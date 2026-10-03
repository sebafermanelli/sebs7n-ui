"use client"

import { Button } from "sebs7n-ui/button"
import { Card, CardContent } from "sebs7n-ui/card"
import { SortableList } from "sebs7n-ui/sortable-list"

import { useProject } from "../_state/project-context"
import { SERVICE_STATUS } from "./status"

// La prioridad de arranque: los servicios se inician de arriba hacia abajo. Pesa por el arrastre, así que
// se pide recién cuando se abre (no entra en el primer bundle de Servicios). Va en la página y no en un
// diálogo: así el arrastre con el teclado (Espacio, flechas, Espacio) llega sin que nada lo intercepte.
export default function StartupOrderPanel({ onClose }: { onClose: () => void }) {
  const { project, services, reorderServices } = useProject()
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-headline text-label">Orden de arranque</h2>
            <p className="text-callout text-label-secondary">Los servicios de {project.name} se inician de arriba hacia abajo. Arrastrá la manija, o tomala con Espacio y movela con las flechas.</p>
          </div>
          <Button onClick={onClose} size="sm">
            Listo
          </Button>
        </div>
        <SortableList
          aria-label="Orden de arranque de los servicios"
          editing
          getKey={(service) => service.id}
          getLabel={(service) => service.name}
          items={services}
          onReorder={(items) => reorderServices(items.map((service) => service.id))}
          renderItem={(service) => (
            <>
              <span className="min-w-0 flex-1 truncate text-body text-label">{service.name}</span>
              <span className="shrink-0 text-callout text-label-secondary">{SERVICE_STATUS[service.status].label}</span>
            </>
          )}
        />
      </CardContent>
    </Card>
  )
}
