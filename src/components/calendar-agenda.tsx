"use client"

import * as React from "react"

import { categoryFill } from "../internal/category-color.js"
import { addDays, startOfDay } from "../lib/dates.js"
import { cn } from "../lib/utils.js"
import type { CalendarEvent } from "./calendar-view.js"

type CalendarAgendaLabels = {
  /** El nombre de la lista. */
  agenda: string
  /** Lo que se lee en un evento de todo el día. */
  allDay: string
}

const calendarAgendaLabels: CalendarAgendaLabels = { agenda: "Agenda", allDay: "Todo el día" }

type CalendarAgendaProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Los mismos eventos que `CalendarView`. */
  events: CalendarEvent[]
  /** Click o Enter sobre un evento. Sin esto, los renglones son de solo lectura. */
  onEventClick?: (event: CalendarEvent) => void
  locale?: string
  /** `false` fuerza las 24 horas; `true`, las 12. Por defecto, lo que diga el locale. */
  hour12?: boolean
  /** Lo que se ve sin eventos. */
  empty?: React.ReactNode
  labels?: Partial<CalendarAgendaLabels>
}

/** El último día de un evento (inclusive): el fin de un evento de todo el día es exclusivo. */
function lastDay(event: CalendarEvent) {
  if (!event.end) return startOfDay(event.start)
  const end = event.allDay ? addDays(startOfDay(event.end), -1) : startOfDay(event.end)
  return end < startOfDay(event.start) ? startOfDay(event.start) : end
}

/**
 * La agenda de `CalendarView` para un contenedor angosto (un teléfono), donde un mes no entra: los
 * eventos por mes, uno por renglón, con el día y la hora a la izquierda. Es la misma lista de
 * `events`; se elige con una container query (la agenda en `@max-2xl`, `CalendarView` desde `@2xl`).
 * De lectura: con `onEventClick` cada renglón es un botón de 44 px de alto.
 */
function CalendarAgenda({ events, onEventClick, locale = "es-AR", hour12, empty, labels: labelsProp, className, ...props }: CalendarAgendaProps) {
  const labels = { ...calendarAgendaLabels, ...labelsProp }
  const groups = React.useMemo(() => {
    const month = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())
    const map = new Map<string, { key: string; label: string; events: CalendarEvent[] }>()
    for (const e of sorted) {
      const key = `${e.start.getFullYear()}-${e.start.getMonth()}`
      if (!map.has(key)) {
        const label = month.format(e.start)
        map.set(key, { key, label: label.charAt(0).toUpperCase() + label.slice(1), events: [] })
      }
      map.get(key)!.events.push(e)
    }
    return [...map.values()]
  }, [events, locale])
  const day = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }), [locale])
  const time = React.useMemo(() => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hour12 }), [locale, hour12])

  if (events.length === 0) return <>{empty}</>
  return (
    <div aria-label={labels.agenda} className={cn("flex flex-col gap-4", className)} data-slot="calendar-agenda" role="group" {...props}>
      {groups.map((group) => (
        <section aria-label={group.label} className="overflow-hidden rounded-surface bg-surface shadow-widget" key={group.key}>
          <h3 className="bg-surface-bar px-4 py-2 text-callout font-medium text-label">{group.label}</h3>
          <ul className="divide-y divide-separator">
            {group.events.map((e) => {
              const end = lastDay(e)
              const first = startOfDay(e.start)
              const when = end > first ? `${day.format(first)} – ${day.format(end)}` : day.format(first)
              const hour = e.allDay ? labels.allDay : time.format(e.start)
              const row = (
                <>
                  <span className="w-24 shrink-0 text-label-secondary tabular-nums">
                    <span className="block">{when}</span>
                    <span className="block text-footnote">{hour}</span>
                  </span>
                  <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", categoryFill[e.color ?? "brand"])} />
                  <span className="min-w-0 flex-1 truncate">{e.title}</span>
                </>
              )
              const rowClass = "flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-callout"
              return (
                <li key={e.id}>
                  {onEventClick ? (
                    <button className={cn(rowClass, "outline-none transition-control hover:bg-fill-1 focus-visible:focus-ring")} onClick={() => onEventClick(e)} type="button">
                      {row}
                    </button>
                  ) : (
                    <div className={rowClass}>{row}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export { CalendarAgenda, calendarAgendaLabels, type CalendarAgendaLabels, type CalendarAgendaProps }
