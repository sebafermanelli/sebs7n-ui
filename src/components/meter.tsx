"use client"

import type * as React from "react"
import { Meter as MeterPrimitive } from "@base-ui/react/meter"

import { categoryFill } from "../internal/category-color.js"
import { useLabels, type Labels } from "../lib/labels.js"
import type { AccessibleName } from "../internal/accessible-name.js"
import { cn } from "../lib/utils.js"
import type { BadgeColor } from "../variants/badge.js"

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
   * Alto de la pista: `sm` 4px, `md` 6px —los mismos que `Progress`: una barra no se toca ni
   * recibe foco, así que no reserva área táctil— y `lg` 16px con radio 6, la barra de
   * almacenamiento de Settings de iCloud (catálogo §2.19).
   */
  size?: "sm" | "md" | "lg"
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
            <MeterPrimitive.Label data-slot="meter-label" className="text-callout text-label">
              {label}
            </MeterPrimitive.Label>
          )}
          {showValue && (
            <MeterPrimitive.Value data-slot="meter-value" className="text-callout tabular-nums text-label-secondary" />
          )}
        </div>
      )}
      <MeterPrimitive.Track
        data-slot="meter-track"
        className={cn(
          "w-full overflow-hidden rounded-full bg-fill-3",
          "group-data-[size=sm]/meter:h-1 group-data-[size=md]/meter:h-1.5 group-data-[size=lg]/meter:h-4 group-data-[size=lg]/meter:rounded-meter",
          trackClassName
        )}
      >
        {/* Base UI pone el ancho —y el alto, heredado de la pista— en un estilo
            inline, así que acá solo queda animar el cambio: un cupo que sube de
            golpe se lee peor que uno que se estira. */}
        <MeterPrimitive.Indicator
          data-slot="meter-indicator"
          className="rounded-full bg-brand-700 transition-[width] duration-300 ease-out motion-reduce:transition-none group-data-[size=lg]/meter:rounded-none"
        />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  )
}

type StackedMeterSegment = {
  /** De qué es («Facturas»): el nombre del segmento para el lector y la leyenda. */
  label: string
  value: number
  /** El color de la categoría (la paleta de `Badge`). */
  color: BadgeColor
}

type StackedMeterPropsBase = Omit<React.ComponentProps<"div">, "children"> & {
  /** Los segmentos, en el orden en que se apilan. Lo que sobra hasta `max` queda gris. */
  segments: StackedMeterSegment[]
  /** El total: el tamaño del plan. */
  max: number
  /** Formato de los valores (`Intl.NumberFormat`): `{ style: "unit", unit: "gigabyte" }`. */
  format?: Intl.NumberFormatOptions
  locale?: Intl.LocalesArgument
  /** El chip del total, a la izquierda de la cabecera («200 GB»). */
  total?: React.ReactNode
  /** Los textos de la cabecera («Libre», «Usado»). Le gana al `LabelsProvider`. */
  labels?: Partial<Labels["meter"]>
  /** El desglose debajo: punto, nombre y valor de cada segmento. */
  legend?: boolean
}

/**
 * La barra de almacenamiento de iCloud (catálogo §2.19): segmentos de color apilados en una pista de
 * 16 con radio 6, separados por 1 px, y el resto en gris; arriba «Libre X · Usado Y» y el chip del
 * total. Son varias medidas del mismo total, así que es un grupo con **un `role="meter"` por
 * segmento**: el lector dice «Facturas, 13,5 GB» y no solo un porcentaje suelto.
 *
 * El grupo necesita nombre (`aria-label` o `aria-labelledby`).
 */
function StackedMeter({ className, segments, max, format, locale, total, labels, legend = false, ...props }: StackedMeterProps) {
  const text = { ...useLabels().meter, ...labels }
  const formatter = new Intl.NumberFormat(locale, format)
  // Un valor negativo no ocupa lugar. Si lo usado pasa el máximo (una cuota que se excedió), la barra
  // se escala a lo usado en vez de cortar los últimos segmentos sin avisar; con un máximo de 0 o
  // menos, no hay barra que dividir (antes daba `NaN%`).
  const value = (segment: StackedMeterSegment) => Math.max(0, segment.value)
  const used = segments.reduce((sum, segment) => sum + value(segment), 0)
  const scale = Math.max(max, used, 0)
  const pct = (amount: number) => `${scale > 0 ? Math.min(100, (amount / scale) * 100) : 0}%`
  return (
    <div role="group" data-slot="stacked-meter" className={cn("flex w-full flex-col gap-3", className)} {...props}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        {total != null && (
          <span className="rounded-item bg-white px-2.5 py-2 text-title-1 font-bold text-black/90 tabular-nums shadow-thumbnail">{total}</span>
        )}
        <p data-slot="stacked-meter-summary" className="ms-auto text-title-2 text-label tabular-nums">
          <span className="text-label-secondary">
            {text.free} {formatter.format(Math.max(0, max - used))}
          </span>
          {" · "}
          {text.used} {formatter.format(used)}
        </p>
      </div>
      <div data-slot="stacked-meter-track" className="flex h-4 w-full gap-px overflow-hidden rounded-meter bg-fill-3">
        {segments.map((segment) => (
          <div
            key={segment.label}
            role="meter"
            aria-label={segment.label}
            aria-valuemin={0}
            aria-valuemax={scale}
            aria-valuenow={value(segment)}
            aria-valuetext={formatter.format(segment.value)}
            className={cn("h-full shrink-0 transition-[width] duration-300 ease-out motion-reduce:transition-none", categoryFill[segment.color])}
            style={{ width: pct(value(segment)) }}
          />
        ))}
      </div>
      {legend && (
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-callout text-label-secondary">
          {segments.map((segment) => (
            <li key={segment.label} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn("size-2 rounded-full", categoryFill[segment.color])} />
              <span className="text-label">{segment.label}</span>
              <span className="tabular-nums">{formatter.format(segment.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


type StackedMeterProps = StackedMeterPropsBase & AccessibleName

export { Meter, StackedMeter, type MeterBaseProps, type MeterProps, type StackedMeterProps, type StackedMeterSegment }
