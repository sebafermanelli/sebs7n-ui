"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import {
  addDays,
  addMonths,
  clampDay,
  compareDays,
  isSameDay,
  isSameMonth,
  isWithin,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toISODate,
  weeksOfMonth,
  type DateRange,
  type WeekStart,
} from "../lib/dates.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"

type CalendarLabels = Labels["calendar"]

type CalendarBaseProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** El mes a la vista, controlado. Cualquier día de ese mes sirve. */
  month?: Date
  /** El mes con el que arranca. Por defecto, el de la fecha elegida, y si no hay, el actual. */
  defaultMonth?: Date
  /** Avisa cuando cambia el mes a la vista, con su primer día. */
  onMonthChange?: (month: Date) => void
  /**
   * Cuántos meses se ven a la vez, uno al lado del otro. Por defecto, 1. `month` es el primero.
   * Con más de uno, los días de los meses vecinos no se dibujan: ya están en el mes de al lado.
   */
  numberOfMonths?: number
  /** La primera fecha que se puede elegir. Las anteriores se ven apagadas. */
  min?: Date
  /** La última fecha que se puede elegir. */
  max?: Date
  /** Apaga fechas sueltas: feriados, fines de semana, días sin turno. */
  isDateDisabled?: (date: Date) => boolean
  /** El idioma de los nombres de mes y de día, como lo entiende `Intl`. Por defecto, `es-AR`. */
  locale?: string
  /** Con qué día arranca la semana: `1` lunes (el default), `0` domingo. */
  weekStartsOn?: WeekStart
  /** Los nombres de los botones de mes anterior y siguiente. */
  labels?: Partial<CalendarLabels>
}

type CalendarSingleProps = CalendarBaseProps & {
  /** `single` elige una fecha; `range`, un desde y un hasta en el mismo calendario. */
  mode?: "single"
  /** La fecha elegida, controlada. `null` es ninguna. */
  value?: Date | null
  /** La fecha elegida al montar, sin controlar. */
  defaultValue?: Date | null
  /** Avisa la fecha elegida. */
  onValueChange?: (value: Date | null) => void
}

type CalendarRangeProps = CalendarBaseProps & {
  mode: "range"
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (value: DateRange) => void
}

type CalendarProps = CalendarSingleProps | CalendarRangeProps

const SIN_RANGO: DateRange = { from: null, to: null }

/**
 * Un mes en una grilla —o varios, uno al lado del otro—, para elegir una fecha o un rango.
 *
 * Existe porque `<input type="date">` abre el calendario del navegador, que no se puede
 * estilar: adentro de un Popover de vidrio aparecía una caja gris del sistema operativo, con
 * otra tipografía y en el idioma del navegador y no en el de la app.
 *
 * No dibuja superficie. Va adentro de un `Popover` (que es lo que hace `DatePicker`), de una
 * `Card` o suelto en la página: el vidrio lo pone quien lo contiene.
 *
 * Sigue el patrón de grilla de fechas de WAI-ARIA: una sola parada de tabulación, y adentro se
 * recorre con las flechas. Los días de los meses vecinos se ven para completar las semanas,
 * pero no se pueden elegir ni enfocar: para ir a otro mes están los botones, o `Re Pág` y
 * `Av Pág`.
 *
 * Con `numberOfMonths` mayor a 1 cada fecha aparece **una sola vez**: los huecos de un mes
 * quedan vacíos, porque esos días ya están en el mes de al lado. Dibujarlos dos veces hace que
 * un rango se vea partido en pedazos de un lado y del otro. Si no entran a lo ancho, los meses
 * bajan uno debajo del otro.
 */
