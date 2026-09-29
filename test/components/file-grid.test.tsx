import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { ContextMenuItem } from "../../src/components/context-menu"
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

  it("hover y elegida: una sola caja gris de radio 12 que cubre miniatura, nombre y tipo (sin píldora de acento)", () => {
    render(<FileGrid aria-label="Archivos" defaultSelected="a" items={ITEMS} />)
    const elegida = opcion("Factura 0012.pdf")
    expect(elegida).toHaveAttribute("data-state", "selected")
    expect(elegida).toHaveClass("group/selectable", "rounded-menu", "hover:bg-fill-1", "data-[state=selected]:bg-selection-inactive", "focus-visible:focus-ring")
    const nombre = screen.getByText("Factura 0012.pdf")
    expect(nombre).toHaveClass("text-label")
    expect(nombre.className).not.toMatch(/bg-selection|text-on-selection/)
    expect(elegida.querySelector("[data-slot=file-grid-thumbnail]")!.className).not.toContain("bg-fill-2")
    // Sin `group/list`: la caja gris no es la selección de acento de una lista con foco, y lo de
    // adentro no pasa a `text-on-selection` (ver `inside-selection`).
    expect(screen.getByRole("listbox").parentElement).not.toHaveClass("group/list")
  })

  it("elegida (una o varias): la misma caja gris más un borde de acento de 2 px por dentro, sin mover el layout", () => {
    render(<FileGrid aria-label="Archivos" defaultSelected={["a", "c"]} items={ITEMS} selectionMode="multiple" />)
    for (const name of ["Factura 0012.pdf", "Contratos"]) {
      const elegida = opcion(name)
      expect(elegida).toHaveAttribute("data-state", "selected")
      // Por dentro (`inset-ring`, compuesto con el resto del box-shadow), no un `border`: no corre nada.
      expect(elegida).toHaveClass("data-[state=selected]:bg-selection-inactive", "data-[state=selected]:inset-ring-2", "data-[state=selected]:inset-ring-selection-border")
      expect(elegida.className).not.toMatch(/(^|\s)(data-\[state=selected\]:)?border(-|\s|$)/)
    }
    // El hover sigue siendo solo la caja gris, sin borde.
    const libre = opcion("Notas.txt")
    expect(libre.className).not.toMatch(/hover:inset-ring|hover:border/)
  })

  it("foco: el anillo de siempre en una no elegida; en la elegida el borde de acento se duplica (2 → 4 px)", () => {
    render(<FileGrid aria-label="Archivos" defaultSelected="a" items={ITEMS} />)
    const elegida = opcion("Factura 0012.pdf")
    expect(elegida).toHaveClass("focus-visible:focus-ring", "data-[state=selected]:focus-visible:inset-ring-4")
  })
})

