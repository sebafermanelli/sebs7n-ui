"use client"

import {
  Autocomplete, AutocompleteContent, AutocompleteEmpty, AutocompleteInput, AutocompleteItem, AutocompleteList,
  Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxCollection, ComboboxContent, ComboboxEmpty,
  ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxStatus, ComboboxValue, Label,
} from "sebs7n-ui"
import * as React from "react"

const REGIONS = [
  { value: "Sudamérica", items: ["Argentina", "Bolivia", "Brasil", "Chile", "Paraguay", "Uruguay"] },
  { value: "Europa", items: ["España", "Francia", "Italia", "Portugal"] },
]
const COUNTRIES = REGIONS.flatMap((region) => region.items)
const CLIENTS = ["Ana Pérez", "Bruno Díaz", "Carla Gómez", "Diego Fernández", "Elena Ruiz", "Federico Sosa", "Gabriela Paz"]
const CITIES = ["Barcelona", "Berlín", "Bilbao", "Bogotá", "Boston", "Bruselas", "Budapest"]

function Items() {
  return (
    <ComboboxList>
      {(item: string) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  )
}

// Búsqueda remota simulada (600 ms).
function ClientSearch() {
  const [items, setItems] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  return (
    <Combobox
      items={items}
      filter={null}
      onInputValueChange={(query, { reason }) => {
        if (reason === "item-press") return
        clearTimeout(timer.current)
        if (!query.trim()) {
          setItems([])
          setLoading(false)
          return
        }
        setLoading(true)
        timer.current = setTimeout(() => {
          setItems(CLIENTS.filter((p) => p.toLowerCase().includes(query.toLowerCase())))
          setLoading(false)
        }, 600)
      }}
    >
      <ComboboxInput id="cb-cliente" placeholder="Buscá por nombre" />
      <ComboboxContent>
        <ComboboxStatus loading={loading} />
        <ComboboxEmpty>{loading ? null : undefined}</ComboboxEmpty>
        <Items />
      </ComboboxContent>
    </Combobox>
  )
}

export function ComboboxDemo() {
  return (
    <div className="grid max-w-xl gap-4">
      <div className="grid gap-2">
        <Label htmlFor="cb-pais">País (grupos)</Label>
        <Combobox items={REGIONS}>
          <ComboboxInput id="cb-pais" placeholder="Elegí un país" />
          <ComboboxContent>
            <ComboboxEmpty />
            <ComboboxList>
              {(region: (typeof REGIONS)[number]) => (
                <ComboboxGroup key={region.value} items={region.items}>
                  <ComboboxLabel>{region.value}</ComboboxLabel>
                  <ComboboxCollection>
                    {(country: string) => (
                      <ComboboxItem key={country} value={country}>
                        {country}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cb-cliente">Cliente (async)</Label>
        <ClientSearch />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cb-destinos">Países (múltiple)</Label>
        <Combobox items={COUNTRIES} multiple defaultValue={["Chile", "Uruguay"]}>
          <ComboboxChips>
            <ComboboxValue>
              {(values: string[]) => (
                <>
                  {values.map((value) => (
                    <ComboboxChip key={value}>{value}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput id="cb-destinos" placeholder={values.length ? "" : "Agregá países"} />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxEmpty />
            <Items />
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cb-ciudad">Ciudad (Autocomplete, texto libre)</Label>
        <Autocomplete items={CITIES}>
          <AutocompleteInput id="cb-ciudad" placeholder="Barcelona" />
          <AutocompleteContent>
            <AutocompleteEmpty />
            <AutocompleteList>
              {(city: string) => (
                <AutocompleteItem key={city} value={city}>
                  {city}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cb-invalido">Inválido</Label>
        <Combobox items={COUNTRIES}>
          <ComboboxInput id="cb-invalido" aria-invalid placeholder="Elegí un país" />
          <ComboboxContent>
            <Items />
          </ComboboxContent>
        </Combobox>
        <p className="text-copy-13 text-red-900">Elegí un país de la lista.</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cb-disabled">Deshabilitado</Label>
        <Combobox items={COUNTRIES} disabled defaultValue="Argentina">
          <ComboboxInput id="cb-disabled" disabled />
        </Combobox>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="min-w-40 flex-1">
            <Combobox items={COUNTRIES}>
              <ComboboxInput size={size} aria-label={`País ${size}`} placeholder={size} />
              <ComboboxContent>
                <Items />
              </ComboboxContent>
            </Combobox>
          </div>
        ))}
      </div>
    </div>
  )
}
