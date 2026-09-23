"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"

/**
 * Un campo completo
 * La etiqueta, la ayuda y el error atados al control sin un solo `id` escrito a mano. Comparalo con armar lo mismo suelto: `useId`, `htmlFor`, `aria-describedby` condicional y `aria-invalid`.
 */
export function Basico() {
  return (
    <Field className="w-full max-w-sm" name="cuit">
      <FieldLabel required>CUIT</FieldLabel>
      <Input placeholder="30712345678" required />
      <FieldDescription>Once dígitos, sin guiones.</FieldDescription>
      <FieldError />
    </Field>
  )
}

/**
 * Cuándo se valida
 * `validationMode="onBlur"` marca el error recién al salir del campo. En `onChange` el rojo aparece a la segunda letra del email, cuando todavía falta todo: sirve para un campo que se puede evaluar entero mientras se escribe, como el largo de una contraseña.
 */
export function Validacion() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Field
        name="email"
        validate={(valor) => (String(valor).includes("@") ? null : "Falta el @: revisá el email")}
        validationMode="onBlur"
      >
        <FieldLabel>Email</FieldLabel>
        <Input placeholder="vos@empresa.com" type="email" />
        <FieldError />
      </Field>

      <Field
        name="password"
        validate={(valor) => (String(valor).length >= 8 ? null : "Mínimo 8 caracteres")}
        validationMode="onChange"
      >
        <FieldLabel>Contraseña</FieldLabel>
        <Input type="password" />
        <FieldDescription>Se valida mientras escribís porque acá sí se puede saber desde el primer carácter.</FieldDescription>
        <FieldError />
      </Field>
    </div>
  )
}

/**
 * El error que solo conoce el servidor
 * Que un email ya esté usado no se puede validar en el navegador. `Form` recibe un objeto `{ campo: mensaje }` y cada `FieldError` muestra el suyo, en el campo que corresponde y no en un cartel arriba de todo.
 */
export function ErroresDelServidor() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  return (
    <Form
      className="w-full max-w-sm"
      errors={errors}
      onFormSubmit={async (valores) => {
        setEnviando(true)
        await new Promise((r) => setTimeout(r, 600))
        setEnviando(false)
        // El servidor de mentira: cualquier email de este dominio ya está tomado.
        setErrors(
          String(valores.email).endsWith("@acme.com") ? { email: "Ese email ya tiene una cuenta" } : {}
        )
      }}
    >
      <Field name="email">
        <FieldLabel required>Email</FieldLabel>
        <Input placeholder="probá con algo@acme.com" required type="email" />
        <FieldError />
      </Field>
      <Button loading={enviando} type="submit">
        Crear cuenta
      </Button>
    </Form>
  )
}
