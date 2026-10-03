import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CalendarAgenda } from "../../src/components/calendar-agenda"
import type { CalendarEvent } from "../../src/components/calendar-view"

const events: CalendarEvent[] = [
  { id: "b", title: "Reunión", start: new Date(2026, 10, 2, 9, 30), end: new Date(2026, 10, 2, 10, 30) },
  { id: "a", title: "Vencimiento", start: new Date(2026, 9, 5), allDay: true },
  { id: "c", title: "Cierre", start: new Date(2026, 9, 28), end: new Date(2026, 10, 1), allDay: true, color: "red" },
]

describe("CalendarAgenda", () => {
  it("agrupa por mes y ordena por comienzo", () => {
    render(<CalendarAgenda events={events} hour12={false} />)
    const octubre = screen.getByRole("region", { name: "Octubre de 2026" })
    expect(within(octubre).getAllByRole("listitem").map((li) => li.textContent)).toEqual([expect.stringContaining("Vencimiento"), expect.stringContaining("Cierre")])
    expect(within(screen.getByRole("region", { name: "Noviembre de 2026" })).getByText("09:30")).toBeInTheDocument()
  })

  it("un evento de todo el día de varios días muestra el rango con el fin inclusive", () => {
    render(<CalendarAgenda events={events} />)
    expect(screen.getByText(/28 oct\.? – 31 oct\.?/)).toBeInTheDocument()
    expect(screen.getAllByText("Todo el día")).toHaveLength(2)
  })

  it("solo lectura sin onEventClick; con él, un botón por evento", async () => {
    const user = userEvent.setup()
    const onEventClick = vi.fn()
    const { rerender } = render(<CalendarAgenda events={events} />)
    expect(screen.queryByRole("button")).toBeNull()
    rerender(<CalendarAgenda events={events} onEventClick={onEventClick} />)
    await user.click(screen.getByRole("button", { name: /Reunión/ }))
    expect(onEventClick).toHaveBeenCalledWith(events[0])
  })

  it("sin eventos muestra el estado vacío que se le pase", () => {
    render(<CalendarAgenda empty={<p>Nada con fecha</p>} events={[]} />)
    expect(screen.getByText("Nada con fecha")).toBeInTheDocument()
  })
})
