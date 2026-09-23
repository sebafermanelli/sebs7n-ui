"use client"

import { useState } from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "sebs7n-ui/combobox"
import { Label } from "sebs7n-ui/label"

const PAISES = ["Argentina", "Brasil", "Chile", "Colombia", "España", "México", "Perú", "Portugal", "Uruguay"]

/**
 * Elegir uno
 * El valor tiene que ser uno de la lista: escribir filtra, no crea.
 */
export function Basico() {
  const [pais, setPais] = useState<string | null>(null)
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="pais">País</Label>
      <Combobox items={PAISES} onValueChange={setPais} value={pais}>
        <ComboboxInput id="pais" placeholder="Elegí un país" />
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

/**
 * Varios, con chips
 * `multiple` y `ComboboxChips` en vez de `ComboboxInput`. Backspace con el input vacío borra el último.
 */
export function Multiple() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="paises">Países donde operás</Label>
      <Combobox items={PAISES} multiple>
        <ComboboxChips>
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput id="paises" />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
