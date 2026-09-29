"use client"

import type * as React from "react"

import { SortableBase, sortableLabels, type SortableItemState, type SortableLabels, type SortableProps } from "../internal/sortable.js"

/**
 * Tarjetas en una grilla que se reordenan arrastrando: las demás se corren mientras arrastrás, como
 * los widgets de la home de iCloud. Con el teclado, Espacio toma la tarjeta, las flechas la mueven
 * en las dos direcciones y Espacio la suelta (Escape cancela), con anuncios.
 *
 * **Solo en modo edición**, como la pantalla de inicio de iOS: se entra con el botón de la app
 * (`editing`) o manteniendo apretada una tarjeta ~0,5 s, y se sale con «Listo», Esc o un clic en un
 * espacio vacío. En edición las tarjetas tiemblan, `onRemove` pone un «−» en cada una y `onAdd` una
 * celda «+ Agregar» al final. Se edita una grilla por vez: entrar en otra saca a esta.
 *
 * **Con teclado no hay «mantener apretado»:** la app tiene que dar su botón «Editar»/«Listo» y
 * controlar `editing` (`onEditingChange`), si no quien no usa puntero nunca entra en edición.
 *
 * Sin `handle` se arrastra la tarjeta entera: el mouse arranca a los 8 px (un click en un botón de
 * adentro sigue siendo un click) y el dedo después de 250 ms apretado (deslizar sigue scrolleando).
 * Con `handle`, `renderItem` recibe la manija ⋮⋮ para ponerla donde vaya. Usa `@dnd-kit/*`, peers
 * opcionales.
 */
type SortableGridProps<T> = SortableProps<T> &
  Omit<React.ComponentProps<"ul">, "children"> & {
    /** Columnas fijas. Sin `columns`, las pone `className` (`grid-cols-2`, `@2xl:grid-cols-3`…). */
    columns?: number
    /** Arrastrar solo desde la manija que `renderItem` recibe en `state.handle`. */
    handle?: boolean
    /** Clases del `<li>` de cada tarjeta: `col-span-2` para una más ancha. */
    itemClassName?: string | ((item: T, index: number) => string | undefined)
  }

function SortableGrid<T>({ columns, handle = false, style, ...props }: SortableGridProps<T>) {
  return (
    <SortableBase
      handle={handle}
      variant="grid"
      style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style } : style}
      {...props}
    />
  )
}

export { SortableGrid, sortableLabels, type SortableGridProps, type SortableItemState, type SortableLabels }
