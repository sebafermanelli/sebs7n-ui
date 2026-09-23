"use client"

import type * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "../lib/utils.js"

/**
 * Barra de progreso de una tarea que la app puede medir (una subida, una
 * importación, un paso de un wizard).
 *
 * Con `value={null}` es **indeterminada**: no hay porcentaje, así que Base UI
 * saca `aria-valuenow` y la barra pasa a ser una franja que recorre la pista.
 * Es para cuando no se sabe cuánto falta; si se sabe, se pasa el número.
 *
 * No es un `Skeleton` (eso es la forma de algo que todavía no llegó) ni un
 * spinner de botón (eso es `Button loading`).
 */
type ProgressProps = Omit<ProgressPrimitive.Root.Props, "className"> & {
  className?: string
  /**
   * Alto de la pista: `sm` 4px, `md` 6px. No sigue la escala de 32/40px de los
   * controles a propósito: una barra no se toca ni recibe foco, así que no
   * tiene por qué reservar un área táctil.
   */
  size?: "sm" | "md"
  /** Etiqueta visible. Es lo que nombra la barra: sin ella hace falta `aria-label`. */
  label?: React.ReactNode
  /** Muestra el porcentaje a la derecha. Indeterminada no muestra número, porque no hay. */
  showValue?: boolean
  /** Clases de la pista (el riel gris), por si hay que cambiarle el ancho o el radio. */
  trackClassName?: string
}

function Progress({ className, size = "md", label, showValue = false, trackClassName, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-size={size}
      className={cn("group/progress flex w-full flex-col gap-2", className)}
      {...props}
    >
      {(label != null || showValue) && (
        <div className={cn("flex items-baseline gap-3", label != null ? "justify-between" : "justify-end")}>
          {label != null && (
            <ProgressPrimitive.Label data-slot="progress-label" className="text-label-14 text-gray-1000">
              {label}
            </ProgressPrimitive.Label>
          )}
          {showValue && (
            <ProgressPrimitive.Value data-slot="progress-value" className="text-copy-13-mono tabular-nums text-gray-900" />
          )}
        </div>
      )}
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className={cn(
          "w-full overflow-hidden rounded-full bg-gray-300",
          "group-data-[size=sm]/progress:h-1 group-data-[size=md]/progress:h-1.5",
          trackClassName
        )}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            // Determinada: Base UI pone el ancho en un estilo inline, así que lo único
            // que hace falta acá es animarlo.
            "h-full rounded-full bg-gray-1000 transition-[width] duration-300 ease-out motion-reduce:transition-none",
            // Indeterminada: sin ancho inline, la pinta una franja corta que recorre la pista.
            "data-indeterminate:w-2/5 data-indeterminate:animate-progress-indeterminate",
            // Con movimiento reducido no queda una franja congelada a mitad de camino:
            // la pista se llena de un gris más apagado que el de una barra terminada.
            "motion-reduce:data-indeterminate:w-full motion-reduce:data-indeterminate:animate-none motion-reduce:data-indeterminate:bg-gray-600"
          )}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress, type ProgressProps }
