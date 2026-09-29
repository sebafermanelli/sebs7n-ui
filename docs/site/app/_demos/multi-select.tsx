"use client"

import { useState } from "react"
import { Field, FieldDescription, FieldLabel } from "sebs7n-ui"
import { MultiSelect, type MultiSelectOption } from "sebs7n-ui/multi-select"

const MEDIOS: MultiSelectOption[] = [
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta de crédito" },
  { value: "debito", label: "Débito automático" },
  { value: "billetera", label: "Billetera virtual" },
  { value: "efectivo", label: "Efectivo", disabled: true },
]

const CLIENTES: MultiSelectOption[] = ["Acme S.A.", "Nube Digital", "Estudio Ruiz", "Óptica Sur", "Taller Norte", "Librería Central"].map((cliente) => ({
  value: cliente.toLowerCase().replace(/\W+/g, "-"),
  label: cliente,
}))

/**
 * Medios de pago
 * Los elegidos como chips y la lista del menú con el círculo de acento a la derecha. Se escribe para filtrar (sin tildes), Enter elige y la lista queda abierta; «Seleccionar todo» marca las que se ven.
 */
export function Basico() {
  const [medios, setMedios] = useState(["transferencia", "tarjeta"])
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="medios">Medios de pago aceptados</FieldLabel>
      <MultiSelect id="medios" onValueChange={setMedios} options={MEDIOS} placeholder="Elegí uno o más" selectAll value={medios} />
      <FieldDescription>Se muestran en el link de pago de cada factura.</FieldDescription>
    </Field>
  )
}

/**
 * Con tope
 * `max` apaga el resto al llegar y la lista lo dice.
 */
export function ConTope() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="destacados">Clientes destacados (hasta 3)</FieldLabel>
      <MultiSelect defaultValue={["acme-s-a-"]} id="destacados" max={3} options={CLIENTES} placeholder="Buscar clientes" />
    </Field>
  )
}
