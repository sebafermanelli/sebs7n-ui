import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SortableList } from "../../src/components/sortable-list"
import { LabelsProvider } from "../../src/lib/labels"
import { cn } from "../../src/lib/utils"
import { hidratar } from "../hidratar"
import { mockSortableRects } from "../sortable-rects"

type Invoice = { id: string; client: string }

const INVOICES: Invoice[] = [
  { id: "0012", client: "Acme S.A." },
  { id: "0013", client: "Nube Digital" },
  { id: "0014", client: "Estudio Ruiz" },
]

function Invoices({ onReorder, ...props }: { onReorder?: (items: Invoice[]) => void | Promise<unknown> } & Partial<React.ComponentProps<typeof SortableList<Invoice>>>) {
  const [items, setItems] = React.useState(INVOICES)
  return (
    <SortableList
      aria-label="Facturas"
      defaultEditing
      getKey={(invoice) => invoice.id}
      getLabel={(invoice) => `Factura ${invoice.id}`}
      items={items}
      onReorder={onReorder ?? setItems}
      renderItem={(invoice) => <span className="text-body text-label">{invoice.client}</span>}
      {...props}
    />
  )
}

const order = () => screen.getAllByRole("listitem").map((row) => row.textContent)
const status = () => document.querySelector("[data-slot=sortable-status]")
const live = () => document.querySelector("[id^=DndLiveRegion]")

beforeEach(() => {
  mockSortableRects()
})
afterEach(() => vi.restoreAllMocks())

