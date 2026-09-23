"use client"

import { useId } from "react"
import { Input } from "sebs7n-ui/input"
import { Label } from "sebs7n-ui/label"

/** Opcional y obligatorio */
export function Basico() {
  const cuit = useId()
  const alias = useId()
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={cuit} required>
          CUIT
        </Label>
        <Input id={cuit} placeholder="30-71234567-9" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={alias}>Alias</Label>
        <Input id={alias} placeholder="acme.pagos" />
      </div>
    </div>
  )
}
