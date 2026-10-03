"use client"

import { useState } from "react"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { FilterDisclosure } from "sebs7n-ui/filter-disclosure"
import { SearchField } from "sebs7n-ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"

const STATUS = { all: "Todos los estados", paid: "Cobradas", pending: "Pendientes" }
const PERIOD = { month: "Este mes", quarter: "Trimestre", year: "Año" }

/**
 * Filtros plegados en un contenedor angosto
 * Desde 36 rem de ancho de la barra los filtros están a la vista; por debajo quedan detrás de «Filtros (n)». La búsqueda espera 300 ms antes de avisar.
 */
export function Basic() {
  const [status, setStatus] = useState("all")
  const [period, setPeriod] = useState("month")
  const [query, setQuery] = useState("")
  return (
    <div className="flex w-full flex-col gap-2">
      <FilterBar
        filters={
          <FilterDisclosure activeCount={(status !== "all" ? 1 : 0) + (period !== "month" ? 1 : 0)}>
            <Select items={STATUS} onValueChange={(v) => v && setStatus(v as string)} value={status}>
              <SelectTrigger aria-label="Estado" className="w-full sm:w-48" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select items={PERIOD} onValueChange={(v) => v && setPeriod(v as string)} value={period}>
              <SelectTrigger aria-label="Período" className="w-full sm:w-40" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERIOD).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterDisclosure>
        }
        search={<SearchField aria-label="Buscar facturas" onSearch={setQuery} size="sm" />}
      />
      <p className="text-footnote text-label-secondary">Búsqueda enviada: {query === "" ? "(vacía)" : query}</p>
    </div>
  )
}
