import type * as React from "react"

import { renderElement, type RenderElement } from "../lib/render.js"
import { type ButtonVariantProps, buttonVariants } from "../variants/button.js"
import { Button } from "./button.js"

type EmptyFiltersActionProps = {
  /**
   * Hay filtros puestos. Sin filtros la lista está vacía de verdad y no hay nada que sacar: no dibuja nada.
   * Default `true`.
   */
  active?: boolean
  /** Con filtros en estado: un botón que los saca. */
  onClear?: () => void
  /** Con filtros en la URL: un link a la misma ruta sin ellos (`href` o, con `next/link`, `render`). */
  href?: string
  render?: RenderElement
  /** El texto. Default «Limpiar filtros». */
  children?: React.ReactNode
  /** El estilo del botón. Default `secondary`. */
  variant?: ButtonVariantProps["variant"]
  /** El tamaño: `sm`, `md` (default) o `lg`. */
  size?: "sm" | "md" | "lg"
  className?: string
}

/**
 * La salida de una lista vacía por sus filtros: «Limpiar filtros». Va como acción de un `EmptyState`.
 * Con filtros en la URL es un `<a>` real (`href` o `render={<Link href={pathname} />}`); con filtros en estado,
 * un botón con `onClear`. Sin filtros puestos (`active={false}`) no dibuja nada.
 */
function EmptyFiltersAction({ active = true, onClear, href, render, children = "Limpiar filtros", variant = "secondary", size, className }: EmptyFiltersActionProps) {
  if (!active) return null
  if (href != null || render) {
    return renderElement(render, "a", { "data-slot": "empty-filters-action", href, className: buttonVariants({ variant, size, className }), children })
  }
  return (
    <Button className={className} data-slot="empty-filters-action" onClick={onClear} size={size} type="button" variant={variant}>
      {children}
    </Button>
  )
}

export { EmptyFiltersAction, type EmptyFiltersActionProps }
