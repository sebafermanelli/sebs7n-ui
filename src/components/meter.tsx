"use client"

import type * as React from "react"
import { Meter as MeterPrimitive } from "@base-ui/react/meter"

import { cn } from "../lib/utils.js"

/**
 * Una **medida** dentro de un rango conocido: cuánto disco se usó, cuánto del
 * cupo mensual se consumió, qué puntaje sacó un formulario.
 *
 * **No es `Progress`.** La diferencia no es de estilo, es de significado y el
 * lector de pantalla la anuncia distinto: `Progress` es `role="progressbar"`
 * —una tarea que arrancó y va a terminar, "subiendo el archivo"— y `Meter` es
 * `role="meter"`, un valor que ya es lo que es y que puede subir o bajar. Si el
 * número puede bajar solo, es un `Meter`. Si al llegar a 100 la pantalla cambia
 * de estado, es un `Progress`.
 *
 * Comparte la forma, los altos y los tokens de `Progress` a propósito: el
 * sistema tiene una sola barra, no dos que se parecen.
 */
type MeterBaseProps = Omit<MeterPrimitive.Root.Props, "className" | "aria-label"> & {
  className?: string
  /**
   * Alto de la pista: `sm` 4px, `md` 6px. Los mismos que `Progress`, y por el
   * mismo motivo: una barra no se toca ni recibe foco, así que no reserva área
   * táctil.
   */
  size?: "sm" | "md"
  /** Muestra el valor formateado a la derecha, el mismo texto que lee el lector. */
  showValue?: boolean
  /** Clases de la pista (el riel gris), por si hay que cambiarle el ancho o el radio. */
  trackClassName?: string
}

/**
 * Mismo contrato de nombre que `Progress`, y por el mismo motivo: un
 * `role="meter"` sin nombre se anuncia «73 %» y el 73 % de qué es lo que hace
 * falta saber. `label` (visible) es la forma preferida; si no hay lugar para
 * texto, va `aria-label` o `aria-labelledby`.
 */
type MeterProps = MeterBaseProps &
  (
    | { label: NonNullable<React.ReactNode>; "aria-label"?: string }
    | { label?: undefined; "aria-label": string }
    | { label?: undefined; "aria-labelledby": string }
  )

function Meter({ className, label, showValue = false, size = "md", trackClassName, ...props }: MeterProps) {
  return (
    <MeterPrimitive.Root
      data-slot="meter"
      data-size={size}
      className={cn("group/meter flex w-full flex-col gap-2", className)}
      {...props}
    >
      {(label != null || showValue) && (
        <div className={cn("flex items-baseline gap-3", label != null ? "justify-between" : "justify-end")}>
          {label != null && (
            <MeterPrimitive.Label data-slot="meter-label" className="text-label-14 text-gray-1000">
              {label}
            </MeterPrimitive.Label>
          )}
          {showValue && (
            <MeterPrimitive.Value data-slot="meter-value" className="text-copy-13-mono tabular-nums text-gray-900" />
          )}
        </div>
      )}
      <MeterPrimitive.Track
        data-slot="meter-track"
        className={cn(
          "w-full overflow-hidden rounded-full bg-gray-300 shadow-track",
          "group-data-[size=sm]/meter:h-1 group-data-[size=md]/meter:h-1.5",
          trackClassName
        )}
      >
        {/* Base UI pone el ancho —y el alto, heredado de la pista— en un estilo
            inline, así que acá solo queda animar el cambio: un cupo que sube de
            golpe se lee peor que uno que se estira. */}
        <MeterPrimitive.Indicator
          data-slot="meter-indicator"
          className="rounded-full bg-gray-1000 transition-[width] duration-300 ease-out motion-reduce:transition-none"
        />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  )
}

export { Meter, type MeterBaseProps, type MeterProps }
