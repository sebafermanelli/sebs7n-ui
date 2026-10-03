"use client"

import { DownloadIcon } from "lucide-react"
import { useState } from "react"
import { BulkActionsBar } from "sebs7n-ui/bulk-actions-bar"
import { Button } from "sebs7n-ui/button"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { SearchField } from "sebs7n-ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"

const STATUS = { all: "Todos los estados", paid: "Cobradas", pending: "Pendientes", overdue: "Vencidas" }

/**
 * Búsqueda, filtros y acciones
 * Una fila en escritorio, una columna en el teléfono. Los controles son los de siempre: la barra solo los acomoda.
 */
export function Basic() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [period, setPeriod] = useState(["month"])
  return (
    <FilterBar
      actions={
        <Button variant="secondary">
          <DownloadIcon />
          Exportar
        </Button>
      }
      className="w-full"
      filters={
        <>
          <Select items={STATUS} onValueChange={(value) => value && setStatus(value as string)} value={status}>
            <SelectTrigger aria-label="Estado" className="w-full sm:w-48">
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
          <ToggleGroup aria-label="Período" onValueChange={(value) => value.length > 0 && setPeriod(value)} required value={period}>
            <ToggleGroupItem value="month">Mes</ToggleGroupItem>
            <ToggleGroupItem value="quarter">Trimestre</ToggleGroupItem>
            <ToggleGroupItem value="year">Año</ToggleGroupItem>
          </ToggleGroup>
        </>
      }
      search={<SearchField aria-label="Buscar facturas" onValueChange={setQuery} placeholder="Buscar facturas" value={query} />}
    />
  )
}

/**
 * Con selección
 * Mientras hay facturas elegidas, las acciones masivas ocupan el lugar de las de siempre.
 */
export function WithSelection() {
  const [selected, setSelected] = useState(2)
  return (
    <FilterBar
      actions={
        selected > 0 ? (
          <BulkActionsBar count={selected} labels={{ selectedOne: "{count} seleccionada", selectedOther: "{count} seleccionadas" }} onClear={() => setSelected(0)}>
            <Button size="sm" variant="secondary">
              Marcar cobradas
            </Button>
          </BulkActionsBar>
        ) : (
          <Button onClick={() => setSelected(2)} variant="secondary">
            Simular selección
          </Button>
        )
      }
      className="w-full"
      search={<SearchField aria-label="Buscar facturas" placeholder="Buscar facturas" />}
    />
  )
}
