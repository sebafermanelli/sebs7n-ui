import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { CalendarView, calendarViewDayLabels, type CalendarEvent } from "../../src/components/calendar-view"
import { defaultLabels, LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

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
    // El segmentado gris de Calendar (§2.10): una sola opción, el segmento elevado y no el acento.
    const vista = screen.getByRole("tablist", { name: "Vista" })
    expect(vista).toHaveAttribute("data-variant", "segmented")
    expect(within(vista).getByRole("tab", { name: "Mes" })).toHaveAttribute("aria-selected", "true")
    expect(within(vista).getByRole("tab", { name: "Semana" })).toHaveAttribute("aria-selected", "false")
    expect(vista.querySelector("[data-slot=tabs-indicator]")).toHaveClass("bg-segment")
    expect(vista.querySelector("[data-slot=toggle-group-item]")).toBeNull()
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

describe("CalendarView · eventos con el teclado", () => {
  const DOS: CalendarEvent[] = [
    { id: "acme", title: "Reunión con Acme", start: new Date(2026, 8, 29, 18, 30), color: "amber" },
    { id: "ruiz", title: "Llamar a Estudio Ruiz", start: new Date(2026, 8, 29, 19, 30), color: "blue" },
  ]

  it("F2 entra a los eventos del día; ↓ ↑ los recorren, Enter los abre y Escape vuelve al día", async () => {
    const onEventClick = vi.fn()
    const onDayOpen = vi.fn()
    render(<CalendarView defaultDate={AHORA} events={DOS} locale="es-AR" now={AHORA} onDayOpen={onDayOpen} onEventClick={onEventClick} />)
    celda(/29 de septiembre/).focus()
    await userEvent.keyboard("{F2}")
    expect(screen.getByRole("button", { name: /Reunión con Acme/ })).toHaveFocus()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: /Estudio Ruiz/ })).toHaveFocus()
    await userEvent.keyboard("{ArrowUp}{Enter}")
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "acme" }))
    // Adentro de un evento, las flechas no cambian de día ni Enter abre el día.
    expect(onDayOpen).not.toHaveBeenCalled()
    expect(celda(/29 de septiembre/)).toHaveAttribute("aria-selected", "true")
    await userEvent.keyboard("{Escape}")
    expect(celda(/29 de septiembre/)).toHaveFocus()
  })

  it("en la semana, un click en un bloque no deja el foco adentro de lo que el lector no ve", () => {
    render(<CalendarView defaultDate={AHORA} defaultView="week" events={DOS} locale="es-AR" now={AHORA} onEventClick={() => {}} />)
    const bloque = screen.getByText("Reunión con Acme").closest("[data-slot=calendar-view-event]")!
    expect(bloque.closest("[aria-hidden=true]")).not.toBeNull()
    expect(fireEvent.mouseDown(bloque)).toBe(false)
  })
})

