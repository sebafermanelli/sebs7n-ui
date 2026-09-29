import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SortableGrid } from "../../src/components/sortable-grid"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"
import { mockSortableRects } from "../sortable-rects"

type Widget = { id: string; title: string }

const WIDGETS: Widget[] = [
  { id: "invoices", title: "Facturas" },
  { id: "clients", title: "Clientes" },
  { id: "calendar", title: "Calendario" },
  { id: "files", title: "Archivos" },
]

type GridProps = Partial<React.ComponentProps<typeof SortableGrid<Widget>>> & { onOpen?: (id: string) => void }

function Widgets({ onReorder, onOpen, ...props }: GridProps) {
  const [items, setItems] = React.useState(WIDGETS)
  return (
    <SortableGrid
      aria-label="Widgets"
      columns={2}
      defaultEditing
      getKey={(widget) => widget.id}
      getLabel={(widget) => widget.title}
      items={items}
      onReorder={onReorder ?? setItems}
      renderItem={(widget, state) => (
        <section aria-label={widget.title}>
          {state.handle}
          <button onClick={() => onOpen?.(widget.id)} type="button">
            Abrir {widget.title}
          </button>
        </section>
      )}
      {...props}
    />
  )
}

const order = () => screen.getAllByRole("listitem").map((item) => item.querySelector("section")!.getAttribute("aria-label"))
const live = () => document.querySelector("[id^=DndLiveRegion]")
const status = () => document.querySelector("[data-slot=sortable-status]")

beforeEach(() => {
  mockSortableRects(2)
})
afterEach(() => vi.restoreAllMocks())

