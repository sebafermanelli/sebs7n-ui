"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { categoryChip, categoryFill } from "../internal/category-color.js"
import { defined } from "../internal/defined.js"
import { addDays, addMonths, isSameDay, isSameMonth, startOfDay, startOfWeek, weeksOfMonth, type WeekStart } from "../lib/dates.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import type { BadgeColor } from "../variants/badge.js"
import { Button } from "./button.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js"

/**
 * El calendario de iCloud (catálogo §2.17), en vista de mes, de semana y de día: cabecera con el mes en 21/600
 * y el año en gris, el segmentado de la vista y «‹ Hoy ›»; hoy en el círculo del acento; eventos de
 * todo el día como chips de 18 (el color al 20 % y el texto en su tinta) y eventos con hora como punto
 * de 8 + título + hora en el mes, o bloques con el borde izquierdo de 3 en la semana y el día, con la
 * línea roja de «ahora». El día es la semana con una sola columna: la misma fila «Todo el día», las
 * mismas horas y el mismo teclado.
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

type CalendarViewMode = "month" | "week" | "day"

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
/** El mes que se dibuja (invisible) antes de saber qué día es hoy: igual en el server y el cliente. */
const PLACEHOLDER = new Date(2000, 0, 1)
const MAX_IN_DAY = 3

/**
 * Los textos de la vista Día. No están en `defaultLabels` (el barrel está en su tope): se mezclan acá
 * debajo de los de `calendarView`, y el provider y la prop `labels` los cambian igual.
 */
const calendarViewDayLabels = { day: "Día", previousDay: "Día anterior", nextDay: "Día siguiente" } satisfies Required<
  Pick<Labels["calendarView"], "day" | "previousDay" | "nextDay">
>

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

/**
 * Los tramos con hora de un día en la semana: un evento que cruza la medianoche se parte, y cada día
 * dibuja su parte (22:00–24:00 y 00:00–02:00). `origin` es el comienzo real, para la hora que se lee.
 */
