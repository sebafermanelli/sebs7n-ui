"use client"

import { Field, FieldLabel, Input } from "sebs7n-ui"
import { CopyButton } from "sebs7n-ui/copy-button"

/**
 * Solo ícono
 * El botón `plain` de 28 de una barra de iCloud: copia, pasa a ✓ y el tooltip dice «Copiado».
 */
export function IconOnly() {
  return (
    <div className="flex w-full max-w-sm items-end gap-2">
      <Field className="flex-1">
        <FieldLabel>Link de pago</FieldLabel>
        <Input readOnly value="https://pagos.example.com/f/0012" />
      </Field>
      <CopyButton aria-label="Copiar el link de pago" className="mb-1" value="https://pagos.example.com/f/0012" />
    </div>
  )
}

/**
 * Con texto
 * Un id corto que se copia entero: el texto es el nombre del botón.
 */
export function WithText() {
  return (
    <p className="text-callout text-label-secondary">
      Factura{" "}
      <CopyButton className="font-mono" value="a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d">
        a1b2c3d4
      </CopyButton>
    </p>
  )
}
