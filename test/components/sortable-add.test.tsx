import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SortableAddButton as FromGrid, SortableGrid } from "../../src/components/sortable-grid"
import { SortableAddButton as FromList } from "../../src/components/sortable-list"
import { LabelsProvider } from "../../src/lib/labels"
import { mockSortableRects } from "../sortable-rects"

const SortableAddButton = FromGrid

type Widget = { id: string; title: string }
const WIDGETS: Widget[] = [
  { id: "invoices", title: "Facturas" },
  { id: "clients", title: "Clientes" },
  { id: "calendar", title: "Calendario" },
]

beforeEach(() => {
  mockSortableRects(2)
})
afterEach(() => vi.restoreAllMocks())

describe("SortableAddButton", () => {
  it("sale de los dos subpaths: es el mismo componente", () => {
    expect(FromList).toBe(FromGrid)
  })

  it("es un botón de ícono «+» plain con nombre; abre un menú con lo que se puede agregar y onSelect recibe el id", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SortableAddButton items={[{ id: "clients", label: "Clientes" }, { id: "calendar", label: "Calendario" }]} onSelect={onSelect} />)
    const button = screen.getByRole("button", { name: "Agregar" })
    expect(button).toHaveAttribute("data-size", "icon-md")
    expect(button).toHaveClass("hover:bg-fill-2")
    expect(button).toHaveAttribute("aria-haspopup", "menu")
    await user.click(button)
    const items = await screen.findAllByRole("menuitem")
    expect(items.map((item) => item.textContent)).toEqual(["Clientes", "Calendario"])
    await user.click(screen.getByRole("menuitem", { name: "Calendario" }))
    expect(onSelect).toHaveBeenCalledWith("calendar")
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
  })

  it("sin nada para agregar queda deshabilitado pero enfocable, y dice por qué", async () => {
    const user = userEvent.setup()
    render(<SortableAddButton items={[]} onSelect={() => {}} />)
    const button = screen.getByRole("button", { name: "Agregar" })
    expect(button).toHaveAttribute("aria-disabled", "true")
    expect(button).toHaveAccessibleDescription("No hay más para agregar")
    await user.tab()
    expect(button).toHaveFocus()
    await user.click(button)
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("los textos salen de LabelsProvider y la prop labels le gana", () => {
    const { rerender } = render(
      <LabelsProvider value={{ sortable: { add: "Add widget", nothingToAdd: "Nothing left" } }}>
        <SortableAddButton items={[]} onSelect={() => {}} />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Add widget" })).toHaveAccessibleDescription("Nothing left")
    rerender(<SortableAddButton items={[]} labels={{ add: "Sumar" }} onSelect={() => {}} />)
    expect(screen.getByRole("button", { name: "Sumar" })).toBeInTheDocument()
  })

  it("junto a la grilla: lo agregado aparece, el foco va a su «−» y se anuncia «Se agregó …»", async () => {
    const user = userEvent.setup()
    function Tablero() {
      const [items, setItems] = React.useState(WIDGETS.slice(0, 2))
      const missing = WIDGETS.filter((widget) => !items.includes(widget))
      return (
        <>
          <SortableAddButton items={missing.map((widget) => ({ id: widget.id, label: widget.title }))} onSelect={(id) => setItems([...items, WIDGETS.find((widget) => widget.id === id)!])} />
          <SortableGrid
            aria-label="Widgets"
            defaultEditing
            getKey={(widget) => widget.id}
            getLabel={(widget) => widget.title}
            items={items}
            onRemove={(id) => setItems(items.filter((widget) => widget.id !== id))}
            onReorder={setItems}
            renderItem={(widget) => <section aria-label={widget.title}>{widget.title}</section>}
          />
        </>
      )
    }
    render(<Tablero />)
    await act(() => new Promise((resolve) => setTimeout(resolve)))
    await user.click(screen.getByRole("button", { name: "Agregar" }))
    await user.click(await screen.findByRole("menuitem", { name: "Calendario" }))
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    expect(screen.getByRole("button", { name: "Sacar Calendario" })).toHaveFocus()
    expect(document.querySelector("[data-slot=sortable-status]")).toHaveTextContent("Se agregó Calendario.")
    // Agregar no es un clic afuera: la grilla sigue en edición.
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("animate-jiggle")
    // Ya no queda nada: el «+» se deshabilita.
    expect(screen.getByRole("button", { name: "Agregar" })).toHaveAttribute("aria-disabled", "true")
  })

  it("el ícono de cada opción del menú no llega al lector: solo el nombre", async () => {
    const user = userEvent.setup()
    render(<SortableAddButton items={[{ id: "clients", label: "Clientes", icon: <svg data-testid="icono" /> }]} onSelect={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Agregar" }))
    const item = await screen.findByRole("menuitem", { name: "Clientes" })
    expect(item.querySelector("[aria-hidden=true]")).toContainElement(screen.getByTestId("icono"))
  })

  it("si lo elegido nunca aparece en una grilla, el foco vuelve al «+» (no queda en el <body>)", async () => {
    const user = userEvent.setup()
    render(<SortableAddButton items={[{ id: "clients", label: "Clientes" }]} onSelect={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Agregar" }))
    await user.click(await screen.findByRole("menuitem", { name: "Clientes" }))
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    await waitFor(() => expect(screen.getByRole("button", { name: "Agregar" })).toHaveFocus())
  })

  it("lo elegido lo recibe solo la grilla que edita, y no queda colgado para después", async () => {
    const user = userEvent.setup()
    const grilla = (label: string, items: Widget[], editing: boolean) => (
      <SortableGrid
        aria-label={label}
        editing={editing}
        getKey={(widget) => widget.id}
        getLabel={(widget) => widget.title}
        items={items}
        onRemove={() => {}}
        onReorder={() => {}}
        renderItem={(widget) => widget.title}
      />
    )
    const vista = (conCalendario: boolean) => (
      <>
        <SortableAddButton items={[{ id: "calendar", label: "Calendario" }]} onSelect={() => {}} />
        {grilla("Editando", conCalendario ? WIDGETS : WIDGETS.slice(0, 2), true)}
        {/* La otra ya tiene «Calendario», pero no está en edición: no es la que recibe. */}
        {grilla("Otra", WIDGETS, false)}
      </>
    )
    const { rerender } = render(vista(false))
    await act(() => new Promise((resolve) => setTimeout(resolve)))
    await user.click(screen.getByRole("button", { name: "Agregar" }))
    await user.click(await screen.findByRole("menuitem", { name: "Calendario" }))
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    const [editando, otra] = document.querySelectorAll("[data-slot=sortable-status]")
    expect(otra?.textContent).toBe("")
    // Pasado el medio segundo, la elección ya no vale: si «Calendario» llega después, no roba el foco.
    await act(() => new Promise((resolve) => setTimeout(resolve, 600)))
    rerender(vista(true))
    expect(editando?.textContent).toBe("")
    expect(screen.getByRole("button", { name: "Agregar" })).toHaveFocus()
  })

  it("la grilla ya no tiene onAdd ni la celda «+ Agregar»", () => {
    render(
      <SortableGrid
        aria-label="Widgets"
        defaultEditing
        getKey={(widget: Widget) => widget.id}
        items={WIDGETS}
        // @ts-expect-error `onAdd` se fue: el «+» es `SortableAddButton`, al lado del «Listo».
        onAdd={() => {}}
        onReorder={() => {}}
        renderItem={(widget) => widget.title}
      />
    )
    expect(document.querySelector("[data-slot=sortable-add]")).toBeNull()
  })
})
