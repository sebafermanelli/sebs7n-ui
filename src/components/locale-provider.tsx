"use client"

import * as React from "react"
import { DirectionProvider } from "@base-ui/react/direction-provider"

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
 * Con `dir="rtl"` también invierte la dirección de lectura de los componentes de Base UI (flechas, popups). Sin provider, `es-AR` y `ARS`.
 */
function LocaleProvider({ locale, currency, timeZone, dir, children }: FormatConfig & { /** `rtl` invierte las flechas de Tabs, Slider, Menu y Tree, y los popups se abren hacia el lado de lectura. Poné también `dir` en `<html>`. */ dir?: "ltr" | "rtl"; children?: React.ReactNode }) {
  const format = React.useMemo(() => createFormat({ locale, currency, timeZone }), [locale, currency, timeZone])
  const labels = React.useMemo(() => ({ dates: { locale: format.locale }, numberField: { locale: format.locale } }), [format.locale])
  const content = (
    <FormatContext.Provider value={format}>
      <LabelsProvider value={labels as never}>{children}</LabelsProvider>
    </FormatContext.Provider>
  )
  return dir ? <DirectionProvider direction={dir}>{content}</DirectionProvider> : content
}

const DEFAULT_FORMAT = createFormat()

/** El `Format` del árbol: el del `LocaleProvider` más cercano, o `es-AR` y `ARS` si no hay. */
function useFormat(): Format {
  return React.useContext(FormatContext) ?? DEFAULT_FORMAT
}

export { LocaleProvider, useFormat }
