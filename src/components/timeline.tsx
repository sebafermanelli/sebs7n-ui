import * as React from "react"

import { categoryFill } from "../internal/category-color.js"
import type { AccessibleName } from "../internal/accessible-name.js"
import { cn } from "../lib/utils.js"
import type { BadgeColor } from "../variants/badge.js"

/**
 * Una lista de eventos en el tiempo: la actividad de una factura, el historial de un cliente. iCloud
 * web no tiene una; se arma con su fila de lista (§2.4): título 17, detalle 14 gris, la hora 14 gris a
 * la derecha y el punto de 8 del color de la categoría (§2.18), unidos por una línea de 1 px. Los días
 * van con la cabecera de grupo de Drive (19/600).
 *
 * `Timeline` es la lista (`<ol>`), `TimelineGroup` un día con su propia lista nombrada por la
 * cabecera y `TimelineItem` cada evento. Sin estado: va en un Server Component.
 */
type TimelinePropsBase = React.ComponentProps<"ol">

function Timeline({ className, ...props }: TimelineProps) {
  return <ol data-slot="timeline" role="list" className={cn("flex flex-col", className)} {...props} />
}

type TimelineGroupProps = Omit<React.ComponentProps<"li">, "title"> & {
  /** El día («Hoy», «Lunes 28 de septiembre»), en 19/600. Nombra la lista de adentro. */
  title: React.ReactNode
}

function TimelineGroup({ className, title, children, ...props }: TimelineGroupProps) {
  const id = React.useId()
  return (
    <li data-slot="timeline-group" className={cn("flex flex-col not-first:mt-4", className)} {...props}>
      <span id={id} className="flex min-h-12 items-end pb-2 text-title-3 text-label">
        {title}
      </span>
      <ol role="list" aria-labelledby={id} className="flex flex-col">
        {children}
      </ol>
    </li>
  )
}

type TimelineItemProps = Omit<React.ComponentProps<"li">, "title"> & {
  /** Qué pasó («Factura enviada»), en 17. */
  title: React.ReactNode
  /** El detalle (14 gris): a quién, por qué medio. */
  description?: React.ReactNode
  /** La hora o la fecha que se ve («10:12»), a la derecha. */
  time?: React.ReactNode
  /** La fecha en formato de máquina para el `<time>` («2026-09-29T10:12»). */
  dateTime?: string
  /** El color del punto (la paleta de `Badge`). Por defecto, gris. */
  dot?: BadgeColor
  /** Un ícono en lugar del punto (en una caja de 24). */
  icon?: React.ReactNode
  /** Botones o links debajo del detalle («Reenviar»). */
  actions?: React.ReactNode
}

function TimelineItem({ className, title, description, time, dateTime, dot = "gray", icon, actions, children, ...props }: TimelineItemProps) {
  return (
    <li data-slot="timeline-item" className={cn("group/timeline-item flex gap-3", className)} {...props}>
      {/* La columna del punto: el punto a la altura del centro del título (22 de alto) y la línea
          hasta el próximo, que no sigue después del último. Decorativa: el orden lo dice la lista. */}
      <div data-slot="timeline-marker" aria-hidden="true" className="flex w-6 shrink-0 flex-col items-center">
        <span className="flex h-5.5 shrink-0 items-center justify-center">
          {icon ? (
            <span className="flex size-6 items-center justify-center rounded-full bg-fill-2 text-label-secondary [&_svg]:size-3.5">{icon}</span>
          ) : (
            <span data-slot="timeline-dot" className={cn("size-2 rounded-full", categoryFill[dot])} />
          )}
        </span>
        <span data-slot="timeline-connector" className="my-1 w-px flex-1 bg-separator group-last/timeline-item:hidden" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col pb-5 group-last/timeline-item:pb-0">
        <div className="flex items-baseline gap-3">
          <span className="min-w-0 flex-1 text-body text-label">{title}</span>
          {time != null && (
            <time dateTime={dateTime} className="shrink-0 text-callout text-label-secondary tabular-nums">
              {time}
            </time>
          )}
        </div>
        {description != null && <span className="text-callout text-label-secondary">{description}</span>}
        {children}
        {actions != null && (
          <div data-slot="timeline-actions" className="mt-1.5 flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </li>
  )
}


type TimelineProps = TimelinePropsBase & AccessibleName

export { Timeline, TimelineGroup, TimelineItem, type TimelineGroupProps, type TimelineItemProps, type TimelineProps }
