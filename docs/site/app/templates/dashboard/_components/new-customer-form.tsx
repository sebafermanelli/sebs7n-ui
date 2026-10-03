"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { CountryPicker } from "sebs7n-ui/country-picker"
import { DialogFooter } from "sebs7n-ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Fieldset, FieldsetLegend } from "sebs7n-ui/fieldset"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { isValidPhone } from "sebs7n-ui/lib/phone"
import { PhoneInput } from "sebs7n-ui/phone-input"
import { toast } from "sonner"

import type { CustomerRecord } from "../_data/customers-mock"

interface NewCustomerFormProps {
  existingNames: string[]
  onAddCustomer: (input: Omit<CustomerRecord, "id">) => CustomerRecord
  onClose: () => void
  onCreated?: (customer: CustomerRecord) => void
}

// El cuerpo del diálogo, en su propio archivo para pedirlo recién al abrirlo (`lazy` en `new-customer-dialog`).
export default function NewCustomerForm({ existingNames, onAddCustomer, onClose, onCreated }: NewCustomerFormProps) {
  const [duplicate, setDuplicate] = useState(false)
  const [phone, setPhone] = useState("")
  // Un teléfono a medias no se guarda: `isValidPhone` mira el largo del número de cada país.
  const phoneInvalid = phone !== "" && !isValidPhone(phone)

  return (
    <Form
      onFormSubmit={(values) => {
        if (phoneInvalid) return
        const name = String(values.name).trim()
        if (existingNames.some((existing) => existing.toLocaleLowerCase("es") === name.toLocaleLowerCase("es"))) {
          setDuplicate(true)
          return
        }
        const created = onAddCustomer({
          name,
          email: String(values.email).trim(),
          phone,
          city: String(values.city ?? "").trim(),
          country: String(values.country ?? "AR"),
        })
        toast.success(`Cliente ${created.name} creado.`)
        setDuplicate(false)
        onClose()
        onCreated?.(created)
      }}
    >
      {/* Un `Fieldset` por grupo: nombra a los campos para el lector y los separa a la vista. */}
      <Fieldset>
        <FieldsetLegend>Datos de facturación</FieldsetLegend>
        <Field invalid={duplicate} name="name">
          <FieldLabel required>Nombre o razón social</FieldLabel>
          <Input onChange={() => setDuplicate(false)} placeholder="Ej. Stark Industries" required />
          <FieldError match="valueMissing">Falta el nombre</FieldError>
          <FieldError match={duplicate}>Ya existe un cliente con ese nombre</FieldError>
        </Field>
        <Field name="email">
          <FieldLabel required>Correo de facturación</FieldLabel>
          <Input placeholder="pagos@empresa.com" required type="email" />
          <FieldError match="valueMissing">Falta el correo</FieldError>
          <FieldError match="typeMismatch">Escribí un correo válido</FieldError>
        </Field>
      </Fieldset>

      <Fieldset>
        <FieldsetLegend>Contacto</FieldsetLegend>
        <Field name="country">
          <FieldLabel>País</FieldLabel>
          <CountryPicker defaultValue="AR" />
        </Field>
        <Field invalid={phoneInvalid}>
          <FieldLabel>Teléfono</FieldLabel>
          <PhoneInput aria-invalid={phoneInvalid} defaultCountry="AR" onValueChange={setPhone} value={phone} />
          <FieldDescription>Para los avisos de cobro por mensaje.</FieldDescription>
          <FieldError alert match={phoneInvalid}>
            Al número le faltan dígitos.
          </FieldError>
        </Field>
        <Field name="city">
          <FieldLabel>Ciudad</FieldLabel>
          <Input placeholder="Buenos Aires" />
        </Field>
      </Fieldset>

      <DialogFooter>
        <Button onClick={onClose} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button type="submit">Crear cliente</Button>
      </DialogFooter>
    </Form>
  )
}
