"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { categoryChip, categoryFill } from "../internal/category-color.js"
import { addDays, addMonths, isSameDay, isSameMonth, startOfDay, startOfWeek, weeksOfMonth, type WeekStart } from "../lib/dates.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import type { BadgeColor } from "../variants/badge.js"
import { Button } from "./button.js"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group.js"

/**
 * El calendario de iCloud (catálogo §2.17), en vista de mes y de semana: cabecera con el mes en 21/600
 * y el año en gris, el segmentado de la vista y «‹ Hoy ›»; hoy en el círculo del acento; eventos de
 * todo el día como chips de 18 (el color al 20 % y el texto en su tinta) y eventos con hora como punto
 * de 8 + título + hora en el mes, o bloques con el borde izquierdo de 3 en la semana, con la línea roja
 * de «ahora».
 *
 * Los días son una grilla (`role="grid"`) con foco itinerante: flechas, Home/End y PageUp/PageDown
 * (Shift: un año), y Enter abre el día (`onDayOpen`).
 */
type CalendarEvent = {
  id: string
  title: string
  start: Date
  /** El fin. Sin `end`, un evento con hora dura una hora. */
  end?: Date
  /** Todo el día: chip arriba del día (o en la fila «Todo el día» de la semana). */
  allDay?: boolean
  /** El color del calendario (la paleta de `Badge`). Por defecto, el de la marca. */
  color?: BadgeColor
}

type CalendarViewMode = "month" | "week"

type CalendarViewProps = Omit<React.ComponentProps<"div">, "children" | "defaultValue" | "onChange"> & {
  events?: CalendarEvent[]
  /** La vista. Pasarla la vuelve controlada. */
  view?: CalendarViewMode
  defaultView?: CalendarViewMode
  onViewChange?: (view: CalendarViewMode) => void
  /** El día activo: define el mes o la semana que se ve y dónde está el foco. Pasarlo lo vuelve controlado. */
  date?: Date
  defaultDate?: Date
  onDateChange?: (date: Date) => void
  /** El momento actual (hoy y la línea de «ahora»). Por defecto, el reloj del navegador después de montar. */
  now?: Date
  /** 1 lunes (default), 0 domingo. */
  weekStartsOn?: WeekStart
  /** El locale de los nombres de meses y días y de las horas. */
  locale?: string
  /** `false` fuerza las 24 horas («18:30»); `true`, las 12. Por defecto, lo que diga el locale. */
  hour12?: boolean
  onEventClick?: (event: CalendarEvent) => void
  /** Enter o doble click sobre un día: mostrar sus eventos, crear uno. */
  onDayOpen?: (date: Date) => void
  /** La hora que se ve arriba al abrir la semana, si hoy no está en ella. */
  scrollToHour?: number
  labels?: Partial<Labels["calendarView"]>
}

const HOUR = 61
const MAX_IN_DAY = 3

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const endOf = (event: CalendarEvent) => event.end ?? new Date(event.start.getTime() + 3_600_000)
const minutes = (date: Date) => date.getHours() * 60 + date.getMinutes()

/** Los eventos de un día, primero los de todo el día y después por hora. */
function eventsOf(events: CalendarEvent[], day: Date) {
  const next = addDays(day, 1)
  return events
    .filter((event) => (event.allDay ? isSameDay(event.start, day) || (event.start < day && endOf(event) > day) : event.start >= day && event.start < next))
    .sort((a, b) => Number(!!b.allDay) - Number(!!a.allDay) || a.start.getTime() - b.start.getTime())
}

/** Columnas para los eventos que se pisan en un día: cada uno recibe su columna y cuántas hay en su grupo. */
function layoutDay(events: CalendarEvent[]) {
  const placed: { event: CalendarEvent; column: number; columns: number }[] = []
  let group: typeof placed = []
  let groupEnd = 0
  const close = () => {
    const columns = Math.max(...group.map((item) => item.column)) + 1
    for (const item of group) item.columns = columns
    group = []
  }
  for (const event of events) {
    if (group.length && event.start.getTime() >= groupEnd) close()
    const used = new Set(group.filter((item) => endOf(item.event) > event.start).map((item) => item.column))
    let column = 0
    while (used.has(column)) column++
    const item = { event, column, columns: 1 }
    group.push(item)
    placed.push(item)
    groupEnd = Math.max(groupEnd, endOf(event).getTime())
  }
  if (group.length) close()
  return placed
}

