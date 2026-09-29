import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CalendarView, type CalendarEvent } from "../../src/components/calendar-view"

// Martes 29 de septiembre de 2026, 22:07. La semana arranca el lunes 28.
const AHORA = new Date(2026, 8, 29, 22, 7)

const EVENTOS: CalendarEvent[] = [
  { id: "cierre", title: "Cierre de mes", start: new Date(2026, 8, 30), allDay: true, color: "blue" },
  { id: "acme", title: "Reunión con Acme", start: new Date(2026, 8, 29, 18, 30), end: new Date(2026, 8, 29, 20), color: "amber" },
  { id: "cobro", title: "Cobro Nube Digital", start: new Date(2026, 9, 1, 14, 0), end: new Date(2026, 9, 1, 15, 30), color: "red" },
]

const celda = (nombre: RegExp) => screen.getByRole("gridcell", { name: nombre })

describe("CalendarView · mes", () => {
  it("cabecera: mes 21/600 y año en gris, segmentado Semana/Mes y ‹ Hoy ›", () => {
    render(<CalendarView defaultDate={AHORA} events={EVENTOS} locale="es-AR" now={AHORA} />)
    expect(screen.getByText("Septiembre")).toHaveClass("text-title-2")
    expect(screen.getByText("2026")).toHaveClass("font-normal", "text-label-secondary")
    const vista = screen.getByRole("group", { name: "Vista" })
    expect(within(vista).getByRole("button", { name: "Mes" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Mes anterior" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Hoy" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Mes siguiente" })).toBeInTheDocument()
  })

  it("es una grilla con los días de la semana y solo las semanas del mes", () => {
    render(<CalendarView defaultDate={AHORA} locale="es-AR" now={AHORA} />)
    const grilla = screen.getByRole("grid", { name: "Septiembre 2026" })
    const filas = within(grilla).getAllByRole("row")
    // Cabecera + 5 semanas (31/08 a 04/10), como iCloud: no rellena a seis.
    expect(filas).toHaveLength(6)
    expect(within(filas[0]!).getAllByRole("columnheader")).toHaveLength(7)
    expect(within(grilla).getAllByRole("gridcell")).toHaveLength(35)
  })

  it("hoy va en el círculo del acento y con aria-current", () => {
    render(<CalendarView defaultDate={AHORA} locale="es-AR" now={AHORA} />)
    const hoy = celda(/29 de septiembre/)
    expect(hoy).toHaveAttribute("aria-current", "date")
    const numero = hoy.querySelector("[data-slot=calendar-view-day]")!
    expect(numero).toHaveClass("size-[30px]", "rounded-full")
    expect(numero.className).toContain("in-aria-[current=date]:bg-brand-700")
  })

  it("eventos: todo el día como chip de 18 al 20 %, con hora como punto + título + hora", () => {
    render(<CalendarView defaultDate={AHORA} events={EVENTOS} hour12={false} locale="es-AR" now={AHORA} />)
    const chip = within(celda(/30 de septiembre/)).getByText("Cierre de mes")
    expect(chip.closest("[data-slot=calendar-view-event]")).toHaveClass("h-[18px]", "rounded-tag", "font-semibold", "bg-blue-700/20", "text-blue-ink")
    const conHora = within(celda(/29 de septiembre/)).getByText("Reunión con Acme").closest("[data-slot=calendar-view-event]")!
    expect(conHora.querySelector("[data-slot=calendar-view-dot]")).toHaveClass("size-2", "bg-amber-700")
    expect(conHora).toHaveTextContent("18:30")
    // Los días de otro mes se ven, con sus eventos.
    expect(within(celda(/1 de octubre/)).getByText("Cobro Nube Digital")).toBeInTheDocument()
  })

  it("teclado de grilla: flechas, Home/End, PageUp/PageDown; Enter abre el día", async () => {
    const onDayOpen = vi.fn()
    const onDateChange = vi.fn()
    render(<CalendarView defaultDate={AHORA} locale="es-AR" now={AHORA} onDateChange={onDateChange} onDayOpen={onDayOpen} />)
    const conTab = screen.getAllByRole("gridcell").filter((el) => el.tabIndex === 0)
    expect(conTab).toEqual([celda(/29 de septiembre/)])
    celda(/29 de septiembre/).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(celda(/30 de septiembre/)).toHaveFocus()
    expect(celda(/30 de septiembre/)).toHaveAttribute("aria-selected", "true")
    await userEvent.keyboard("{ArrowUp}")
    expect(celda(/23 de septiembre/)).toHaveFocus()
    await userEvent.keyboard("{Home}")
    expect(celda(/21 de septiembre/)).toHaveFocus()
    await userEvent.keyboard("{End}")
    expect(celda(/27 de septiembre/)).toHaveFocus()
    await userEvent.keyboard("{PageDown}")
    expect(screen.getByRole("grid", { name: "Octubre 2026" })).toBeInTheDocument()
    expect(celda(/27 de octubre/)).toHaveFocus()
    expect(onDateChange).toHaveBeenLastCalledWith(new Date(2026, 9, 27))
    await userEvent.keyboard("{Enter}")
    expect(onDayOpen).toHaveBeenCalledWith(new Date(2026, 9, 27))
  })

  it("‹ › y Hoy cambian de mes", async () => {
    render(<CalendarView defaultDate={AHORA} locale="es-AR" now={AHORA} />)
    await userEvent.click(screen.getByRole("button", { name: "Mes siguiente" }))
    expect(screen.getByRole("grid", { name: "Octubre 2026" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Hoy" }))
    expect(screen.getByRole("grid", { name: "Septiembre 2026" })).toBeInTheDocument()
  })

  it("onEventClick con el evento", async () => {
    const onEventClick = vi.fn()
    render(<CalendarView defaultDate={AHORA} events={EVENTOS} locale="es-AR" now={AHORA} onEventClick={onEventClick} />)
    await userEvent.click(screen.getByText("Reunión con Acme"))
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "acme" }))
  })
})

describe("CalendarView · semana", () => {
  it("siete días con la fila «Todo el día», horas de 61 y bloques con borde izquierdo de 3", () => {
    render(<CalendarView defaultDate={AHORA} defaultView="week" events={EVENTOS} locale="es-AR" now={AHORA} />)
    expect(screen.getByRole("group", { name: "Vista" })).toBeInTheDocument()
    expect(within(screen.getByRole("group", { name: "Vista" })).getByRole("button", { name: "Semana" })).toHaveAttribute("aria-pressed", "true")
    const grilla = screen.getByRole("grid", { name: /28 de septiembre/ })
    expect(within(grilla).getAllByRole("gridcell")).toHaveLength(7)
    expect(screen.getByText("Todo el día")).toBeInTheDocument()
    const bloque = screen.getByText("Reunión con Acme").closest("[data-slot=calendar-view-event]") as HTMLElement
    expect(bloque).toHaveClass("border-s-[3px]", "rounded-tag", "bg-amber-700/20", "border-amber-700")
    // 18:30 → 18,5 horas × 61; 1 h 30 → 91,5.
    expect(bloque.style.top).toBe("1128.5px")
    expect(bloque.style.height).toBe("91.5px")
    const horas = document.querySelector("[data-slot=calendar-view-hours]")!
    expect(horas).toHaveStyle({ height: `${24 * 61}px` })
  })

  it("la línea de ahora, roja, con la hora al costado", () => {
    render(<CalendarView defaultDate={AHORA} defaultView="week" hour12={false} locale="es-AR" now={AHORA} />)
    const linea = document.querySelector("[data-slot=calendar-view-now]") as HTMLElement
    expect(linea).toHaveClass("bg-red-700")
    // En un pixel entero: una línea de 1 px entre dos pixeles se ve gris.
    expect(linea.style.top).toBe(`${Math.round((22 + 7 / 60) * 61)}px`)
    expect(screen.getByText("22:07")).toHaveClass("text-red-ink")
  })

  it("teclado: ←→ recorren los días y cruzan de semana", async () => {
    render(<CalendarView defaultDate={new Date(2026, 8, 28)} defaultView="week" locale="es-AR" now={AHORA} />)
    celda(/28 de septiembre/).focus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(screen.getByRole("grid", { name: /21 de septiembre/ })).toBeInTheDocument()
    expect(celda(/27 de septiembre/)).toHaveFocus()
  })
})
