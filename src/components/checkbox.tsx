"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

import { useControlSize } from "../internal/control-size.js"
import { cn, type WithClassName } from "../lib/utils.js"

type CheckboxProps = WithClassName<CheckboxPrimitive.Root.Props> & {
  /**
   * `square` (el default) es la casilla de iCloud (Calendar): 16 px con esquinas de 4. `circle` es
   * el check de Reminders: un círculo de 22 con borde fino que se llena al completar la tarea. Es la
   * misma casilla —mismo rol, mismo teclado—; cambia el dibujo.
   */
  shape?: "square" | "circle"
  /** `sm` 14, `md` 16 (el default) o `lg` 20 px; sin `size`, el de un `Form` o `FilterBar` que la contenga. Solo la casilla `square`. */
  size?: "sm" | "md" | "lg"
}

// La caja y el tilde por tamaño; el área táctil (`::after`) no cambia, así que `sm` no baja de 24×24.
const squareSize = { sm: ["size-3.5", "size-2.5"], md: ["size-4", "size-3"], lg: ["size-5", "size-3.5"] } as const

function Checkbox({ className, shape = "square", size: sizeProp, ...props }: CheckboxProps) {
  const circle = shape === "circle"
  const size = useControlSize(sizeProp, "md")
  const [box, glyph] = circle ? ["size-5.5", "size-3.5"] : squareSize[size]
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-shape={shape}
      data-size={size}
      className={cn(
        // El borde es lo ÚNICO que dibuja una casilla vacía: sin él no hay control, hay un hueco.
        // Por eso cae bajo WCAG 1.4.11 (3:1 contra el fondo) y no bajo la licencia de "decoración":
        // `label-tertiary` llega (test/surfaces.test.ts).
        "group/checkbox peer relative inline-flex shrink-0 cursor-pointer items-center justify-center border bg-surface text-brand-contrast outline-none transition-control after:absolute after:-inset-2 pointer-coarse:after:-inset-3.5",
        box, circle ? "rounded-full border-[1.5px] after:-inset-1" : "rounded-sm",
        "border-label-tertiary hover:border-label-secondary focus-visible:focus-ring",
        // Marcada lleva el acento con el tilde blanco, como la de Calendar; el relleno ya es el
        // contorno, así que el borde se va. El tilde va en `brand-contrast`, el par que
        // `brand-contrast.test.ts` verifica a 4,5:1.
        "data-checked:border-transparent data-checked:bg-brand-700 data-checked:hover:bg-brand-800 data-checked:focus-visible:focus-ring-inverse",
        "data-indeterminate:border-transparent data-indeterminate:bg-brand-700 data-indeterminate:focus-visible:focus-ring-inverse",
        "aria-invalid:border-red-800 data-invalid:border-red-800",
        // Marcada y apagada, a .4, como todo control de iCloud: se sigue viendo que estaba marcada.
        // Vacía no se apaga (a .4 el contorno quedaba en ~1,4:1 y la casilla no se encontraba):
        // conserva el contorno y el interior pasa al gris de `fill-2`, que dice «apagada».
        "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        "data-disabled:not-data-checked:not-data-indeterminate:opacity-100 data-disabled:not-data-checked:not-data-indeterminate:bg-fill-2 data-disabled:not-data-checked:not-data-indeterminate:hover:border-label-tertiary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center">
        <CheckIcon className={cn("stroke-3 group-data-indeterminate/checkbox:hidden", glyph)} />
        <MinusIcon className={cn("hidden stroke-3 group-data-indeterminate/checkbox:block", glyph)} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, type CheckboxProps }
