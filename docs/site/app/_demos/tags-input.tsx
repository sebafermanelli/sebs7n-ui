"use client"

import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { TagsInput } from "sebs7n-ui/tags-input"

/**
 * Etiquetas de una factura
 * Enter o coma agregan; Backspace con el campo vacío quita la última. Las repetidas no entran.
 */
export function Basic() {
  return (
    <div className="w-full max-w-md">
      <Field name="tags">
        <FieldLabel>Etiquetas</FieldLabel>
        <TagsInput defaultValue={["mayorista", "urgente"]} max={5} placeholder="Agregar etiqueta" />
        <FieldDescription>Hasta 5. Enter o coma para agregar.</FieldDescription>
        <FieldError />
      </Field>
    </div>
  )
}

const email = (tag: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag) ? undefined : "no es un correo")

/**
 * Correos con validación
 * `validate` revisa cada uno antes de agregarlo; pegar una lista la separa por comas y renglones.
 */
export function Emails() {
  return (
    <div className="w-full max-w-md">
      <Field name="cc">
        <FieldLabel>Copia a</FieldLabel>
        <TagsInput defaultValue={["cobranzas@acme.com"]} placeholder="correo@cliente.com" size="lg" validate={email} />
      </Field>
    </div>
  )
}
