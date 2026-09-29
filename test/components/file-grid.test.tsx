import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { FileGrid, type FileGridItem } from "../../src/components/file-grid"
import { hidratar } from "../hidratar"

const ITEMS: FileGridItem[] = [
  { id: "a", name: "Factura 0012.pdf", kind: "PDF" },
  { id: "b", name: "Factura 0013.pdf", kind: "PDF" },
  { id: "c", name: "Contratos", kind: "Carpeta", folder: true },
  { id: "d", name: "Logo.png", kind: "Imagen", thumbnail: <img alt="" src="data:," /> },
  { id: "e", name: "Notas.txt", kind: "Texto" },
]

const opcion = (name: string) => screen.getByRole("option", { name: new RegExp(`^${name}`) })

/** jsdom no hace layout: se simula una grilla de 3 columnas con la posición de cada opción. */
function grillaDeTres() {
  screen.getAllByRole("option").forEach((el, index) => {
    el.getBoundingClientRect = () => ({ top: Math.floor(index / 3) * 150, left: (index % 3) * 140 }) as DOMRect
  })
}

describe("FileGrid", () => {
  it("es un listbox nombrado; cada archivo es una opción con su nombre y tipo", () => {
    render(<FileGrid aria-label="Archivos" items={ITEMS} />)
    const lista = screen.getByRole("listbox", { name: "Archivos" })
    expect(within(lista).getAllByRole("option")).toHaveLength(5)
    expect(opcion("Factura 0012.pdf")).toHaveAttribute("aria-selected", "false")
    expect(screen.getByText("Factura 0012.pdf")).toHaveClass("text-callout", "line-clamp-2")
    expect(screen.getAllByText("PDF")[0]).toHaveClass("text-footnote", "text-label-secondary")
    expect(lista.parentElement).toHaveClass("group/list")
  })

  it("la miniatura lleva el filo de 1 px y radio 4; sin miniatura, el ícono de archivo o carpeta", () => {
    render(<FileGrid aria-label="Archivos" items={ITEMS} />)
    const caja = opcion("Logo.png").querySelector("[data-slot=file-grid-thumbnail]")!
    expect(caja.className).toContain("[&>img]:shadow-thumbnail")
    expect(caja.className).toContain("[&>img]:rounded-tag")
    expect(opcion("Contratos").querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("flechas en dos dimensiones: ←→ de a uno, ↑↓ de a una fila; la selección sigue al foco", async () => {
    const onSelectedChange = vi.fn()
    render(<FileGrid aria-label="Archivos" items={ITEMS} onSelectedChange={onSelectedChange} />)
    grillaDeTres()
    await userEvent.tab()
    expect(opcion("Factura 0012.pdf")).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    expect(opcion("Factura 0013.pdf")).toHaveFocus()
    expect(opcion("Factura 0013.pdf")).toHaveAttribute("aria-selected", "true")
    expect(onSelectedChange).toHaveBeenLastCalledWith("b", expect.objectContaining({ id: "b" }))
    await userEvent.keyboard("{ArrowDown}")
    expect(opcion("Notas.txt")).toHaveFocus()
    await userEvent.keyboard("{ArrowUp}")
    expect(opcion("Factura 0013.pdf")).toHaveFocus()
    await userEvent.keyboard("{End}")
    expect(opcion("Notas.txt")).toHaveFocus()
    await userEvent.keyboard("{Home}")
    expect(opcion("Factura 0012.pdf")).toHaveFocus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(opcion("Factura 0012.pdf")).toHaveFocus()
  })

  it("un solo ítem en el orden de Tab; Enter y doble click abren", async () => {
    const onOpen = vi.fn()
    render(<FileGrid aria-label="Archivos" defaultSelected="c" items={ITEMS} onOpen={onOpen} />)
    expect(screen.getAllByRole("option").filter((el) => el.tabIndex === 0)).toEqual([opcion("Contratos")])
    await userEvent.tab()
    await userEvent.keyboard("{Enter}")
    expect(onOpen).toHaveBeenLastCalledWith(expect.objectContaining({ id: "c" }))
    await userEvent.dblClick(screen.getByText("Notas.txt"))
    expect(onOpen).toHaveBeenLastCalledWith(expect.objectContaining({ id: "e" }))
    expect(opcion("Notas.txt")).toHaveAttribute("aria-selected", "true")
  })

  it("la elegida: caja en fill 2 y el nombre en la píldora del acento con foco (gris sin foco)", () => {
    render(<FileGrid aria-label="Archivos" defaultSelected="a" items={ITEMS} />)
    const elegida = opcion("Factura 0012.pdf")
    expect(elegida).toHaveAttribute("data-state", "selected")
    expect(elegida).toHaveClass("group/selectable")
    const nombre = screen.getByText("Factura 0012.pdf")
    expect(nombre.className).toContain("group-data-[state=selected]/selectable:bg-selection-inactive")
    expect(nombre.className).toContain("group-data-[state=selected]/selectable:group-focus-within/list:bg-selection")
    expect(elegida.querySelector("[data-slot=file-grid-thumbnail]")!.className).toContain("group-data-[state=selected]/selectable:bg-fill-2")
  })

  it("actions: el «…» del ítem, fuera del árbol de accesibilidad (el teclado usa el menú contextual)", () => {
    render(<FileGrid actions={(item) => <button type="button">Acciones de {item.name}</button>} aria-label="Archivos" items={ITEMS} />)
    const slot = opcion("Notas.txt").querySelector("[data-slot=file-grid-actions]")!
    expect(slot).toHaveAttribute("aria-hidden", "true")
    expect(within(slot as HTMLElement).getByText(/Acciones de Notas/).closest("button")).toHaveAttribute("tabindex", "-1")
  })
})

describe("FileGrid · onKeyDown de la app", () => {
  it("se suma a la navegación y con preventDefault la cancela", async () => {
    const propio = vi.fn((event: React.KeyboardEvent) => {
      if (event.key === "End") event.preventDefault()
    })
    render(<FileGrid aria-label="Archivos" items={[{ id: "a", name: "Alfa.pdf" }, { id: "b", name: "Beta.pdf" }, { id: "c", name: "Gama.pdf" }]} onKeyDown={propio} />)
    screen.getByRole("option", { name: /Alfa/ }).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(propio).toHaveBeenCalled()
    expect(screen.getByRole("option", { name: /Beta/ })).toHaveFocus()
    await userEvent.keyboard("{End}")
    expect(screen.getByRole("option", { name: /Beta/ })).toHaveFocus()
  })
})

describe("FileGrid · revisión de R5b", () => {
  const ARCHIVOS: FileGridItem[] = [
    { id: "a", name: "Acme.pdf" },
    { id: "b", name: "Balance.xlsx" },
    { id: "c", name: "Arcor.pdf" },
  ]

  it("en RTL → va al anterior y ← al siguiente", async () => {
    render(
      <div dir="rtl">
        <FileGrid aria-label="Archivos" items={ARCHIVOS} />
      </div>
    )
    screen.getByRole("option", { name: /Balance/ }).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("option", { name: /Acme/ })).toHaveFocus()
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(screen.getByRole("option", { name: /Arcor/ })).toHaveFocus()
  })

  it("type-ahead: salta al siguiente cuyo nombre empieza con lo tipeado", async () => {
    render(<FileGrid aria-label="Archivos" items={ARCHIVOS} />)
    screen.getByRole("option", { name: /Acme/ }).focus()
    await userEvent.keyboard("a")
    expect(screen.getByRole("option", { name: /Arcor/ })).toHaveFocus()
    await userEvent.keyboard("b")
    expect(screen.getByRole("option", { name: /Arcor/ })).toHaveFocus()
  })

  it("un click en el «…» no le deja el foco a lo que el lector no ve", () => {
    render(<FileGrid actions={() => <button type="button">Más</button>} aria-label="Archivos" items={ARCHIVOS} />)
    const envoltura = document.querySelector("[data-slot=file-grid-actions]")!
    expect(fireEvent.mouseDown(envoltura)).toBe(false)
  })
})

describe("FileGrid · selección múltiple", () => {
  const elegidos = () => screen.getAllByRole("option").filter((el) => el.getAttribute("aria-selected") === "true").map((el) => el.textContent)

  it("aria-multiselectable solo con selectionMode=multiple; el default sigue siendo simple", () => {
    const { rerender } = render(<FileGrid aria-label="Archivos" items={ITEMS} />)
    expect(screen.getByRole("listbox")).not.toHaveAttribute("aria-multiselectable")
    rerender(<FileGrid aria-label="Archivos" items={ITEMS} selectionMode="multiple" />)
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true")
  })

  it("click elige uno; ⌘/Ctrl+click suma y saca; ⇧+click elige el rango desde el ancla", async () => {
    const onSelectedChange = vi.fn()
    const user = userEvent.setup()
    render(<FileGrid aria-label="Archivos" items={ITEMS} onSelectedChange={onSelectedChange} selectionMode="multiple" />)
    await user.click(screen.getByText("Factura 0013.pdf"))
    expect(onSelectedChange).toHaveBeenLastCalledWith(["b"], [expect.objectContaining({ id: "b" })])
    await user.keyboard("{Meta>}")
    await user.click(screen.getByText("Notas.txt"))
    await user.keyboard("{/Meta}")
    expect(onSelectedChange).toHaveBeenLastCalledWith(["b", "e"], [expect.objectContaining({ id: "b" }), expect.objectContaining({ id: "e" })])
    await user.keyboard("{Control>}")
    await user.click(screen.getByText("Factura 0013.pdf"))
    await user.keyboard("{/Control}")
    expect(onSelectedChange).toHaveBeenLastCalledWith(["e"], [expect.objectContaining({ id: "e" })])
    // El ancla quedó en «Factura 0013» (el último ⌘+click): ⇧+click en «Contratos» elige b..c.
    await user.keyboard("{Shift>}")
    await user.click(screen.getByText("Contratos"))
    await user.keyboard("{/Shift}")
    expect(onSelectedChange).toHaveBeenLastCalledWith(["b", "c"], expect.any(Array))
    expect(opcion("Factura 0013.pdf")).toHaveAttribute("aria-selected", "true")
    expect(opcion("Contratos")).toHaveAttribute("aria-selected", "true")
    expect(opcion("Notas.txt")).toHaveAttribute("aria-selected", "false")
  })

  it("teclado: las flechas mueven sin elegir, Espacio suma o saca, ⇧+flechas extienden y ⌘A elige todo", async () => {
    render(<FileGrid aria-label="Archivos" items={ITEMS} selectionMode="multiple" />)
    grillaDeTres()
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}")
    expect(opcion("Factura 0013.pdf")).toHaveFocus()
    expect(elegidos()).toEqual([])
    await userEvent.keyboard(" ")
    expect(elegidos()).toEqual(["Factura 0013.pdfPDF"])
    await userEvent.keyboard("{Shift>}{ArrowRight}{ArrowRight}{/Shift}")
    expect(opcion("Logo.png")).toHaveFocus()
    expect(elegidos()).toHaveLength(3)
    await userEvent.keyboard(" ")
    expect(elegidos()).toHaveLength(2)
    await userEvent.keyboard("{Meta>}a{/Meta}")
    expect(elegidos()).toHaveLength(5)
    // Con todo elegido, ⌘A de nuevo vacía la selección.
    await userEvent.keyboard("{Control>}a{/Control}")
    expect(elegidos()).toEqual([])
  })

  it("⇧+↓ extiende una fila del layout; los deshabilitados no entran en el rango", async () => {
    const conDeshabilitado = ITEMS.map((item) => (item.id === "c" ? { ...item, disabled: true } : item))
    render(<FileGrid aria-label="Archivos" items={conDeshabilitado} selectionMode="multiple" />)
    grillaDeTres()
    await userEvent.tab()
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}")
    expect(opcion("Logo.png")).toHaveFocus()
    // a, b, (c deshabilitado), d.
    expect(elegidos()).toEqual(["Factura 0012.pdfPDF", "Factura 0013.pdfPDF", "Logo.pngImagen"])
  })

  it("selected controlado con un array", async () => {
    function Controlado() {
      const [selected, setSelected] = useState<string[]>(["a"])
      return <FileGrid aria-label="Archivos" items={ITEMS} onSelectedChange={(ids) => setSelected(ids)} selected={selected} selectionMode="multiple" />
    }
    const user = userEvent.setup()
    render(<Controlado />)
    expect(opcion("Factura 0012.pdf")).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{Meta>}")
    await user.click(screen.getByText("Notas.txt"))
    expect(elegidos()).toHaveLength(2)
  })

  it("tipos: con multiple, selected es string[] y onSelectedChange recibe ids", () => {
    // @ts-expect-error -- con selectionMode="multiple", selected es un array
    ;<FileGrid aria-label="Archivos" items={ITEMS} selected="a" selectionMode="multiple" />
    // @ts-expect-error -- sin selectionMode (simple), selected no puede ser un array
    ;<FileGrid aria-label="Archivos" items={ITEMS} selected={["a"]} />
    ;<FileGrid aria-label="Archivos" items={ITEMS} onSelectedChange={(ids: string[], items: FileGridItem[]) => [ids, items]} selectionMode="multiple" />
    ;<FileGrid aria-label="Archivos" items={ITEMS} onSelectedChange={(id: string | null) => id} />
  })
})

describe("FileGrid · hidratación", () => {
  it("el HTML del servidor hidrata sin mismatch, en simple y en múltiple", async () => {
    for (const props of [{ defaultSelected: "b" }, { selectionMode: "multiple" as const, defaultSelected: ["a", "c"] }]) {
      const ui = <FileGrid aria-label="Archivos" items={ITEMS} {...props} />
      const container = document.createElement("div")
      container.innerHTML = renderToString(ui)
      document.body.append(container)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      const recoverable = vi.fn()
      await hidratar(container, ui, { onRecoverableError: recoverable })
      expect(recoverable).not.toHaveBeenCalled()
      expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
      expect(container.querySelectorAll("[aria-selected=true]")).toHaveLength(props.selectionMode ? 2 : 1)
      errors.mockRestore()
      container.remove()
    }
  })
})
