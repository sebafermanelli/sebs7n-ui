import type * as React from "react"

import { cn } from "../lib/utils.js"

type SparklineProps = Omit<React.ComponentProps<"svg">, "children" | "viewBox" | "points" | "values"> & {
  /** La serie, de izquierda a derecha. Con menos de dos valores no hay curva y no se dibuja nada. */
  values: readonly number[]
  /** Pinta el área bajo la curva, a baja opacidad. Por defecto, `true`. */
  area?: boolean
}

/**
 * Una curva de un vistazo, en SVG a mano: sin librería de gráficos, así una lista de cien filas no
 * paga el peso de Recharts. Es **decorativa** (`aria-hidden`): da la forma, no el dato. El valor
 * actual va escrito al lado, y para ejes, tooltip o lectura por lector de pantalla, `chart`.
 *
 * Toma el color de `currentColor` (`text-brand-900` por defecto) y se estira al ancho de su caja
 * (`preserveAspectRatio="none"`, con el trazo siempre de 1,5 px). Sin estado: va en un Server Component.
 */
function Sparkline({ values, area = true, className, ...props }: SparklineProps) {
  const finite = values.filter(Number.isFinite)
  if (finite.length < 2) return null
  const max = Math.max(...finite, 1)
  const min = Math.min(...finite, 0)
  const span = max - min || 1
  const points = finite.map((value, index) => `${((index / (finite.length - 1)) * 100).toFixed(1)},${(28 - ((value - min) / span) * 26).toFixed(1)}`).join(" ")
  return (
    <svg
      aria-hidden="true"
      className={cn("h-8 w-full text-brand-900", className)}
      data-slot="sparkline"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 100 30"
      {...props}
    >
      {area && <polyline fill="currentColor" opacity="0.12" points={`0,30 ${points} 100,30`} stroke="none" />}
      <polyline points={points} stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export { Sparkline, type SparklineProps }
