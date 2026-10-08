import type * as React from "react"

import { cn } from "../lib/utils.js"

/**
 * Una sección de landing a todo el ancho: la banda y, adentro, una columna centrada.
 *
 * ```tsx
 * <Section variant="grouped" maxWidth="1080px" aria-labelledby="seguridad">
 *   <SectionHeader id="seguridad" title="Seguridad" />
 *   …
 * </Section>
 * ```
 *
 * - `default`: sin fondo (la página). `grouped`: una franja a todo el ancho en `bg-grouped`, con filetes
 *   arriba y abajo, para separar una sección sin cards.
 * - `maxWidth` es el de la columna de adentro (default `1080px`, el de la receta de landing); la franja
 *   siempre ocupa todo el ancho de su contenedor.
 * - Sin estado: sirve en un Server Component.
 */
type SectionProps = React.ComponentProps<"section"> & {
  /** `default` (sin fondo) · `grouped` (franja `bg-grouped` con filetes). */
  variant?: "default" | "grouped"
  /** El ancho máximo de la columna de adentro (cualquier largo CSS). Default `1080px`. */
  maxWidth?: string
  /** Clases de la columna de adentro. */
  innerClassName?: string
}

function Section({ variant = "default", maxWidth = "1080px", innerClassName, className, children, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      data-variant={variant}
      className={cn("w-full scroll-mt-20", variant === "grouped" && "border-y border-separator bg-grouped", className)}
      {...props}
    >
      <div className={cn("mx-auto flex w-full flex-col gap-10 px-4", variant === "grouped" ? "py-16" : "py-4", innerClassName)} style={{ maxWidth }}>
        {children}
      </div>
    </section>
  )
}

export { Section, type SectionProps }
