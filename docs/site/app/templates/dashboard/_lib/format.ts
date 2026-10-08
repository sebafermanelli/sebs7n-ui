// Formatos del template, en un solo lugar: la tabla, el detalle, Inicio y Clientes muestran lo mismo.

import { createFormat } from "sebs7n-ui/lib/format"

// El idioma y la moneda, en un solo lugar: el símbolo lo pone `Intl`, no el código. En tu app: tu moneda (o un `LocaleProvider`).
const f = createFormat({ locale: "es-AR", currency: "USD" })

export const money = { format: (value: number) => f.currency(value) }

/** Sin centavos: para listas angostas, donde el monto le come lugar a la descripción. */
export const wholeMoney = { format: (value: number) => f.currency(value, { maximumFractionDigits: 0 }) }

const shortDate = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" })

/** Las fechas del mock son `YYYY-MM-DD` locales: con `new Date(iso)` serían UTC y en Argentina darían el día anterior. */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return shortDate.format(new Date(y!, m! - 1, d))
}

const dayMonth = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" })

/** «8 oct»: para listas angostas, donde el año sobra. */
export function formatDayMonth(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return dayMonth.format(new Date(y!, m! - 1, d))
}

/** Hoy en `YYYY-MM-DD` local: `toISOString()` da la de UTC, que después de las 21 ya es mañana. */
export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Un `Date` local en `YYYY-MM-DD`: lo que usan las facturas y los filtros por fecha. */
export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

/** El inverso de `toIsoDate`: `YYYY-MM-DD` a un `Date` local (medianoche de ese día, no la UTC). */
export function fromIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y!, m! - 1, d)
}

/** Un `Date` local como `YYYY-MM-DDTHH:mm`: el recordatorio programado, sin zona (es la hora de quien lo programa). */
export function toIsoDateTime(date: Date) {
  return `${toIsoDate(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

/** El inverso de `toIsoDateTime`. */
export function fromIsoDateTime(iso: string) {
  const [day = "", time = "00:00"] = iso.split("T")
  const [h, min] = time.split(":").map(Number)
  const date = fromIsoDate(day)
  date.setHours(h ?? 0, min ?? 0, 0, 0)
  return date
}

const dateTime = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })

/** «8 oct, 09:30» para el recordatorio programado. */
export function formatDateTime(iso: string) {
  return dateTime.format(fromIsoDateTime(iso))
}

/** «1 factura», «3 facturas». */
export const plural = (count: number, one: string, other: string) => `${count} ${count === 1 ? one : other}`

/** `iso` (`YYYY-MM-DD`) más `days` días, en el calendario local. */
export function addDays(iso: string, days: number) {
  const date = fromIsoDate(iso)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}
