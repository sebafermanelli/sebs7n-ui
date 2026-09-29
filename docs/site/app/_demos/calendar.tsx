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
 * Dos meses
 * Para un rango que cruza de un mes al otro. Cada fecha aparece una sola vez: los huecos de un mes quedan vacíos, porque esos días están en el de al lado.
 */
export function DosMeses() {
  const [rango, setRango] = useState<DateRange>({ from: new Date(2026, 8, 28), to: new Date(2026, 9, 9) })
  return (
    <Card size="sm">
      <CardContent>
        <Calendar defaultMonth={new Date(2026, 8, 1)} mode="range" numberOfMonths={2} onValueChange={setRango} value={rango} />
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

/**
 * Una fecha lejana
 * El título abre una grilla de meses, y su año una de doce años: el alta de un cliente de hace veinte años está a cinco clics. `max` apaga los meses y años que todavía no llegaron.
 */
export function FechaLejana() {
  const [alta, setAlta] = useState<Date | null>(new Date(2006, 3, 12))
  return (
    <Card size="sm">
      <CardContent>
        <Calendar aria-label="Fecha de alta del cliente" max={new Date(2026, 8, 29)} onValueChange={setAlta} value={alta} />
      </CardContent>
    </Card>
  )
}
