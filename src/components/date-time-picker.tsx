"use client"

import * as React from "react"

import { toISODate } from "../lib/dates.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { DatePicker } from "./date-picker.js"
import { TimePicker } from "./time-picker.js"

type DateTimePickerProps = {
  /** La fecha y hora elegidas. `null` es ninguna. Pasarlo lo vuelve controlado. */
  value?: Date | null
  defaultValue?: Date | null
  /** Avisa la fecha y hora elegidas, o `null` al limpiar. */
  onValueChange?: (value: Date | null) => void
  /**
   * El nombre con el que viaja en un formulario, como `2026-09-29T09:30` (el formato de
   * `<input type="datetime-local">`, hora local); vacío sin fecha.
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
  /** El `id` de la parte de la fecha, para un `<Label htmlFor>`. */
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  /** Clases del contenedor. */
  className?: string
  labels?: Partial<Labels["dateTimePicker"]>
}

const pad = (n: number) => String(n).padStart(2, "0")
const timeOf = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

/** El día de `date` a la hora «HH:MM». */
function withTime(date: Date, time: string) {
  const next = new Date(date)
  next.setHours(Number(time.slice(0, 2)), Number(time.slice(3, 5)), 0, 0)
  return next
}

/**
 * Fecha y hora en un solo campo: un `DatePicker` y un `TimePicker` pegados, con una línea entre los
 * dos, en un `role="group"` que lleva el nombre. Elegir el día conserva la hora; sin hora elegida,
 * el día arranca a las 00:00. Una hora elegida antes que el día se guarda hasta que haya día.
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
  size = "md",
  disabled,
  id,
  className,
  labels: labelsProp,
  ...aria
}: DateTimePickerProps) {
  const labels = { ...useLabels().dateTimePicker, ...labelsProp }
  const [own, setOwn] = React.useState(defaultValue)
  const value = valueProp !== undefined ? valueProp : own
  const [pendingTime, setPendingTime] = React.useState<string | null>(null)
  const time = value ? timeOf(value) : pendingTime

  const commit = (next: Date | null) => {
    if (valueProp === undefined) setOwn(next)
    onValueChange?.(next)
  }

  return (
    <div role="group" data-slot="date-time-picker" className={cn("flex w-full min-w-0", className)} {...aria}>
      <DatePicker
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
        className="w-28 shrink-0 rounded-s-none border-s-hairline"
        disabled={disabled}
        onValueChange={(next) => {
          setPendingTime(next)
          if (value) commit(withTime(value, next ?? "00:00"))
        }}
        size={size}
        step={step}
        value={time}
      />
      {name && <input name={name} type="hidden" value={value ? `${toISODate(value)}T${timeOf(value)}` : ""} />}
    </div>
  )
}

export { DateTimePicker, type DateTimePickerProps }
