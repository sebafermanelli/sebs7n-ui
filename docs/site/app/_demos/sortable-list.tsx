"use client"

import { ReceiptIcon } from "lucide-react"
import { useState } from "react"
import { SortableList } from "sebs7n-ui/sortable-list"

type Line = { id: string; concept: string; amount: string }

const LINES: Line[] = [
  { id: "design", concept: "Diseño de la factura", amount: "$ 48.000" },
  { id: "hosting", concept: "Hosting anual", amount: "$ 36.000" },
  { id: "support", concept: "Soporte mensual", amount: "$ 22.500" },
  { id: "domain", concept: "Dominio", amount: "$ 9.800" },
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

/**
 * Las líneas de una factura
 * Arrastrá la manija ⋮⋮, o enfocala con Tab y usá Espacio, ↑/↓ y Espacio.
 */
export function InvoiceLines() {
  const [lines, setLines] = useState(LINES)
  return (
    <SortableList
      aria-label="Líneas de la factura"
      className="w-full max-w-md"
      getKey={(line) => line.id}
      getLabel={(line) => line.concept}
      items={lines}
      onReorder={setLines}
      renderItem={(line) => <LineRow line={line} />}
    />
  )
}

/**
 * Si guardar falla
 * `onReorder` devuelve una promesa: el orden cambia al soltar y, si la promesa falla, vuelve el anterior y se anuncia.
 */
export function Rollback() {
  return (
    <SortableList
      aria-label="Líneas de la factura, sin conexión"
      className="w-full max-w-md"
      getKey={(line) => line.id}
      getLabel={(line) => line.concept}
      items={LINES}
      onReorder={() => new Promise((_, reject) => setTimeout(() => reject(new Error("Sin conexión")), 800))}
      renderItem={(line) => <LineRow line={line} />}
    />
  )
}
