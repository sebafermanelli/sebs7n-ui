"use client"

import { useId, useState } from "react"
import { Input } from "sebs7n-ui/input"
import { Label } from "sebs7n-ui/label"

/** Con etiqueta */
export function ConEtiqueta() {
  const id = useId()
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor={id} required>
        Razón social
      </Label>
      <Input id={id} placeholder="Acme S.A." />
    </div>
  )
}

/** Tamaños */
export function Tamanos() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input size="sm" placeholder="sm · 32px" />
      <Input size="md" placeholder="md · 40px" />
      <Input size="lg" placeholder="lg · 48px" />
    </div>
  )
}

/**
 * Error
 * `aria-invalid` es todo: el borde rojo y el anillo salen de ahí.
 */
export function Error() {
  const id = useId()
  const [valor, setValor] = useState("acme@")
  const invalido = !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(valor)
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor={id}>Email</Label>
      <Input
        aria-describedby={invalido ? `${id}-error` : undefined}
        aria-invalid={invalido || undefined}
        id={id}
        onChange={(event) => setValor(event.target.value)}
        type="email"
        value={valor}
      />
      {invalido && (
        <p className="text-copy-13 text-red-900" id={`${id}-error`}>
          Escribí un email válido, con dominio.
        </p>
      )}
    </div>
  )
}

/** Deshabilitado y solo lectura */
export function Estados() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input defaultValue="No se puede editar" disabled />
      <Input defaultValue="30-71234567-9" readOnly />
    </div>
  )
}
