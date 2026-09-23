"use client"

import { FileTextIcon, SearchXIcon } from "lucide-react"
import { Button } from "sebs7n-ui/button"
import { EmptyState } from "sebs7n-ui/empty-state"

/**
 * Los dos vacíos
 * «Todavía no hay nada» y «el filtro no encontró nada» no son el mismo texto.
 */
export function Basico() {
  return (
    <div className="flex w-full flex-col gap-4">
      <EmptyState
        action={<Button variant="accent">Nueva factura</Button>}
        description="Cuando emitas la primera, va a aparecer acá con su estado y su vencimiento."
        icon={<FileTextIcon />}
        title="Todavía no emitiste ninguna factura"
      />
      <EmptyState
        action={<Button variant="outline">Limpiar filtros</Button>}
        description="Probá con otro rango de fechas o sacá el filtro de cliente."
        icon={<SearchXIcon />}
        title="Ninguna factura coincide con el filtro"
      />
    </div>
  )
}
