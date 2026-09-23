"use client"

import { ChevronDownIcon } from "lucide-react"
import { useId, useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "sebs7n-ui/collapsible"
import { Input } from "sebs7n-ui/input"
import { Label } from "sebs7n-ui/label"

/**
 * El detalle de una fila
 * El trigger no trae estilo: va `render={<Button … />}`. El chevron gira con `data-panel-open`, que Base UI pone en el trigger.
 */
export function Basico() {
  return (
    <Collapsible className="w-full max-w-sm gap-1">
      <CollapsibleTrigger render={<Button className="group w-full justify-between" variant="ghost" />}>
        Factura 0012 · $ 128.400
        <ChevronDownIcon className="transition-transform duration-150 ease-out motion-reduce:transition-none group-data-panel-open:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-1 rounded-md bg-background-200 p-3">
        <span>Consultoría — 40 h — $ 96.000</span>
        <span>Hosting — 1 mes — $ 18.400</span>
        <span>Soporte — 1 mes — $ 14.000</span>
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * Filtros avanzados, controlado por la app
 * Con `open` en el estado, la app sabe si están abiertos: por ejemplo para dejarlos abiertos cuando hay un filtro aplicado.
 */
export function Controlado() {
  const [abierto, setAbierto] = useState(false)
  const desde = useId()
  const hasta = useId()
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input placeholder="Buscar factura" />
      <Collapsible className="gap-2" onOpenChange={setAbierto} open={abierto}>
        <CollapsibleTrigger render={<Button className="self-start" size="sm" variant="ghost" />}>
          {abierto ? "Ocultar filtros avanzados" : "Filtros avanzados"}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={desde}>Desde</Label>
            <Input id={desde} size="sm" type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={hasta}>Hasta</Label>
            <Input id={hasta} size="sm" type="date" />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

/**
 * Contenido que tiene que existir cerrado
 * `keepMounted` lo deja en el DOM, oculto: sirve cuando un crawler o el ⌘F del navegador tienen que verlo. Sin él, el contenido cerrado no existe.
 */
export function KeepMounted() {
  return (
    <Collapsible className="w-full max-w-sm gap-1">
      <CollapsibleTrigger render={<Button size="sm" variant="outline" />}>Ver claves de recuperación</CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-1 text-copy-13-mono" keepMounted>
        <span>alien-bean-pasta</span>
        <span>wild-irish-burrito</span>
        <span>horse-battery-staple</span>
      </CollapsibleContent>
    </Collapsible>
  )
}
