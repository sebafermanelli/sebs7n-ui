"use client"

import { ReceiptIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "sebs7n-ui"
import { SortableAddButton, SortableList } from "sebs7n-ui/sortable-list"

type Line = { id: string; concept: string; amount: string }

const LINES: Line[] = [
  { id: "design", concept: "Diseño de la factura", amount: "$ 48.000" },
  { id: "hosting", concept: "Hosting anual", amount: "$ 36.000" },
  { id: "support", concept: "Soporte mensual", amount: "$ 22.500" },
  { id: "domain", concept: "Dominio", amount: "$ 9.800" },
]

// Lo que se puede sumar a la factura: las líneas de arriba más dos del catálogo.
const CATALOG: Line[] = [
  ...LINES,
  { id: "maintenance", concept: "Mantenimiento", amount: "$ 15.000" },
  { id: "training", concept: "Capacitación", amount: "$ 30.000" },
]

function LineRow({ line }: { line: Line }) {
  return (
    <>
      <ReceiptIcon aria-hidden="true" className="size-5 shrink-0 text-brand-900" />
      <span className="min-w-0 flex-1 truncate text-body text-label">{line.concept}</span>
      <span className="shrink-0 text-body text-label tabular-nums">{line.amount}</span>
    </>
  )
}

/** El botón de la app que prende y apaga el modo edición: «Listo» es el acento mientras se edita. */
function EditButton({ editing, onEditingChange }: { editing: boolean; onEditingChange: (editing: boolean) => void }) {
  return (
    <Button className="self-end" onClick={() => onEditingChange(!editing)} size="sm" variant={editing ? "default" : "secondary"}>
      {editing ? "Listo" : "Editar"}
    </Button>
  )
}

/**
 * Las líneas de una factura
 * «Editar» (o mantener apretada una fila) muestra el «−» y la manija ⋮⋮: arrastrala, o enfocala con Tab y usá Espacio, ↑/↓ y Espacio. El «+» al lado de «Listo» (`SortableAddButton`) suma una línea del catálogo.
 */
export function InvoiceLines() {
  const [lines, setLines] = useState(LINES)
  const [editing, setEditing] = useState(false)
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-end gap-1">
        {editing && (
          <SortableAddButton
            items={CATALOG.filter((line) => !lines.includes(line)).map((line) => ({ id: line.id, label: line.concept }))}
            onSelect={(id) => setLines([...lines, ...CATALOG.filter((line) => line.id === id)])}
            size="icon-sm"
          />
        )}
        <EditButton editing={editing} onEditingChange={setEditing} />
      </div>
      <SortableList
        aria-label="Líneas de la factura"
        editing={editing}
        getKey={(line) => line.id}
        getLabel={(line) => line.concept}
        items={lines}
        onEditingChange={setEditing}
        onRemove={(id) => setLines(lines.filter((line) => line.id !== id))}
        onReorder={setLines}
        renderItem={(line) => <LineRow line={line} />}
      />
    </div>
  )
}

/**
 * Si guardar falla
 * `onReorder` devuelve una promesa: el orden cambia al soltar y, si la promesa falla, vuelve el anterior y se anuncia.
 */
export function Rollback() {
  const [editing, setEditing] = useState(false)
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <EditButton editing={editing} onEditingChange={setEditing} />
      <SortableList
        aria-label="Líneas de la factura, sin conexión"
        editing={editing}
        getKey={(line) => line.id}
        getLabel={(line) => line.concept}
        items={LINES}
        onEditingChange={setEditing}
        onReorder={() => new Promise((_, reject) => setTimeout(() => reject(new Error("Sin conexión")), 800))}
        renderItem={(line) => <LineRow line={line} />}
      />
    </div>
  )
}