function Calendar(props: CalendarProps) {
  const {
    className,
    mode = "single",
    value: valueProp,
    defaultValue,
    onValueChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    min,
    max,
    isDateDisabled,
    locale = "es-AR",
    weekStartsOn = 1,
    labels: labelsProp,
    ...rest
  } = props as CalendarBaseProps & {
    mode?: "single" | "range"
    value?: Date | null | DateRange
    defaultValue?: Date | null | DateRange
    onValueChange?: (value: never) => void
  }
  const labels = { ...useLabels().calendar, ...labelsProp }
  const titleId = React.useId()
  const vista = React.useRef<HTMLDivElement>(null)

  const [interno, setInterno] = React.useState(defaultValue ?? (mode === "range" ? SIN_RANGO : null))
  const value = valueProp !== undefined ? valueProp : interno
  const elegida = mode === "single" ? (value as Date | null) : null
  const rango = mode === "range" ? ((value as DateRange | null) ?? SIN_RANGO) : SIN_RANGO

  // `hoy` se calcula una vez por montaje: si fuera en cada render, un calendario abierto a
  // medianoche cambiaría el día marcado en el medio de una interacción.
  const [hoy] = React.useState(() => startOfDay(new Date()))
  const ancla = elegida ?? rango.from ?? hoy

  const [mesInterno, setMesInterno] = React.useState(() => startOfMonth(defaultMonth ?? ancla))
  const month = monthProp ? startOfMonth(monthProp) : mesInterno
  const cuantos = Math.max(1, Math.floor(numberOfMonths))
  const meses = Array.from({ length: cuantos }, (_, i) => addMonths(month, i))
  const aLaVista = (date: Date) => meses.some((mes) => isSameMonth(mes, date))
  const mostrar = (primero: Date) => {
    if (isSameMonth(primero, month)) return
    if (!monthProp) setMesInterno(primero)
    onMonthChange?.(primero)
  }
  // Lleva la vista hasta el mes de `destino` corriéndola lo menos posible: si ya se ve, no se
  // mueve; si queda antes, pasa a ser el primero; si queda después, el último.
  const irAlMes = (destino: Date) => {
    if (aLaVista(destino)) return
    const primero = startOfMonth(destino)
    mostrar(compareDays(primero, month) < 0 ? primero : addMonths(primero, 1 - cuantos))
  }

  // El día que tiene la parada de tabulación. Siempre es uno de los meses a la vista: si el mes
  // cambia por los botones, se corre al mismo número de día del primer mes nuevo.
  const [foco, setFoco] = React.useState(() => clampDay(ancla, min, max))
  const enfocable = aLaVista(foco) ? foco : clampDay(addMonths(foco, monthDiff(month, foco)), min, max)
  const moverFoco = React.useRef(false)

  React.useEffect(() => {
    if (!moverFoco.current) return
    moverFoco.current = false
    vista.current?.querySelector<HTMLButtonElement>(`[data-date="${toISODate(enfocable)}"]`)?.focus()
  })

  const apagada = (date: Date) =>
    (min != null && compareDays(date, min) < 0) || (max != null && compareDays(date, max) > 0) || (isDateDisabled?.(date) ?? false)

  // Mientras se elige un rango —ya hay desde, todavía no hay hasta— el día bajo el puntero
  // muestra cómo quedaría. Sin esto el segundo clic es a ciegas.
  const [sobre, setSobre] = React.useState<Date | null>(null)
  const eligiendo = mode === "range" && rango.from != null && rango.to == null
  const hasta = rango.to ?? (eligiendo ? sobre : null)

  const elegir = (date: Date) => {
    if (apagada(date)) return
    setFoco(date)
    let siguiente: Date | DateRange = date
    if (mode === "range") {
      if (!rango.from || rango.to) siguiente = { from: date, to: null }
      // Elegir un «hasta» anterior al «desde» no es un error: los da vuelta.
      else siguiente = compareDays(date, rango.from) < 0 ? { from: date, to: rango.from } : { from: rango.from, to: date }
      setSobre(null)
    }
    if (valueProp === undefined) setInterno(siguiente)
    ;(onValueChange as ((value: Date | DateRange) => void) | undefined)?.(siguiente)
  }

  const teclado = (event: React.KeyboardEvent<HTMLTableElement>) => {
    const saltos: Record<string, () => Date> = {
      ArrowLeft: () => addDays(enfocable, -1),
      ArrowRight: () => addDays(enfocable, 1),
      ArrowUp: () => addDays(enfocable, -7),
      ArrowDown: () => addDays(enfocable, 7),
      Home: () => startOfWeek(enfocable, weekStartsOn),
      End: () => addDays(startOfWeek(enfocable, weekStartsOn), 6),
      PageUp: () => addMonths(enfocable, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(enfocable, event.shiftKey ? 12 : 1),
    }
    const salto = saltos[event.key]
    if (!salto) return
    event.preventDefault()
    const destino = clampDay(salto(), min, max)
    moverFoco.current = true
    setFoco(destino)
    irAlMes(destino)
  }

  const formatos = React.useMemo(
    () => ({
      titulo: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
      dia: new Intl.DateTimeFormat(locale, { dateStyle: "full" }),
      corto: new Intl.DateTimeFormat(locale, { weekday: "short" }),
      largo: new Intl.DateTimeFormat(locale, { weekday: "long" }),
    }),
    [locale]
  )
  const sinAnterior = min != null && compareDays(addDays(month, -1), min) < 0
  const sinSiguiente = max != null && compareDays(addMonths(month, cuantos), max) > 0
  const anterior = (
    <Button aria-label={labels.previousMonth} disabled={sinAnterior} onClick={() => mostrar(addMonths(month, -1))} size="icon-sm" variant="ghost">
      <ChevronLeftIcon />
    </Button>
  )
  const siguiente = (
    <Button aria-label={labels.nextMonth} disabled={sinSiguiente} onClick={() => mostrar(addMonths(month, 1))} size="icon-sm" variant="ghost">
      <ChevronRightIcon />
    </Button>
  )

  return (
    <div data-slot="calendar" data-mode={mode} data-months={cuantos} className={cn("w-fit text-gray-1000", className)} {...rest}>
      <div className="flex flex-wrap gap-x-6 gap-y-4" data-slot="calendar-months" onPointerLeave={() => setSobre(null)} ref={vista}>
        {meses.map((mes, indice) => {
          const id = `${titleId}-${indice}`
          const titulo = (
            // `aria-live`: al cambiar de mes con los botones, el lector dice a cuál se llegó. Con
            // varios a la vista alcanza con el primero: leerlos todos es oír la misma noticia dos veces.
            <div aria-live={indice === 0 ? "polite" : undefined} className="text-heading-14 first-letter:uppercase" data-slot="calendar-title" id={id}>
              {formatos.titulo.format(mes)}
            </div>
          )
          return (
            // La clave es la posición y no el mes: al cambiar de mes el bloque se actualiza en vez
            // de montarse de nuevo, y el botón que se acaba de apretar conserva el foco.
            <div className="flex flex-col gap-2" data-slot="calendar-month" key={indice}>
              {cuantos === 1 ? (
                <div className="flex items-center justify-between gap-2 pl-2">
                  {titulo}
                  <div className="flex items-center gap-0.5">
                    {anterior}
                    {siguiente}
                  </div>
                </div>
              ) : (
                // Los botones en las puntas y cada título centrado sobre su mes: «anterior» y
                // «siguiente» mueven la vista entera, no un mes solo.
                <div className="grid h-8 grid-cols-[--spacing(8)_1fr_--spacing(8)] items-center justify-items-center gap-2">
                  {indice === 0 ? anterior : <span />}
                  {titulo}
                  {indice === cuantos - 1 ? siguiente : <span />}
                </div>
              )}

              <table
                aria-labelledby={id}
                aria-multiselectable={mode === "range" || undefined}
                className="border-separate border-spacing-x-0 border-spacing-y-0.5"
                data-slot="calendar-grid"
                onKeyDown={teclado}
                role="grid"
              >
                <thead>
                  <tr>
                    {weeksOfMonth(mes, weekStartsOn)[0]!.map((dia) => (
                      <th abbr={formatos.largo.format(dia)} className="size-9 text-label-12 font-normal text-gray-900" key={dia.getDay()} scope="col">
                        {formatos.corto.format(dia).replace(".", "").slice(0, 2)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeksOfMonth(mes, weekStartsOn).map((semana) => (
                    <tr key={toISODate(semana[0]!)}>
                      {semana.map((dia) => {
                        const iso = toISODate(dia)
                        if (!isSameMonth(dia, mes)) {
                          return (
                            <td aria-hidden="true" className="size-9 p-0 text-center text-copy-14 tabular-nums text-gray-700" data-outside="" key={iso}>
                              {cuantos === 1 ? dia.getDate() : null}
                            </td>
                          )
                        }
                        const esDesde = isSameDay(dia, rango.from)
                        const esHasta = isSameDay(dia, hasta)
                        const marcada = isSameDay(dia, elegida) || esDesde || (esHasta && rango.to != null)
                        const enRango = isWithin(dia, rango.from, hasta)
                        // Qué mitad de la celda lleva la banda del rango: a un extremo le llega de un
                        // solo lado. Depende de para dónde crece el rango, que mientras se elige puede
                        // ser hacia atrás.
                        const creceHaciaAtras = rango.from != null && hasta != null && compareDays(hasta, rango.from) < 0
                        const extremo =
                          !enRango || isSameDay(rango.from, hasta) ? undefined : esDesde ? (creceHaciaAtras ? "end" : "start") : esHasta ? (creceHaciaAtras ? "start" : "end") : "middle"
                        const off = apagada(dia)
                        return (
                          <td
                            aria-selected={marcada || (enRango && mode === "range") || undefined}
                            className={cn(
                              "size-9 p-0",
                              "data-[range=middle]:bg-highlight data-[range=middle]:first:rounded-l-full data-[range=middle]:last:rounded-r-full",
                              "data-[range=start]:bg-[linear-gradient(to_right,transparent_50%,var(--color-highlight)_50%)]",
                              "data-[range=end]:bg-[linear-gradient(to_left,transparent_50%,var(--color-highlight)_50%)]",
                              // La banda no sale del mes: en el primer y el último día se cierra redonda,
                              // igual que en las puntas de una semana, en vez de cortarse contra un hueco.
                              "data-[range=middle]:data-month-start:rounded-l-full data-[range=middle]:data-month-end:rounded-r-full",
                              "data-[range=start]:data-month-end:bg-none data-[range=end]:data-month-start:bg-none"
                            )}
                            data-month-end={isSameMonth(addDays(dia, 1), mes) ? undefined : ""}
                            data-month-start={dia.getDate() === 1 ? "" : undefined}
                            data-range={extremo}
                            key={iso}
                            role="gridcell"
                          >
                            <button
                              aria-current={isSameDay(dia, hoy) ? "date" : undefined}
                              aria-disabled={off || undefined}
                              aria-label={formatos.dia.format(dia)}
                              className={cn(
                                "relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-copy-14 tabular-nums outline-none select-none transition-surface",
                                "hover:bg-gray-alpha-200 focus-visible:focus-ring active:scale-95",
                                // Hoy: el número en el color de marca y un punto debajo. El punto es lo que
                                // lo distingue cuando además está elegido, que es cuando el color no alcanza.
                                "aria-[current=date]:font-medium aria-[current=date]:text-brand-900",
                                "aria-[current=date]:after:absolute aria-[current=date]:after:bottom-1 aria-[current=date]:after:size-1 aria-[current=date]:after:rounded-full aria-[current=date]:after:bg-brand-700",
                                "data-selected:bg-brand-700 data-selected:text-brand-contrast data-selected:sheen data-selected:shadow-button-accent data-selected:hover:bg-brand-800",
                                "data-selected:aria-[current=date]:text-brand-contrast data-selected:aria-[current=date]:after:bg-brand-contrast",
                                "aria-disabled:cursor-not-allowed aria-disabled:text-gray-700 aria-disabled:hover:bg-transparent aria-disabled:active:scale-100"
                              )}
                              data-date={iso}
                              data-selected={marcada ? "" : undefined}
                              data-slot="calendar-day"
                              onClick={() => elegir(dia)}
                              onFocus={() => setFoco(dia)}
                              onPointerEnter={() => eligiendo && setSobre(dia)}
                              tabIndex={isSameDay(dia, enfocable) ? 0 : -1}
                              type="button"
                            >
                              {dia.getDate()}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Cuántos meses hay de `desde` a `hasta`, con signo. */
const monthDiff = (hasta: Date, desde: Date) => (hasta.getFullYear() - desde.getFullYear()) * 12 + hasta.getMonth() - desde.getMonth()

export { Calendar, type CalendarBaseProps, type CalendarLabels, type CalendarProps, type CalendarRangeProps, type CalendarSingleProps }