function useNow(nowProp: Date | undefined) {
  const [clock, setClock] = React.useState<Date | null>(null)
  React.useEffect(() => {
    if (nowProp) return
    setClock(new Date())
    const id = setInterval(() => setClock(new Date()), 60_000)
    return () => clearInterval(id)
  }, [nowProp])
  return nowProp ?? clock
}

function CalendarView({
  className,
  events = [],
  view: viewProp,
  defaultView = "month",
  onViewChange,
  date: dateProp,
  defaultDate,
  onDateChange,
  now: nowProp,
  weekStartsOn = 1,
  locale,
  hour12,
  onEventClick,
  onDayOpen,
  scrollToHour = 8,
  labels: labelsProp,
  ...props
}: CalendarViewProps) {
  const labels = { ...useLabels().calendarView, ...labelsProp }
  const now = useNow(nowProp)
  const [ownView, setOwnView] = React.useState(defaultView)
  const view = viewProp ?? ownView
  const [ownDate, setOwnDate] = React.useState(() => startOfDay(defaultDate ?? nowProp ?? new Date()))
  const date = dateProp ? startOfDay(dateProp) : ownDate
  const gridRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const focusAfter = React.useRef(false)

  const setView = (next: CalendarViewMode) => {
    if (viewProp === undefined) setOwnView(next)
    onViewChange?.(next)
  }
  const setDate = (next: Date, focus = false) => {
    focusAfter.current = focus
    if (dateProp === undefined) setOwnDate(startOfDay(next))
    onDateChange?.(startOfDay(next))
  }

  // Después de mover con el teclado, el foco va a la celda nueva (que puede estar en otro mes).
  React.useEffect(() => {
    if (!focusAfter.current) return
    focusAfter.current = false
    gridRef.current?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus()
  })

  const weekStart = startOfWeek(date, weekStartsOn)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options)
  const fullDate = fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const time = fmt({ hour: "2-digit", minute: "2-digit", hour12 })
  const hourLabel = fmt({ hour: "numeric", hour12 })
  const monthName = capitalize(fmt({ month: "long" }).format(date))
  const year = date.getFullYear()

  // La semana abre en la hora de ahora (si hoy está en ella) o en `scrollToHour`.
  const showsToday = now != null && weekDays.some((day) => isSameDay(day, now))
  React.useEffect(() => {
    if (view !== "week" || !scrollRef.current) return
    const hour = showsToday && now ? Math.max(0, now.getHours() - 2) : scrollToHour
    scrollRef.current.scrollTop = hour * HOUR
    // Solo al cambiar de vista o de semana, no con cada minuto del reloj.
  }, [view, weekStart.getTime()])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, () => Date> = {
      ArrowRight: () => addDays(date, 1),
      ArrowLeft: () => addDays(date, -1),
      Home: () => weekStart,
      End: () => addDays(weekStart, 6),
      ...(view === "month"
        ? {
            ArrowDown: () => addDays(date, 7),
            ArrowUp: () => addDays(date, -7),
            PageDown: () => addMonths(date, event.shiftKey ? 12 : 1),
            PageUp: () => addMonths(date, event.shiftKey ? -12 : -1),
          }
        : { PageDown: () => addDays(date, 7), PageUp: () => addDays(date, -7) }),
    }
    const next = step[event.key]
    if (next) {
      event.preventDefault()
      setDate(next(), true)
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onDayOpen?.(date)
    }
  }

  const shift = (direction: 1 | -1) => setDate(view === "month" ? addMonths(date, direction) : addDays(date, 7 * direction))

  const renderEvent = (item: CalendarEvent, variant: "chip" | "line" | "block", style?: React.CSSProperties) => {
    const color = item.color ?? "brand"
    const Tag = onEventClick ? "button" : "div"
    return (
      <Tag
        key={item.id}
        data-slot="calendar-view-event"
        {...(onEventClick ? { type: "button" as const, tabIndex: -1, onClick: () => onEventClick(item) } : {})}
        style={style}
        className={cn(
          "flex min-w-0 text-start text-footnote",
          variant === "chip" && ["h-[18px] shrink-0 items-center rounded-tag px-1 font-semibold", categoryChip[color]],
          variant === "line" && "h-[18px] shrink-0 items-center gap-1 text-label",
          variant === "block" && ["absolute flex-col overflow-hidden rounded-tag border-s-[3px] px-1.5 py-0.5 font-semibold", categoryChip[color]],
          onEventClick && "cursor-pointer"
        )}
      >
        {variant === "line" && <span data-slot="calendar-view-dot" aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", categoryFill[color])} />}
        <span className={cn("min-w-0 truncate", variant === "line" && "flex-1")}>{item.title}</span>
        {!item.allDay && variant !== "chip" && (
          <span className={cn("shrink-0 tabular-nums", variant === "line" ? "text-caption text-label-secondary" : "font-normal")}>
            {time.format(item.start)}
          </span>
        )}
      </Tag>
    )
  }

  const cellProps = (day: Date) => {
    const active = isSameDay(day, date)
    return {
      role: "gridcell",
      tabIndex: active ? 0 : -1,
      "aria-selected": active,
      "aria-current": now && isSameDay(day, now) ? ("date" as const) : undefined,
      onClick: () => setDate(day),
      onDoubleClick: () => onDayOpen?.(day),
    }
  }

  const dayNumber = (day: Date, muted: boolean) => (
    <span
      data-slot="calendar-view-day"
      aria-hidden="true"
      className={cn(
        "flex size-[30px] shrink-0 items-center justify-center rounded-full text-subheadline tabular-nums",
        muted ? "text-label-tertiary" : "text-label",
        "in-aria-[current=date]:bg-brand-700 in-aria-[current=date]:font-semibold in-aria-[current=date]:text-brand-contrast"
      )}
    >
      {day.getDate()}
    </span>
  )

  const weekdayHeader = (day: Date) => (
    <div
      key={day.getDay()}
      role="columnheader"
      aria-label={fmt({ weekday: "long" }).format(day)}
      className={cn("truncate px-2 pb-1.5 text-body", now && day.getDay() === now.getDay() && isSameDay(startOfWeek(day, weekStartsOn), startOfWeek(now, weekStartsOn)) ? "text-brand-ink" : "text-label-secondary")}
    >
      {view === "week" && <span className="me-1 font-semibold text-label tabular-nums">{day.getDate()}</span>}
      {capitalize(fmt({ weekday: "short" }).format(day).replace(".", ""))}
    </div>
  )

  const focusRing = "outline-none focus-visible:focus-ring"

  let body: React.ReactNode
  if (view === "month") {
    const weeks = weeksOfMonth(date, weekStartsOn).filter((week) => week.some((day) => isSameMonth(day, date)))
    body = (
      <div
        ref={gridRef}
        role="grid"
        aria-label={`${monthName} ${year}`}
        onKeyDown={onKeyDown}
        className="grid min-h-0 flex-1 grid-cols-1"
        style={{ gridTemplateRows: `auto repeat(${weeks.length}, minmax(6.5rem, 1fr))` }}
      >
        <div role="row" className="grid grid-cols-7 gap-x-1.5 px-5">
          {weekDays.map(weekdayHeader)}
        </div>
        {weeks.map((week) => (
          <div role="row" key={week[0]!.getTime()} className="grid grid-cols-7 gap-x-1.5 px-5">
            {week.map((day) => {
              const dayEvents = eventsOf(events, day)
              const hidden = dayEvents.length - MAX_IN_DAY
              return (
                <div
                  key={day.getTime()}
                  {...cellProps(day)}
                  className={cn("flex min-w-0 flex-col gap-0.5 border-t border-separator pt-1 pb-1.5 aria-selected:bg-fill-1", focusRing)}
                >
                  <span className="sr-only">{fullDate.format(day)}</span>
                  {dayNumber(day, !isSameMonth(day, date))}
                  {dayEvents.slice(0, hidden > 0 ? MAX_IN_DAY - 1 : MAX_IN_DAY).map((item) => renderEvent(item, item.allDay ? "chip" : "line"))}
                  {hidden > 0 && (
                    <span className="px-1 text-caption text-label-secondary">
                      +{hidden + 1} {labels.more}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  } else {
    const allDay = weekDays.map((day) => eventsOf(events, day).filter((item) => item.allDay))
    const nowTop = now ? (minutes(now) / 60) * HOUR : 0
    const todayIndex = now ? weekDays.findIndex((day) => isSameDay(day, now)) : -1
    body = (
      <div
        ref={gridRef}
        role="grid"
        aria-label={`${labels.weekOf} ${fmt({ day: "numeric", month: "long", year: "numeric" }).format(weekStart)}`}
        onKeyDown={onKeyDown}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-col">
          <div role="row" className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
            <span aria-hidden="true" />
            {weekDays.map(weekdayHeader)}
          </div>
          <div role="row" className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-separator-strong">
            <span role="rowheader" className="pe-2 pt-0.5 text-end text-footnote text-label-secondary">
              {labels.allDay}
            </span>
            {weekDays.map((day, index) => (
              <div key={day.getTime()} {...cellProps(day)} className={cn("flex min-h-6 min-w-0 flex-col gap-0.5 border-s border-separator p-0.5 aria-selected:bg-fill-1", focusRing)}>
                <span className="sr-only">{fullDate.format(day)}</span>
                {allDay[index]!.map((item) => renderEvent(item, "chip"))}
                {/* Los eventos con hora del día, para el lector: los bloques de abajo están fuera de la celda. */}
                <span className="sr-only">
                  {eventsOf(events, day)
                    .filter((item) => !item.allDay)
                    .map((item) => `${time.format(item.start)} ${item.title}`)
                    .join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div
            data-slot="calendar-view-hours"
            aria-hidden="true"
            className="relative grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]"
            style={{ height: 24 * HOUR }}
          >
            <div className="relative">
              {Array.from({ length: 23 }, (_, index) => (
                <span key={index} className="absolute end-2 -translate-y-1/2 text-[13px] leading-4 text-label-secondary tabular-nums" style={{ top: (index + 1) * HOUR }}>
                  {hourLabel.format(new Date(2000, 0, 1, index + 1))}
                </span>
              ))}
            </div>
            {weekDays.map((day) => (
              <div
                key={day.getTime()}
                className="relative border-s border-separator bg-[linear-gradient(to_bottom,var(--color-separator)_1px,transparent_1px)] bg-size-[100%_61px]"
              >
                {layoutDay(eventsOf(events, day).filter((item) => !item.allDay)).map(({ event: item, column, columns }) =>
                  renderEvent(item, "block", {
                    top: (minutes(item.start) / 60) * HOUR,
                    height: Math.max(((endOf(item).getTime() - item.start.getTime()) / 3_600_000) * HOUR, 20),
                    insetInlineStart: `calc(${(column / columns) * 100}% + 1px)`,
                    width: `calc(${100 / columns}% - 2px)`,
                  })
                )}
              </div>
            ))}
            {todayIndex >= 0 && (
              <>
                <span className="absolute end-[calc(100%-3.5rem+0.5rem)] z-10 -translate-y-1/2 bg-surface text-[13px] leading-4 text-red-ink tabular-nums" style={{ top: nowTop }}>
                  {time.format(now!)}
                </span>
                <span
                  data-slot="calendar-view-now"
                  className="absolute end-0 start-14 z-10 h-px bg-red-700"
                  style={{ top: nowTop }}
                >
                  <span
                    className="absolute -top-[3.5px] size-2 -translate-x-1/2 rounded-full bg-red-700 rtl:translate-x-1/2"
                    style={{ insetInlineStart: `${(todayIndex / 7) * 100}%` }}
                  />
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-slot="calendar-view" data-view={view} className={cn("flex h-full min-h-0 w-full flex-col bg-surface text-label", className)} {...props}>
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-2.5">
        <h2 className="text-title-2 whitespace-nowrap" aria-live="polite">
          {monthName} <span className="font-normal text-label-secondary">{year}</span>
        </h2>
        <ToggleGroup
          aria-label={labels.view}
          className="w-56"
          onValueChange={(value) => value[0] && setView(value[0] as CalendarViewMode)}
          value={[view]}
        >
          <ToggleGroupItem value="week">{labels.week}</ToggleGroupItem>
          <ToggleGroupItem value="month">{labels.month}</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-1">
          <Button aria-label={view === "month" ? labels.previousMonth : labels.previousWeek} onClick={() => shift(-1)} size="icon-sm" variant="plain">
            <ChevronLeftIcon />
          </Button>
          <Button className="text-body" onClick={() => setDate(now ?? new Date())} size="sm" variant="plain">
            {labels.today}
          </Button>
          <Button aria-label={view === "month" ? labels.nextMonth : labels.nextWeek} onClick={() => shift(1)} size="icon-sm" variant="plain">
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      {body}
    </div>
  )
}

export { CalendarView, type CalendarEvent, type CalendarViewMode, type CalendarViewProps }
