"use client"

import * as React from "react"
import { Legend as LegendPrimitive, Tooltip as TooltipPrimitive, type LegendPayload, type TooltipPayloadEntry } from "recharts"

import { cn } from "../lib/utils.js"

/**
 * Qué es cada serie: la etiqueta que se muestra y, si hace falta, el color.
 *
 * Las claves son las `dataKey` del gráfico. El color es opcional: sin él, cada
 * serie toma el siguiente de la paleta (`chart-1`…`chart-5`) **en el orden en
 * que está escrita la config**, y ese orden no cambia si una serie se filtra:
 * el color sigue a la entidad, no a la posición.
 */
type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    /** Un color CSS. Por defecto, `var(--color-chart-n)` según la posición. */
    color?: string
    icon?: React.ComponentType
  }
>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart necesita <ChartContainer>")
  return context
}

/** Cinco series y no más. La sexta se agrupa en «Otros» o se parte en otro gráfico. */
const PALETTE_SIZE = 5

/**
 * `--color-<clave>` por serie, en el contenedor: el gráfico las lee con
 * `fill="var(--color-ventas)"`. Va como estilo inline y no como `<style>`
 * porque los tokens ya cambian solos con `.dark`; no hay nada que duplicar por
 * tema, y una hoja inyectada por gráfico es lo que una CSP estricta rechaza.
 *
 * Apunta a `--sf-chart-n` y no a `--color-chart-n`: la segunda es la versión de
 * `@theme inline`, y Tailwind v4 solo la emite si alguna clase (`bg-chart-1`)
 * la usa en el código escaneado. Un `var()` en un estilo inline no cuenta, y el
 * gráfico salía negro. La `--sf-*` está en `@layer base` y existe siempre.
 */
function colorVariables(config: ChartConfig): React.CSSProperties {
  const style: Record<string, string> = {}
  let slot = 0
  for (const [key, entry] of Object.entries(config)) {
    if (entry.color) {
      style[`--color-${key}`] = entry.color
    } else if (slot < PALETTE_SIZE) {
      slot += 1
      style[`--color-${key}`] = `var(--sf-chart-${slot})`
    }
  }
  return style as React.CSSProperties
}

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig
  /**
   * Un gráfico de Recharts con `responsive`: `<AreaChart responsive>`. Sin esa
   * prop el gráfico mide 0×0 y no se ve; con ella llena el contenedor, que es
   * el que decide el tamaño (`aspect-video` por defecto, o el `className`).
   */
  children: React.ReactNode
}

/**
 * El marco de un gráfico de Recharts, con los tokens del sistema.
 *
 * Recharts pinta con sus propios colores (`#ccc` en la grilla, `#fff` en el
 * anillo de los puntos, `#666` en los ejes). Acá se sobreescriben por clase
 * para que la grilla sea `gray-400`, el texto de los ejes `gray-900` y el anillo
 * de un punto la superficie del tema, que es lo que hace que un gráfico en
 * oscuro no tenga un halo blanco alrededor de cada punto.
 *
 * No envuelve en `ResponsiveContainer`: desde Recharts 3.3 el propio gráfico
 * lleva `responsive` y mide con CSS, sin un observer extra ni un primer render
 * en blanco. El contenedor de acá le da el ancho y el alto.
 *
 * `recharts` es un peer **opcional**: solo lo instala la app que lo usa. Este
 * archivo es el único del paquete que lo importa, así que un `import` de
 * cualquier otro subpath no lo trae.
 */
