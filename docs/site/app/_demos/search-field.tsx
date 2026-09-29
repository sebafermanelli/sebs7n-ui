"use client"

import { useState } from "react"
import { SearchField } from "sebs7n-ui/search-field"

const CLIENTS = ["Acme S.A.", "Globex SRL", "Initech", "Umbrella Corp.", "Hooli", "Soylent"]

/**
 * Filtrar una lista
 * La lupa adentro, «Borrar búsqueda» con texto y Escape que vacía. El filtrado es de la app.
 */
export function FilterList() {
  const [query, setQuery] = useState("")
  const shown = CLIENTS.filter((client) => client.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <SearchField aria-label="Buscar clientes" onValueChange={setQuery} placeholder="Buscar clientes" value={query} />
      <ul className="flex flex-col gap-1 text-callout text-label">
        {shown.map((client) => (
          <li key={client}>{client}</li>
        ))}
        {shown.length === 0 && <li className="text-label-secondary">Sin resultados</li>}
      </ul>
    </div>
  )
}

/**
 * Tamaños
 * 28, 36 y 40, como los campos del formulario.
 */
export function Sizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <SearchField aria-label="Buscar facturas, chico" size="sm" />
      <SearchField aria-label="Buscar facturas" defaultValue="F-0012" />
      <SearchField aria-label="Buscar facturas, grande" size="lg" />
    </div>
  )
}
