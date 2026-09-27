"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { CalendarIcon } from "lucide-react"

import { toISODate, type DateRange, type WeekStart } from "../lib/dates.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import {
  inputControlClassName,
  inputDisabledClassName,
  inputInvalidClassName,
  inputPaddingClassName,
  inputSizeClassName,
} from "../variants/input.js"
import { floatingPopupClassName } from "../variants/overlay.js"
import { Calendar } from "./calendar.js"

type DatePickerLabels = Labels["datePicker"]

type DatePickerBaseProps = Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "name"> & {
  /** Las mismas tres alturas que `Input`, para que un formulario mixto quede alineado. */
  size?: "sm" | "md" | "lg"
  /**
   * El nombre con el que la fecha viaja en un formulario, como `2026-09-27`. En `range` salen
   * dos campos: `nombre-desde` y `nombre-hasta`.
   */
  name?: string
  /** La primera fecha que se puede elegir. */
  min?: Date
  /** La última fecha que se puede elegir. */
  max?: Date
  /** Apaga fechas sueltas: feriados, fines de semana, días sin turno. */
  isDateDisabled?: (date: Date) => boolean
  /** El idioma de la fecha y del calendario, como lo entiende `Intl`. Por defecto, `es-AR`. */
  locale?: string
  /** Cómo se escribe la fecha en el campo. Por defecto, `{ dateStyle: "medium" }`: «27 sept 2026». */
  format?: Intl.DateTimeFormatOptions
  /** Con qué día arranca la semana: `1` lunes (el default), `0` domingo. */
  weekStartsOn?: WeekStart
  /** El calendario abierto o cerrado, controlado. */
  open?: boolean
  /** Avisa cuando se abre o se cierra. */
  onOpenChange?: (open: boolean) => void
  /** El texto del campo vacío y los nombres de los botones del calendario. */
  labels?: Partial<DatePickerLabels & Labels["calendar"]>
  /** Clases del panel del calendario. */
  popupClassName?: string
}

type DatePickerSingleProps = DatePickerBaseProps & {
  /** `single` elige una fecha; `range`, un desde y un hasta. */
  mode?: "single"
  /** La fecha elegida, controlada. `null` es ninguna. */
  value?: Date | null
  /** La fecha elegida al montar, sin controlar. */
  defaultValue?: Date | null
  /** Avisa la fecha elegida. */
  onValueChange?: (value: Date | null) => void
}

type DatePickerRangeProps = DatePickerBaseProps & {
  mode: "range"
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (value: DateRange) => void
}

type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps

const SIN_RANGO: DateRange = { from: null, to: null }

/**
 * Un campo que abre un calendario.
 *
 * Reemplaza a `<input type="date">`, cuyo calendario es del navegador: no toma el material,
 * ni la tipografía, ni el idioma de la app.
 *
 * El campo es un **botón**, no un input de texto: la fecha se elige, no se tipea. Si en tu
 * pantalla lo normal es tipearla —una fecha de nacimiento, un vencimiento que se copia de un
 * papel—, usá un `Input` con máscara: recorrer cuarenta años de a un mes es peor que escribir
 * ocho números.
 *
 * **No valida.** No tiene `required` y no se registra en un `Field`: si la fecha es
 * obligatoria, lo chequea la app al enviar. Se dejó afuera a propósito en vez de aceptar la
 * prop y no hacer nada con ella, que es lo que pasa con un control suelto adentro de un `Form`.
 */
function DatePicker(props: DatePickerProps) {
  const {
    className,
    popupClassName,
    mode = "single",
    size = "md",
    name,
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    isDateDisabled,
    locale = "es-AR",
    format,
    weekStartsOn,
    open: openProp,
    onOpenChange,
    labels: labelsProp,
    disabled,
    ...rest
  } = props as DatePickerBaseProps & {
    mode?: "single" | "range"
    value?: Date | null | DateRange
    defaultValue?: Date | null | DateRange
    onValueChange?: (value: never) => void
  }
  const todos = useLabels()
  const labels = { ...todos.calendar, ...todos.datePicker, ...labelsProp }

  const [interno, setInterno] = React.useState(defaultValue ?? (mode === "range" ? SIN_RANGO : null))
  const value = valueProp !== undefined ? valueProp : interno
  const [abiertoInterno, setAbiertoInterno] = React.useState(false)
  const abierto = openProp ?? abiertoInterno
  const abrir = (siguiente: boolean) => {
    if (openProp === undefined) setAbiertoInterno(siguiente)
    onOpenChange?.(siguiente)
  }

  const formato = React.useMemo(() => new Intl.DateTimeFormat(locale, format ?? { dateStyle: "medium" }), [locale, format])
  const fecha = mode === "single" ? (value as Date | null) : null
  const rango = mode === "range" ? ((value as DateRange | null) ?? SIN_RANGO) : SIN_RANGO
  const texto =
    mode === "single"
      ? fecha && formato.format(fecha)
      : rango.from && (rango.to ? `${formato.format(rango.from)} – ${formato.format(rango.to)}` : `${formato.format(rango.from)} – …`)

  const cambiar = (siguiente: Date | null | DateRange) => {
    if (valueProp === undefined) setInterno(siguiente)
    ;(onValueChange as ((value: Date | null | DateRange) => void) | undefined)?.(siguiente)
    // Una fecha se elige con un clic; un rango, con dos. El calendario se cierra cuando la
    // elección está completa, no antes: cerrarlo después del «desde» obligaría a reabrirlo.
    const completo = mode === "single" || (siguiente as DateRange).to != null
    if (completo) abrir(false)
  }

  const calendario = { min, max, isDateDisabled, locale, weekStartsOn, labels: labelsProp }

  return (
    <PopoverPrimitive.Root onOpenChange={abrir} open={abierto}>
      <PopoverPrimitive.Trigger
        data-slot="date-picker"
        data-size={size}
        data-placeholder={texto ? undefined : ""}
        disabled={disabled}
        className={cn(
          inputControlClassName,
          inputSizeClassName,
          inputDisabledClassName,
          inputInvalidClassName,
          inputPaddingClassName[size],
          "flex w-full min-w-0 cursor-pointer items-center gap-2 text-left",
          "focus-visible:focus-border data-popup-open:focus-border data-placeholder:text-gray-900",
          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-gray-900",
          className
        )}
        {...rest}
      >
        <CalendarIcon aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate tabular-nums">{texto || (mode === "range" ? labels.rangePlaceholder : labels.placeholder)}</span>
      </PopoverPrimitive.Trigger>
      {name && mode === "single" && <input name={name} type="hidden" value={fecha ? toISODate(fecha) : ""} />}
      {name && mode === "range" && (
        <>
          <input name={`${name}-desde`} type="hidden" value={rango.from ? toISODate(rango.from) : ""} />
          <input name={`${name}-hasta`} type="hidden" value={rango.to ? toISODate(rango.to) : ""} />
        </>
      )}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner align="start" className="isolate z-50" side="bottom" sideOffset={6}>
          <PopoverPrimitive.Popup
            aria-label={labels.calendar}
            data-slot="date-picker-popup"
            className={cn(floatingPopupClassName, "w-auto p-3", popupClassName)}
          >
            {mode === "range" ? (
              <Calendar {...calendario} mode="range" onValueChange={cambiar} value={rango} />
            ) : (
              <Calendar {...calendario} onValueChange={cambiar} value={fecha} />
            )}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export { DatePicker, type DatePickerBaseProps, type DatePickerLabels, type DatePickerProps, type DatePickerRangeProps, type DatePickerSingleProps }
