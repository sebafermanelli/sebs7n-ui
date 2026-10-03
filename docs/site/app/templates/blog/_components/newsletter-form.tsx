"use client"

import { Button } from "sebs7n-ui/button"
import { Field, FieldError } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { toast } from "sonner"

export default function NewsletterForm() {
  return (
    <Form className="flex flex-col gap-2 sm:flex-row sm:items-start" onFormSubmit={() => toast.success("Listo, te suscribiste")}>
      <Field className="flex-1" name="email">
        <Input aria-label="Correo" autoComplete="email" placeholder="vos@correo.com" required type="email" />
        <FieldError match="valueMissing">Escribí tu correo</FieldError>
        <FieldError match="typeMismatch">Revisá el correo: falta algo</FieldError>
      </Field>
      <Button type="submit">Suscribirme</Button>
    </Form>
  )
}
