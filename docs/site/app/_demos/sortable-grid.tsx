"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "sebs7n-ui"
import { SortableGrid } from "sebs7n-ui/sortable-grid"

type Widget = { id: string; title: string; value: string }

const WIDGETS: Widget[] = [
  { id: "billed", title: "Facturado", value: "$ 4.820.300" },
  { id: "due", title: "Por cobrar", value: "$ 237.200" },
  { id: "clients", title: "Clientes", value: "23 activos" },
  { id: "overdue", title: "Vencidas", value: "1 factura" },
]

/**
 * Widgets
 * La tarjeta entera se arrastra y las demás se corren. Con el teclado: Tab hasta una, Espacio, flechas en las dos direcciones y Espacio.
 */
export function Widgets() {
  const [widgets, setWidgets] = useState(WIDGETS)
  return (
    <SortableGrid
      aria-label="Resumen"
      className="w-full max-w-lg"
      columns={2}
      getKey={(widget) => widget.id}
      getLabel={(widget) => widget.title}
      items={widgets}
      onReorder={setWidgets}
      renderItem={(widget) => (
        <Card size="sm">
          <CardHeader>
            <CardTitle>{widget.title}</CardTitle>
            <CardDescription>{widget.value}</CardDescription>
          </CardHeader>
        </Card>
      )}
    />
  )
}

/**
 * Con manija
 * `handle`: se arrastra solo desde la manija ⋮⋮, que `renderItem` pone donde va. El resto de la tarjeta queda para sus propios clicks.
 */
export function WithHandle() {
  const [widgets, setWidgets] = useState(WIDGETS)
  return (
    <SortableGrid
      aria-label="Resumen con manija"
      className="w-full max-w-lg"
      columns={2}
      getKey={(widget) => widget.id}
      getLabel={(widget) => widget.title}
      handle
      items={widgets}
      onReorder={setWidgets}
      renderItem={(widget, state) => (
        <Card size="sm">
          <CardHeader>
            <CardTitle>{widget.title}</CardTitle>
            <CardDescription>{widget.value}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">{state.handle}</CardContent>
        </Card>
      )}
    />
  )
}
