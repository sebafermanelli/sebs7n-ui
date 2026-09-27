import type * as React from "react"

import { cn } from "../lib/utils.js"
import { cardVariants } from "../variants/card.js"

type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> & {
  icon?: React.ReactNode
  title: React.ReactNode
  /** Nivel del título. h2 por defecto (debajo del h1 del PageHeader). */
  titleAs?: "h2" | "h3" | "h4" | "h5" | "h6"
  description?: React.ReactNode
  /** Botón o link para salir del vacío. Uno solo. */
  action?: React.ReactNode
}

// Zona hundida (Card variant="subtle"): fondo gray-alpha-100, sin borde ni blur.
function EmptyState({ className, icon, title, titleAs: Title = "h2", description, action, children, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(cardVariants({ variant: "subtle" }), "items-center justify-center gap-4 px-6 py-12 text-center", className)}
      {...props}
    >
      {icon && (
        <div
          data-slot="empty-state-icon"
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-control border border-gray-alpha-400 glass-control text-gray-900 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5"
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1">
        <Title data-slot="empty-state-title" className="text-heading-16 text-balance text-gray-1000">
          {title}
        </Title>
        {description && (
          <p data-slot="empty-state-description" className="text-copy-14 text-pretty text-gray-900">
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
