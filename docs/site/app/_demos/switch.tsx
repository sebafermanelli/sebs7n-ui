"use client"

import { useId } from "react"
import { Label } from "sebs7n-ui/label"
import { Switch } from "sebs7n-ui/switch"

/**
 * Efecto inmediato
 * Si el cambio se aplica al apretar «Guardar», es un `Checkbox`.
 */
export function Basico() {
  const a = useId()
  const b = useId()
  const c = useId()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Switch defaultChecked id={a} />
        <Label htmlFor={a}>Notificaciones</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch defaultChecked id={b} variant="accent" />
        <Label htmlFor={b}>Recordatorios de vencimiento</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id={c} size="sm" />
        <Label htmlFor={c}>Modo compacto</Label>
      </div>
    </div>
  )
}
