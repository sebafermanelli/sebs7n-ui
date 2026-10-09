/**
 * Formato por idioma, en un solo lugar (3.0): moneda, número, porcentaje, fecha, hora, fecha relativa, listas y unidades con `Intl`.
 * Sin dependencias y sin `"use client"`: sirve en un Server Component, en un test de Node o en el navegador. Por defecto `es-AR` y
 * `ARS`; **nunca escribe un símbolo de moneda a mano** («US$», «$»): lo pone `Intl` según el idioma y la moneda que le pasás.
 *
 * ```ts
 * const f = createFormat({ locale: "es-AR", currency: "ARS" })
 * f.currency(1240.5)            // «$ 1.240,50»
 * f.currency(99, { currency: "USD", maximumFractionDigits: 0 })   // «US$ 99»
 * f.percent(0.125)              // «12,5 %»
 * f.date("2026-10-08")          // «8 de oct de 2026»
 * f.relative(-2, "day")         // «anteayer»
 * f.list(["facturas", "clientes", "equipos"])   // «facturas, clientes y equipos»
 * f.unit(2.5, "gigabyte")       // «2,5 GB»
 * ```
 *
 * En un árbol de React, `LocaleProvider` (`sebs7n-ui/locale-provider`) lo reparte y `useFormat()` lo lee; los componentes que ya
 * tenían `locale` (Calendar, DatePicker, NumberField, MetricChart…) lo toman de ahí cuando no se les pasa uno propio.
 */

export const DEFAULT_LOCALE = "es-AR"
export const DEFAULT_CURRENCY = "ARS"

export type FormatConfig = {
  /** El idioma como lo entiende `Intl` («es-AR», «en-US»). Default `es-AR`. */
  locale?: string
  /** La moneda por defecto, código ISO 4217 («ARS», «USD»). Default `ARS`. */
  currency?: string
  /** La zona horaria de las fechas con hora (IANA, «America/Argentina/Buenos_Aires»). Sin valor, la del navegador. */
  timeZone?: string
}

/**
 * Las fechas «solo día» (`YYYY-MM-DD`) no tienen hora ni zona: se arman en UTC y se formatean en UTC, así el día no se corre
 * con la zona del servidor ni con `timeZone` (con `new Date(iso)` en Argentina darían el día anterior).
 */
function resolveDate(value: Date | string | number, timeZone: string | undefined): { date: Date; timeZone: string | undefined } {
  if (typeof value === "string") {
    const dia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (dia) return { date: new Date(Date.UTC(Number(dia[1]), Number(dia[2]) - 1, Number(dia[3]))), timeZone: "UTC" }
  }
  return { date: value instanceof Date ? value : new Date(value), timeZone }
}

/** `dateStyle`/`timeStyle` no se pueden combinar con campos sueltos (`day`, `hour`…): si llegan campos, el estilo por defecto sale. */
const FIELDS = ["weekday", "era", "year", "month", "day", "dayPeriod", "hour", "minute", "second", "fractionalSecondDigits", "timeZoneName"] as const
const hasFields = (options?: Intl.DateTimeFormatOptions) => !!options && FIELDS.some((k) => options[k] !== undefined)

export function createFormat(config: FormatConfig = {}) {
  const locale = config.locale ?? DEFAULT_LOCALE
  const currency = config.currency ?? DEFAULT_CURRENCY
  const timeZone = config.timeZone
  // Instanciar `Intl` es lo caro: se guarda uno por combinación de opciones.
  const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat | Intl.RelativeTimeFormat | Intl.ListFormat>()
  const get = <T extends Intl.NumberFormat | Intl.DateTimeFormat | Intl.RelativeTimeFormat | Intl.ListFormat>(kind: string, options: object | undefined, make: () => T): T => {
    const key = `${kind}:${JSON.stringify(options ?? {})}`
    let found = cache.get(key)
    if (!found) cache.set(key, (found = make()))
    return found as T
  }

  return {
    locale,
    currencyCode: currency,
    /** Un número («1.240,5»). */
    number: (value: number, options?: Intl.NumberFormatOptions) => get("n", options, () => new Intl.NumberFormat(locale, options)).format(value),
    /** Una moneda; `options.currency` pisa la del formateador. */
    currency: (value: number, options?: Intl.NumberFormatOptions) =>
      get("c", { currency, ...options }, () => new Intl.NumberFormat(locale, { style: "currency", currency, ...options })).format(value),
    /** Un porcentaje desde una fracción: `0.125` → «12,5 %». */
    percent: (value: number, options?: Intl.NumberFormatOptions) =>
      get("p", options, () => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1, ...options })).format(value),
    /** Un número compacto («1,2 M»). */
    compact: (value: number, options?: Intl.NumberFormatOptions) =>
      get("k", options, () => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1, ...options })).format(value),
    /** Una cantidad con unidad (`unit`: «gigabyte», «kilometer-per-hour»…). */
    unit: (value: number, unit: string, options?: Intl.NumberFormatOptions) =>
      get("u", { unit, ...options }, () => new Intl.NumberFormat(locale, { style: "unit", unit, ...options })).format(value),
    /** Una fecha; sin opciones, «8 de oct de 2026» (el orden y las palabras son del idioma). */
    date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const r = resolveDate(value, timeZone)
      const opts = { timeZone: r.timeZone, ...options }
      return get("d", opts, () => new Intl.DateTimeFormat(locale, hasFields(options) || options?.dateStyle ? opts : { day: "numeric", month: "short", year: "numeric", ...opts })).format(r.date)
    },
    /** Una hora, en el formato de horas del idioma (`hour12: false` fuerza las 24). */
    time: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const r = resolveDate(value, timeZone)
      const opts = { timeZone: r.timeZone, ...options }
      return get("t", opts, () => new Intl.DateTimeFormat(locale, hasFields(options) || options?.timeStyle ? opts : { hour: "2-digit", minute: "2-digit", ...opts })).format(r.date)
    },
    /** Fecha y hora, en el formato del idioma. */
    dateTime: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const r = resolveDate(value, timeZone)
      const opts = { timeZone: r.timeZone, ...options }
      const custom = hasFields(options) || options?.dateStyle || options?.timeStyle
      return get("dt", opts, () => new Intl.DateTimeFormat(locale, custom ? opts : { dateStyle: "medium", timeStyle: "short", ...opts })).format(r.date)
    },
    /** Una fecha relativa a un número de unidades: `(-2, "day")` → «anteayer»; `(3, "hour")` → «dentro de 3 horas». */
    relative: (value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions) =>
      get("r", options, () => new Intl.RelativeTimeFormat(locale, { numeric: "auto", ...options })).format(value, unit),
    /** Cuánto falta o pasó entre `value` y `now`, en la unidad que mejor lo cuenta. */
    since: (value: Date | string | number, now: Date | number = new Date()) => {
      const seconds = (resolveDate(value, timeZone).date.getTime() - (now instanceof Date ? now.getTime() : now)) / 1000
      const steps: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]
      const [unit, size] = steps.find(([, size]) => Math.abs(seconds) >= size) ?? (["second", 1] as [Intl.RelativeTimeFormatUnit, number])
      return get("r", { numeric: "auto" }, () => new Intl.RelativeTimeFormat(locale, { numeric: "auto" })).format(Math.round(seconds / size), unit)
    },
    /** Una lista con su conjunción: «facturas, clientes y equipos». */
    list: (items: readonly string[], options?: Intl.ListFormatOptions) =>
      get("l", options, () => new Intl.ListFormat(locale, { style: "long", type: "conjunction", ...options })).format(items),
  }
}

export type Format = ReturnType<typeof createFormat>
