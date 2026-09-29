"use client"

import { Field, FieldDescription, FieldLabel } from "sebs7n-ui"
import { PasswordInput } from "sebs7n-ui/password-input"

/**
 * Básico
 * El ojo va adentro del campo: muestra y oculta, con `aria-pressed`.
 */
export function Basico() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Contraseña</FieldLabel>
      <PasswordInput autoComplete="current-password" name="password" />
    </Field>
  )
}

/**
 * Con seguridad
 * `strength` suma la barra de 4 niveles con el nivel en texto: largo, mayúsculas y minúsculas, números y símbolos.
 */
export function ConSeguridad() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Contraseña nueva</FieldLabel>
      <PasswordInput autoComplete="new-password" name="new-password" strength />
      <FieldDescription>Al menos 8 caracteres. Para el acceso al portal de facturación.</FieldDescription>
    </Field>
  )
}
