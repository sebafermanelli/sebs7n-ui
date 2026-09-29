import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Calendar } from "../../src/components/calendar"
import { CalendarView } from "../../src/components/calendar-view"
import { DatePicker } from "../../src/components/date-picker"
import { DateTimePicker } from "../../src/components/date-time-picker"
import { LabelsProvider } from "../../src/lib/labels"

// A nivel de módulo: el provider compara `format` por identidad.
const NUMERIC: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }
const firstHeader = () => document.querySelector("[data-slot=calendar-grid] th")!

describe("idioma, semana y formato globales (LabelsProvider dates)", () => {
  it("Calendar toma locale y weekStartsOn del provider", () => {
    render(
      <LabelsProvider value={{ dates: { locale: "en-US", weekStartsOn: 0 } }}>
        <Calendar defaultMonth={new Date(2026, 8, 1)} />
      </LabelsProvider>
    )
    expect(screen.getByText("September 2026")).toBeInTheDocument()
    expect(firstHeader()).toHaveAttribute("abbr", "Sunday")
  })

  it("la prop del componente le gana al provider", () => {
    render(
      <LabelsProvider value={{ dates: { locale: "en-US", weekStartsOn: 0 } }}>
        <Calendar defaultMonth={new Date(2026, 8, 1)} locale="es-AR" weekStartsOn={1} />
      </LabelsProvider>
    )
    expect(screen.getByText("septiembre de 2026")).toBeInTheDocument()
    expect(firstHeader()).toHaveAttribute("abbr", "lunes")
  })

  it("DatePicker escribe la fecha con el locale y el format del provider; la prop gana", () => {
    render(
      <LabelsProvider value={{ dates: { locale: "en-US", format: NUMERIC } }}>
        <DatePicker aria-label="Vence" defaultValue={new Date(2026, 8, 15)} />
        <DatePicker aria-label="Emitida" defaultValue={new Date(2026, 8, 15)} format={{ dateStyle: "medium" }} locale="es-AR" />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: /Vence/ })).toHaveTextContent("09/15/2026")
    expect(screen.getByRole("button", { name: /Emitida/ })).toHaveTextContent("15 sept 2026")
  })

  it("DateTimePicker también (por su DatePicker)", () => {
    render(
      <LabelsProvider value={{ dates: { locale: "en-US", format: NUMERIC } }}>
        <DateTimePicker aria-label="Emisión" defaultValue={new Date(2026, 8, 15, 9, 30)} />
      </LabelsProvider>
    )
    expect(document.querySelector("[data-slot=date-picker]")).toHaveTextContent("09/15/2026")
  })

  it("CalendarView toma locale y weekStartsOn del provider", () => {
    render(
      <LabelsProvider value={{ dates: { locale: "en-US", weekStartsOn: 0 } }}>
        <CalendarView defaultDate={new Date(2026, 8, 15)} now={new Date(2026, 8, 15)} />
      </LabelsProvider>
    )
    const grid = screen.getByRole("grid", { name: /September 2026/ })
    expect(within(grid).getAllByRole("columnheader")[0]!.textContent).toMatch(/^Sun/)
  })

  it("sin provider, lo de 2.0: es-AR y la semana del lunes", () => {
    render(<Calendar defaultMonth={new Date(2026, 8, 1)} />)
    expect(screen.getByText("septiembre de 2026")).toBeInTheDocument()
    expect(firstHeader()).toHaveAttribute("abbr", "lunes")
  })
})
