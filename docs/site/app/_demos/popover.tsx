"use client"

import { Button } from "sebs7n-ui/button"
import { Input } from "sebs7n-ui/input"
import { Label } from "sebs7n-ui/label"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "sebs7n-ui/popover"

/** Contenido interactivo anclado a un control */
export function Basico() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Rango de fechas</PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverHeader>
          <PopoverTitle>Rango</PopoverTitle>
          <PopoverDescription>Se aplica al resumen del mes.</PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pop-desde">Desde</Label>
            <Input id="pop-desde" size="sm" type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pop-hasta">Hasta</Label>
            <Input id="pop-hasta" size="sm" type="date" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
