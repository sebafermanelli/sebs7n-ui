"use client"

import { useId } from "react"
import { Label } from "sebs7n-ui/label"
import { Textarea } from "sebs7n-ui/textarea"

/** Con etiqueta y ayuda */
export function Basico() {
  const id = useId()
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor={id}>Notas internas</Label>
      <Textarea id={id} placeholder="No se muestran al cliente." rows={4} />
      <p className="text-callout text-label-secondary">Admite saltos de línea. No se envía por email.</p>
    </div>
  )
}

/**
 * Con filas
 * `rows={6}`: arranca con seis líneas de alto y sigue creciendo con el texto.
 */
export function Filas() {
  return <Textarea aria-label="Condiciones de pago" className="max-w-md" placeholder="Condiciones que salen al pie de cada factura" rows={6} />
}
