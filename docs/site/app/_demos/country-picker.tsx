"use client"

import { Field, FieldLabel } from "sebs7n-ui"
import { CountryPicker } from "sebs7n-ui/country-picker"

/**
 * Básico
 * Los 249 países con su bandera, por nombre en el idioma de la app. Se escribe sin tildes: «peru» encuentra «Perú».
 */
export function Basico() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>País de facturación</FieldLabel>
      <CountryPicker defaultValue="AR" name="country" />
    </Field>
  )
}

/**
 * Algunos países
 * `countries` limita la lista; se ordena por nombre.
 */
export function Algunos() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>País del emisor</FieldLabel>
      <CountryPicker countries={["AR", "UY", "CL", "PY", "BR"]} />
    </Field>
  )
}
