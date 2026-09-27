"use client"

import { Button } from "sebs7n-ui/button"
import { DatePicker } from "sebs7n-ui/date-picker"
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
            <DatePicker id="pop-desde" size="sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pop-hasta">Hasta</Label>
            <DatePicker id="pop-hasta" size="sm" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
