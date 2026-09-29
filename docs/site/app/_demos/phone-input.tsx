"use client"

import { useState } from "react"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui"
import { formatPhone, isValidPhone } from "sebs7n-ui/lib/phone"
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

const contacts = [
  { client: "Acme S.A.", phone: "+5491155552002" },
  { client: "Globex SRL", phone: "+543514567890" },
  { client: "Initech", phone: "+12025550143" },
]

/**
 * Para mostrar
 * `formatPhone` de `sebs7n-ui/lib/phone`: internacional legible, o nacional si el teléfono es del país de quien lo lee (`country`).
 */
export function Display() {
  return (
    <dl className="grid w-full max-w-md grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2 text-callout">
      <dt className="text-label-secondary">Cliente</dt>
      <dt className="text-label-secondary">Internacional</dt>
      <dt className="text-label-secondary">Desde Argentina</dt>
      {contacts.map((contact) => (
        <div className="contents" key={contact.client}>
          <dd className="text-label">{contact.client}</dd>
          <dd className="tabular-nums text-label">{formatPhone(contact.phone)}</dd>
          <dd className="tabular-nums text-label">{formatPhone(contact.phone, { country: "AR" })}</dd>
        </div>
      ))}
    </dl>
  )
}
