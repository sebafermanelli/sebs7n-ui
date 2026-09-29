"use client"

import { BoldIcon } from "lucide-react"
import { Field, FieldDescription, FieldLabel } from "sebs7n-ui/field"
import { Toggle } from "sebs7n-ui/toggle"

/** Un botón que queda apretado */
export function Basico() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle defaultPressed>Activos</Toggle>
      <Toggle>Archivados</Toggle>
      <Toggle disabled>Borradores</Toggle>
      <Toggle aria-label="Negrita">
        <BoldIcon />
      </Toggle>
    </div>
  )
}

/**
 * Tamaños y en un formulario
 * `size` 28, 36 o 40 como los botones; en un `Field`, `FieldLabel` lo nombra y con `name` viaja en el form.
 */
export function TamanosYFormulario() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle size="sm">Chico</Toggle>
        <Toggle defaultPressed size="md">
          Mediano
        </Toggle>
        <Toggle size="lg">Grande</Toggle>
      </div>
      <Field name="urgent">
        <FieldLabel>Prioridad</FieldLabel>
        <Toggle size="md">Urgente</Toggle>
        <FieldDescription>Las urgentes se cobran primero.</FieldDescription>
      </Field>
    </div>
  )
}