describe("SortableGrid", () => {
  it("una grilla de columns columnas; sin handle la tarjeta entera es la que se enfoca y se arrastra", () => {
    render(<Widgets itemClassName={(widget) => (widget.id === "files" ? "col-span-2" : undefined)} />)
    const grid = screen.getByRole("list", { name: "Widgets" })
    expect(grid).toHaveAttribute("data-slot", "sortable-grid")
    expect(grid).toHaveClass("grid", "gap-5")
    expect(grid).toHaveStyle({ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" })
    const items = within(grid).getAllByRole("listitem")
    expect(items[0]).toHaveAttribute("tabindex", "0")
    expect(items[0]).not.toHaveAttribute("role")
    expect(items[0]).not.toHaveAttribute("aria-pressed")
    expect(items[0]).not.toHaveAttribute("aria-roledescription")
    expect(items[3]).toHaveClass("col-span-2")
    expect(screen.queryByRole("button", { name: /Reordenar/ })).toBeNull()
  })

  it("con el teclado se mueve en 2D: → y ↓ llevan la primera a la posición 4", async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    render(<Widgets onReorder={onReorder} />)
    screen.getAllByRole("listitem")[0]!.focus()
    await user.keyboard(" ")
    expect(live()).toHaveTextContent("Tomaste Facturas, posición 1 de 4.")
    await user.keyboard("{ArrowRight}")
    expect(live()).toHaveTextContent("Facturas, posición 2 de 4.")
    await user.keyboard("{ArrowDown}")
    expect(live()).toHaveTextContent("Facturas, posición 4 de 4.")
    await user.keyboard(" ")
    expect(live()).toHaveTextContent("Soltaste Facturas, posición 4 de 4.")
    expect(onReorder).toHaveBeenCalledWith([WIDGETS[1], WIDGETS[2], WIDGETS[3], WIDGETS[0]])
  })

  it("mientras arrastrás la grilla se reacomoda de verdad (tarjetas de distinto ancho) y Escape la devuelve", async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    render(<Widgets itemClassName={(widget) => (widget.id === "files" ? "col-span-2" : undefined)} onReorder={onReorder} />)
    screen.getAllByRole("listitem")[0]!.focus()
    await user.keyboard(" {ArrowRight}")
    // Todavía sin soltar: el DOM ya está en el orden nuevo y ninguna tarjeta quieta va corrida.
    expect(order()).toEqual(["Clientes", "Facturas", "Calendario", "Archivos"])
    const resting = screen.getAllByRole("listitem").filter((item) => !item.hasAttribute("data-dragging"))
    expect(resting.map((item) => item.style.transform || "none")).toEqual(["none", "none", "none"])
    expect(onReorder).not.toHaveBeenCalled()
    await user.keyboard("{Escape}")
    expect(order()).toEqual(["Facturas", "Clientes", "Calendario", "Archivos"])
    expect(onReorder).not.toHaveBeenCalled()
  })

  it("un click y un Espacio en un botón de adentro son del botón, no toman la tarjeta", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const onReorder = vi.fn()
    render(<Widgets onOpen={onOpen} onReorder={onReorder} />)
    await user.click(screen.getByRole("button", { name: "Abrir Clientes" }))
    expect(onOpen).toHaveBeenCalledWith("clients")
    await user.keyboard(" {ArrowRight} ")
    // El click y los dos Espacios: los tres abren.
    expect(onOpen).toHaveBeenCalledTimes(3)
    expect(onReorder).not.toHaveBeenCalled()
    expect(live()?.textContent ?? "").toBe("")
  })

  it("con handle, la manija va donde la pone renderItem y la tarjeta no se enfoca", async () => {
    const user = userEvent.setup()
    render(<Widgets handle />)
    expect(screen.getAllByRole("listitem")[0]).not.toHaveAttribute("tabindex")
    const handle = within(screen.getByRole("region", { name: "Calendario" })).getByRole("button", { name: "Reordenar Calendario" })
    handle.focus()
    await user.keyboard(" {ArrowUp} ")
    expect(order()).toEqual(["Calendario", "Facturas", "Clientes", "Archivos"])
  })

  it("optimista con vuelta atrás si la promesa falla", async () => {
    const user = userEvent.setup()
    let fail!: () => void
    render(<Widgets onReorder={() => new Promise<void>((_, reject) => (fail = () => reject(new Error("sin red"))))} />)
    screen.getAllByRole("listitem")[0]!.focus()
    await user.keyboard(" {ArrowRight} ")
    expect(order()).toEqual(["Clientes", "Facturas", "Calendario", "Archivos"])
    await act(async () => fail())
    expect(order()).toEqual(["Facturas", "Clientes", "Calendario", "Archivos"])
    expect(status()).toHaveTextContent("No se pudo guardar el orden: volvió el anterior.")
  })

  it("si la app manda items nuevos a mitad del arrastre, onReorder recibe los de ahora, no una copia vieja", async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    let setItems!: React.Dispatch<React.SetStateAction<Widget[]>>
    function Live() {
      const [items, set] = React.useState(WIDGETS)
      setItems = set
      return (
        <SortableGrid
          aria-label="Widgets"
          columns={2}
          defaultEditing
          getKey={(widget) => widget.id}
          getLabel={(widget) => widget.title}
          items={items}
          onReorder={onReorder}
          renderItem={(widget) => <section aria-label={widget.title}>{widget.title}</section>}
        />
      )
    }
    render(<Live />)
    screen.getAllByRole("listitem")[0]!.focus()
    await user.keyboard(" {ArrowRight}")
    await act(async () => setItems((items) => [...items, { id: "reports", title: "Informes" }]))
    // El que llegó ya se ve mientras arrastrás.
    expect(order()).toEqual(["Clientes", "Facturas", "Calendario", "Archivos", "Informes"])
    await user.keyboard(" ")
    expect(onReorder).toHaveBeenCalledWith([WIDGETS[1], WIDGETS[0], WIDGETS[2], WIDGETS[3], { id: "reports", title: "Informes" }])
  })

  it("sin handle, la tarjeta tomada lo dice en su descripción (como aria-pressed en la manija de la lista)", async () => {
    const user = userEvent.setup()
    render(<Widgets />)
    const card = screen.getAllByRole("listitem")[0]!
    card.focus()
    expect(card).not.toHaveAccessibleDescription(/En movimiento/)
    await user.keyboard(" ")
    expect(card).toHaveAccessibleDescription(/^En movimiento/)
    await user.keyboard("{Escape}")
    expect(card).not.toHaveAccessibleDescription(/En movimiento/)
  })

  it("si la app ya aplicó el orden y la promesa falla, no anuncia una vuelta atrás que no pasó", async () => {
    const user = userEvent.setup()
    let fail!: () => void
    function Applied() {
      const [items, setItems] = React.useState(WIDGETS)
      return (
        <Widgets
          items={items}
          onReorder={(next) => {
            setItems(next)
            return new Promise<void>((_, reject) => (fail = () => reject(new Error("sin red"))))
          }}
        />
      )
    }
    render(<Applied />)
    screen.getAllByRole("listitem")[0]!.focus()
    await user.keyboard(" {ArrowRight} ")
    await act(async () => fail())
    // El orden es de la app: lo revierte ella. El componente no dice «volvió el anterior».
    expect(order()).toEqual(["Clientes", "Facturas", "Calendario", "Archivos"])
    expect(status()?.textContent).toBe("")
  })

  it("los textos salen de LabelsProvider y la prop labels le gana", async () => {
    const user = userEvent.setup()
    render(
      <LabelsProvider value={{ sortable: { picked: "Picked up", position: "position", of: "of" } }}>
        <Widgets labels={{ picked: "Agarraste" }} />
      </LabelsProvider>
    )
    screen.getAllByRole("listitem")[1]!.focus()
    await user.keyboard(" ")
    expect(live()).toHaveTextContent("Agarraste Clientes, position 2 of 4.")
    await user.keyboard("{Escape}")
  })

  it("hidrata sin mismatch", async () => {
    const ui = <Widgets />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
  })

  describe("modo edición", () => {
    it("fuera de edición no se arrastra: la tarjeta no es parada de Tab y Espacio no toma nada", async () => {
      const user = userEvent.setup()
      const onReorder = vi.fn()
      render(<Widgets defaultEditing={false} onReorder={onReorder} />)
      const card = screen.getAllByRole("listitem")[0]!
      expect(card).not.toHaveAttribute("tabindex")
      expect(card).not.toHaveAttribute("aria-describedby")
      card.focus()
      await user.keyboard(" {ArrowRight} ")
      expect(onReorder).not.toHaveBeenCalled()
      expect(live()?.textContent ?? "").toBe("")
    })

    it("con handle, fuera de edición renderItem no recibe manija", () => {
      render(<Widgets defaultEditing={false} handle />)
      expect(screen.queryByRole("button", { name: /Reordenar/ })).toBeNull()
    })

    it("controlado: editing manda y renderItem recibe state.editing", () => {
      const seen: boolean[] = []
      const renderItem = (widget: Widget, state: { editing: boolean }) => {
        seen.push(state.editing)
        return <section aria-label={widget.title}>{widget.title}</section>
      }
      const { rerender } = render(<Widgets editing={false} renderItem={renderItem} />)
      expect(seen.at(-1)).toBe(false)
      expect(screen.getAllByRole("listitem")[0]).not.toHaveAttribute("tabindex")
      rerender(<Widgets editing renderItem={renderItem} />)
      expect(seen.at(-1)).toBe(true)
      expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("tabindex", "0")
    })
  })
})
