import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import * as React from "react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SortableGrid } from "../../src/components/sortable-grid"
import { Dialog, DialogContent, DialogTitle } from "../../src/components/dialog"
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
    // `isPrimary`: en jsdom un `PointerEvent` arranca en `false`; el mouse de verdad es primario.
    const down = { button: 0, isPrimary: true, clientX: 10, clientY: 10 }

    it("mantener apretada ~0,5 s entra en edición, y el clic que sigue no abre el botón de adentro", () => {
      vi.useFakeTimers()
      try {
        const onEditingChange = vi.fn()
        const onOpen = vi.fn()
        render(<Widgets defaultEditing={false} onEditingChange={onEditingChange} onOpen={onOpen} />)
        const open = screen.getByRole("button", { name: "Abrir Clientes" })
        fireEvent.pointerDown(open, down)
        act(() => vi.advanceTimersByTime(499))
        expect(onEditingChange).not.toHaveBeenCalled()
        act(() => vi.advanceTimersByTime(1))
        expect(onEditingChange).toHaveBeenCalledWith(true)
        // Ya en edición (sin controlar): la tarjeta es parada de Tab.
        expect(screen.getAllByRole("listitem")[1]).toHaveAttribute("tabindex", "0")
        fireEvent.pointerUp(open)
        fireEvent.click(open)
        expect(onOpen).not.toHaveBeenCalled()
        // El próximo clic es un clic.
        fireEvent.pointerDown(open, down)
        fireEvent.click(open)
        expect(onOpen).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
    })

    it("un clic normal no entra, y moverse o soltar antes de tiempo cancela", () => {
      vi.useFakeTimers()
      try {
        const onEditingChange = vi.fn()
        const onOpen = vi.fn()
        render(<Widgets defaultEditing={false} onEditingChange={onEditingChange} onOpen={onOpen} />)
        const open = screen.getByRole("button", { name: "Abrir Facturas" })
        fireEvent.pointerDown(open, down)
        act(() => vi.advanceTimersByTime(200))
        fireEvent.pointerUp(open)
        fireEvent.click(open)
        act(() => vi.advanceTimersByTime(1000))
        expect(onOpen).toHaveBeenCalledTimes(1)
        fireEvent.pointerDown(open, down)
        fireEvent.pointerMove(open, { isPrimary: true, clientX: 30, clientY: 10 })
        act(() => vi.advanceTimersByTime(600))
        // El botón derecho y un segundo dedo tampoco.
        fireEvent.pointerDown(open, { ...down, button: 2 })
        act(() => vi.advanceTimersByTime(600))
        fireEvent.pointerDown(open, { ...down, isPrimary: false })
        act(() => vi.advanceTimersByTime(600))
        expect(onEditingChange).not.toHaveBeenCalled()
      } finally {
        vi.useRealTimers()
      }
    })

    const tick = () => act(() => new Promise((resolve) => setTimeout(resolve)))

    it("un clic en una tarjeta sigue en edición; uno en el espacio vacío sale, y Esc también", async () => {
      const user = userEvent.setup()
      const onEditingChange = vi.fn()
      render(<Widgets onEditingChange={onEditingChange} />)
      await tick()
      await user.click(screen.getByRole("button", { name: "Abrir Clientes" }))
      expect(onEditingChange).not.toHaveBeenCalled()
      await user.click(screen.getByRole("list", { name: "Widgets" }))
      expect(onEditingChange).toHaveBeenLastCalledWith(false)
      expect(screen.getAllByRole("listitem")[0]).not.toHaveAttribute("tabindex")
    })

    it("Esc sale de la edición", async () => {
      const user = userEvent.setup()
      const onEditingChange = vi.fn()
      render(<Widgets onEditingChange={onEditingChange} />)
      await tick()
      await user.keyboard("{Escape}")
      expect(onEditingChange).toHaveBeenCalledWith(false)
    })

    it("el clic que prende la edición (el «Editar» de la app) no la apaga al subir", async () => {
      const user = userEvent.setup()
      function App() {
        const [editing, setEditing] = React.useState(false)
        return (
          <>
            <button onClick={() => setEditing(!editing)} type="button">
              {editing ? "Listo" : "Editar"}
            </button>
            <Widgets editing={editing} onEditingChange={setEditing} />
          </>
        )
      }
      render(<App />)
      await user.click(screen.getByRole("button", { name: "Editar" }))
      await tick()
      expect(screen.getByRole("button", { name: "Listo" })).toBeInTheDocument()
      await user.click(screen.getByRole("button", { name: "Listo" }))
      await tick()
      expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument()
    })

    it("Esc durante un arrastre con teclado cancela el arrastre, no la edición", async () => {
      const user = userEvent.setup()
      const onEditingChange = vi.fn()
      render(<Widgets onEditingChange={onEditingChange} />)
      await tick()
      screen.getAllByRole("listitem")[0]!.focus()
      await user.keyboard(" {ArrowRight}{Escape}")
      expect(live()).toHaveTextContent("Volvió a su lugar: Facturas.")
      await tick()
      expect(onEditingChange).not.toHaveBeenCalled()
    })

    it("Esc y los clics de un diálogo abierto encima son del diálogo", async () => {
      const user = userEvent.setup()
      const onEditingChange = vi.fn()
      render(
        <>
          <Widgets onEditingChange={onEditingChange} />
          <Dialog open>
            <DialogContent>
              <DialogTitle>Agregar un widget</DialogTitle>
              <button type="button">Facturas</button>
            </DialogContent>
          </Dialog>
        </>
      )
      await tick()
      await user.click(screen.getByRole("button", { name: "Facturas" }))
      await user.keyboard("{Escape}")
      expect(onEditingChange).not.toHaveBeenCalled()
    })
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

    it("en edición las tarjetas tiemblan, cada una con su fase, menos la que se arrastra", async () => {
      const user = userEvent.setup()
      const { rerender } = render(<Widgets editing={false} />)
      expect(document.querySelectorAll(".animate-jiggle")).toHaveLength(0)
      rerender(<Widgets editing />)
      const cards = screen.getAllByRole("listitem")
      for (const card of cards) {
        expect(card).toHaveClass("animate-jiggle")
        expect(parseFloat(card.style.animationDelay)).toBeLessThanOrEqual(0)
      }
      // La fase sale de la clave: no todas arrancan juntas.
      expect(new Set(cards.map((card) => card.style.animationDelay)).size).toBeGreaterThan(1)
      cards[0]!.focus()
      await user.keyboard(" ")
      expect(document.querySelector("[data-dragging]")).not.toHaveClass("animate-jiggle")
      expect(document.querySelectorAll(".animate-jiggle")).toHaveLength(3)
      await user.keyboard("{Escape}")
    })

    it("theme.css: el temblor gira con rotate (se suma al transform de dnd-kit) y con movimiento reducido es un contorno punteado", () => {
      const css = readFileSync(join(process.cwd(), "src/styles/theme.css"), "utf8")
      const keyframes = css.slice(css.indexOf("@keyframes sf-jiggle"), css.indexOf("}\n}", css.indexOf("@keyframes sf-jiggle")))
      expect(keyframes).toMatch(/rotate: -1deg/)
      expect(keyframes).toMatch(/rotate: 1deg/)
      expect(keyframes).not.toMatch(/transform/)
      const utility = css.slice(css.indexOf("@utility animate-jiggle {"), css.indexOf("\n}", css.indexOf("@utility animate-jiggle {")))
      expect(utility).toMatch(/animation: sf-jiggle 0\.3s ease-in-out infinite alternate/)
      const reduced = utility.slice(utility.indexOf("prefers-reduced-motion: reduce"))
      expect(reduced).toMatch(/animation: none/)
      expect(reduced).toMatch(/&::after \{[^}]*border: 1px dashed var\(--color-label-tertiary\)/)
    })

    it("onRemove: en edición cada tarjeta trae un «−» con su nombre que la saca directo, lo anuncia y deja el foco en el siguiente", async () => {
      const user = userEvent.setup()
      function Removable() {
        const [items, setItems] = React.useState(WIDGETS)
        return <Widgets items={items} onRemove={(id) => setItems((all) => all.filter((widget) => widget.id !== id))} />
      }
      render(<Removable />)
      const remove = screen.getByRole("button", { name: "Sacar Clientes" })
      expect(remove).toHaveAttribute("data-slot", "sortable-remove")
      expect(remove).toHaveClass("absolute", "-top-2", "-left-2", "size-[22px]", "rounded-full", "touch-target")
      await user.click(remove)
      expect(order()).toEqual(["Facturas", "Calendario", "Archivos"])
      expect(status()).toHaveTextContent("Se sacó Clientes.")
      expect(screen.getByRole("button", { name: "Sacar Calendario" })).toHaveFocus()
      // Sacar no es un clic afuera: sigue en edición.
      expect(screen.getAllByRole("listitem")[0]).toHaveClass("animate-jiggle")
      await user.click(screen.getByRole("button", { name: "Sacar Archivos" }))
      expect(screen.getByRole("button", { name: "Sacar Calendario" })).toHaveFocus()
    })

    it("sin onRemove o fuera de edición no hay «−»", () => {
      const { rerender } = render(<Widgets />)
      expect(screen.queryByRole("button", { name: /^Sacar/ })).toBeNull()
      rerender(<Widgets editing={false} onRemove={() => {}} />)
      expect(screen.queryByRole("button", { name: /^Sacar/ })).toBeNull()
    })

    it("labels.remove y labels.removed se traducen", async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn()
      render(
        <LabelsProvider value={{ sortable: { remove: "Remove", removed: "Removed" } }}>
          <Widgets onRemove={onRemove} />
        </LabelsProvider>
      )
      await user.click(screen.getByRole("button", { name: "Remove Facturas" }))
      expect(onRemove).toHaveBeenCalledWith("invoices")
      expect(status()).toHaveTextContent("Removed Facturas.")
    })

    it("onAdd: en edición la última celda es «+ Agregar», punteada y con el radio de las tarjetas; abrirla no sale de la edición", async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      const onEditingChange = vi.fn()
      render(<Widgets onAdd={onAdd} onEditingChange={onEditingChange} />)
      await act(() => new Promise((resolve) => setTimeout(resolve)))
      const cells = within(screen.getByRole("list", { name: "Widgets" })).getAllByRole("listitem")
      expect(cells).toHaveLength(5)
      expect(cells[4]).toHaveAttribute("data-slot", "sortable-add")
      const add = within(cells[4]!).getByRole("button", { name: "Agregar" })
      expect(add).toHaveClass("rounded-surface", "border-dashed")
      await user.click(add)
      expect(onAdd).toHaveBeenCalledTimes(1)
      expect(onEditingChange).not.toHaveBeenCalled()
    })

    it("sin edición no hay «+ Agregar», y labels.add lo traduce", () => {
      const { rerender } = render(<Widgets editing={false} onAdd={() => {}} />)
      expect(screen.queryByRole("button", { name: "Agregar" })).toBeNull()
      rerender(<Widgets editing labels={{ add: "Add widget" }} onAdd={() => {}} />)
      expect(screen.getByRole("button", { name: "Add widget" })).toBeInTheDocument()
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
