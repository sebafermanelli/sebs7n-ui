import type * as React from "react"

import { Button } from "../components/button.js"
import { EmptyState } from "../components/empty-state.js"
import { cn } from "../lib/utils.js"
import type { WidgetBoardLabels, WidgetDef, WidgetSize } from "../lib/widget-layout.js"

/**
 * Lo que comparten el tablero estático y el módulo de edición, que se pide aparte: la grilla (la
 * misma clase en los dos, así nada se corre al entrar en edición) y el estado vacío. No importa
 * `@dnd-kit`: es lo que `WidgetBoard` trae al abrir. No es API.
 */

/**
 * La grilla de 4 por container query: 1 columna, 2 desde 36 rem de ancho del contenedor y 4 desde
 * 56 rem. Con un panel lateral abierto el contenedor se angosta y la grilla pasa sola a 2 o a 1.
 */
const widgetGridClassName = "grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-4"

/** Cuántas columnas ocupa cada tamaño. Estático para que Tailwind vea las clases. */
const widgetSpanClassName: Record<WidgetSize, string> = {
  sm: "",
  md: "@xl:col-span-2",
  lg: "@xl:col-span-2 @4xl:col-span-4"
}

/**
 * Las clases de cada `<li>`: su ancho, y que la card del adentro llene el alto de la fila (las de una fila quedan
 * parejas). Un `StatGrid` de un solo indicador envuelve su grilla en una caja `@container`: el alto baja hasta ella.
 */
const widgetItemClassName = (widget: Pick<WidgetDef, "size">) =>
  cn("min-w-0 [&>:first-child]:h-full [&>[data-slot=stat-grid-container]>[data-slot=stat-grid]]:h-full", widgetSpanClassName[widget.size ?? "sm"])

function WidgetStaticGrid({ widgets, className, label }: { widgets: readonly WidgetDef[]; className?: string; label: string }) {
  return (
    <ul aria-label={label} className={cn(widgetGridClassName, className)} data-slot="widget-board-grid" role="list">
      {widgets.map((widget) => (
        <li className={cn("relative", widgetItemClassName(widget))} data-widget={widget.id} key={widget.id}>
          {widget.render()}
        </li>
      ))}
    </ul>
  )
}

/** Sin widgets en pantalla: se puede volver a elegir o al panel original. */
function WidgetEmpty({ labels, onAdd, onReset, icon }: { labels: WidgetBoardLabels; onAdd: () => void; onReset: () => void; icon?: React.ReactNode }) {
  return (
    <EmptyState
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={onAdd} size="sm" variant="secondary">
            {labels.add}
          </Button>
          <Button onClick={onReset} size="sm" variant="plain">
            {labels.reset}
          </Button>
        </div>
      }
      description={labels.emptyDescription}
      icon={icon}
      title={labels.emptyTitle}
    />
  )
}

export { WidgetEmpty, WidgetStaticGrid, widgetGridClassName, widgetItemClassName, widgetSpanClassName }
