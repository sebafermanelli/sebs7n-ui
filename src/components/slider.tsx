"use client"

import type * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn, type WithClassName } from "../lib/utils.js"
import { sliderThumbClassName, sliderThumbDraggingClassName } from "../variants/slider.js"

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
  /** Alto del área que recibe el arrastre: `sm` 24px, `md` 32px, como el resto de los controles. */
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
            <SliderPrimitive.Label data-slot="slider-label" className="text-callout text-label">
              {label}
            </SliderPrimitive.Label>
          )}
          {showValue && (
            <SliderPrimitive.Value data-slot="slider-value" className="text-mono-body tabular-nums text-label-secondary" />
          )}
        </div>
      )}

      <SliderPrimitive.Control
        data-slot="slider-control"
        className={cn(
          "flex w-full cursor-pointer touch-none items-center select-none",
          "group-data-[size=sm]/slider:h-6 group-data-[size=md]/slider:h-8",
          // Apagado a .4, como todo control de iCloud.
          "data-disabled:cursor-not-allowed data-disabled:opacity-40",
          controlClassName
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          // La pista de Photos (§2.14): 2 px con radio completo, el label al 32 % y el progreso en el
          // label. Lo que dice el valor es la perilla; la pista es contexto.
          className="h-0.5 w-full rounded-full bg-label/32"
        >
          <SliderPrimitive.Indicator data-slot="slider-indicator" className="h-full rounded-full bg-label" />

          {marks?.map((mark) => (
            <span
              aria-hidden="true"
              className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-label-tertiary"
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
                // La perilla de iCloud, la misma del matiz del ColorPicker: 14 con borde de 2, en los
                // dos tamaños. El `::after` agranda el área de toque (34, y 46 con el dedo) sin
                // cambiar lo que se ve.
                sliderThumbClassName,
                "outline-none after:absolute after:-inset-2.5 pointer-coarse:after:-inset-4",
                // Mientras se arrastra, la perilla crece: es la respuesta al toque.
                sliderThumbDraggingClassName,
                // El foco vive en el <input type="range"> de adentro, y el anillo va por fuera del
                // thumb, como en el Switch: adentro de 14 px un anillo interior de 3 la taparía.
                "has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-(color:--sf-focus)",
                "data-disabled:cursor-not-allowed data-disabled:scale-100"
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