describe("SortableList", () => {
  it("es una lista de ListRow con la manija ⋮⋮ nombrada por el ítem", () => {
    render(<Invoices />)
    const list = screen.getByRole("list", { name: "Facturas" })
    expect(list).toHaveAttribute("data-slot", "sortable-list")
    const rows = within(list).getAllByRole("listitem")
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveAttribute("data-slot", "sortable-list-item")
    // Mantener apretada una fila (para entrar en edición) no selecciona texto ni abre el globo de iOS.
    expect(rows[0]).toHaveClass("select-none", "[-webkit-touch-callout:none]")
    const handle = screen.getByRole("button", { name: "Reordenar Factura 0012" })
    expect(handle).toHaveClass("size-7", "rounded-control", "touch-none")
    expect(handle).not.toHaveAttribute("aria-roledescription")
    expect(document.getElementById(handle.getAttribute("aria-describedby")!)).toHaveTextContent(
      "Para moverlo, apretá Espacio, usá las flechas y apretá Espacio para soltarlo. Escape cancela."
    )
  })

  it("con el teclado: Espacio toma, ↓ mueve, Espacio suelta, y cada paso se anuncia", async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    render(<Invoices onReorder={onReorder} />)
    screen.getByRole("button", { name: "Reordenar Factura 0012" }).focus()
    await user.keyboard(" ")
    expect(live()).toHaveTextContent("Tomaste Factura 0012, posición 1 de 3.")
    await user.keyboard("{ArrowDown}")
    expect(live()).toHaveTextContent("Factura 0012, posición 2 de 3.")
    await user.keyboard(" ")
    expect(live()).toHaveTextContent("Soltaste Factura 0012, posición 2 de 3.")
    expect(onReorder).toHaveBeenCalledWith([INVOICES[1], INVOICES[0], INVOICES[2]])
    expect(order()).toEqual(["Nube Digital", "Acme S.A.", "Estudio Ruiz"])
  })

  it("Escape cancela: no reordena y anuncia que volvió", async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    render(<Invoices onReorder={onReorder} />)
    screen.getByRole("button", { name: "Reordenar Factura 0013" }).focus()
    await user.keyboard(" ")
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Escape}")
    expect(live()).toHaveTextContent("Volvió a su lugar: Factura 0013.")
    expect(onReorder).not.toHaveBeenCalled()
    expect(order()).toEqual(["Acme S.A.", "Nube Digital", "Estudio Ruiz"])
  })

  it("optimista: si onReorder devuelve una promesa que falla, vuelve al orden anterior y lo anuncia", async () => {
    const user = userEvent.setup()
    let fail!: () => void
    const onReorder = vi.fn(() => new Promise<void>((_, reject) => (fail = () => reject(new Error("sin red")))))
    render(<Invoices onReorder={onReorder} />)
    screen.getByRole("button", { name: "Reordenar Factura 0012" }).focus()
    await user.keyboard(" {ArrowDown} ")
    expect(order()).toEqual(["Nube Digital", "Acme S.A.", "Estudio Ruiz"])
    await act(async () => fail())
    expect(order()).toEqual(["Acme S.A.", "Nube Digital", "Estudio Ruiz"])
    expect(status()).toHaveTextContent("No se pudo guardar el orden: volvió el anterior.")
  })

  it("si la promesa se cumple, el orden nuevo queda aunque la app no mande items nuevos", async () => {
    const user = userEvent.setup()
    render(<Invoices onReorder={() => Promise.resolve()} />)
    screen.getByRole("button", { name: "Reordenar Factura 0014" }).focus()
    await user.keyboard(" {ArrowUp} ")
    await act(async () => {})
    expect(order()).toEqual(["Acme S.A.", "Estudio Ruiz", "Nube Digital"])
    expect(status()).toHaveTextContent("")
  })

  it("disabled: aun en edición no hay manija, así que no se toma nada", () => {
    render(<Invoices disabled />)
    expect(screen.queryByRole("button", { name: /Reordenar/ })).toBeNull()
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
  })

  it("con movimiento reducido no se desliza: la transición inline pierde", () => {
    render(<Invoices />)
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("motion-reduce:transition-none!")
  })

  it("los textos salen de LabelsProvider y la prop labels le gana", async () => {
    const user = userEvent.setup()
    render(
      <LabelsProvider value={{ sortable: { handle: "Reorder", picked: "Picked up", position: "position", of: "of" } }}>
        <Invoices labels={{ handle: "Mover" }} />
      </LabelsProvider>
    )
    screen.getByRole("button", { name: "Mover Factura 0012" }).focus()
    await user.keyboard(" ")
    expect(live()).toHaveTextContent("Picked up Factura 0012, position 1 of 3.")
    await user.keyboard("{Escape}")
  })

  it("hidrata sin mismatch (los ids de dnd-kit salen de useId)", async () => {
    const ui = <Invoices />
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
    it("fuera de edición no hay manija: la lista no se reordena", () => {
      render(<Invoices defaultEditing={false} />)
      expect(screen.getAllByRole("listitem")).toHaveLength(3)
      expect(screen.queryByRole("button", { name: /Reordenar/ })).toBeNull()
    })

    it("mantener apretada una fila ~0,5 s entra en edición y aparece la manija", () => {
      vi.useFakeTimers()
      try {
        const onEditingChange = vi.fn()
        render(<Invoices defaultEditing={false} onEditingChange={onEditingChange} />)
        fireEvent.pointerDown(screen.getByText("Nube Digital"), { button: 0, isPrimary: true, clientX: 5, clientY: 5 })
        act(() => vi.advanceTimersByTime(500))
        expect(onEditingChange).toHaveBeenCalledWith(true)
        expect(screen.getByRole("button", { name: "Reordenar Factura 0013" })).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })

    it("onRemove: en edición cada fila va «−» adelante y la manija al final; sacar anuncia", async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn()
      render(<Invoices onRemove={onRemove} />)
      const row = screen.getAllByRole("listitem")[1]!
      const remove = within(row).getByRole("button", { name: "Sacar Factura 0013" })
      const buttons = within(row).getAllByRole("button")
      expect(buttons[0]).toBe(remove)
      expect(buttons.at(-1)).toHaveAccessibleName("Reordenar Factura 0013")
      expect(remove).not.toHaveClass("absolute")
      await user.click(remove)
      expect(onRemove).toHaveBeenCalledWith("0013")
      expect(status()).toHaveTextContent("Se sacó Factura 0013.")
    })

    it("controlado: con editing aparece la manija", () => {
      const { rerender } = render(<Invoices editing={false} />)
      expect(screen.queryByRole("button", { name: /Reordenar/ })).toBeNull()
      rerender(<Invoices editing />)
      expect(screen.getByRole("button", { name: "Reordenar Factura 0012" })).toBeInTheDocument()
    })
  })

  describe("itemClassName y plain (2.2)", () => {
    it("itemClassName va al <li> de cada fila, como texto o según el ítem y su estado", async () => {
      const user = userEvent.setup()
      const seen: { index: number; dragging: boolean; editing: boolean }[] = []
      render(
        <Invoices
          itemClassName={(invoice, state) => {
            seen.push(state)
            return cn(invoice.id === "0013" && "mt-4", state.dragging && "opacity-90")
          }}
        />
      )
      const rows = screen.getAllByRole("listitem")
      expect(rows[1]).toHaveClass("mt-4")
      expect(rows[0]).not.toHaveClass("mt-4")
      expect(seen).toContainEqual({ index: 2, dragging: false, editing: true })
      screen.getByRole("button", { name: "Reordenar Factura 0012" }).focus()
      await user.keyboard(" ")
      expect(screen.getAllByRole("listitem")[0]).toHaveClass("opacity-90")
      await user.keyboard("{Escape}")
    })

    it("itemClassName como texto", () => {
      render(<Invoices itemClassName="bg-fill-1" />)
      for (const row of screen.getAllByRole("listitem")) expect(row).toHaveClass("bg-fill-1")
    })

    it("plain: sin separador ni padding de fila, para cuando renderItem dibuja su card", () => {
      render(<Invoices plain />)
      const row = screen.getAllByRole("listitem")[1]!
      expect(row).toHaveAttribute("data-plain")
      // El `div` de adentro es el de `ListRow`: la regla la lleva el paquete, no la app.
      expect(row).toHaveClass("before:hidden", "[&>div]:p-0", "[&>div]:min-h-0")
      expect(row.firstElementChild?.tagName).toBe("DIV")
    })
  })
})
