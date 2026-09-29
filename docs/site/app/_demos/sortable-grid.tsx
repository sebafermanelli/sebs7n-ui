"use client"

import { useState } from "react"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "sebs7n-ui"
import { SortableAddButton, SortableGrid } from "sebs7n-ui/sortable-grid"

type Widget = { id: string; title: string; value: string }

const WIDGETS: Widget[] = [
  { id: "billed", title: "Facturado", value: "$ 4.820.300" },
  { id: "due", title: "Por cobrar", value: "$ 237.200" },
  { id: "clients", title: "Clientes", value: "23 activos" },
  { id: "overdue", title: "Vencidas", value: "1 factura" },
]

/** El botón de la app que prende y apaga el modo edición: «Listo» es el acento mientras se edita. */
function EditButton({ editing, onEditingChange }: { editing: boolean; onEditingChange: (editing: boolean) => void }) {
  return (
    <Button className="self-end" onClick={() => onEditingChange(!editing)} size="sm" variant={editing ? "default" : "secondary"}>
      {editing ? "Listo" : "Editar"}
    </Button>
  )
}

function WidgetCardDemo({ widget }: { widget: Widget }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
        <CardDescription>{widget.value}</CardDescription>
      </CardHeader>
    </Card>
  )
}

/**
 * Widgets
 * Se ordena en modo edición: «Editar», o mantené apretada una tarjeta. La tarjeta entera se arrastra y las demás se corren; con el teclado, Tab hasta una, Espacio, flechas y Espacio. Esc o un clic afuera sale.
 */
export function Widgets() {
  const [widgets, setWidgets] = useState(WIDGETS)
  const [editing, setEditing] = useState(false)
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <EditButton editing={editing} onEditingChange={setEditing} />
      <SortableGrid
        aria-label="Resumen"
        columns={2}
        editing={editing}
        getKey={(widget) => widget.id}
        getLabel={(widget) => widget.title}
        items={widgets}
        onEditingChange={setEditing}
        onReorder={setWidgets}
        renderItem={(widget) => <WidgetCardDemo widget={widget} />}
      />
    </div>
  )
}

/**
 * Sacar y agregar
 * `onRemove` pone un «−» en cada tarjeta, que la saca sin confirmar. `SortableAddButton` es el «+» al lado de «Listo»: un menú con las que sacaste; la que elegís vuelve al final, con el foco en su «−».
 */
export function EditMode() {
  const [widgets, setWidgets] = useState(WIDGETS)
  const [editing, setEditing] = useState(true)
  const removed = WIDGETS.filter((widget) => !widgets.includes(widget))
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex items-center justify-end gap-1">
        {editing && (
          <SortableAddButton
            items={removed.map((widget) => ({ id: widget.id, label: widget.title }))}
            onSelect={(id) => setWidgets([...widgets, ...WIDGETS.filter((widget) => widget.id === id)])}
            size="icon-sm"
          />
        )}
        <EditButton editing={editing} onEditingChange={setEditing} />
      </div>
      <SortableGrid
        aria-label="Resumen editable"
        columns={2}
        editing={editing}
        getKey={(widget) => widget.id}
        getLabel={(widget) => widget.title}
        items={widgets}
        onEditingChange={setEditing}
        onRemove={(id) => setWidgets(widgets.filter((widget) => widget.id !== id))}
        onReorder={setWidgets}
        renderItem={(widget) => <WidgetCardDemo widget={widget} />}
      />
    </div>
  )
}

/**
 * Con manija
 * `handle`: en edición, se arrastra solo desde la manija ⋮⋮, que `renderItem` pone donde va. El resto de la tarjeta queda para sus propios clicks.
 */
export function WithHandle() {
  const [widgets, setWidgets] = useState(WIDGETS)
  const [editing, setEditing] = useState(false)
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <EditButton editing={editing} onEditingChange={setEditing} />
      <SortableGrid
        aria-label="Resumen con manija"
        columns={2}
        editing={editing}
        getKey={(widget) => widget.id}
        getLabel={(widget) => widget.title}
        handle
        items={widgets}
        onEditingChange={setEditing}
        onReorder={setWidgets}
        renderItem={(widget, state) => (
          <Card size="sm">
            <CardHeader>
              <CardTitle>{widget.title}</CardTitle>
              <CardDescription>{widget.value}</CardDescription>
            </CardHeader>
            {state.handle && <CardContent className="flex justify-end">{state.handle}</CardContent>}
          </Card>
        )}
      />
    </div>
  )
}
