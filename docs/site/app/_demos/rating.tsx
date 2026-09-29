"use client"

import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Rating } from "sebs7n-ui/rating"

/**
 * Solo lectura
 * El promedio de las reseñas de un proveedor, con fracciones. Se lee como «4,5 de 5 estrellas».
 */
export function ReadOnly() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Rating readOnly value={4.5} />
        <span className="text-callout text-label-secondary">4,5 · 128 reseñas</span>
      </div>
      <Rating readOnly size="sm" value={3} />
    </div>
  )
}

/**
 * En un formulario
 * Un `radiogroup`: flechas, Inicio y Fin. Con `required`, sin valor no se envía.
 */
export function InForm() {
  return (
    <div className="w-full max-w-sm">
      <Field name="score">
        <FieldLabel>¿Cómo fue la atención?</FieldLabel>
        <Rating required size="lg" />
        <FieldDescription>Del 1 al 5.</FieldDescription>
        <FieldError />
      </Field>
    </div>
  )
}
