import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { FileGrid, type FileGridItem } from "../../src/components/file-grid"

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
