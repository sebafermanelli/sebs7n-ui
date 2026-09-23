"use client"

import type * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn, type WithClassName } from "../lib/utils.js"

/**
 * Elegir un número —o un rango— arrastrando. Va cuando el valor exacto importa
 * menos que la proporción: un volumen, una opacidad, un presupuesto "de tanto a
 * tanto". Si el número exacto importa, es un `Input`.
 *
 * Simple con `defaultValue={40}`; de rango con `defaultValue={[20, 60]}`, que
 * pinta los dos thumbs solo. Cada thumb es un `<input type="range">` real: se
 * mueve con las flechas, salta de a `largeStep` con Página arriba/abajo y va a
 * los extremos con Inicio/Fin.
 */
type SliderProps<Value extends number | readonly number[] = number | readonly number[]> = WithClassName<SliderPrimitive.Root.Props<Value>> & {
  /** Alto del área que recibe el arrastre: `sm` 32px, `md` 40px, como el resto de los controles. */
  size?: "sm" | "md"
  /** Etiqueta visible. Base UI la asocia sola con los thumbs; sin ella hace falta `aria-label`. */
  label?: React.ReactNode
  /** Muestra el valor (o "20 – 60" en un rango) a la derecha de la etiqueta. */
  showValue?: boolean
  /** Marcas de referencia sobre la pista. Son decoración (`aria-hidden`): el valor lo canta el thumb. */
  marks?: readonly number[]
  /** Clases del área arrastrable, por si hay que cambiarle el ancho. */
  controlClassName?: string
}

function Slider<Value extends number | readonly number[] = number | readonly number[]>({
  "aria-label": ariaLabel,
  className,
  controlClassName,
  defaultValue,
  label,
  marks,
  max = 100,
  min = 0,
  showValue = false,
  size = "md",
  value,
  ...props
}: SliderProps<Value>) {
  // Un thumb por valor. Base UI pide el `index` explícito para que un rango
  // renderice igual en el server que en el cliente.
  const current = value ?? defaultValue
  const thumbs = Array.isArray(current) ? current.length : 1

  return (
    <SliderPrimitive.Root
      aria-label={ariaLabel}
      data-slot="slider"
      data-size={size}
      className={cn("group/slider flex w-full flex-col gap-2", className)}
      defaultValue={defaultValue}
      max={max}
      min={min}
      value={value}
      {...props}
    >
      {(label != null || showValue) && (
        <div className={cn("flex items-baseline gap-3", label != null ? "justify-between" : "justify-end")}>
          {label != null && (
            <SliderPrimitive.Label data-slot="slider-label" className="text-label-14 text-gray-1000">
              {label}
            </SliderPrimitive.Label>
          )}
          {showValue && (
            <SliderPrimitive.Value data-slot="slider-value" className="text-copy-13-mono tabular-nums text-gray-900" />
          )}
        </div>
      )}

      <SliderPrimitive.Control
        data-slot="slider-control"
        className={cn(
          "flex w-full cursor-pointer touch-none items-center select-none",
          "group-data-[size=sm]/slider:h-8 group-data-[size=md]/slider:h-10",
          "data-disabled:cursor-not-allowed",
          controlClassName
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "w-full rounded-full bg-gray-300",
            "group-data-[size=sm]/slider:h-1 group-data-[size=md]/slider:h-1.5",
            "data-disabled:bg-gray-200"
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className="h-full rounded-full bg-gray-1000 data-disabled:bg-gray-400"
          />

          {marks?.map((mark) => (
            <span
              aria-hidden="true"
              className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-600"
              data-slot="slider-mark"
              key={mark}
              style={{ insetInlineStart: `${((mark - min) / (max - min)) * 100}%` }}
            />
          ))}

          {Array.from({ length: thumbs }, (_, index) => (
            <SliderPrimitive.Thumb
              // El nombre del control vive en el <input type="range">, no en el grupo.
              // Con `label` lo pone Base UI solo (`aria-labelledby`), así que no se pisa.
              aria-label={label == null ? ariaLabel : undefined}
              className={cn(
                "rounded-full border border-gray-alpha-400 bg-background-100 shadow-tooltip outline-none transition-control",
                "group-data-[size=sm]/slider:size-4 group-data-[size=md]/slider:size-5",
                "hover:border-gray-600 data-dragging:border-gray-600",
                // El foco vive en el <input type="range"> de adentro: el anillo va en el thumb.
                "has-[input:focus-visible]:focus-ring",
                "data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:shadow-none"
              )}
              data-slot="slider-thumb"
              index={index}
              key={index}
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider, type SliderProps }
