"use client"

import { useState } from "react"
import { CalendarAgenda } from "sebs7n-ui/calendar-agenda"
import type { CalendarEvent } from "sebs7n-ui/calendar-view"

const EVENTS: CalendarEvent[] = [
  { id: "1", title: "Vencimiento F-0001", start: new Date(2026, 9, 5), allDay: true, color: "amber" },
  { id: "2", title: "Cierre de mes", start: new Date(2026, 9, 28), end: new Date(2026, 10, 1), allDay: true, color: "red" },
  { id: "4", title: "Capacitación de equipos · Confirmación de asistentes", start: new Date(2026, 9, 25), end: new Date(2026, 9, 31), allDay: true, color: "blue" },
  { id: "3", title: "Reunión de equipo", start: new Date(2026, 10, 2, 9, 30), end: new Date(2026, 10, 2, 10, 30) },
]

/**
 * La agenda para un contenedor angosto
 * Los eventos de `CalendarView` por mes, uno por renglón. Con `onEventClick` cada renglón es un botón.
 */
export function Basic() {
  const [last, setLast] = useState<string | null>(null)
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <CalendarAgenda events={EVENTS} hour12={false} onEventClick={(e) => setLast(e.title)} />
      <p className="text-footnote text-label-secondary">Último abierto: {last ?? "ninguno"}</p>
    </div>
  )
}
