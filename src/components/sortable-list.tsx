"use client"

import type * as React from "react"

import { SortableBase, sortableLabels, type SortableItemState, type SortableLabels, type SortableProps } from "../internal/sortable.js"

/**
 * Una lista que se reordena arrastrando la manija ⋮⋮ de cada fila, o con el teclado: Espacio la
 * toma, ↑/↓ la mueven y Espacio la suelta (Escape cancela). Cada movimiento se anuncia: «Tomaste
 * Factura 0012, posición 2 de 5».
 *
 * Cada fila es un `ListRow` con la manija a la izquierda: `renderItem` devuelve lo de adentro, no
 * un `<li>` (un `<li>` adentro de otro rompe la hidratación). Usa `@dnd-kit/core`,
 * `@dnd-kit/sortable` y `@dnd-kit/utilities`, peers opcionales: los instala la app que lo usa.
 */
type SortableListProps<T> = SortableProps<T> & Omit<React.ComponentProps<"ul">, "children">

function SortableList<T>(props: SortableListProps<T>) {
  return <SortableBase handle variant="list" {...props} />
}

export { SortableList, sortableLabels, type SortableItemState, type SortableLabels, type SortableListProps }
