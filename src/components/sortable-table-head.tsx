import type * as React from "react"

import { ariaSort, nextSortDirection, SortIndicator, sortHeadClassName, type SortDirection } from "../internal/sort-head.js"
import { TableHead, type TableHeadProps } from "./table.js"

type SortableTableHeadProps = Omit<TableHeadProps, "children" | "onClick"> & {
  /** La dirección de ESTA columna ahora (`null` si la tabla no está ordenada por ella). Sale de la URL o del estado. */
  direction?: SortDirection | null
  /**
   * Orden **por link**: devuelve la URL del siguiente estado (`"asc"`, `"desc"` o `null` para quitar el orden). Es un
   * `<a>` real: sirve en un Server Component, se abre en otra pestaña y la tabla se ordena en el servidor.
   */
  href?: (next: SortDirection | null) => string
  /** Orden **por callback** (estado local): se llama con el siguiente estado. Con `href`, no hace falta. */
  onSort?: (next: SortDirection | null) => void
  /** Un link propio (`next/link`): `renderLink={(props) => <Link {...props} />}` recibe `href`, `className` y `children`. */
  renderLink?: (props: { href: string; className: string; children: React.ReactNode }) => React.ReactElement
  children: React.ReactNode
}

/**
 * El encabezado ordenable para una `Table` del servidor (la que se ordena con `?sort=<col>&dir=asc|desc`): un `<th>` con
 * `aria-sort` y, adentro, un link (`href`) o un botón (`onSort`) con el nombre de la columna y la flecha ↑↓. Es el mismo
 * dibujo y el mismo ciclo que los encabezados `sortable` de `DataTable`: primer click ascendente, segundo descendente,
 * tercero quita el orden. Sin `"use client"`: con `href` va en un Server Component.
 */
function SortableTableHead({ direction = null, href, onSort, renderLink, numeric, children, ...props }: SortableTableHeadProps) {
  const next = nextSortDirection(direction)
  const className = sortHeadClassName(direction, numeric)
  const content = (
    <>
      {children}
      <SortIndicator direction={direction} />
    </>
  )
  return (
    <TableHead aria-sort={ariaSort(direction)} data-sortable="" numeric={numeric} {...props}>
      {href ? (
        renderLink ? (
          renderLink({ href: href(next), className, children: content })
        ) : (
          <a className={className} data-slot="sortable-table-head-link" href={href(next)}>
            {content}
          </a>
        )
      ) : (
        <button className={className} data-slot="sortable-table-head-button" onClick={() => onSort?.(next)} type="button">
          {content}
        </button>
      )}
    </TableHead>
  )
}

export { nextSortDirection, SortableTableHead, type SortableTableHeadProps, type SortDirection }
