import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Tree, type TreeNode } from "../../src/components/tree"
import { hidratar } from "../hidratar"

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

describe("Tree · onKeyDown de la app", () => {
  it("se suma a la navegación y con preventDefault la cancela", async () => {
    const propio = vi.fn((event: React.KeyboardEvent) => {
      if (event.key === "End") event.preventDefault()
    })
    render(<Tree aria-label="Archivos" items={[{ id: "a", label: "Alfa" }, { id: "b", label: "Beta" }, { id: "c", label: "Gama" }]} onKeyDown={propio} />)
    screen.getByRole("treeitem", { name: /Alfa/ }).focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(propio).toHaveBeenCalled()
    expect(screen.getByRole("treeitem", { name: /Beta/ })).toHaveFocus()
    await userEvent.keyboard("{End}")
    expect(screen.getByRole("treeitem", { name: /Beta/ })).toHaveFocus()
  })
})

describe("Tree · revisión de R5b", () => {
  const REMOTA: TreeNode[] = [{ id: "remota", label: "Remota", hasChildren: true }]

  it("una carga que falla cierra la carpeta y avisa con onLoadError", async () => {
    const onLoadError = vi.fn()
    const error = new Error("sin red")
    render(<Tree aria-label="Archivos" items={REMOTA} onLoadChildren={() => Promise.reject(error)} onLoadError={onLoadError} />)
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}")
    await act(async () => {})
    expect(onLoadError).toHaveBeenCalledWith(expect.objectContaining({ id: "remota" }), error)
    expect(item("Remota")).toHaveAttribute("aria-expanded", "false")
    expect(item("Remota")).not.toHaveAttribute("aria-busy")
  })

  it("no pide dos veces los mismos hijos, y dice «Cargando…» mientras tanto", async () => {
    const onLoadChildren = vi.fn(() => new Promise<void>(() => {}))
    render(<Tree aria-label="Archivos" items={REMOTA} onLoadChildren={onLoadChildren} />)
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}{ArrowLeft}{ArrowRight}")
    expect(onLoadChildren).toHaveBeenCalledTimes(1)
    expect(item("Remota")).toHaveTextContent("Cargando…")
  })

  it("si la carga termina y los hijos siguen sin llegar, no los vuelve a pedir solo", async () => {
    const onLoadChildren = vi.fn(() => Promise.resolve())
    render(<Tree aria-label="Archivos" defaultExpanded={["remota"]} items={REMOTA} onLoadChildren={onLoadChildren} />)
    for (let i = 0; i < 5; i++) await act(async () => {})
    expect(onLoadChildren).toHaveBeenCalledTimes(1)
    // Cerrar y abrir de nuevo sí reintenta.
    await userEvent.tab()
    await userEvent.keyboard("{ArrowLeft}{ArrowRight}")
    await act(async () => {})
    expect(onLoadChildren).toHaveBeenCalledTimes(2)
  })

  it("con expanded controlado que no se cierra, una carga que falla no se reintenta sola", async () => {
    const onLoadChildren = vi.fn(() => Promise.reject(new Error("sin red")))
    render(<Tree aria-label="Archivos" expanded={["remota"]} items={REMOTA} onLoadChildren={onLoadChildren} onLoadError={() => {}} />)
    for (let i = 0; i < 5; i++) await act(async () => {})
    expect(onLoadChildren).toHaveBeenCalledTimes(1)
  })

  it("una carpeta perezosa abierta de entrada pide sus hijos al montar", () => {
    const onLoadChildren = vi.fn(() => new Promise<void>(() => {}))
    render(<Tree aria-label="Archivos" defaultExpanded={["remota"]} items={REMOTA} onLoadChildren={onLoadChildren} />)
    expect(onLoadChildren).toHaveBeenCalledWith(expect.objectContaining({ id: "remota" }))
  })

  it("type-ahead: la misma letra otra vez va al siguiente que empieza con ella", async () => {
    render(<Tree aria-label="Archivos" items={[{ id: "a", label: "Acme" }, { id: "b", label: "Arcor" }, { id: "c", label: "Aysa" }]} />)
    await userEvent.tab()
    await userEvent.keyboard("a")
    expect(item("Arcor")).toHaveFocus()
    await userEvent.keyboard("a")
    expect(item("Aysa")).toHaveFocus()
  })

  it("si se cierra (controlado) la carpeta del ítem con foco, el foco sube a la carpeta", async () => {
    function Controlado() {
      const [expanded, setExpanded] = useState(["facturas"])
      return (
        <>
          <button onClick={() => setExpanded([])} type="button">
            Cerrar todo
          </button>
          <Tree aria-label="Archivos" expanded={expanded} items={ITEMS} onExpandedChange={setExpanded} onKeyDown={(event) => event.key === "x" && setExpanded([])} />
        </>
      )
    }
    render(<Controlado />)
    item("Factura 0001.pdf").focus()
    await userEvent.keyboard("x")
    expect(item("Facturas")).toHaveFocus()
  })

  it("si el elegido desaparece de items, avisa con null", () => {
    const onSelectedChange = vi.fn()
    const { rerender } = render(<Tree aria-label="Archivos" defaultSelected="notas" items={ITEMS} onSelectedChange={onSelectedChange} />)
    rerender(<Tree aria-label="Archivos" defaultSelected="notas" items={ITEMS.filter((node) => node.id !== "notas")} onSelectedChange={onSelectedChange} />)
    expect(onSelectedChange).toHaveBeenCalledWith(null, null)
  })
})

