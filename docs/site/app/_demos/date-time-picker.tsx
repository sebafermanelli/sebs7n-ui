"use client"

import { useState } from "react"
import { DateTimePicker } from "sebs7n-ui/date-time-picker"

/**
 * Básico
 * La fecha y la hora en un solo campo. Elegir otro día conserva la hora.
 */
export function Basic() {
  const [dueAt, setDueAt] = useState<Date | null>(new Date(2026, 8, 30, 18, 0))
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <span className="text-callout text-label" id="invoice-due">
        Vencimiento de la factura
      </span>
      <DateTimePicker aria-labelledby="invoice-due" clearable name="due-at" onValueChange={setDueAt} value={dueAt} />
    </div>
  )
}
