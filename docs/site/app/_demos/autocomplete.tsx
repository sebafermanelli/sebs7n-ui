"use client"

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
