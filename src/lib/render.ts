import { cloneElement, createElement, isValidElement, type ElementType, type ReactElement } from "react"

import { cn } from "./utils.js"

/** El elemento que pasa el llamador en `render`: cualquier elemento que acepte `className`. */
export type RenderElement = ReactElement<{ className?: string }>

/**
 * El `render` de los componentes **sin estado** del paquete: renderiza el
 * elemento que pasó el llamador (`render={<Link href="/facturas" />}`) con las
 * props del componente adentro.
 *
 * Por qué no `useRender` de Base UI, que es lo que usan `SidebarItem` o `Badge`:
 * es un hook, y obligaría a marcar `"use client"` un componente que no tiene
 * estado. `Breadcrumb` y `Pagination` existen justamente para emitir `<a>`
 * reales en el HTML del server —que es lo que ve un crawler y lo que se abre en
 * una pestaña nueva—, así que se resuelve clonando el elemento.
 *
 * Precedencia: las props del elemento del llamador ganan (su `href`, su
 * `onClick`, sus `children` si los trae); el `className` se fusiona con `cn()`
 * y el del llamador queda último, así que también gana.
 */
export function renderElement(
  render: RenderElement | undefined,
  fallback: ElementType,
  props: Record<string, unknown> & { className?: string }
): ReactElement {
  if (!render || !isValidElement(render)) return createElement(fallback, props)
  const own = render.props as Record<string, unknown> & { className?: string }
  return cloneElement(render as ReactElement<Record<string, unknown>>, {
    ...props,
    ...own,
    className: cn(props.className, own.className),
  })
}
