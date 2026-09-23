import { cn } from "../lib/utils.js"
import { renderElement, type RenderElement } from "../lib/render.js"
import { badgeDotColor, badgeVariants, type BadgeColor } from "../variants/badge.js"

// solid solo existe en gray y brand: los 700 de Geist con texto blanco no llegan a 4.5:1.
type BadgeTone =
  | { variant?: "subtle"; color?: BadgeColor }
  | { variant: "solid"; color?: "gray" | "brand" }

type BadgeProps = Omit<React.ComponentProps<"span">, "color" | "className"> &
  BadgeTone & {
    className?: string
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
function Badge({ className, variant = "subtle", color = "gray", size = "md", dot = false, render, children, ...props }: BadgeProps) {
  return renderElement(render, "span", {
    "data-slot": "badge",
    "data-variant": variant,
    "data-color": color,
    ...props,
    className: cn(badgeVariants({ variant, color, size }), className),
    children: (
      <>
        {dot && <span data-slot="badge-dot" aria-hidden="true" className={cn("size-1.5 rounded-full", badgeDotColor[color])} />}
        {children}
      </>
    ),
  })
}

export { Badge, type BadgeProps }
