"use client"

import { MapPinIcon } from "lucide-react"
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "sebs7n-ui/autocomplete"
import { Label } from "sebs7n-ui/label"

const CIUDADES = ["Barcelona", "Bogotá", "Buenos Aires", "Córdoba", "Lima", "Madrid", "Montevideo", "Rosario", "Santiago"]

/**
 * Texto libre con sugerencias
 * Un valor que no está en la lista también vale.
 */
export function Basico() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="ciudad">Ciudad</Label>
      <Autocomplete items={CIUDADES}>
        <AutocompleteInput id="ciudad" placeholder="Escribí o elegí" />
        <AutocompleteContent>
          <AutocompleteEmpty />
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}

/**
 * Con ícono adelante
 * `startIcon` pone el ícono adentro del campo y corre el texto: sin `pl-10` ni íconos absolutos a mano.
 */
export function ConIcono() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="ciudad-icono">Ciudad de entrega</Label>
      <Autocomplete items={CIUDADES}>
        <AutocompleteInput id="ciudad-icono" placeholder="Escribí o elegí" startIcon={<MapPinIcon />} />
        <AutocompleteContent>
          <AutocompleteEmpty />
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    </div>
  )
}
