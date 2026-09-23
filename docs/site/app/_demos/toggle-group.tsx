"use client"

import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"

/**
 * Uno de varios
 * El grupo entero es una sola parada de tabulación; adentro se recorre con las flechas.
 */
export function Basico() {
  const [vista, setVista] = useState<string[]>(["tabla"])
  return (
    <ToggleGroup aria-label="Vista" onValueChange={(value) => value[0] && setVista(value as string[])} value={vista}>
      <ToggleGroupItem value="tabla">Tabla</ToggleGroupItem>
      <ToggleGroupItem value="tarjetas">Tarjetas</ToggleGroupItem>
      <ToggleGroupItem value="calendario">Calendario</ToggleGroupItem>
    </ToggleGroup>
  )
}
