"use client"

import { BoldIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react"
import { useState } from "react"
import { Field, FieldLabel } from "sebs7n-ui/field"
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

/**
 * Varios a la vez
 * Con `multiple`, cada ítem se prende solo: los B/I/U de un editor, como el formato de Notes.
 */
export function Varios() {
  return (
    <ToggleGroup aria-label="Formato" defaultValue={["bold"]} multiple>
      <ToggleGroupItem aria-label="Negrita" value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Cursiva" value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Subrayado" value="underline">
        <UnderlineIcon />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Tachado" value="strike">
        <StrikethroughIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

/**
 * Tamaño de formulario
 * `size="md"` para que la pista mida 36 como los campos de al lado; en un `Field` con `name`, manda cada valor prendido.
 */
export function EnFormulario() {
  return (
    <Field name="status">
      <FieldLabel>Estados</FieldLabel>
      <ToggleGroup defaultValue={["paid"]} multiple size="md">
        <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
        <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
        <ToggleGroupItem value="draft">Borradores</ToggleGroupItem>
      </ToggleGroup>
    </Field>
  )
}
