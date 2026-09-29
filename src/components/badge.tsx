import type * as React from "react"

import { renderElement, type RenderElement } from "../lib/render.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { badgeVariants, type BadgeColor } from "../variants/badge.js"

type BadgeTone = {
  /**
   * Desde 2.0 hay un solo aspecto, el sólido: `solid` es el default y `subtle` se acepta por
   * compatibilidad, pero dibuja lo mismo. Hasta 1.x `solid` solo existía en `gray` y `brand`; ahora
   * los nueve colores tienen su relleno y su tinta con 4,5:1.
   */
  variant?: "solid" | /** @deprecated Desde 2.0 dibuja lo mismo que `solid`; se va en la próxima major. */ "subtle"
  color?: BadgeColor
}

// El `color` del `<span>` también se saca: acá `color` es la paleta del badge, no el
// atributo HTML heredado, y dejarlos conviviendo hace que TypeScript acepte `color="#333"`.
type BadgeProps = WithClassName<Omit<React.ComponentProps<"span">, "color">> &
  BadgeTone & {
    size?: "sm" | "md"
    dot?: boolean
    /** El elemento que se renderiza en lugar del `<span>`: `render={<a href="/planes" />}`. */
    render?: RenderElement
  }

/**
 * Etiqueta de estado.
 *
 * Usa `renderElement` de `lib/render.ts` y no el `useRender` de Base UI, que es lo que usaba
 * antes: `useRender` es un hook, así que obligaba a marcar `"use client"` un componente que no
 * tiene estado, ni efectos, ni handlers. Un `Badge` en un Server Component —una fila de tabla
 * renderizada en el server, un listado— se llevaba Base UI al bundle de cliente por nada.
 * El DOM que sale es el mismo: `<span>` con `data-slot`, `data-variant` y `data-color`.
 */
function Badge({ className, variant = "solid", color = "gray", size = "md", dot = false, render, children, ...props }: BadgeProps) {
  return renderElement(render, "span", {
    "data-slot": "badge",
    "data-variant": variant,
    "data-color": color,
    ...props,
    className: cn(badgeVariants({ variant, color, size }), className),
    children: (
      <>
        {/* El punto va en la tinta (2.0): del color del badge, sobre su propio relleno, no se veía. */}
        {dot && <span data-slot="badge-dot" aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
        {children}
      </>
    ),
  })
}

export { Badge, type BadgeProps }
