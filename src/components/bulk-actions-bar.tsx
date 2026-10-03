"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"

type BulkActionsLabels = NonNullable<Labels["bulkActions"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const bulkActionsLabels: BulkActionsLabels = {
  label: "Acciones sobre la selección",
  clear: "Limpiar selección",
  selectedOne: "{count} seleccionado",
  selectedOther: "{count} seleccionados",
}

type BulkActionsBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Cuántos hay seleccionados. Con 0 la barra no se dibuja. */
  count: number
  /** Vacía la selección: lo llama «Limpiar selección». */
  onClear: () => void
  /** Las acciones sobre la selección: `Button`s `size="sm"`, `variant="secondary"` (y `destructive` solo si borra, detrás de un `AlertDialog`). */
  children?: React.ReactNode
  /** Textos: `label`, `clear`, `selectedOne` y `selectedOther` (con `{count}`). Por defecto, `bulkActionsLabels`. */
  labels?: Partial<BulkActionsLabels>
}

/**
 * La barra de una selección múltiple: «3 seleccionados», las acciones que valen para todos y
 * «Limpiar selección». Aparece cuando `count` pasa de 0 y se va al limpiar. Va en el lugar de los
 * filtros mientras hay selección (`filters` de `DataTable`, `actions` de `FilterBar`), así la barra
 * no cambia de alto.
 *
 * El contador es una región `status`: el lector anuncia «3 seleccionados» al marcar. El género del
 * rótulo («seleccionadas» para facturas) se cambia con `labels`. No mantiene la selección: la lleva
 * la tabla o la grilla, y la app le pasa `count`.
 */
function BulkActionsBar({ count, onClear, children, labels: labelsProp, className, ...props }: BulkActionsBarProps) {
  const labels = { ...bulkActionsLabels, ...useLabels().bulkActions, ...defined(labelsProp) }
  if (!(count > 0)) return null
  const text = (count === 1 ? labels.selectedOne : labels.selectedOther).replace("{count}", String(count))
  return (
    <div aria-label={labels.label} className={cn("flex flex-wrap items-center gap-2", className)} data-slot="bulk-actions-bar" role="group" {...props}>
      <span className="text-callout text-label-secondary" role="status">
        {text}
      </span>
      {children}
      <Button onClick={onClear} size="sm" variant="plain">
        {labels.clear}
      </Button>
    </div>
  )
}

export { BulkActionsBar, bulkActionsLabels, type BulkActionsBarProps, type BulkActionsLabels }