describe("CalendarView · revisión de R5b", () => {
  it("un evento que cruza la medianoche se parte entre los dos días de la semana", () => {
    const tarde: CalendarEvent[] = [{ id: "cierre", title: "Cierre nocturno", start: new Date(2026, 8, 29, 22, 0), end: new Date(2026, 8, 30, 2, 0) }]
    render(<CalendarView defaultDate={AHORA} defaultView="week" events={tarde} locale="es-AR" now={AHORA} />)
    const bloques = screen.getAllByText("Cierre nocturno").map((texto) => texto.closest<HTMLElement>("[data-slot=calendar-view-event]")!)
    expect(bloques).toHaveLength(2)
    expect(bloques[0]!.style.top).toBe(`${22 * 61}px`)
    expect(bloques[0]!.style.height).toBe(`${2 * 61}px`)
    expect(bloques[1]!.style.top).toBe("0px")
    expect(bloques[1]!.style.height).toBe(`${2 * 61}px`)
  })

  it("la duración sale del reloj de pared, no de los milisegundos (cambio de horario)", () => {
    const zona = process.env.TZ
    process.env.TZ = "America/New_York"
    try {
      // 8 de marzo de 2026 a las 2:00 el reloj salta a las 3:00: de 1:00 a 4:00 son 3 horas de pared
      // (lo que ocupa en la grilla) aunque pasen 2.
      const dia = new Date(2026, 2, 8)
      const evento: CalendarEvent[] = [{ id: "x", title: "Inventario", start: new Date(2026, 2, 8, 1, 0), end: new Date(2026, 2, 8, 4, 0) }]
      render(<CalendarView defaultDate={dia} defaultView="week" events={evento} locale="es-AR" now={dia} />)
      expect(screen.getByText("Inventario").closest<HTMLElement>("[data-slot=calendar-view-event]")!.style.height).toBe(`${3 * 61}px`)
    } finally {
      if (zona === undefined) delete process.env.TZ
      else process.env.TZ = zona
    }
  })

  it("el mes se anuncia al cambiarlo con ‹ ›, no cuando el foco ya dice la fecha", async () => {
    render(<CalendarView defaultDate={AHORA} locale="es-AR" now={AHORA} />)
    expect(screen.getByRole("heading", { name: /Septiembre/ })).not.toHaveAttribute("aria-live")
    const aviso = screen.getByRole("status")
    await userEvent.click(screen.getByRole("button", { name: "Mes siguiente" }))
    expect(aviso).toHaveTextContent("Octubre 2026")
    celda(/jueves, 1 de octubre/).focus()
    await userEvent.keyboard("{PageDown}")
    expect(aviso).toHaveTextContent("Octubre 2026")
  })

  it("«Hoy» sin cambiar de mes no deja un anuncio pendiente para el teclado", async () => {
    render(<CalendarView defaultDate={AHORA} locale="es-AR" now={AHORA} />)
    const aviso = screen.getByRole("status")
    await userEvent.click(screen.getByRole("button", { name: "Hoy" }))
    celda(/29 de septiembre/).focus()
    await userEvent.keyboard("{PageDown}")
    expect(aviso).toHaveTextContent("")
  })

  it("las celdas con eventos anuncian F2 con aria-keyshortcuts", () => {
    render(<CalendarView defaultDate={AHORA} events={EVENTOS} locale="es-AR" now={AHORA} onEventClick={() => {}} />)
    expect(celda(/29 de septiembre/)).toHaveAttribute("aria-keyshortcuts", "F2")
    expect(celda(/28 de septiembre/)).not.toHaveAttribute("aria-keyshortcuts")
  })

  it("en la semana, Shift+PageDown salta un mes", async () => {
    render(<CalendarView defaultDate={new Date(2026, 8, 28)} defaultView="week" locale="es-AR" now={AHORA} />)
    celda(/28 de septiembre/).focus()
    await userEvent.keyboard("{Shift>}{PageDown}{/Shift}")
    expect(screen.getByRole("grid", { name: /26 de octubre/ })).toBeInTheDocument()
  })
})

