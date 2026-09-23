"use client"

import { Button } from "sebs7n-ui/button"
import { CheckboxGroup, CheckboxGroupItem } from "sebs7n-ui/checkbox-group"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
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

/**
 * El error que es del grupo y no de un campo
 * "Tildá al menos un archivo" no pertenece a ninguna casilla suelta. `Fieldset` no tiene dónde mostrarlo —un `<fieldset>` no lleva un mensaje que el lector anuncie—, así que ese conjunto se declara como lo que es: un campo con `name`, valor y error. El `FieldError` queda atado al `role="group"` por `aria-describedby` y se limpia solo al tildar.
 */
export function ErrorDelGrupo() {
  return (
    <Form className="w-full max-w-sm">
      <Fieldset>
        <FieldsetLegend>Documentación del legajo</FieldsetLegend>

        <Field name="titular">
          <FieldLabel>Titular</FieldLabel>
          <Input placeholder="Apellido y nombre" />
        </Field>

        <Field
          name="adjuntos"
          validate={(valor) => ((valor as string[]).length > 0 ? null : "Tildá al menos un archivo")}
        >
          <FieldLabel required>Archivos que adjuntás</FieldLabel>
          <CheckboxGroup>
            <CheckboxGroupItem value="dni">DNI</CheckboxGroupItem>
            <CheckboxGroupItem value="pasaporte">Pasaporte</CheckboxGroupItem>
            <CheckboxGroupItem value="seguro">Póliza del seguro</CheckboxGroupItem>
          </CheckboxGroup>
          <FieldError />
        </Field>
      </Fieldset>

      <Button type="submit">Guardar el legajo</Button>
    </Form>
  )
}
