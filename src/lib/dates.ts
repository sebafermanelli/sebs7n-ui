/**
 * Aritmética de fechas de calendario, para `Calendar` y `DatePicker`.
 *
 * Son fechas **de calendario**, no instantes: «27 de septiembre», sin hora. Por eso todo se
 * arma con `new Date(año, mes, día)` —hora local, medianoche— y se compara por año, mes y día,
 * nunca por milisegundos. Sumar 86.400.000 ms para «mañana» falla dos veces por año en
 * cualquier lugar con horario de verano: el día del cambio tiene 23 o 25 horas.
 *
 * Sin dependencias y sin `"use client"`: corre en un test de Node o en un Server Component.
 */

/** Un rango de fechas. `to` en `null` es un rango que se está eligiendo: ya tiene inicio y todavía no tiene fin. */
export type DateRange = { from: Date | null; to: Date | null }

/** Con qué día arranca la semana: `0` domingo, `1` lunes. */
export type WeekStart = 0 | 1

/** La misma fecha, a medianoche local. */
export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

/**
 * Suma meses sin salirse del mes de destino: 31 de enero + 1 mes es 28 (o 29) de febrero, no
 * 3 de marzo, que es lo que da `setMonth` cuando el día no existe.
 */
export function addMonths(date: Date, months: number): Date {
  const destino = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const ultimo = new Date(destino.getFullYear(), destino.getMonth() + 1, 0).getDate()
  return new Date(destino.getFullYear(), destino.getMonth(), Math.min(date.getDate(), ultimo))
}

/** Negativo si `a` es anterior a `b`, cero si son el mismo día, positivo si es posterior. */
export const compareDays = (a: Date, b: Date) =>
  a.getFullYear() - b.getFullYear() || a.getMonth() - b.getMonth() || a.getDate() - b.getDate()

export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && compareDays(a, b) === 0

export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

/** Lleva una fecha adentro de `[min, max]`. Sin límites, la devuelve igual. */
export function clampDay(date: Date, min?: Date | null, max?: Date | null): Date {
  if (min && compareDays(date, min) < 0) return startOfDay(min)
  if (max && compareDays(date, max) > 0) return startOfDay(max)
  return date
}

/** El primer día de la semana que contiene a `date`. */
export function startOfWeek(date: Date, weekStartsOn: WeekStart = 1): Date {
  return addDays(date, -((date.getDay() - weekStartsOn + 7) % 7))
}

/**
 * Las seis semanas que dibuja un mes, con los días del mes anterior y del siguiente que
 * completan la primera y la última fila.
 *
 * Siempre seis, aunque el mes entre en cinco (o en cuatro, como febrero de 2027 empezando en
 * lunes): con un alto fijo el calendario no salta al cambiar de mes, y lo que está debajo
 * —los botones de un popover— no se mueve de abajo del puntero.
 */
export function weeksOfMonth(month: Date, weekStartsOn: WeekStart = 1): Date[][] {
  const inicio = startOfWeek(startOfMonth(month), weekStartsOn)
  return Array.from({ length: 6 }, (_, semana) => Array.from({ length: 7 }, (_, dia) => addDays(inicio, semana * 7 + dia)))
}

/** `2026-09-27`: el formato de `<input type="date">` y el que viaja en un formulario. */
export function toISODate(date: Date): string {
  const dos = (n: number) => String(n).padStart(2, "0")
  return `${String(date.getFullYear()).padStart(4, "0")}-${dos(date.getMonth() + 1)}-${dos(date.getDate())}`
}

/** `2026-09-27` → fecha local. `null` si el texto no es una fecha que exista (`2026-02-30`). */
export function fromISODate(text: string): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!partes) return null
  const [anio, mes, dia] = partes.slice(1).map(Number) as [number, number, number]
  const fecha = new Date(anio, mes - 1, dia)
  // `new Date(2026, 1, 30)` no falla: da el 2 de marzo. Si lo que volvió no es lo que se pidió,
  // la fecha no existía.
  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia ? fecha : null
}

/** ¿Está `date` entre `from` y `to`, extremos incluidos? El orden de los extremos no importa. */
export function isWithin(date: Date, from: Date | null, to: Date | null): boolean {
  if (!from || !to) return false
  const [a, b] = compareDays(from, to) <= 0 ? [from, to] : [to, from]
  return compareDays(date, a) >= 0 && compareDays(date, b) <= 0
}
