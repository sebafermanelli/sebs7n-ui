"use client"

import { useState } from "react"
import { Field, FieldDescription, FieldLabel } from "sebs7n-ui"
import { TimePicker } from "sebs7n-ui/time-picker"

/**
 * Básico
 * Se tipea («930») o se elige de la lista, cada 15 minutos. Al salir del campo queda como «09:30».
 */
export function Basico() {
  const [hora, setHora] = useState<string | null>("09:30")
  return (
    <Field className="w-full max-w-40">
      <FieldLabel>Envío del resumen</FieldLabel>
      <TimePicker name="hora-envio" onValueChange={setHora} value={hora} />
    </Field>
  )
}

/**
 * Con horario
 * `min`, `max` y `step`: la lista va de 08:00 a 18:00 cada media hora y lo tipeado fuera del horario se lleva al borde.
 */
export function ConHorario() {
  return (
    <Field className="w-full max-w-40">
      <FieldLabel>Débito automático</FieldLabel>
      <TimePicker max="18:00" min="08:00" step={30} />
      <FieldDescription>En horario bancario.</FieldDescription>
    </Field>
  )
}