describe("FileGrid · menu", () => {
  const menu = vi.fn((item: FileGridItem, selected: FileGridItem[]) => (
    <>
      <ContextMenuItem>Abrir {item.name}</ContextMenuItem>
      <ContextMenuItem>Descargar {selected.length}</ContextMenuItem>
    </>
  ))
  const mas = (name: string) => opcion(name).querySelector<HTMLButtonElement>("[data-slot=file-grid-more] button")!

  it("sin menu no hay «…»", () => {
    render(<FileGrid aria-label="Archivos" items={ITEMS} />)
    expect(document.querySelector("[data-slot=file-grid-more]")).toBeNull()
  })

  it("el «…» es un círculo gris de 24 adentro de la caja, fuera del orden de Tab y del lector", () => {
    render(<FileGrid aria-label="Archivos" items={ITEMS} menu={menu} />)
    const slot = opcion("Notas.txt").querySelector("[data-slot=file-grid-more]")!
    expect(slot).toHaveAttribute("aria-hidden", "true")
    expect(slot).toHaveClass("absolute", "top-1.5", "end-1.5")
    const boton = mas("Notas.txt")
    expect(boton).toHaveAttribute("tabindex", "-1")
    expect(boton).toHaveClass("size-6", "rounded-full", "bg-fill-3", "text-label")
    // Un click no le deja el foco a lo que el lector no ve.
    expect(fireEvent.mouseDown(boton)).toBe(false)
  })

  it("el «…» aparece solo en el ítem con el puntero o con el foco, no en cada elegido", () => {
    render(<FileGrid aria-label="Archivos" defaultSelected={["a", "b"]} items={ITEMS} menu={menu} selectionMode="multiple" />)
    const slot = opcion("Factura 0012.pdf").querySelector("[data-slot=file-grid-more]")!
    expect(slot).toHaveClass("opacity-0", "group-hover/selectable:opacity-100", "group-focus/selectable:opacity-100")
    expect(slot.className).not.toContain("group-data-[state=selected]/selectable:opacity-100")
  })

  it("click derecho: elige el ítem y abre su menú", async () => {
    const onSelectedChange = vi.fn()
    render(<FileGrid aria-label="Archivos" items={ITEMS} menu={menu} onSelectedChange={onSelectedChange} />)
    fireEvent.contextMenu(screen.getByText("Notas.txt"), { clientX: 10, clientY: 10 })
    expect(await screen.findByRole("menuitem", { name: "Abrir Notas.txt" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Descargar 1" })).toBeInTheDocument()
    expect(onSelectedChange).toHaveBeenLastCalledWith("e", expect.objectContaining({ id: "e" }))
  })

  it("click en el «…»: el mismo menú, sin doble click ni otro click en el ítem", async () => {
    const onOpen = vi.fn()
    render(<FileGrid aria-label="Archivos" items={ITEMS} menu={menu} onOpen={onOpen} />)
    await userEvent.click(mas("Contratos"))
    expect(await screen.findByRole("menuitem", { name: "Abrir Contratos" })).toBeInTheDocument()
    expect(screen.getByText("Contratos").closest("[role=option]")).toHaveAttribute("aria-selected", "true")
    expect(onOpen).not.toHaveBeenCalled()
  })

  it("Shift+F10 y la tecla de menú abren el menú del ítem enfocado", async () => {
    render(<FileGrid aria-label="Archivos" items={ITEMS} menu={menu} />)
    opcion("Logo.png").focus()
    await userEvent.keyboard("{Shift>}{F10}{/Shift}")
    expect(await screen.findByRole("menuitem", { name: "Abrir Logo.png" })).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    // Al cerrar, el foco vuelve al ítem.
    await waitFor(() => expect(opcion("Logo.png")).toHaveFocus())
    await userEvent.keyboard("{ArrowRight}{ContextMenu}")
    expect(await screen.findByRole("menuitem", { name: "Abrir Notas.txt" })).toBeInTheDocument()
  })

  it("en múltiple, sobre un elegido actúa sobre la selección; sobre otro, lo elige solo", async () => {
    render(<FileGrid aria-label="Archivos" defaultSelected={["a", "b", "c"]} items={ITEMS} menu={menu} selectionMode="multiple" />)
    fireEvent.contextMenu(screen.getByText("Factura 0013.pdf"), { clientX: 10, clientY: 10 })
    expect(await screen.findByRole("menuitem", { name: "Descargar 3" })).toBeInTheDocument()
    expect(menu).toHaveBeenLastCalledWith(expect.objectContaining({ id: "b" }), [expect.objectContaining({ id: "a" }), expect.objectContaining({ id: "b" }), expect.objectContaining({ id: "c" })])
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    fireEvent.contextMenu(screen.getByText("Notas.txt"), { clientX: 10, clientY: 10 })
    expect(await screen.findByRole("menuitem", { name: "Descargar 1" })).toBeInTheDocument()
    // Con el menú abierto lo de afuera queda inerte: se busca por texto.
    expect(screen.getByText("Notas.txt").closest("[role=option]")).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Factura 0012.pdf").closest("[role=option]")).toHaveAttribute("aria-selected", "false")
  })

  it("el click derecho en el espacio vacío no abre el menú", () => {
    render(<FileGrid aria-label="Archivos" items={ITEMS} menu={menu} />)
    fireEvent.contextMenu(screen.getByRole("listbox"), { clientX: 10, clientY: 10 })
    expect(screen.queryByRole("menu")).toBeNull()
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
    { id: "c", name: "Alfa.pdf" },
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
    expect(screen.getByRole("option", { name: /Alfa/ })).toHaveFocus()
  })

  it("type-ahead: salta al siguiente cuyo nombre empieza con lo tipeado", async () => {
    render(<FileGrid aria-label="Archivos" items={ARCHIVOS} />)
    screen.getByRole("option", { name: /Acme/ }).focus()
    await userEvent.keyboard("a")
    expect(screen.getByRole("option", { name: /Alfa/ })).toHaveFocus()
    await userEvent.keyboard("b")
    expect(screen.getByRole("option", { name: /Alfa/ })).toHaveFocus()
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

  it("un id controlado que ya no está en items no se emite: ids e items van alineados", async () => {
    const onSelectedChange = vi.fn()
    const user = userEvent.setup()
    render(<FileGrid aria-label="Archivos" items={ITEMS} onSelectedChange={onSelectedChange} selected={["borrado", "a"]} selectionMode="multiple" />)
    onSelectedChange.mockClear()
    await user.keyboard("{Meta>}")
    await user.click(screen.getByText("Notas.txt"))
    await user.keyboard("{/Meta}")
    expect(onSelectedChange).toHaveBeenLastCalledWith(["a", "e"], [expect.objectContaining({ id: "a" }), expect.objectContaining({ id: "e" })])
  })

  it("si un elegido deja de estar en items, sale de la selección y se avisa (como en Tree)", () => {
    const onSelectedChange = vi.fn()
    const { rerender } = render(
      <FileGrid aria-label="Archivos" defaultSelected={["a", "b"]} items={ITEMS} onSelectedChange={onSelectedChange} selectionMode="multiple" />
    )
    expect(onSelectedChange).not.toHaveBeenCalled()
    rerender(
      <FileGrid
        aria-label="Archivos"
        defaultSelected={["a", "b"]}
        items={ITEMS.filter((item) => item.id !== "b")}
        onSelectedChange={onSelectedChange}
        selectionMode="multiple"
      />
    )
    expect(onSelectedChange).toHaveBeenLastCalledWith(["a"], [expect.objectContaining({ id: "a" })])
    expect(elegidos()).toEqual(["Factura 0012.pdfPDF"])
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
