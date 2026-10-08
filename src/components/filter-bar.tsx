import type * as React from "react"

import { ControlSizeProvider, type ControlSize } from "../lib/control-size.js"
import { cn } from "../lib/utils.js"

type FilterBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** El buscador (`SearchField`). Desde 36 rem de ancho de la barra ocupa 18 rem; por debajo, todo el ancho. */
  search?: React.ReactNode
  /** Los filtros (`Select`, `ToggleGroup`): se acomodan en fila desde 36 rem de ancho de la barra y en columna por debajo. */
  filters?: React.ReactNode
  /** Lo que actúa sobre la lista (vista, exportar, `BulkActionsBar`): queda al final, a la derecha. */
  actions?: React.ReactNode
  /**
   * El tamaño de todos los controles de la barra (búsqueda, selectores, `ToggleGroup`, botones, fechas):
   * `sm` por defecto, que es el de una barra sobre una lista. Un control que declara su propio `size` gana.
   * Los popups, diálogos y hojas que abre lo reinician: lo de adentro no es de la barra.
   */
  size?: ControlSize
}

/**
 * La barra que va sobre una lista o una tabla: búsqueda, filtros y acciones al final. Es solo
 * disposición: los controles son los de siempre (`SearchField`, `Select`, `ToggleGroup`, `Button`) y
 * cada uno trae su estado.
 *
 * En escritorio es **una fila**: búsqueda, filtros y acciones a la derecha. En el teléfono (390 px)
 * pasa a una **columna** donde la búsqueda y los selectores ocupan el ancho entero (un `ToggleGroup` o un grupo de botones mantiene su tamaño natural), y las acciones se reparten la
 * última fila: nada queda huérfano a medias. Los tamaños los elige quien la usa (`sm` en barras de
 * una tabla; `md`, el default, sobre una lista suelta); todos los controles de una barra van del
 * mismo tamaño: la barra lo pone sola (`size`, `sm` por defecto) y no hace falta repetirlo en cada control.
 *
 * «Desktop» y «teléfono» son anchos de la **barra**, no de la ventana (container queries): va dentro
 * de una caja `@container`, así que con un panel lateral abierto pasa a columna igual que en un teléfono, y
 * funciona igual fuera de un `AppShell`. El umbral es 36 rem (`@xl`).
 *
 * Para nombrarla como búsqueda de la página, `role="search"` y `aria-label`. Sin estado: va en un
 * Server Component.
 */
function FilterBar({ search, filters, actions, size = "sm", className, ...props }: FilterBarProps) {
  return (
    <ControlSizeProvider size={size}>
    <div data-slot="filter-bar-container" className="@container w-full">
    <div data-slot="filter-bar" className={cn("flex flex-col gap-2 @xl:flex-row @xl:flex-wrap @xl:items-center", className)} {...props}>
      {search != null && (
        <div data-slot="filter-bar-search" className="w-full @xl:w-72 @xl:shrink-0">
          {search}
        </div>
      )}
      {filters != null && (
        <div
          data-slot="filter-bar-filters"
          className="flex min-w-0 flex-col gap-2 @xl:flex-row @xl:flex-wrap @xl:items-center @max-xl:[&>:not(.sr-only,[role=group])]:w-full"
        >
          {filters}
        </div>
      )}
      {actions != null && (
        <div data-slot="filter-bar-actions" className="flex flex-wrap items-center gap-2 @max-xl:[&>*]:flex-1 @xl:ms-auto">
          {actions}
        </div>
      )}
    </div>
    </div>
    </ControlSizeProvider>
  )
}

export { FilterBar, type FilterBarProps }
