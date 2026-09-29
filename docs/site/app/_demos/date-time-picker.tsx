"use client"

import { useState } from "react"
import { DateTimePicker } from "sebs7n-ui/date-time-picker"

/**
 * Básico
 * La fecha y la hora en un solo campo. Elegir otro día conserva la hora.
 */
export function Basico() {
  const [vence, setVence] = useState<Date | null>(new Date(2026, 8, 30, 18, 0))
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <span className="text-callout text-label" id="vence">
        Vencimiento de la factura
      </span>
      <DateTimePicker aria-labelledby="vence" clearable name="vence" onValueChange={setVence} value={vence} />
    </div>
  )
}
