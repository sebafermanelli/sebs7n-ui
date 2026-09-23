"use client"

import { useId } from "react"
import { Label } from "sebs7n-ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "sebs7n-ui/select"

/** Básico */
export function Basico() {
  const id = useId()
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor={id}>Condición frente al IVA</Label>
      <Select>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Elegí una" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ri">Responsable inscripto</SelectItem>
          <SelectItem value="mono">Monotributo</SelectItem>
          <SelectItem value="exento">Exento</SelectItem>
          <SelectItem value="cf">Consumidor final</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

/** Con grupos */
export function Grupos() {
  return (
    <Select defaultValue="ars">
      <SelectTrigger aria-label="Moneda" className="max-w-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Local</SelectLabel>
          <SelectItem value="ars">Peso argentino</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Extranjera</SelectLabel>
          <SelectItem value="usd">Dólar</SelectItem>
          <SelectItem value="eur">Euro</SelectItem>
          <SelectItem value="brl">Real</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

/**
 * Tamaños y error
 * Las mismas tres alturas que `Input`, para que un formulario mixto quede alineado.
 */
export function TamanosYError() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Select>
        <SelectTrigger aria-label="Pequeño" size="sm">
          <SelectValue placeholder="sm · 32px" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Una opción</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger aria-invalid aria-label="Con error">
          <SelectValue placeholder="Falta elegir" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Una opción</SelectItem>
        </SelectContent>
      </Select>
      <Select disabled>
        <SelectTrigger aria-label="Deshabilitado">
          <SelectValue placeholder="No se puede cambiar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Una opción</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
