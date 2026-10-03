"use client"

import * as React from "react"

import { WidgetEmpty, WidgetStaticGrid } from "../internal/widget-board-parts.js"
import type { WidgetLayout } from "../lib/widget-layout.js"
import { Button, type ButtonProps } from "./button.js"

// El arrastre (`@dnd-kit`), la barra de edición y el catálogo viven en otro módulo, que se pide recién
// al apretar «Editar»: la pantalla normal es una grilla estática y no paga su peso. `lazy` y no
// `next/dynamic`: el módulo no entra en el HTML del servidor (nunca se renderiza ahí) y sirve en
// cualquier bundler.
const WidgetBoardEditor = React.lazy(() => import("../internal/widget-board-editor.js"))

type WidgetBoardProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** El estado: lo que devuelve `useWidgetLayout`. */
  layout: WidgetLayout
  /** Clases de la grilla (por ejemplo, otro `gap`). */
  gridClassName?: string
}

/**
 * Un panel de widgets que el usuario edita, como la pantalla de inicio de iCloud. Normalmente es una
 * grilla estática de cards (`WidgetDef.render`), de 1, 2 o 4 columnas según el ancho de su
 * contenedor y el `size` de cada widget. Con `layout.setEditing(true)` (el botón `WidgetBoardEditButton`
 * en la cabecera) pasa a edición: los widgets tiemblan, se reordenan arrastrando o con el teclado
 * (Espacio toma, flechas mueven, Espacio suelta, Escape cancela), se sacan con su «−» y se agregan
 * desde un catálogo con vista previa; «Restablecer» vuelve al panel original. El orden y los widgets
 * visibles se guardan (`useStoredState`).
 *
 * **Carga diferida:** la edición (`SortableGrid`, `@dnd-kit/*` peers opcionales) se pide al editar
 * por primera vez; hasta que llega se ve la misma grilla, sin saltos. Sin widgets en pantalla muestra un
 * `EmptyState` con «Agregar widget» y «Restablecer». Un `role="status"` anuncia el estado de la edición.
 */
function WidgetBoard({ layout, gridClassName, className, ...props }: WidgetBoardProps) {
  const { visible, labels } = layout
  const empty = <WidgetEmpty labels={labels} onAdd={layout.openCatalog} onReset={layout.reset} />
  const fallback = (
    <>
      {layout.editing && <div aria-hidden="true" className="h-8" />}
      {visible.length === 0 ? empty : <WidgetStaticGrid className={gridClassName} label={labels.region} widgets={visible} />}
    </>
  )
  return (
    <div className={className} data-editing={layout.editing ? "" : undefined} data-slot="widget-board" {...props}>
      {layout.armed ? (
        <React.Suspense fallback={fallback}>
          <WidgetBoardEditor gridClassName={gridClassName} layout={layout} />
        </React.Suspense>
      ) : (
        fallback
      )}
      <span className="sr-only" data-slot="widget-board-status" role="status">
        {layout.message}
      </span>
    </div>
  )
}

/**
 * «Editar» / «Listo»: el botón de la cabecera que entra y sale de la edición. Es secundario: la
 * acción primaria de la pantalla sigue siendo la suya (un solo acento).
 */
function WidgetBoardEditButton({ layout, children, ...props }: Omit<ButtonProps, "onClick" | "variant"> & { layout: WidgetLayout }) {
  return (
    <Button data-slot="widget-board-edit" onClick={() => layout.setEditing(!layout.editing)} variant="secondary" {...props}>
      {children ?? (layout.editing ? layout.labels.done : layout.labels.edit)}
    </Button>
  )
}

export { WidgetBoard, WidgetBoardEditButton, type WidgetBoardProps }