describe("CalendarView · segmentado", () => {
  it("cambiar de pestaña cambia la vista, y el cuerpo es su panel sin sumar una parada de Tab", async () => {
    const onViewChange = vi.fn()
    render(<CalendarView defaultDate={AHORA} locale="es-AR" now={AHORA} onViewChange={onViewChange} />)
    await userEvent.click(screen.getByRole("tab", { name: "Semana" }))
    expect(onViewChange).toHaveBeenCalledWith("week")
    const panel = screen.getByRole("tabpanel")
    expect(panel).toHaveAttribute("tabindex", "-1")
    expect(within(panel).getByRole("grid", { name: /28 de septiembre/ })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Semana" })).toHaveAttribute("aria-selected", "true")
  })

  it("con el teclado: ← → mueven entre Semana y Mes", async () => {
    render(<CalendarView defaultDate={AHORA} locale="es-AR" now={AHORA} />)
    screen.getByRole("tab", { name: "Mes" }).focus()
    await userEvent.keyboard("{ArrowLeft}{Enter}")
    expect(screen.getByRole("tab", { name: "Semana" })).toHaveAttribute("aria-selected", "true")
  })
})

describe("CalendarView · semana", () => {
  it("siete días con la fila «Todo el día», horas de 61 y bloques con borde izquierdo de 3", () => {
    render(<CalendarView defaultDate={AHORA} defaultView="week" events={EVENTOS} locale="es-AR" now={AHORA} />)
    expect(within(screen.getByRole("tablist", { name: "Vista" })).getByRole("tab", { name: "Semana" })).toHaveAttribute("aria-selected", "true")
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

describe("CalendarView · día", () => {
  it("el segmentado tiene Día, Semana y Mes; Día es una grilla de una columna nombrada con la fecha", () => {
    render(<CalendarView defaultDate={AHORA} defaultView="day" events={EVENTOS} locale="es-AR" now={AHORA} />)
    const vista = screen.getByRole("tablist", { name: "Vista" })
    expect(within(vista).getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["Día", "Semana", "Mes"])
    expect(within(vista).getByRole("tab", { name: "Día" })).toHaveAttribute("aria-selected", "true")
    const grilla = screen.getByRole("grid", { name: "martes, 29 de septiembre de 2026" })
    expect(within(grilla).getAllByRole("gridcell")).toHaveLength(1)
    expect(within(grilla).getAllByRole("columnheader")).toHaveLength(1)
    // El título va con el mes corto para que la cabecera siga en una línea a ~600 de ancho; la
    // fecha larga la dicen la grilla y el anuncio.
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/^29 sept 2026$/)
    expect(screen.getByRole("button", { name: "Día anterior" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Día siguiente" })).toBeInTheDocument()
  })

  it("fila «Todo el día», horas de 61, el bloque del evento y la línea de ahora en la única columna", () => {
    render(<CalendarView defaultDate={AHORA} defaultView="day" events={EVENTOS} hour12={false} locale="es-AR" now={AHORA} />)
    expect(screen.getByText("Todo el día")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=calendar-view-hours]")).toHaveClass("grid-cols-[4.5rem_minmax(0,1fr)]")
    const bloque = screen.getByText("Reunión con Acme").closest("[data-slot=calendar-view-event]") as HTMLElement
    expect(bloque).toHaveClass("border-s-[3px]", "bg-amber-700/20")
    expect(bloque.style.top).toBe("1128.5px")
    expect(bloque.style.width).toBe("calc(100% - 2px)")
    // Los de otros días no se dibujan.
    expect(screen.queryByText("Cierre de mes")).not.toBeInTheDocument()
    expect(screen.queryByText("Cobro Nube Digital")).not.toBeInTheDocument()
    const punto = document.querySelector("[data-slot=calendar-view-now] > span") as HTMLElement
    expect(punto.style.insetInlineStart).toBe("0%")
    expect(screen.getByText("22:07")).toHaveClass("text-red-ink")
  })

  it("‹ › pasan de a un día y lo anuncian; el evento de todo el día aparece en su fila", async () => {
    render(<CalendarView defaultDate={AHORA} defaultView="day" events={EVENTOS} locale="es-AR" now={AHORA} />)
    await userEvent.click(screen.getByRole("button", { name: "Día siguiente" }))
    expect(screen.getByRole("grid", { name: "miércoles, 30 de septiembre de 2026" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("miércoles, 30 de septiembre de 2026")
    expect(screen.getByText("Cierre de mes").closest("[data-slot=calendar-view-event]")).toHaveClass("h-[18px]", "rounded-tag")
    await userEvent.click(screen.getByRole("button", { name: "Día anterior" }))
    await userEvent.click(screen.getByRole("button", { name: "Día anterior" }))
    expect(screen.getByRole("grid", { name: /28 de septiembre/ })).toBeInTheDocument()
  })

  it("el mismo teclado: ← → cambian de día y el foco sigue en la celda; PageDown salta una semana; Enter abre", async () => {
    const onDayOpen = vi.fn()
    render(<CalendarView defaultDate={AHORA} defaultView="day" locale="es-AR" now={AHORA} onDayOpen={onDayOpen} />)
    celda(/29 de septiembre/).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(celda(/30 de septiembre/)).toHaveFocus()
    await userEvent.keyboard("{PageDown}")
    expect(celda(/7 de octubre/)).toHaveFocus()
    await userEvent.keyboard("{Home}")
    expect(celda(/5 de octubre/)).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onDayOpen).toHaveBeenCalledWith(new Date(2026, 9, 5))
  })

  it("los textos de Día salen del provider y de la prop, sin estar en defaultLabels", () => {
    expect(defaultLabels.calendarView).not.toHaveProperty("day")
    expect(calendarViewDayLabels).toEqual({ day: "Día", previousDay: "Día anterior", nextDay: "Día siguiente" })
    render(
      <LabelsProvider value={{ calendarView: { day: "Day", previousDay: "Previous day" } }}>
        <CalendarView defaultDate={AHORA} defaultView="day" labels={{ nextDay: "Mañana" }} locale="es-AR" now={AHORA} />
      </LabelsProvider>
    )
    expect(screen.getByRole("tab", { name: "Day" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Previous day" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Mañana" })).toBeInTheDocument()
  })

  it("hidrata sin mismatch en la vista Día", async () => {
    const ui = <CalendarView defaultDate={AHORA} defaultView="day" events={EVENTOS} locale="es-AR" now={AHORA} />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
    errors.mockRestore()
  })
})
