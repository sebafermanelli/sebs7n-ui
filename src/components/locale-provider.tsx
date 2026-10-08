"use client"

import * as React from "react"

import { createFormat, type Format, type FormatConfig } from "../lib/format.js"
import { LabelsProvider } from "../lib/labels.js"

const FormatContext = React.createContext<Format | null>(null)

/**
 * El idioma, la moneda y la zona horaria de toda la app, en un solo lugar (3.0).
 *
 * ```tsx
 * <LocaleProvider currency="ARS" locale="es-AR">
 *   <App />
 * </LocaleProvider>
 * ```
 *
 * Reparte un `Format` (`useFormat()`, ver `sebs7n-ui/lib/format`) y, de paso, fija el idioma de `Calendar`, `DatePicker`,
 * `DateTimePicker`, `CalendarView` y `NumberField`, que antes lo pedían uno por uno. La prop `locale` de un componente sigue ganando.
 * Sin provider, `es-AR` y `ARS`.
 */
function LocaleProvider({ locale, currency, timeZone, children }: FormatConfig & { children?: React.ReactNode }) {
  const format = React.useMemo(() => createFormat({ locale, currency, timeZone }), [locale, currency, timeZone])
  const labels = React.useMemo(() => ({ dates: { locale: format.locale }, numberField: { locale: format.locale } }), [format.locale])
  return (
    <FormatContext.Provider value={format}>
      <LabelsProvider value={labels as never}>{children}</LabelsProvider>
    </FormatContext.Provider>
  )
}

const DEFAULT_FORMAT = createFormat()

/** El `Format` del árbol: el del `LocaleProvider` más cercano, o `es-AR` y `ARS` si no hay. */
function useFormat(): Format {
  return React.useContext(FormatContext) ?? DEFAULT_FORMAT
}

export { LocaleProvider, useFormat }
