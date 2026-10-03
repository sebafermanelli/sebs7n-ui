import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { WidgetBoard, WidgetBoardEditButton } from "../../src/components/widget-board"
import { useWidgetLayout, type WidgetDef } from "../../src/lib/widget-layout"
import { LabelsProvider } from "../../src/lib/labels"
import { mockSortableRects } from "../sortable-rects"

const widgets: WidgetDef[] = [
  { id: "invoices", title: "Facturas", size: "md", description: "Lo facturado", preview: <span>US$ 4.820</span>, render: () => <section aria-label="Facturas">Facturas</section> },
  { id: "clients", title: "Clientes", render: () => <section aria-label="Clientes">Clientes</section> },
  { id: "calendar", title: "Calendario", size: "lg", render: () => <section aria-label="Calendario">Calendario</section> }
]

function Screen({ storageKey = "test:board" }: { storageKey?: string }) {
  const layout = useWidgetLayout({ storageKey, widgets })
  return (
    <>
      <WidgetBoardEditButton layout={layout} />
      <WidgetBoard layout={layout} />
    </>
  )
}

const order = () => screen.getAllByRole("listitem").map((item) => item.querySelector("section")?.getAttribute("aria-label"))

beforeEach(() => {
  localStorage.clear()
  mockSortableRects(2)
})
afterEach(() => vi.restoreAllMocks())

describe("WidgetBoard: modo normal", () => {
  it("es una lista estática con cada widget, sin controles de edición", () => {
    render(<Screen />)
    expect(screen.getByRole("list", { name: "Widgets" })).toHaveAttribute("data-slot", "widget-board-grid")
    expect(order()).toEqual(["Facturas", "Clientes", "Calendario"])
    expect(screen.queryByRole("button", { name: /^Sacar/ })).toBeNull()
    expect(screen.queryByRole("button", { name: "Agregar widget" })).toBeNull()
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument()
  })

  it("el tamaño decide las columnas por container query y la card llena la fila", () => {
    render(<Screen />)
    const [invoices, clients, calendar] = screen.getAllByRole("listitem")
    expect(clients?.className).not.toMatch(/col-span/)
    expect(invoices).toHaveClass("@xl:col-span-2")
    expect(invoices?.className).not.toContain("@4xl:col-span-4")
    expect(calendar).toHaveClass("@xl:col-span-2", "@4xl:col-span-4")
    expect(clients).toHaveClass("[&>:first-child]:h-full", "[&>[data-slot=stat-grid-container]>[data-slot=stat-grid]]:h-full")
    const grid = screen.getByRole("list", { name: "Widgets" })
    expect(grid).toHaveClass("@xl:grid-cols-2", "@4xl:grid-cols-4")
    expect(grid.className).not.toMatch(/(^|\s)(sm|md|lg|xl):/)
  })

  it("el HTML del servidor es determinista y muestra el orden original", () => {
    function Server() {
      const layout = useWidgetLayout({ storageKey: "ssr", widgets })
      return <WidgetBoard layout={layout} />
    }
    const html = renderToString(<Server />)
    expect(html.indexOf("Facturas")).toBeLessThan(html.indexOf("Clientes"))
    expect(html).toBe(renderToString(<Server />))
    expect(html).not.toContain("sortable")
  })

  it("el módulo de arrastre no está en el tablero: se pide recién al editar", () => {
    const src = readFileSync(join(import.meta.dirname, "../../src/components/widget-board.tsx"), "utf8")
    expect(src).toContain('React.lazy(() => import("../internal/widget-board-editor.js"))')
    expect(src).not.toMatch(/from "[^"]*(sortable|dnd-kit)/)
    const parts = readFileSync(join(import.meta.dirname, "../../src/internal/widget-board-parts.tsx"), "utf8")
    expect(parts).not.toMatch(/from "[^"]*(sortable|dnd-kit)/)
  })

  it("adopta el orden guardado después de montar", async () => {
    localStorage.setItem("test:board", JSON.stringify({ version: 1, ids: ["calendar", "invoices"] }))
    render(<Screen />)
    expect(order()).toEqual(["Calendario", "Facturas"])
  })
})