function ChartContainer({ config, className, children, style, ...props }: ChartContainerProps) {
  const id = React.useId()
  const vars = React.useMemo(() => colorVariables(config), [config])
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={id}
        className={cn(
          "flex aspect-video w-full justify-center text-label-12 text-gray-900 [&_.recharts-responsive-container]:size-full [&_.recharts-wrapper]:size-full",
          // Ejes y grilla: recesivos. Una línea de grilla es de un paso sobre la superficie, sólida.
          "[&_.recharts-cartesian-axis-tick_text]:fill-gray-900 [&_.recharts-cartesian-axis-line]:stroke-gray-400 [&_.recharts-cartesian-grid_line]:stroke-gray-400",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-gray-400 [&_.recharts-radial-bar-background-sector]:fill-gray-200 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-gray-alpha-100 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-gray-500",
          // El anillo de 2px de un punto y el hueco entre sectores son del color de la superficie.
          "[&_.recharts-dot[stroke='#fff']]:stroke-background-100 [&_.recharts-sector[stroke='#fff']]:stroke-background-100 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-gray-500",
          // El foco de teclado lo pone el sistema, no el outline azul del navegador sobre un <svg>.
          "[&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper:focus-visible]:focus-ring",
          className
        )}
        style={{ ...vars, ...style }}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

/** El `<Tooltip>` de Recharts, tal cual. Se le pasa `content={<ChartTooltipContent />}`. */
const ChartTooltip = TooltipPrimitive

/**
 * Lo que Recharts le inyecta al `content` del tooltip (`active`, `payload`,
 * `label`) más lo propio. **No** se aceptan ni se esparcen las otras ~300 props
 * de `<Tooltip>`: caerían en el `<div>` como atributos desconocidos
 * (`accessibilityLayer`, `cursor`…) y React avisa por cada una.
 */
type ChartTooltipContentProps = {
  active?: boolean
  payload?: readonly TooltipPayloadEntry[]
  label?: React.ReactNode
  className?: string
  /** Forma del testigo de cada serie: un punto, una línea vertical, o nada. */
  indicator?: "dot" | "line" | "none"
  hideLabel?: boolean
  hideIndicator?: boolean
  /** Clave del payload que da el título del tooltip. Por defecto, el `label` del eje. */
  labelKey?: string
  /** Clave del payload que identifica la serie. Por defecto, `dataKey` o `name`. */
  nameKey?: string
  /** Cómo se escribe cada valor: `(value) => value.toLocaleString("es-AR")`. */
  formatter?: (value: number | string, name: string, entry: TooltipPayloadEntry) => React.ReactNode
  labelFormatter?: (label: React.ReactNode, payload: readonly TooltipPayloadEntry[]) => React.ReactNode
}

/**
 * Con qué clave de la config se busca una entrada: lo que hay en `payload[nameKey]`
 * si se pidió una (`nameKey="canal"` en un `Pie`, donde cada sector es una fila), y
 * si no, la `dataKey` de la serie o el `value` que Recharts ya resolvió.
 */
function entryKey(entry: TooltipPayloadEntry | LegendPayload, nameKey?: string) {
  const row = entry.payload as Record<string, unknown> | undefined
  const fromRow = nameKey ? row?.[nameKey] : undefined
  const dataKey = "dataKey" in entry ? entry.dataKey : undefined
  const key = fromRow ?? (typeof dataKey === "string" ? dataKey : undefined) ?? entry.value
  return typeof key === "string" ? key : String(key ?? "")
}

/**
 * El cuerpo del tooltip: superficie, borde y sombra del sistema, el nombre de
 * la serie en gris y el valor en tinta, tabular.
 *
 * El texto nunca lleva el color de la serie: el color va en el testigo de al
 * lado. Un ámbar como texto sobre blanco no se lee.
 */
function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelKey,
  nameKey,
  formatter,
  labelFormatter,
}: ChartTooltipContentProps) {
  const { config } = useChart()
  const entries = payload ?? []
  if (!active || !entries.length) return null

  const first = entries[0]
  const labelFromConfig = first && labelKey ? config[String(first.payload?.[labelKey] ?? labelKey)]?.label : undefined
  const title = hideLabel ? null : (labelFromConfig ?? (labelFormatter ? labelFormatter(label, entries) : label))

  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        "grid min-w-32 gap-1.5 rounded-md border border-gray-400 bg-background-100 px-2.5 py-1.5 text-copy-13 shadow-menu",
        className
      )}
    >
      {title != null && title !== "" && (
        <div data-slot="chart-tooltip-label" className="text-label-12 text-gray-900">
          {title}
        </div>
      )}
      <div className="grid gap-1">
        {entries.map((entry, index) => {
          const key = entryKey(entry, nameKey)
          const item = config[key]
          const color = entry.color ?? `var(--color-${key})`
          const name = item?.label ?? entry.name ?? key
          return (
            <div
              key={`${key}-${index}`}
              data-slot="chart-tooltip-item"
              className={cn("flex items-center gap-2", indicator === "line" && "items-stretch")}
            >
              {!hideIndicator && indicator !== "none" && (
                <span
                  aria-hidden="true"
                  data-slot="chart-tooltip-indicator"
                  className={cn("shrink-0 rounded-full", indicator === "dot" ? "size-2" : "w-0.5 self-stretch rounded-sm")}
                  style={{ backgroundColor: color }}
                />
              )}
              <span className="flex-1 text-gray-900">{name}</span>
              {entry.value != null && (
                <span className="text-copy-13-mono tabular-nums text-gray-1000">
                  {formatter
                    ? formatter(entry.value as number | string, String(name), entry)
                    : typeof entry.value === "number"
                      ? entry.value.toLocaleString()
                      : String(entry.value)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** El `<Legend>` de Recharts, tal cual. Se le pasa `content={<ChartLegendContent />}`. */
const ChartLegend = LegendPrimitive

/** Igual que el tooltip: solo `payload` y `verticalAlign` de lo que inyecta Recharts, nada más cae en el `<div>`. */
type ChartLegendContentProps = {
  payload?: readonly LegendPayload[]
  verticalAlign?: "top" | "bottom" | "middle"
  className?: string
  nameKey?: string
  hideIcon?: boolean
}

/**
 * La leyenda: un testigo del color y la etiqueta de la config. Siempre visible
 * cuando hay dos series o más; con una sola, el título del gráfico ya la nombra
 * y la leyenda no va.
 */
function ChartLegendContent({ className, payload, verticalAlign = "bottom", nameKey, hideIcon = false }: ChartLegendContentProps) {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <div
      data-slot="chart-legend"
      className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((entry, index) => {
        const key = entryKey(entry, nameKey)
        const item = config[key]
        const IconComponent = item?.icon
        return (
          <div key={`${key}-${index}`} data-slot="chart-legend-item" className="flex items-center gap-1.5 text-label-12 text-gray-900">
            {IconComponent && !hideIcon ? (
              <IconComponent />
            ) : (
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? `var(--color-${key})` }}
              />
            )}
            {item?.label ?? entry.value}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Si el visitante pidió menos movimiento, los gráficos no se animan.
 *
 * Recharts no mira `prefers-reduced-motion`: hay que pasarle
 * `isAnimationActive={false}` a cada serie. Este hook devuelve la prop lista
 * para esparcir: `<Area {...motion} />`. Empieza en «con animación» durante el
 * SSR y se corrige en el cliente antes de pintar.
 */
function useChartMotion(): { isAnimationActive: boolean; animationDuration: number } {
  const reduced = React.useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)")
      query.addEventListener("change", onChange)
      return () => query.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
  return { isAnimationActive: !reduced, animationDuration: reduced ? 0 : 600 }
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
  useChartMotion,
  type ChartConfig,
  type ChartContainerProps,
  type ChartLegendContentProps,
  type ChartTooltipContentProps,
}
