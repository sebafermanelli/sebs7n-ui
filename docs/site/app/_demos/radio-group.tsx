"use client"

import { useId } from "react"
import { Label } from "sebs7n-ui/label"
import { RadioGroup, RadioGroupItem } from "sebs7n-ui/radio-group"

/** Una de pocas, todas visibles */
export function Basico() {
  const titulo = useId()
  const a = useId()
  const b = useId()
  const c = useId()
  return (
    <div className="flex flex-col gap-3">
      <div className="text-label-14 text-gray-1000" id={titulo}>
        Forma de pago
      </div>
      <RadioGroup aria-labelledby={titulo} className="flex flex-col gap-3" defaultValue="transferencia">
        <div className="flex items-center gap-2">
          <RadioGroupItem id={a} value="transferencia" />
          <Label htmlFor={a}>Transferencia</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id={b} value="tarjeta" />
          <Label htmlFor={b}>Tarjeta</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem disabled id={c} value="efectivo" />
          <Label htmlFor={c}>Efectivo (no disponible)</Label>
        </div>
      </RadioGroup>
    </div>
  )
}
