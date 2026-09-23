"use client"

import { Field, FieldDescription, FieldLabel } from "sebs7n-ui/field"
import { Fieldset, FieldsetLegend } from "sebs7n-ui/fieldset"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { Textarea } from "sebs7n-ui/textarea"

/**
 * Un grupo de campos
 * `Fieldset` le da un nombre común a varios campos. No es un título decorativo: es lo que hace que dos campos "Calle" en la misma pantalla se distingan para quien usa un lector de pantalla.
 */
export function Grupo() {
  return (
    <Form className="w-full max-w-sm">
      <Fieldset>
        <FieldsetLegend>Domicilio fiscal</FieldsetLegend>
        <Field name="domicilio.calle">
          <FieldLabel>Calle y número</FieldLabel>
          <Input />
        </Field>
        <Field name="domicilio.localidad">
          <FieldLabel>Localidad</FieldLabel>
          <Input />
        </Field>
      </Fieldset>

      <Field name="notas">
        <FieldLabel>Notas para el repartidor</FieldLabel>
        <Textarea rows={3} />
        <FieldDescription>Opcional.</FieldDescription>
      </Field>
    </Form>
  )
}
