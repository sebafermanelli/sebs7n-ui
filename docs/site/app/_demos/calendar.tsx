"use client"

import { useState } from "react"
import { Calendar } from "sebs7n-ui/calendar"
import { Card, CardContent } from "sebs7n-ui/card"
import type { DateRange } from "sebs7n-ui/lib/dates"

/**
 * Una fecha
 * No dibuja superficie: acá el vidrio lo pone la `Card`. Recorrelo con las flechas; `Re Pág` y `Av Pág` cambian de mes.
 */
export function Basico() {
  const [fecha, setFecha] = useState<Date | null>(new Date(2026, 8, 27))
  return (
    <Card size="sm">
      <CardContent>
        <Calendar onValueChange={setFecha} value={fecha} />
      </CardContent>
    </Card>
  )
}

/**
 * Un rango
 * El primer clic es el desde y el segundo el hasta. Mientras se elige, el día bajo el puntero muestra cómo quedaría.
 */
export function Rango() {
  const [rango, setRango] = useState<DateRange>({ from: new Date(2026, 8, 14), to: new Date(2026, 8, 18) })
  return (
    <Card size="sm">
      <CardContent>
        <Calendar mode="range" onValueChange={setRango} value={rango} />
      </CardContent>
    </Card>
  )
}

/**
 * Con límites y días apagados
 * `min` y `max` apagan lo que queda afuera y los botones de mes; `isDateDisabled`, fechas sueltas. Acá no hay turnos los fines de semana.
 */
export function Limites() {
  return (
    <Card size="sm">
      <CardContent>
        <Calendar
          defaultValue={new Date(2026, 8, 15)}
          isDateDisabled={(fecha) => fecha.getDay() === 0 || fecha.getDay() === 6}
          max={new Date(2026, 9, 16)}
          min={new Date(2026, 8, 7)}
        />
      </CardContent>
    </Card>
  )
}
