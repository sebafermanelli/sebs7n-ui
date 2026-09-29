"use client"

import { useState } from "react"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui"
import { isValidPhone } from "sebs7n-ui/lib/phone"
import { PhoneInput } from "sebs7n-ui/phone-input"

/**
 * Básico
 * El país con su bandera y código adentro del campo, y el número en dígitos. El valor es E.164.
 */
export function Basic() {
  const [phone, setPhone] = useState("+5491155552002")
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Teléfono de contacto</FieldLabel>
      <PhoneInput name="phone" onValueChange={setPhone} value={phone} />
      <FieldDescription>
        Se guarda como <code>{phone || "—"}</code>.
      </FieldDescription>
    </Field>
  )
}

/**
 * Con validación
 * `isValidPhone` (de `sebs7n-ui/lib/phone`, también en el servidor) mira el largo del número de cada país.
 */
export function WithValidation() {
  const [phone, setPhone] = useState("+598991234")
  const invalid = phone !== "" && !isValidPhone(phone)
  return (
    <Field className="w-full max-w-sm" invalid={invalid}>
      <FieldLabel>Teléfono para avisos de cobro</FieldLabel>
      <PhoneInput aria-invalid={invalid} defaultCountry="UY" onValueChange={setPhone} value={phone} />
      <FieldError alert match={invalid}>Al número le faltan dígitos.</FieldError>
    </Field>
  )
}
