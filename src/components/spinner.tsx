import { Loader2Icon } from "lucide-react"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/** 16 / 20 / 24px. El del `Button` es el `sm`; el `md` es el de una fila o una card. */
const spinnerSizes = { sm: "size-4", md: "size-5", lg: "size-6" } as const

type SpinnerProps = Omit<React.ComponentProps<"svg">, "className"> & {
  className?: string
  size?: keyof typeof spinnerSizes
  /**
   * Nombre accesible. Con `label` el spinner es una región `role="status"` y el
   * lector anuncia el texto al aparecer; sin `label` es decoración
   * (`aria-hidden`), que es lo que corresponde cuando quien anuncia la espera es
   * otro elemento —el `Button` con `aria-busy`, una lista con `aria-busy`—.
   */
  label?: string
}

/**
 * El indicador de carga del sistema. Hereda el color del texto (`currentColor`),
 * así que sirve sobre cualquier fondo sin una prop de color.
 *
 * Con `prefers-reduced-motion` no desaparece: deja de girar y queda quieto. Un
 * spinner que se esconde borra la única señal de que algo está pasando.
 */
function Spinner({ className, size = "md", label, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      className={cn("shrink-0 animate-spin motion-reduce:animate-none", spinnerSizes[size], className)}
      {...props}
    />
  )
}

export { Spinner, type SpinnerProps }