describe("Tree · selección múltiple", () => {
  const elegidos = () => screen.getAllByRole("treeitem").filter((el) => el.getAttribute("aria-selected") === "true").map((el) => el.textContent)

  it("aria-multiselectable solo con selectionMode=multiple", () => {
    const { rerender } = render(<Tree aria-label="Archivos" items={ITEMS} />)
    expect(screen.getByRole("tree")).not.toHaveAttribute("aria-multiselectable")
    rerender(<Tree aria-label="Archivos" items={ITEMS} selectionMode="multiple" />)
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true")
  })

  it("click, ⌘/Ctrl+click y ⇧+click sobre lo visible, en el orden en que se ve", async () => {
    const onSelectedChange = vi.fn()
    const user = userEvent.setup()
    render(<Tree aria-label="Archivos" defaultExpanded={["facturas"]} items={ITEMS} onSelectedChange={onSelectedChange} selectionMode="multiple" />)
    await user.click(screen.getByText("Notas.txt"))
    expect(onSelectedChange).toHaveBeenLastCalledWith(["notas"], [expect.objectContaining({ id: "notas" })])
    await user.keyboard("{Meta>}")
    await user.click(screen.getByText("2026"))
    await user.keyboard("{/Meta}")
    // En el orden visible: «2026» está arriba de «Notas.txt».
    expect(onSelectedChange).toHaveBeenLastCalledWith(["f-2026", "notas"], expect.any(Array))
    await user.keyboard("{Shift>}")
    await user.click(screen.getByText("Contratos"))
    await user.keyboard("{/Shift}")
    expect(onSelectedChange).toHaveBeenLastCalledWith(["f-2026", "f-0001", "contratos"], expect.any(Array))
    expect(elegidos()).toEqual(["2026", "Factura 0001.pdf", "Contratos"])
  })

  it("teclado: ↓ mueve sin elegir, Espacio suma, ⇧+↓ extiende, ⌘A elige todo lo visible", async () => {
    render(<Tree aria-label="Archivos" items={ITEMS} selectionMode="multiple" />)
    await userEvent.tab()
    await userEvent.keyboard("{ArrowDown}")
    expect(item("Contratos")).toHaveFocus()
    expect(elegidos()).toEqual([])
    await userEvent.keyboard(" ")
    expect(elegidos()).toEqual(["Contratos"])
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}")
    expect(elegidos()).toEqual(["Contratos", "Notas.txt"])
    await userEvent.keyboard("{Shift>}{Home}{/Shift}")
    expect(elegidos()).toEqual(["Facturas", "Contratos"])
    await userEvent.keyboard("{Control>}a{/Control}")
    expect(elegidos()).toEqual(["Facturas", "Contratos", "Notas.txt"])
  })

  it("en simple, ⇧+↓ y ⌘+click siguen eligiendo uno solo (la API de siempre)", async () => {
    const user = userEvent.setup()
    render(<Tree aria-label="Archivos" items={ITEMS} />)
    await user.tab()
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}")
    expect(elegidos()).toEqual(["Contratos"])
    await user.keyboard("{Meta>}")
    await user.click(screen.getByText("Notas.txt"))
    expect(elegidos()).toEqual(["Notas.txt"])
  })

  it("varias elegidas seguidas son un bloque: sin radio donde se tocan", () => {
    render(<Tree aria-label="Archivos" defaultSelected={["contratos", "notas"]} items={ITEMS} selectionMode="multiple" />)
    expect(item("Contratos").className).toContain("data-[state=selected]:has-[+[data-state=selected]]:rounded-b-none")
    expect(item("Notas.txt").className).toContain("data-[state=selected]:[[data-state=selected]+&]:rounded-t-none")
  })

  it("si un elegido desaparece de items, sale de la selección y se avisa", () => {
    const onSelectedChange = vi.fn()
    const { rerender } = render(<Tree aria-label="Archivos" defaultSelected={["contratos", "notas"]} items={ITEMS} onSelectedChange={onSelectedChange} selectionMode="multiple" />)
    rerender(
      <Tree
        aria-label="Archivos"
        defaultSelected={["contratos", "notas"]}
        items={ITEMS.filter((node) => node.id !== "notas")}
        onSelectedChange={onSelectedChange}
        selectionMode="multiple"
      />
    )
    expect(onSelectedChange).toHaveBeenCalledWith(["contratos"], [expect.objectContaining({ id: "contratos" })])
  })

  it("tipos: multiple exige arrays; grid exige columns", () => {
    // @ts-expect-error -- con selectionMode="multiple", selected es un array
    ;<Tree aria-label="Archivos" items={ITEMS} selected="notas" selectionMode="multiple" />
    // @ts-expect-error -- grid sin columns
    ;<Tree aria-label="Archivos" grid items={ITEMS} />
    ;<Tree aria-label="Archivos" columns={[{ header: "Tipo" }]} grid items={ITEMS} onSelectedChange={(ids: string[]) => ids} selectionMode="multiple" />
  })
})

