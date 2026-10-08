import type * as React from "react"

import { cn } from "../lib/utils.js"

type SectionHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** El título de la sección: un `<h2>` (o el nivel de `level`) en `text-title-1` con la fuente de titulares (`font-display`). */
  title: React.ReactNode
  /** La bajada, una o dos líneas en `text-body text-label-secondary`. */
  description?: React.ReactNode
  /** `center` (el default de una landing) o `start`, alineado a la izquierda. */
  align?: "center" | "start"
  /** El nivel del encabezado: cambia la semántica, no el tamaño. `2` por defecto. */
  level?: 2 | 3 | 4
  /** Va al encabezado, no a la caja: es lo que nombra la sección (`aria-labelledby`). */
  id?: string
}

/**
 * El encabezado de una sección de landing: título y bajada, con el mismo tamaño y la misma
 * separación en todas. Server Component: no tiene estado.
 */
function SectionHeader({ title, description, align = "center", level = 2, id, className, ...props }: SectionHeaderProps) {
  const Heading = `h${level}` as const
  return (
    <div
      data-slot="section-header"
      data-align={align}
      className={cn("flex flex-col gap-2", align === "center" ? "items-center text-center" : "items-start", className)}
      {...props}
    >
      <Heading className="font-display text-title-1 text-balance text-label" id={id}>
        {title}
      </Heading>
      {description != null && <p className="max-w-2xl text-body text-pretty text-label-secondary">{description}</p>}
    </div>
  )
}

export { SectionHeader, type SectionHeaderProps }
