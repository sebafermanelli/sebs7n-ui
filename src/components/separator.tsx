import { cn, type WithClassName } from "../lib/utils.js"

type SeparatorProps = WithClassName<React.ComponentProps<"div">> & {
  /** `horizontal` ocupa el ancho; `vertical` se estira al alto del flex y necesita uno. */
  orientation?: "horizontal" | "vertical"
}

/**
 * Una línea de 1px que agrupa sin decir nada.
 *
 * Es un `<div>` a mano y no `Separator` de Base UI porque ese módulo trae `'use client'`: un
 * separador entre dos bloques de una página renderizada en el server no tiene estado ni
 * interacción, y arrastraba Base UI al bundle de cliente de cualquier RSC que lo usara. El
 * primitivo hace exactamente esto —`role="separator"` más la orientación en `aria-orientation`
 * y en `data-orientation`—, así que el DOM es idéntico al que salía antes.
 */
function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <div
      data-orientation={orientation}
      role="separator"
      aria-orientation={orientation}
      data-slot="separator"
      className={cn(
        "shrink-0 bg-gray-400 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator, type SeparatorProps }
