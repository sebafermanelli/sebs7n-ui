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
        action={<Button>Nueva factura</Button>}
        description="Cuando emitas la primera, va a aparecer acá con su estado y su vencimiento."
        hint="También podés importarlas desde un archivo, en Más acciones."
        icon={<FileTextIcon />}
        title="Todavía no emitiste ninguna factura"
      />
      <EmptyState
        action={<Button variant="secondary">Limpiar filtros</Button>}
        description="Probá con otro rango de fechas o sacá el filtro de cliente."
        icon={<SearchXIcon />}
        title="Ninguna factura coincide con el filtro"
      />
    </div>
  )
}

/**
 * El panel vacío
 * `placeholder` es el de iCloud («No Message Selected»): solo el título grande y tenue, centrado en todo el alto del panel, sin ícono ni acción.
 */
export function Panel() {
  return (
    <div className="h-64 w-full rounded-surface border border-separator">
      <EmptyState title="Ninguna factura elegida" variant="placeholder" />
    </div>
  )
}
