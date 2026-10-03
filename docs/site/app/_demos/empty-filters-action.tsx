"use client"

import { useState } from "react"
import { EmptyFiltersAction } from "sebs7n-ui/empty-filters-action"
import { EmptyState } from "sebs7n-ui/empty-state"

/**
 * Salida de una lista vacía por filtros
 * Con filtros en estado, un botón con onClear; con filtros en la URL, un link a la misma ruta sin ellos. Sin filtros no dibuja nada.
 */
export function Basic() {
  const [status, setStatus] = useState<string | null>("Vencidas")
  return (
    <EmptyState
      action={<EmptyFiltersAction active={status !== null} onClear={() => setStatus(null)} />}
      description={status ? `Filtro: ${status}.` : "Cuando emitas la primera, la vas a ver acá."}
      title={status ? "Ninguna factura coincide" : "Todavía no hay facturas"}
      variant="plain"
    />
  )
}