function segmentsOf(events: CalendarEvent[], day: Date) {
  const next = addDays(day, 1)
  return events
    .filter((event) => !event.allDay && event.start < next && endOf(event) > day)
    .map((event) => ({ ...event, start: event.start < day ? day : event.start, end: endOf(event) > next ? next : endOf(event), origin: event.start }))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

/**
 * Minutos de reloj de pared entre dos momentos: en el día del cambio de horario, 1:00 a 4:00 ocupan
 * tres horas de la grilla aunque pasen dos (la grilla es de horas de pared, no de milisegundos).
 */
function wallMinutes(from: Date, to: Date) {
  const days = Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000)
  return days * 1440 + minutes(to) - minutes(from)
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
  weekStartsOn: weekStartsOnProp,
  locale: localeProp,
  hour12,
  onEventClick,
  onDayOpen,
  scrollToHour = 8,
  labels: labelsProp,
  ...props
}: CalendarViewProps) {
  const all = useLabels()
  const labels = { ...calendarViewDayLabels, ...all.calendarView, ...defined(labelsProp) } as Required<Labels["calendarView"]>
  // El idioma y la semana globales (`LabelsProvider` `dates`); la prop gana.
  const locale = localeProp ?? all.dates?.locale
  const weekStartsOn = weekStartsOnProp ?? all.dates?.weekStartsOn ?? 1
  const now = useNow(nowProp)
  const [ownView, setOwnView] = React.useState(defaultView)
  const view = viewProp ?? ownView
  // Sin `date`, `defaultDate` ni `now`, el día inicial es «hoy», y hoy no se puede leer en el render:
  // el server (otra hora, otra zona) y el cliente caerían en días distintos y la hidratación no
  // coincidiría. Hasta montar se dibuja un marcador fijo, invisible, y el reloj lo reemplaza.
  const [ownDate, setOwnDate] = React.useState<Date | null>(() => (defaultDate ?? nowProp ? startOfDay((defaultDate ?? nowProp)!) : null))
  const pending = !dateProp && !ownDate && !now
  const date = dateProp ? startOfDay(dateProp) : (ownDate ?? (now ? startOfDay(now) : PLACEHOLDER))
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
  // Las columnas de la grilla de horas: la semana, o el día solo.
  const days = view === "day" ? [date] : weekDays
  const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options)
  const fullDate = fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const time = fmt({ hour: "2-digit", minute: "2-digit", hour12 })
  const hourLabel = fmt({ hour: "numeric", hour12 })
  const monthName = capitalize(fmt({ month: "long" }).format(date))
  const year = date.getFullYear()
  const titleOf = (day: Date) =>
    view === "month"
      ? `${capitalize(fmt({ month: "long" }).format(day))} ${day.getFullYear()}`
      : view === "day"
        ? fullDate.format(day)
        : `${labels.weekOf} ${fmt({ day: "numeric", month: "long", year: "numeric" }).format(startOfWeek(day, weekStartsOn))}`
  const title = titleOf(date)
  React.useEffect(() => {
    if (!announceNext.current) return
    announceNext.current = false
    setAnnouncement(title)
  }, [title])

  // La semana (o el día) abre en la hora de ahora (si hoy está en ella) o en `scrollToHour`.
  const showsToday = now != null && days.some((day) => isSameDay(day, now))
  React.useEffect(() => {
    if (view === "month" || !scrollRef.current) return
    const hour = showsToday && now ? Math.max(0, now.getHours() - 2) : scrollToHour
    scrollRef.current.scrollTop = hour * HOUR
    // Al cambiar de vista, de semana o de día (y cuando llega el reloj), no con cada minuto.
  }, [view, days[0]!.getTime(), showsToday])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Adentro de un evento (se entra con F2): ↓ ↑ recorren los del día, Escape o F2 vuelven a la
    // celda, y Enter/Espacio son del botón. Nada de esto cambia de día.
    const target = event.target as HTMLElement
    if (target.dataset.slot === "calendar-view-event") {
      const cell = target.closest<HTMLElement>('[role="gridcell"]')
      const siblings = [...(cell?.querySelectorAll<HTMLElement>('button[data-slot="calendar-view-event"]') ?? [])]
      const at = siblings.indexOf(target)
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        siblings[at + (event.key === "ArrowDown" ? 1 : -1)]?.focus()
      } else if (event.key === "Escape" || event.key === "F2") {
        event.preventDefault()
        cell?.focus()
      }
      return
    }
    if (event.key === "F2") {
      const first = target.querySelector<HTMLElement>('button[data-slot="calendar-view-event"]')
      if (first) {
        event.preventDefault()
        first.focus()
      }
      return
    }
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
        : {
            PageDown: () => (event.shiftKey ? addMonths(date, 1) : addDays(date, 7)),
            PageUp: () => (event.shiftKey ? addMonths(date, -1) : addDays(date, -7)),
          }),
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

  // Lo que se anuncia al cambiar de mes o semana con ‹ Hoy ›. Con el teclado en la grilla no: el foco
  // ya dice la fecha de la celda nueva, y el título con `aria-live` la decía dos veces.
  const [announcement, setAnnouncement] = React.useState("")
  const announceNext = React.useRef(false)
  // Solo si el título cambia: si no, no hay render que lo consuma y el anuncio quedaba pendiente para
  // la próxima tecla en la grilla.
  const go = (next: Date) => {
    announceNext.current = titleOf(next) !== title
    setDate(next)
  }
  const shift = (direction: 1 | -1) => go(view === "month" ? addMonths(date, direction) : addDays(date, (view === "day" ? 1 : 7) * direction))

  // `size` es solo de los bloques: "short" (menos de dos líneas de alto) va en una línea con la hora
  // adelante, y "tiny" (el mínimo de 20) solo con el título, como los eventos cortos de iCloud.
  const renderEvent = (
    item: CalendarEvent & { origin?: Date },
    variant: "chip" | "line" | "block",
    style?: React.CSSProperties,
    size?: "short" | "tiny"
  ) => {
    const color = item.color ?? "brand"
    const timeText = !item.allDay && variant !== "chip" && size !== "tiny" && (
      <span className={cn("shrink-0 tabular-nums", variant === "line" ? "text-caption text-label-secondary" : "font-normal")}>
        {time.format(item.origin ?? item.start)}
      </span>
    )
    const Tag = onEventClick ? "button" : "div"
    return (
      <Tag
        key={item.id}
        data-slot="calendar-view-event"
        data-size={size}
        {...(onEventClick
          ? {
              type: "button" as const,
              tabIndex: -1,
              onClick: () => onEventClick(item),
              // Los bloques de la semana están en la parte que el lector no ve (`aria-hidden`: los
              // eventos se leen en la fila «Todo el día»): un click no les deja el foco.
              onMouseDown: variant === "block" ? (event: React.MouseEvent) => event.preventDefault() : undefined,
            }
          : {})}
        style={style}
        className={cn(
          "flex min-w-0 text-start text-footnote",
          variant === "chip" && ["h-[18px] shrink-0 items-center rounded-tag px-1 font-semibold", categoryChip[color]],
          variant === "line" && "h-[18px] shrink-0 items-center gap-1 text-label",
          variant === "block" && [
            "absolute overflow-hidden rounded-tag border-s-[3px] px-1.5 py-0.5 font-semibold",
            size ? "flex-row items-baseline gap-1" : "flex-col",
            categoryChip[color],
          ],
          onEventClick && "cursor-pointer"
        )}
      >
        {variant === "line" && <span data-slot="calendar-view-dot" aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", categoryFill[color])} />}
        {size === "short" && timeText}
        <span className={cn("min-w-0 truncate", variant === "line" && "flex-1")}>{item.title}</span>
        {!size && timeText}
      </Tag>
    )
  }

  // `withEvents`: la celda tiene eventos que se abren (botones), y F2 entra a ellos.
  const cellProps = (day: Date, withEvents = false) => {
    const active = isSameDay(day, date)
    return {
      role: "gridcell",
      tabIndex: active ? 0 : -1,
      "aria-keyshortcuts": withEvents && onEventClick ? "F2" : undefined,
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
      className={cn("truncate px-1.5 pb-1.5 text-body", now && day.getDay() === now.getDay() && isSameDay(startOfWeek(day, weekStartsOn), startOfWeek(now, weekStartsOn)) ? "text-brand-ink" : "text-label-secondary")}
    >
      {view !== "month" && (
        <span
          className={cn(
            "me-1 inline-flex h-[30px] min-w-[30px] items-center justify-center rounded-full px-1 font-semibold tabular-nums",
            now && isSameDay(day, now) ? "bg-brand-700 text-brand-contrast" : "text-label"
          )}
        >
          {day.getDate()}
        </span>
      )}
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
                  {...cellProps(day, dayEvents.length > 0)}
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
    const allDay = days.map((day) => eventsOf(events, day).filter((item) => item.allDay))
    const nowTop = now ? Math.round((minutes(now) / 60) * HOUR) : 0
    const todayIndex = now ? days.findIndex((day) => isSameDay(day, now)) : -1
    // La semana son siete columnas después de la de las horas; el día, una.
    const columns = view === "day" ? "grid-cols-[4.5rem_minmax(0,1fr)]" : "grid-cols-[4.5rem_repeat(7,minmax(0,1fr))]"
    body = (
      <div
        ref={gridRef}
        role="grid"
        aria-label={titleOf(date)}
        onKeyDown={onKeyDown}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-col">
          <div role="row" className={cn("grid", columns)}>
            <span aria-hidden="true" />
            {days.map(weekdayHeader)}
          </div>
          <div role="row" className={cn("grid border-b border-separator-strong", columns)}>
            <span role="rowheader" className="pe-2 pt-0.5 text-end text-footnote text-label-secondary">
              {labels.allDay}
            </span>
            {days.map((day, index) => (
              <div key={day.getTime()} {...cellProps(day, allDay[index]!.length > 0)} className={cn("flex min-h-6 min-w-0 flex-col gap-0.5 border-s border-separator p-0.5 aria-selected:bg-fill-1", focusRing)}>
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
            className={cn("relative grid", columns)}
            style={{ height: 24 * HOUR }}
          >
            <div className="relative">
              {Array.from({ length: 23 }, (_, index) => (
                <span key={index} className="absolute end-2 -translate-y-1/2 text-[13px] leading-4 text-label-secondary tabular-nums" style={{ top: (index + 1) * HOUR }}>
                  {hourLabel.format(new Date(2000, 0, 1, index + 1))}
                </span>
              ))}
            </div>
            {days.map((day) => (
              <div
                key={day.getTime()}
                className="relative border-s border-separator bg-[linear-gradient(to_bottom,var(--color-separator)_1px,transparent_1px)] bg-size-[100%_61px]"
              >
                {layoutDay(segmentsOf(events, day)).map(({ event: item, column, columns }) => {
                  const height = (wallMinutes(item.start, endOf(item)) / 60) * HOUR
                  // Título y hora en dos líneas de 16 más el padding piden 36: menos, una línea.
                  const size = height <= 20 ? "tiny" : height < 36 ? "short" : undefined
                  return renderEvent(
                    item,
                    "block",
                    {
                      top: (minutes(item.start) / 60) * HOUR,
                      height: Math.max(height, 20),
                      insetInlineStart: `calc(${(column / columns) * 100}% + 1px)`,
                      width: `calc(${100 / columns}% - 2px)`,
                    },
                    size
                  )
                })}
              </div>
            ))}
            {todayIndex >= 0 && (
              <>
                <span className="absolute end-[calc(100%-4rem)] z-10 -translate-y-1/2 bg-surface text-[13px] leading-4 text-red-ink tabular-nums" style={{ top: nowTop }}>
                  {time.format(now!)}
                </span>
                <span
                  data-slot="calendar-view-now"
                  className="absolute end-0 start-18 z-10 h-px bg-red-700"
                  style={{ top: nowTop }}
                >
                  <span
                    className="absolute -top-[3.5px] size-2 -translate-x-1/2 rounded-full bg-red-700 rtl:translate-x-1/2"
                    style={{ insetInlineStart: `${(todayIndex / days.length) * 100}%` }}
                  />
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // El cambio de vista es el segmentado gris de Calendar (§2.10): una sola opción, el segmento
  // elevado (`Tabs` segmentado) y no el acento de `ToggleGroup`, que es para opciones que se prenden.
  // Todo el calendario es el `Tabs`: el cuerpo es el panel de la vista elegida, con `tabIndex={-1}`
  // porque la grilla ya es la parada de Tab y un panel tabulable la duplicaría.
  return (
    <Tabs
      data-slot="calendar-view"
      data-view={view}
      aria-busy={pending || undefined}
      className={cn("flex h-full min-h-0 w-full flex-col gap-0 bg-surface text-label", pending && "invisible", className)}
      onValueChange={(value) => setView(value as CalendarViewMode)}
      value={view}
      {...(props as Omit<React.ComponentProps<typeof Tabs>, "value" | "defaultValue" | "onValueChange">)}
    >
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-2.5">
        <h2 className="text-title-2 whitespace-nowrap">
          {/* En el día, el mes corto («29 sept»): con el largo, la cabecera baja a dos líneas a ~680.
              El lector recibe la fecha entera: «sept» abreviado y sin día de la semana se leía mal. */}
          {view === "day" ? (
            <>
              <span aria-hidden="true">
                {fmt({ day: "numeric", month: "short" }).format(date)} <span className="font-normal text-label-secondary">{year}</span>
              </span>
              <span className="sr-only">{fullDate.format(date)}</span>
            </>
          ) : (
            <>
              {monthName} <span className="font-normal text-label-secondary">{year}</span>
            </>
          )}
        </h2>
        <TabsList aria-label={labels.view} className="w-64" variant="segmented">
          <TabsTrigger value="day">{labels.day}</TabsTrigger>
          <TabsTrigger value="week">{labels.week}</TabsTrigger>
          <TabsTrigger value="month">{labels.month}</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-1">
          <Button aria-label={{ month: labels.previousMonth, week: labels.previousWeek, day: labels.previousDay }[view]} onClick={() => shift(-1)} size="icon-sm" variant="plain">
            <ChevronLeftIcon />
          </Button>
          <Button
            className="text-body"
            onClick={() => go(now ?? new Date())}
            size="sm"
            variant="plain"
          >
            {labels.today}
          </Button>
          <Button aria-label={{ month: labels.nextMonth, week: labels.nextWeek, day: labels.nextDay }[view]} onClick={() => shift(1)} size="icon-sm" variant="plain">
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <TabsContent className="flex min-h-0 flex-1 flex-col rounded-none text-inherit focus-visible:shadow-none" tabIndex={-1} value={view}>
        {body}
      </TabsContent>
    </Tabs>
  )
}

export { CalendarView, calendarViewDayLabels, type CalendarEvent, type CalendarViewMode, type CalendarViewProps }