describe("Tree · treegrid", () => {
  const COLUMNAS = [{ header: "Tipo", width: 120 }, { header: "Tamaño", width: 90, numeric: true }]
  const CON_COLUMNAS: TreeNode[] = [
    { id: "facturas", label: "Facturas", columns: ["Carpeta", "—"], children: [{ id: "f-0012", label: "Factura 0012.pdf", columns: ["PDF", "128 KB"] }] },
    { id: "notas", label: "Notas.txt", columns: ["Texto", "2 KB"] },
  ]
  const fila = (name: string) => screen.getByRole("row", { name: new RegExp(`^${name}`) })
  const celdas = (name: string) => within(fila(name)).getAllByRole("gridcell")

  it("treegrid con cabeceras que se leen; filas con nivel, posición, tamaño y aria-expanded; celdas gridcell", () => {
    render(<Tree aria-label="Archivos" columns={COLUMNAS} defaultExpanded={["facturas"]} grid items={CON_COLUMNAS} nameHeader="Nombre" />)
    const grilla = screen.getByRole("treegrid", { name: "Archivos" })
    expect(within(grilla).getAllByRole("columnheader").map((el) => el.textContent)).toEqual(["Nombre", "Tipo", "Tamaño"])
    expect(document.querySelector("[data-slot=tree-header]")).not.toHaveAttribute("aria-hidden")
    expect(fila("Facturas")).toHaveAttribute("aria-level", "1")
    expect(fila("Facturas")).toHaveAttribute("aria-expanded", "true")
    expect(fila("Facturas")).toHaveAttribute("aria-setsize", "2")
    expect(fila("Factura 0012.pdf")).toHaveAttribute("aria-level", "2")
    expect(fila("Factura 0012.pdf")).toHaveAttribute("aria-posinset", "1")
    expect(fila("Notas.txt")).not.toHaveAttribute("aria-expanded")
    expect(celdas("Notas.txt").map((el) => el.textContent)).toEqual(["Notas.txt", "Texto", "2 KB"])
    expect(screen.queryByRole("treeitem")).not.toBeInTheDocument()
  })

  it("→ abre, → entra a la primera celda, → recorre y ← vuelve a la fila; ← en la fila cierra", async () => {
    render(<Tree aria-label="Archivos" columns={COLUMNAS} grid items={CON_COLUMNAS} />)
    await userEvent.tab()
    expect(fila("Facturas")).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    expect(fila("Facturas")).toHaveAttribute("aria-expanded", "true")
    expect(fila("Facturas")).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    expect(celdas("Facturas")[0]).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}")
    expect(celdas("Facturas")[2]).toHaveFocus()
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}")
    expect(fila("Facturas")).toHaveFocus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(fila("Facturas")).toHaveAttribute("aria-expanded", "false")
  })

  it("en una celda, ↓↑ van a la misma celda de otra fila (la selección sigue a la fila); Home/End recorren la fila", async () => {
    render(<Tree aria-label="Archivos" columns={COLUMNAS} defaultExpanded={["facturas"]} grid items={CON_COLUMNAS} />)
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}{ArrowRight}")
    expect(celdas("Facturas")[1]).toHaveFocus()
    await userEvent.keyboard("{ArrowDown}")
    expect(celdas("Factura 0012.pdf")[1]).toHaveFocus()
    expect(fila("Factura 0012.pdf")).toHaveAttribute("aria-selected", "true")
    await userEvent.keyboard("{End}")
    expect(celdas("Factura 0012.pdf")[2]).toHaveFocus()
    await userEvent.keyboard("{Home}")
    expect(celdas("Factura 0012.pdf")[0]).toHaveFocus()
    await userEvent.keyboard("{Control>}{End}{/Control}")
    expect(celdas("Notas.txt")[0]).toHaveFocus()
  })

  it("foco itinerante: un solo elemento con tabIndex 0 (fila o celda) y Tab sale de una", async () => {
    render(
      <>
        <Tree aria-label="Archivos" columns={COLUMNAS} grid items={CON_COLUMNAS} />
        <button type="button">Después</button>
      </>
    )
    const conTab = () => [...screen.getByRole("treegrid").querySelectorAll("[tabindex='0']")]
    expect(conTab()).toEqual([fila("Facturas")])
    await userEvent.tab()
    await userEvent.keyboard("{ArrowDown}{ArrowRight}")
    expect(conTab()).toEqual([celdas("Notas.txt")[0]])
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Después" })).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(celdas("Notas.txt")[0]).toHaveFocus()
  })

  it("Enter en una celda abre la fila; un click en una celda elige la fila", async () => {
    const onOpen = vi.fn()
    render(<Tree aria-label="Archivos" columns={COLUMNAS} grid items={CON_COLUMNAS} onOpen={onOpen} />)
    await userEvent.click(screen.getByText("2 KB"))
    expect(fila("Notas.txt")).toHaveAttribute("aria-selected", "true")
    expect(celdas("Notas.txt")[2]).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: "notas" }))
  })

  it("un click en el nombre enfoca la fila (↓ sigue por filas); en un valor, esa celda (↓ sigue por celda)", async () => {
    render(<Tree aria-label="Archivos" columns={COLUMNAS} defaultExpanded={["facturas"]} grid items={CON_COLUMNAS} />)
    await userEvent.click(screen.getByText("Factura 0012.pdf"))
    expect(fila("Factura 0012.pdf")).toHaveFocus()
    expect(fila("Factura 0012.pdf")).toHaveAttribute("tabindex", "0")
    await userEvent.keyboard("{ArrowDown}")
    expect(fila("Notas.txt")).toHaveFocus()
    await userEvent.click(screen.getByText("128 KB"))
    expect(celdas("Factura 0012.pdf")[2]).toHaveFocus()
    await userEvent.keyboard("{ArrowDown}")
    expect(celdas("Notas.txt")[2]).toHaveFocus()
  })

  it("con grid y selección múltiple: aria-multiselectable en el treegrid y Espacio en una celda suma la fila", async () => {
    render(<Tree aria-label="Archivos" columns={COLUMNAS} grid items={CON_COLUMNAS} selectionMode="multiple" />)
    expect(screen.getByRole("treegrid")).toHaveAttribute("aria-multiselectable", "true")
    await userEvent.tab()
    await userEvent.keyboard("{ArrowDown}{ArrowRight} ")
    expect(fila("Notas.txt")).toHaveAttribute("aria-selected", "true")
  })
})

describe("Tree · hidratación", () => {
  it("hidrata sin mismatch como árbol, con selección múltiple y como treegrid", async () => {
    const casos = [
      <Tree key="a" aria-label="Archivos" defaultSelected="notas" items={ITEMS} />,
      <Tree key="b" aria-label="Archivos" defaultSelected={["contratos", "notas"]} items={ITEMS} selectionMode="multiple" />,
      <Tree key="c" aria-label="Archivos" columns={[{ header: "Tipo" }]} defaultExpanded={["facturas"]} grid items={ITEMS} nameHeader="Nombre" />,
    ]
    for (const ui of casos) {
      const container = document.createElement("div")
      container.innerHTML = renderToString(ui)
      document.body.append(container)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      const recoverable = vi.fn()
      await hidratar(container, ui, { onRecoverableError: recoverable })
      expect(recoverable).not.toHaveBeenCalled()
      expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
      errors.mockRestore()
      container.remove()
    }
  })
})
