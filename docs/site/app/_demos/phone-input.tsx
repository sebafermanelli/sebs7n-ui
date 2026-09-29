"use client"

import { useState } from "react"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui"
import { isValidPhone } from "sebs7n-ui/lib/phone"
import { PhoneInput } from "sebs7n-ui/phone-input"

/**
 * Básico
 * El país con su bandera y código adentro del campo, y el número en dígitos. El valor es E.164.
 */
export function Basico() {
  const [telefono, setTelefono] = useState("+5491155552002")
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Teléfono de contacto</FieldLabel>
      <PhoneInput name="phone" onValueChange={setTelefono} value={telefono} />
      <FieldDescription>
        Se guarda como <code>{telefono || "—"}</code>.
      </FieldDescription>
    </Field>
  )
}

/**
 * Con validación
 * `isValidPhone` (de `sebs7n-ui/lib/phone`, también en el servidor) mira el largo del número de cada país.
 */
export function ConValidacion() {
  const [telefono, setTelefono] = useState("+598991234")
  const invalido = telefono !== "" && !isValidPhone(telefono)
  return (
    <Field className="w-full max-w-sm" invalid={invalido}>
      <FieldLabel>Teléfono para avisos de cobro</FieldLabel>
      <PhoneInput aria-invalid={invalido} defaultCountry="UY" onValueChange={setTelefono} value={telefono} />
      <FieldError alert match={invalido}>Al número le faltan dígitos.</FieldError>
    </Field>
  )
}
