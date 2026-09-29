"use client"

import { useState } from "react"
import { Field, FieldDescription, FieldLabel } from "sebs7n-ui/field"
import { NumberField } from "sebs7n-ui/number-field"

/**
 * Cantidad de usuarios
 * `min` y `max` son topes de verdad: el botón se apaga al llegar y las flechas tampoco lo pasan. Inicio y Fin saltan a 1 y a 9. Adentro de un `Field` la etiqueta nombra al input sin que nadie escriba un `id`.
 */
export function Usuarios() {
  const [usuarios, setUsuarios] = useState<number | null>(2)
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field name="usuarios">
        <FieldLabel>Usuarios</FieldLabel>
        <NumberField
          max={9}
          min={1}
          onValueChange={setUsuarios}
          value={usuarios}
        />
        <FieldDescription>Hasta 9 por cuenta. Los de solo lectura no cuentan.</FieldDescription>
      </Field>
      <p className="text-callout text-label-secondary">
        {usuarios === 1 ? "1 usuario" : `${usuarios ?? 0} usuarios`}
      </p>
    </div>
  )
}

/**
 * Precio, con moneda
 * `format` es el de `Intl.NumberFormat` y `locale` decide el separador: se ve «$ 12.500» pero el valor sigue siendo `12500`, y eso es lo que viaja en el submit. `largeStep` con Shift sube de a mil.
 */
export function Precio() {
  const [precio, setPrecio] = useState<number | null>(12_500)
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field name="precio">
        <FieldLabel>Precio de lista</FieldLabel>
        <NumberField
          format={{ style: "currency", currency: "ARS", maximumFractionDigits: 0 }}
          largeStep={1_000}
          locale="es-AR"
          min={0}
          onValueChange={setPrecio}
          step={100}
          value={precio}
        />
        <FieldDescription>Sin IVA. Shift + flecha mueve de a $1.000.</FieldDescription>
      </Field>
      <p className="text-mono-callout text-label-secondary">value: {JSON.stringify(precio)}</p>
    </div>
  )
}

/**
 * Stock: tamaños y solo lectura
 * `sm` (32px) para una fila de tabla o un panel denso, `md` (40px) suelto, `lg` (48px) para un formulario de alta. `readOnly` deja copiar el número y apaga los steppers; `disabled` lo saca del formulario.
 */
export function Stock() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field name="stock-deposito">
        <FieldLabel>Stock en depósito</FieldLabel>
        <NumberField defaultValue={140} min={0} size="sm" step={10} />
      </Field>
      <Field name="stock-minimo">
        <FieldLabel>Stock mínimo antes de reponer</FieldLabel>
        <NumberField defaultValue={20} min={0} size="lg" />
      </Field>
      <Field name="stock-reservado">
        <FieldLabel>Reservado por pedidos abiertos</FieldLabel>
        <NumberField defaultValue={12} readOnly />
      </Field>
    </div>
  )
}
