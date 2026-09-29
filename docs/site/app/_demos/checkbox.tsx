"use client"

import { useId } from "react"
import { Checkbox } from "sebs7n-ui/checkbox"
import { Label } from "sebs7n-ui/label"

/** Con etiqueta, indeterminado y deshabilitado */
export function Basico() {
  const a = useId()
  const b = useId()
  const c = useId()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked id={a} />
        <Label htmlFor={a}>Enviar copia por email</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id={b} indeterminate />
        <Label htmlFor={b}>Seleccionar todo (3 de 8)</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox disabled id={c} />
        <Label htmlFor={c}>Firmar digitalmente (requiere certificado)</Label>
      </div>
    </div>
  )
}

/**
 * Check circular
 * `shape="circle"`: completar una tarea en una lista, como en Reminders.
 */
export function Circular() {
  const a = useId()
  const b = useId()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <Checkbox id={a} shape="circle" />
        <Label htmlFor={a}>Enviar el presupuesto a Acme</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox defaultChecked id={b} shape="circle" />
        <Label htmlFor={b}>Cargar las facturas de agosto</Label>
      </div>
    </div>
  )
}
