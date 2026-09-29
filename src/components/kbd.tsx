import type * as React from "react"

import { cn } from "../lib/utils.js"

type KbdProps = React.ComponentProps<"kbd"> & {
  /**
   * `md` (20 px) suelto en un texto. `sm` (18 px) adentro de un control de 32, como el ⌘K del
   * buscador del Sidebar: a 20 casi tocaba los bordes y el campo se veía apretado.
   */
  size?: "sm" | "md"
}

// Atajo de teclado en línea (⌘K, Esc). Mono, como todo lo que es código. El `sm` va en la fuente
// del sistema, como los atajos de los menús de macOS: a 10 px la mono pierde el dibujo del ⌘.
function Kbd({ className, size = "md", ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      data-size={size}
      className={cn(
        // R4: con los tokens de iCloud, el gris de un relleno sin borde y el radio de etiqueta (4).
        "inline-flex shrink-0 items-center justify-center gap-0.5 rounded-tag bg-fill-2 px-1 text-label-secondary select-none",
        size === "sm" ? "h-[18px] min-w-[18px] text-caption" : "h-5 min-w-5 text-mono-callout",
        className
      )}
      {...props}
    />
  )
}

export { Kbd, type KbdProps }
