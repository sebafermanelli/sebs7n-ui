"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { useFieldControl } from "../internal/field-control.js"
import { FieldIsolation } from "../internal/field-isolation.js"
import { toISODate } from "../lib/dates.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { useFormReset } from "../internal/form-reset.js"
import { cn } from "../lib/utils.js"
import { DatePicker } from "./date-picker.js"
import { TimePicker } from "./time-picker.js"
import { useControlSize } from "../internal/control-size.js"

type DateTimePickerProps = {
  /** La fecha y hora elegidas. `null` es ninguna. Pasarlo lo vuelve controlado. */
  value?: Date | null
  defaultValue?: Date | null
  /** Avisa la fecha y hora elegidas, o `null` al limpiar. */
  onValueChange?: (value: Date | null) => void
  /**
   * El nombre con el que viaja en un formulario, como `2026-09-29T09:30`: el formato de
   * `<input type="datetime-local">`, en la hora local del navegador y **sin zona horaria** (ni «Z»
   * ni «-03:00»); vacío sin fecha. El servidor no sabe de qué zona es: si corre en otra (UTC en la
   * mayoría de los hostings), `new Date("2026-09-29T09:30")` ahí es otro instante. Para guardar un
   * instante, mandá la zona aparte o usá `onValueChange` y `toISOString()`.
   */
  name?: string
  /** Un «Limpiar» al pie del calendario: vacía la fecha y la hora. */
  clearable?: boolean
  /** Cada cuántos minutos hay una hora en la lista. Por defecto, 15. */
  step?: number
  /** El primer día que se puede elegir. */
  min?: Date
  /** El último día que se puede elegir. */
  max?: Date
  /** El idioma de la fecha y del calendario. Por defecto, `es-AR`. */
  locale?: string
  /** 28, 36 (default) o 40, como los campos. */
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  /** Sin fecha no se puede enviar: dentro de un `Form`, el campo queda inválido y `Form` enfoca la fecha. */
  required?: boolean
  /** El `id` de la parte de la fecha, para un `<Label htmlFor>`. */
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  /** Clases del contenedor. */
  className?: string
  labels?: Partial<Labels["dateTimePicker"]>
}

const pad = (n: number) => String(n).padStart(2, "0")
const timeOf = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

/**
 * El día de `date` a la hora «HH:MM». Una hora que no existe ese día por el cambio de horario (el
 * reloj salta de 00:00 a 01:00 en las zonas que adelantan a medianoche, como Chile, Paraguay o
 * Brasil antes) la corre `setHours` a la siguiente que sí: `withTime(día, "00:00")` puede dar 01:00.
 * Es lo mismo que hace el navegador con un `datetime-local`.
 */
function withTime(date: Date, time: string) {
  const next = new Date(date)
  next.setHours(Number(time.slice(0, 2)), Number(time.slice(3, 5)), 0, 0)
  return next
}

/**
 * Fecha y hora en un solo campo: un `DatePicker` y un `TimePicker` pegados, con una línea entre los
 * dos, en un `role="group"` que lleva el nombre. Elegir el día conserva la hora; sin hora elegida,
 * el día arranca a las 00:00. Una hora elegida antes que el día se guarda hasta que haya día.
 *
 * Dentro de un `Field` se registra el grupo entero (2.1): `FieldLabel` lo nombra, `FieldDescription` y
 * `FieldError` lo describen, y con el `name` del `Field` viaja «2026-09-29T09:30» (también en
 * `onFormSubmit`). Las dos partes no se registran por separado.
 */
function DateTimePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  name,
  clearable = false,
  step,
  min,
  max,
  locale,
  size: sizeProp,
  disabled: disabledProp,
  required = false,
  id,
  className,
  labels: labelsProp,
  ...aria
}: DateTimePickerProps) {
  const size = useControlSize(sizeProp, "md")
  const labels = { ...useLabels().dateTimePicker, ...defined(labelsProp) }
  const [own, setOwn] = React.useState(defaultValue)
  const value = valueProp !== undefined ? valueProp : own
  const [pendingTime, setPendingTime] = React.useState<string | null>(null)
  // La hora sin día sirve solo mientras no hay valor: cualquier valor nuevo (de afuera o elegido) la
  // descarta, o un `value` que pasa a null mostraría la hora tipeada antes (ajuste en el render).
  const [synced, setSynced] = React.useState(value?.getTime() ?? null)
  if (synced !== (value?.getTime() ?? null)) {
    setSynced(value?.getTime() ?? null)
    setPendingTime(null)
  }
  const time = value ? timeOf(value) : pendingTime

  // El reset del form vuelve a `defaultValue` (sin controlar) y descarta la hora sin día.
  const formReset = useFormReset(() => {
    if (valueProp === undefined) setOwn(defaultValue)
    setPendingTime(null)
  })

  const local = value ? `${toISODate(value)}T${timeOf(value)}` : ""
  const dateRef = React.useRef<HTMLButtonElement>(null)
  const field = useFieldControl({ name, value: local || null, filled: value != null, disabled: disabledProp, controlRef: dateRef, labelable: false })
  const disabled = field.disabled
  const fieldName = field.name

  const commit = (next: Date | null) => {
    if (valueProp === undefined) setOwn(next)
    onValueChange?.(next)
  }

  return (
    <div
      ref={formReset}
      role="group"
      data-slot="date-time-picker"
      className={cn("flex w-full min-w-0", className)}
      {...aria}
      aria-labelledby={aria["aria-labelledby"] ?? (aria["aria-label"] ? undefined : field.labelId)}
      aria-describedby={cn(aria["aria-describedby"], field.messageIds.join(" ")) || undefined}
      aria-invalid={field.invalid || undefined}
      onFocus={field.onFocus}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) field.onBlur()
      }}
    >
      <FieldIsolation>
        <DatePicker
          ref={dateRef}
          className="min-w-0 flex-1 rounded-e-none"
          clearable={clearable}
          disabled={disabled}
          id={id}
          locale={locale}
          max={max}
          min={min}
          onValueChange={(date) => {
            if (!date) {
              setPendingTime(null)
              return commit(null)
            }
            commit(withTime(date, time ?? "00:00"))
          }}
          size={size}
          value={value}
        />
        <TimePicker
          aria-label={labels.time}
          className="shrink-0 rounded-s-none border-s-hairline"
          disabled={disabled}
          onValueChange={(next) => {
            setPendingTime(next)
            if (value) commit(withTime(value, next ?? "00:00"))
          }}
          size={size}
          step={step}
          value={time}
        />
      </FieldIsolation>
      {fieldName && <input name={fieldName} type="hidden" value={local} />}
      {required && (
        // La validación nativa de `required`: fuera de la vista y del Tab, devuelve el foco a la fecha.
        <input
          ref={field.inputRef}
          aria-hidden="true"
          className="sr-only"
          disabled={disabled}
          onChange={() => {}}
          onFocus={() => dateRef.current?.focus()}
          required
          tabIndex={-1}
          value={local}
        />
      )}
    </div>
  )
}

export { DateTimePicker, type DateTimePickerProps }
