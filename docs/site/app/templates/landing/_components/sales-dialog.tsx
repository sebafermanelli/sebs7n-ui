"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "sebs7n-ui/button"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "sebs7n-ui/combobox"
import { CountryPicker } from "sebs7n-ui/country-picker"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "sebs7n-ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Fieldset, FieldsetLegend } from "sebs7n-ui/fieldset"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "sebs7n-ui/input-group"
import { isValidPhone } from "sebs7n-ui/lib/phone"
import { PhoneInput } from "sebs7n-ui/phone-input"
import { Textarea } from "sebs7n-ui/textarea"

const VOLUMES = ["Hasta 20 facturas por mes", "De 21 a 100", "De 101 a 500", "Más de 500"]

/**
 * «Hablar con ventas»: un formulario completo en un `Dialog`. `Form` junta los valores por `name` y enfoca el
 * primer campo inválido; el teléfono (E.164) y el volumen (un `Combobox`) llevan su estado y su error.
 * En tu app, `onFormSubmit` manda `values` a tu API.
 */
export default function SalesDialog({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("")
  const [volume, setVolume] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const phoneInvalid = phone !== "" && !isValidPhone(phone)
  const volumeMissing = submitted && volume === null

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open>
      <DialogContent className="sm:max-w-xl">
        <Form
          className="flex flex-col gap-4"
          onFormSubmit={() => {
            setSubmitted(true)
            if (phoneInvalid || volume === null) return
            toast.success("Listo: te escribimos en un día hábil")
            onClose()
          }}
        >
          <DialogHeader>
            <DialogTitle>Hablar con ventas</DialogTitle>
            <DialogDescription>Contanos de tu equipo y te respondemos en un día hábil.</DialogDescription>
          </DialogHeader>
          <div className="-mx-1 flex max-h-[min(60dvh,30rem)] flex-col gap-5 overflow-y-auto px-1 py-1">
            <Fieldset>
              <FieldsetLegend>Tus datos</FieldsetLegend>
              <Field name="name">
                <FieldLabel required>Nombre y apellido</FieldLabel>
                <Input autoComplete="name" required />
                <FieldError match="valueMissing">Falta tu nombre</FieldError>
              </Field>
              <Field name="email">
                <FieldLabel required>Correo de trabajo</FieldLabel>
                <Input autoComplete="email" required type="email" />
                <FieldError match="valueMissing">Falta tu correo</FieldError>
                <FieldError match="typeMismatch">Revisá el correo: falta algo</FieldError>
              </Field>
              <Field invalid={phoneInvalid}>
                <FieldLabel>Teléfono</FieldLabel>
                <PhoneInput aria-invalid={phoneInvalid} name="phone" onValueChange={setPhone} value={phone} />
                <FieldDescription>Opcional. Para coordinar una llamada.</FieldDescription>
                <FieldError alert match={phoneInvalid}>
                  Al número le faltan dígitos.
                </FieldError>
              </Field>
            </Fieldset>
            <Fieldset>
              <FieldsetLegend>Tu empresa</FieldsetLegend>
              <Field name="company">
                <FieldLabel required>Empresa</FieldLabel>
                <Input autoComplete="organization" required />
                <FieldError match="valueMissing">Falta el nombre de la empresa</FieldError>
              </Field>
              <Field name="website">
                <FieldLabel>Sitio web</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>https://</InputGroupAddon>
                  <InputGroupInput inputMode="url" placeholder="tu-empresa.com" />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel>País</FieldLabel>
                <CountryPicker defaultValue="AR" name="country" />
              </Field>
              <Field invalid={volumeMissing}>
                <FieldLabel required>Facturas por mes</FieldLabel>
                <Combobox items={VOLUMES} onValueChange={setVolume} value={volume}>
                  <ComboboxInput aria-invalid={volumeMissing} placeholder="Elegí un rango" />
                  <ComboboxContent>
                    <ComboboxEmpty />
                    <ComboboxList>
                      {(item: string) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <FieldError alert match={volumeMissing}>
                  Elegí cuántas facturas emitís por mes.
                </FieldError>
              </Field>
              <Field name="message">
                <FieldLabel>¿Qué necesitás resolver?</FieldLabel>
                <Textarea rows={3} />
                <FieldDescription>Opcional.</FieldDescription>
              </Field>
            </Fieldset>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>Cancelar</DialogClose>
            <Button type="submit">Enviar consulta</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