describe("WidgetBoard: edición", () => {
  async function edit() {
    const user = userEvent.setup()
    render(<Screen />)
    await user.click(screen.getByRole("button", { name: "Editar" }))
    await screen.findByRole("button", { name: "Agregar widget" })
    return user
  }

  it("Editar pide el módulo, anuncia el modo, muestra «−» con el nombre y «Listo»", async () => {
    await edit()
    expect(screen.getByRole("button", { name: "Listo" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sacar Facturas" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sacar Clientes" })).toBeInTheDocument()
    expect(document.querySelector("[data-slot=widget-board-status]")).toHaveTextContent(/^Modo edición/)
    expect(document.querySelector("[data-slot=sortable-grid]")).toHaveAttribute("data-editing")
  })

  it("quitar saca el widget, lo guarda y lo anuncia; el foco pasa al «−» que queda", async () => {
    const user = await edit()
    await user.click(screen.getByRole("button", { name: "Sacar Clientes" }))
    expect(order()).toEqual(["Facturas", "Calendario"])
    expect(JSON.parse(localStorage.getItem("test:board")!).ids).toEqual(["invoices", "calendar"])
    expect(document.querySelector("[data-slot=sortable-status]")).toHaveTextContent("Se sacó Clientes.")
    await waitFor(() => expect(screen.getByRole("button", { name: "Sacar Calendario" })).toHaveFocus())
  })

  it("el catálogo lista lo que falta, con vista previa oculta del lector, y agregar lo suma al final con el foco en su «−»", async () => {
    const user = await edit()
    await user.click(screen.getByRole("button", { name: "Sacar Facturas" }))
    await user.click(screen.getByRole("button", { name: "Agregar widget" }))
    const catalog = await screen.findByRole("dialog")
    const row = within(catalog).getByRole("button", { name: "Agregar Facturas" })
    expect(within(catalog).getAllByRole("button")).toHaveLength(1)
    expect(row).toHaveTextContent("Lo facturado")
    expect([...row.querySelectorAll("[aria-hidden=true]")].at(-1)).toHaveTextContent("US$ 4.820")
    await user.click(row)
    expect(order()).toEqual(["Clientes", "Calendario", "Facturas"])
    await waitFor(() => expect(screen.getByRole("button", { name: "Sacar Facturas" })).toHaveFocus())
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("sin nada para agregar, el catálogo lo dice", async () => {
    const user = await edit()
    await user.click(screen.getByRole("button", { name: "Agregar widget" }))
    expect(await screen.findByText("Ya están todos los widgets en pantalla.")).toBeInTheDocument()
  })

  it("Restablecer vuelve al orden original (y está deshabilitado, pero enfocable, si ya lo es)", async () => {
    const user = await edit()
    const reset = screen.getByRole("button", { name: "Restablecer" })
    expect(reset).toHaveAttribute("aria-disabled", "true")
    await user.click(screen.getByRole("button", { name: "Sacar Facturas" }))
    await user.click(screen.getByRole("button", { name: "Restablecer" }))
    expect(order()).toEqual(["Facturas", "Clientes", "Calendario"])
    expect(document.querySelector("[data-slot=widget-board-status]")).toHaveTextContent("Se restableció el panel original.")
    // Un clic en «Restablecer» (fuera de la grilla) no saca de la edición.
    expect(screen.getByRole("button", { name: "Sacar Facturas" })).toBeInTheDocument()
  })

  it("reordena con el teclado: Espacio toma, flecha mueve, Espacio suelta, y se guarda", async () => {
    const user = await edit()
    const first = screen.getAllByRole("listitem")[0]!
    act(() => first.focus())
    await user.keyboard(" ")
    await user.keyboard("{ArrowRight}")
    await user.keyboard(" ")
    expect(order()[0]).not.toBe("Facturas")
    await waitFor(() => expect(JSON.parse(localStorage.getItem("test:board")!).ids[0]).not.toBe("invoices"))
  })

  it("Listo vuelve a la vista normal sin perder el orden, y Editar de nuevo no recarga", async () => {
    const user = await edit()
    await user.click(screen.getByRole("button", { name: "Sacar Facturas" }))
    await user.click(screen.getByRole("button", { name: "Listo" }))
    expect(screen.queryByRole("button", { name: /^Sacar/ })).toBeNull()
    expect(screen.queryByRole("button", { name: "Agregar widget" })).toBeNull()
    expect(order()).toEqual(["Clientes", "Calendario"])
    await user.click(screen.getByRole("button", { name: "Editar" }))
    expect(await screen.findByRole("button", { name: "Sacar Clientes" })).toBeInTheDocument()
  })

  it("sin widgets muestra el estado vacío con «Agregar widget» y «Restablecer»", async () => {
    const user = await edit()
    for (const name of ["Facturas", "Clientes", "Calendario"]) await user.click(screen.getByRole("button", { name: `Sacar ${name}` }))
    expect(screen.getByText("No hay widgets en pantalla")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Agregar widget" }).length).toBeGreaterThanOrEqual(1)
    await user.click(screen.getAllByRole("button", { name: "Restablecer" }).at(-1)!)
    expect(order()).toEqual(["Facturas", "Clientes", "Calendario"])
  })

  it("el estado vacío en modo normal abre el catálogo en un clic", async () => {
    localStorage.setItem("test:board", JSON.stringify({ version: 1, ids: [] }))
    const user = userEvent.setup()
    render(<Screen />)
    await user.click(screen.getByRole("button", { name: "Agregar widget" }))
    const catalog = await screen.findByRole("dialog")
    expect(within(catalog).getAllByRole("button")).toHaveLength(3)
  })

  it("los textos salen de LabelsProvider (widgetBoard)", async () => {
    const user = userEvent.setup()
    render(
      <LabelsProvider value={{ widgetBoard: { edit: "Edit", done: "Done" } as never }}>
        <Screen />
      </LabelsProvider>
    )
    await user.click(screen.getByRole("button", { name: "Edit" }))
    expect(await screen.findByRole("button", { name: "Done" })).toBeInTheDocument()
  })
})
