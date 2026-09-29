import type * as React from "react"

import { cn } from "../lib/utils.js"

type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> & {
  icon?: React.ReactNode
  title: React.ReactNode
  /** Nivel del título. h2 por defecto (debajo del h1 del PageHeader). */
  titleAs?: "h2" | "h3" | "h4" | "h5" | "h6"
  description?: React.ReactNode
  /** Botón o link para salir del vacío. Uno solo. */
  action?: React.ReactNode
  /**
   * `default`: un grupo plano para el vacío suelto en la página. `subtle`: la zona
   * hundida de `Card variant="subtle"`. `plain`: sin superficie, para adentro de una Card o de
   * una Table, que ya son el grupo. `placeholder`: el panel vacío de iCloud («No Message Selected»),
   * solo el título grande y tenue, centrado en todo el alto, sin caja ni ícono.
   */
  variant?: "default" | "subtle" | "plain" | "placeholder"
}

// Un grupo plano (2.0): fondo opaco `bg-grouped`, sin la sombra de widget de la Card. Antes era la zona
// hundida de `subtle`, que en oscuro sobre la página negra casi no se veía. Adentro de una Card o
// de una Table el grupo ya está, y un segundo borde con sombra es una caja adentro de otra: para
// eso `subtle` (la de `cardVariants`) y `plain`, que no dibuja superficie.
function EmptyState({ className, icon, title, titleAs: Title = "h2", description, action, variant = "default", children, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      data-variant={variant}
      className={cn(
        "flex flex-col text-callout text-label",
        // Desde R5a la Card es un widget con sombra; el vacío sigue siendo un grupo plano.
        variant === "default" && "rounded-surface bg-grouped",
        variant === "subtle" && "rounded-surface bg-fill-1",
        variant === "placeholder" && "h-full",
        "items-center justify-center gap-4 px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div
          data-slot="empty-state-icon"
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-control bg-fill-1 text-label-secondary [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5"
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1">
        {/* El tenue de iCloud es el cuaternario; va el terciario, que en 28/600 (texto grande) llega a 3:1. */}
        <Title
          data-slot="empty-state-title"
          className={cn("text-title-3 text-balance text-label", variant === "placeholder" && "text-title-1 text-label-tertiary")}
        >
          {title}
        </Title>
        {description && (
          <p data-slot="empty-state-description" className="text-callout text-pretty text-label-secondary">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div data-slot="empty-state-action" className="flex flex-wrap items-center justify-center gap-2">
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export { EmptyState, type EmptyStateProps }
