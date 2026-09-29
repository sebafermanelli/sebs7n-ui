import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Tree, type TreeNode } from "../../src/components/tree"

const ITEMS: TreeNode[] = [
  {
    id: "facturas",
    label: "Facturas",
    children: [
      { id: "f-2026", label: "2026", children: [{ id: "f-0012", label: "Factura 0012.pdf" }] },
      { id: "f-0001", label: "Factura 0001.pdf" },
    ],
  },
  { id: "contratos", label: "Contratos", children: [{ id: "c-acme", label: "Acme S.A.pdf" }] },
  { id: "notas", label: "Notas.txt" },
]

const item = (name: string) => screen.getByRole("treeitem", { name: new RegExp(`^${name}`) })

describe("Tree", () => {
  it("es un árbol nombrado, con nivel, posición y tamaño de grupo en cada ítem", () => {
    render(<Tree aria-label="Archivos" defaultExpanded={["facturas"]} items={ITEMS} />)
    const tree = screen.getByRole("tree", { name: "Archivos" })
    expect(within(tree).getAllByRole("treeitem")).toHaveLength(5)
    const facturas = item("Facturas")
    expect(facturas).toHaveAttribute("aria-level", "1")
    expect(facturas).toHaveAttribute("aria-setsize", "3")
    expect(facturas).toHaveAttribute("aria-posinset", "1")
    expect(facturas).toHaveAttribute("aria-expanded", "true")
    expect(item("Contratos")).toHaveAttribute("aria-expanded", "false")
    // Un archivo no se despliega: sin `aria-expanded`.
    expect(item("Notas.txt")).not.toHaveAttribute("aria-expanded")
    const hijo = item("Factura 0001.pdf")
    expect(hijo).toHaveAttribute("aria-level", "2")
    expect(hijo).toHaveAttribute("aria-setsize", "2")
    expect(hijo).toHaveAttribute("aria-posinset", "2")
  })

  it("un solo ítem en el orden de Tab: el elegido, o el primero", async () => {
    render(<Tree aria-label="Archivos" defaultSelected="contratos" items={ITEMS} />)
    const conTab = screen.getAllByRole("treeitem").filter((el) => el.tabIndex === 0)
    expect(conTab).toEqual([item("Contratos")])
    expect(item("Contratos")).toHaveAttribute("aria-selected", "true")
    expect(item("Facturas")).toHaveAttribute("aria-selected", "false")
    await userEvent.tab()
    expect(item("Contratos")).toHaveFocus()
  })

  it("↑↓ recorren lo visible y la selección sigue al foco; Home y End van a los extremos", async () => {
    const onSelectedChange = vi.fn()
    render(<Tree aria-label="Archivos" items={ITEMS} onSelectedChange={onSelectedChange} />)
    await userEvent.tab()
    expect(item("Facturas")).toHaveFocus()
    await userEvent.keyboard("{ArrowDown}")
    expect(item("Contratos")).toHaveFocus()
    expect(item("Contratos")).toHaveAttribute("aria-selected", "true")
    expect(onSelectedChange).toHaveBeenLastCalledWith("contratos", expect.objectContaining({ id: "contratos" }))
    await userEvent.keyboard("{End}")
    expect(item("Notas.txt")).toHaveFocus()
    await userEvent.keyboard("{ArrowDown}")
    expect(item("Notas.txt")).toHaveFocus()
    await userEvent.keyboard("{Home}")
    expect(item("Facturas")).toHaveFocus()
  })

  it("→ abre una carpeta cerrada y después entra al primer hijo; ← sube al padre y después cierra", async () => {
    render(<Tree aria-label="Archivos" items={ITEMS} />)
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}")
    expect(item("Facturas")).toHaveAttribute("aria-expanded", "true")
    expect(item("Facturas")).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    expect(item("2026")).toHaveFocus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(item("Facturas")).toHaveFocus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(item("Facturas")).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("treeitem", { name: /^2026/ })).not.toBeInTheDocument()
  })

  it("tipear salta al próximo ítem que empieza así, sin tildes ni mayúsculas", async () => {
    render(<Tree aria-label="Archivos" items={ITEMS} />)
    await userEvent.tab()
    await userEvent.keyboard("no")
    expect(item("Notas.txt")).toHaveFocus()
    await act(() => new Promise((resolve) => setTimeout(resolve, 600)))
    await userEvent.keyboard("c")
    expect(item("Contratos")).toHaveFocus()
  })

  it("Enter abre (onOpen); el click elige y el click en el chevron despliega", async () => {
    const onOpen = vi.fn()
    render(<Tree aria-label="Archivos" items={ITEMS} onOpen={onOpen} />)
    await userEvent.click(screen.getByText("Notas.txt"))
    expect(item("Notas.txt")).toHaveAttribute("aria-selected", "true")
    expect(item("Notas.txt")).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: "notas" }))
    const chevron = item("Contratos").querySelector("[data-slot=tree-chevron]")!
    expect(chevron).toHaveAttribute("aria-hidden", "true")
    await userEvent.click(chevron)
    expect(item("Contratos")).toHaveAttribute("aria-expanded", "true")
  })

  it("expanded controlado: avisa y espera a que el dueño lo cambie", async () => {
    const onExpandedChange = vi.fn()
    render(<Tree aria-label="Archivos" expanded={[]} items={ITEMS} onExpandedChange={onExpandedChange} />)
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}")
    expect(onExpandedChange).toHaveBeenCalledWith(["facturas"])
    expect(item("Facturas")).toHaveAttribute("aria-expanded", "false")
  })

  it("selected controlado", async () => {
    function Controlado() {
      const [selected, setSelected] = useState<string | null>("notas")
      return <Tree aria-label="Archivos" items={ITEMS} onSelectedChange={setSelected} selected={selected} />
    }
    render(<Controlado />)
    expect(item("Notas.txt")).toHaveAttribute("aria-selected", "true")
    await userEvent.click(screen.getByText("Contratos"))
    expect(item("Contratos")).toHaveAttribute("aria-selected", "true")
    expect(item("Notas.txt")).toHaveAttribute("aria-selected", "false")
  })

  it("hijos perezosos: pide los hijos al abrir y marca aria-busy mientras llegan", async () => {
    let resolver: () => void = () => {}
    function Perezoso() {
      const [items, setItems] = useState<TreeNode[]>([{ id: "remota", label: "Remota", hasChildren: true }])
      const onLoadChildren = () =>
        new Promise<void>((resolve) => {
          resolver = () => {
            setItems([{ id: "remota", label: "Remota", children: [{ id: "r-1", label: "Recibo 1.pdf" }] }])
            resolve()
          }
        })
      return <Tree aria-label="Archivos" items={items} onLoadChildren={onLoadChildren} />
    }
    render(<Perezoso />)
    expect(item("Remota")).toHaveAttribute("aria-expanded", "false")
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}")
    expect(item("Remota")).toHaveAttribute("aria-busy", "true")
    await act(async () => resolver())
    expect(item("Remota")).not.toHaveAttribute("aria-busy")
    expect(item("Recibo 1.pdf")).toHaveAttribute("aria-level", "2")
  })

  it("columnas a la derecha: la cabecera es visual y los valores se leen dentro del ítem", () => {
    render(
      <Tree
        aria-label="Archivos"
        columns={[{ header: "Tamaño", width: 100, numeric: true }, { header: "Fecha", width: 180 }]}
        items={[{ id: "notas", label: "Notas.txt", columns: ["2 KB", "29/09/2026"] }]}
      />
    )
    const cabecera = document.querySelector("[data-slot=tree-header]")!
    expect(cabecera).toHaveAttribute("aria-hidden", "true")
    expect(within(cabecera as HTMLElement).getByText("Tamaño")).toHaveStyle({ width: "100px" })
    expect(item("Notas.txt")).toHaveTextContent("2 KB")
    expect(screen.getByText("2 KB")).toHaveClass("text-right", "tabular-nums")
  })

  it("selección de iCloud: acento con el foco en el árbol, gris sin foco", () => {
    render(<Tree aria-label="Archivos" defaultSelected="notas" items={ITEMS} />)
    const fila = item("Notas.txt")
    expect(fila).toHaveAttribute("data-state", "selected")
    expect(fila).toHaveClass("group/selectable", "rounded-item", "h-[41px]")
    expect(fila.className).toContain("data-[state=selected]:bg-selection-inactive")
    expect(fila.className).toContain("data-[state=selected]:group-focus-within/list:bg-selection")
    expect(screen.getByRole("tree").parentElement).toHaveClass("group/list")
  })
})
