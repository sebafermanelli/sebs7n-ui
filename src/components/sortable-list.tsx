"use client"

import type * as React from "react"

import {
  SortableAddButton,
  SortableBase,
  sortableLabels,
  type SortableAddButtonProps,
  type SortableAddItem,
  type SortableItemState,
  type SortableLabels,
  type SortableProps,
} from "../internal/sortable.js"

/**
 * Una lista que se reordena arrastrando la manija ⋮⋮ de cada fila, o con el teclado: Espacio la
 * toma, ↑/↓ la mueven y Espacio la suelta (Escape cancela). Cada movimiento se anuncia: «Tomaste
 * Factura 0012, posición 2 de 5».
 *
 * **Solo en modo edición** (`editing`, o mantener apretada una fila ~0,5 s): la manija aparece al
 * final de cada fila, `onRemove` pone un «−» adelante; el «+» para agregar es
 * `SortableAddButton`, al lado del «Listo». Se sale
 * con el «Listo» de la app, Esc o un clic afuera. Se edita una lista por vez.
 *
 * **Con teclado no hay «mantener apretado»:** la app tiene que dar su botón «Editar»/«Listo» y
 * controlar `editing` (`onEditingChange`), si no quien no usa puntero nunca entra en edición.
 *
 * Cada fila es un `ListRow` con la manija a la izquierda: `renderItem` devuelve lo de adentro, no
 * un `<li>` (un `<li>` adentro de otro rompe la hidratación). Usa `@dnd-kit/core`,
 * `@dnd-kit/sortable` y `@dnd-kit/utilities`, peers opcionales: los instala la app que lo usa.
 */
/** Lo que recibe `itemClassName` de `SortableList` como segundo argumento. */
type SortableListItemState = {
  index: number
  /** `true` mientras esta fila es la que se arrastra. */
  dragging: boolean
  /** `true` en modo edición. */
  editing: boolean
}

type SortableListProps<T> = SortableProps<T> &
  Omit<React.ComponentProps<"ul">, "children"> & {
    /**
     * Las clases del `<li>` de cada fila, fijas o según el ítem y su estado (`dragging`, `editing`,
     * `index`): así la app no apunta a la estructura de adentro con `[&>li]`.
     */
    itemClassName?: string | ((item: T, state: SortableListItemState) => string | undefined)
    /**
     * Filas sin el separador ni el padding de `ListRow`, para un `renderItem` que dibuja su propia
     * card. El espacio entre filas va en `className` (`gap-4`).
     */
    plain?: boolean
  }

function SortableList<T>(props: SortableListProps<T>) {
  return <SortableBase handle variant="list" {...props} />
}

export { SortableAddButton, SortableList, sortableLabels, type SortableAddButtonProps, type SortableAddItem, type SortableItemState, type SortableLabels, type SortableListItemState, type SortableListProps }
