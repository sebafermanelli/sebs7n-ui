import * as React from "react"

import { MetricChartFrame, metricChartColors, type MetricChartColor, type MetricChartPoint } from "../internal/metric-chart-frame.js"
import { cn } from "../lib/utils.js"

type MetricChartDatum = { label: string; value: number }
type MetricChartSeries = {
  /** Cómo se llama la serie: sale en el tooltip y en la tabla para el lector. */
  name?: string
  data: readonly MetricChartDatum[]
  /** El color token de la serie. Por defecto, `brand` la primera y las demás en orden. */
  color?: MetricChartColor
}

type MetricChartLabels = {
  /** Plantilla del resumen para el lector: `{count}`, `{from}`, `{to}`, `{min}`, `{max}`, `{last}`. */
  summary: string
  /** Cómo se usa con el teclado. */
  keys: string
  /** El título de la tabla de datos que lee el lector. */
  table: string
  /** El encabezado de la columna de rótulos. */
  period: string
  /** El encabezado de la columna de valores si la serie no tiene `name`. */
  value: string
}

const metricChartLabels: MetricChartLabels = {
  summary: "{count} puntos, de {from} a {to}. Mínimo {min}, máximo {max}, último {last}.",
  keys: "Flechas izquierda y derecha para recorrer los puntos, Escape para soltar.",
  table: "Datos del gráfico",
  period: "Período",
  value: "Valor",
}

type MetricChartProps = Omit<React.ComponentProps<"div">, "children" | "color" | "aria-label"> & {
  /** Una sola serie: los puntos de izquierda a derecha. Para varias, `series`. */
  data?: readonly MetricChartDatum[]
  /** Varias series con los mismos rótulos (se toman los de la primera). Le gana a `data`. */
  series?: readonly MetricChartSeries[]
  /** Qué mide: «Facturación de los últimos 6 meses». Es el nombre accesible del gráfico. */
  "aria-label": string
  /** El nombre de la serie única (`data`). */
  name?: string
  /** El alto en px. Sin él, llena a su contenedor (mínimo 8 rem): en una `Card` de `StatGrid` ocupa el alto que sobra. */
  height?: number
  /** Cómo se escriben los valores: opciones de `Intl.NumberFormat` o una función. El eje las compacta (`3K`) salvo que pases `axisFormat`. */
  format?: Intl.NumberFormatOptions | ((value: number) => string)
  /** El formato del eje Y, si tiene que ser distinto del tooltip. */
  axisFormat?: Intl.NumberFormatOptions | ((value: number) => string)
  /** El idioma de los números. Por defecto, `es-AR`. */
  locale?: string
  /** Cuántas etiquetas aproximadas en el eje Y (la escala redondea a pasos 1-2-5). Por defecto 4. */
  yTicks?: number
  /** Dibuja guías y etiquetas del eje Y, a la derecha. Por defecto `false` desde 3.0: en una card de métrica solo línea, área y tooltip. */
  showAxis?: boolean
  /** Pinta el área bajo la curva. Por defecto `true`. */
  area?: boolean
  /** Color token de la serie única. Por defecto `brand`. */
  color?: MetricChartColor
  /** Con `false` no hay puntero, teclado ni tooltip, y no se carga el JS del cliente. Por defecto `true`. */
  interactive?: boolean
  /** Textos internos (español por defecto: `metricChartLabels`). */
  labels?: Partial<MetricChartLabels>
}

const GUTTER = 44
const ORDER: MetricChartColor[] = ["brand", "green", "amber", "red"]

function formatter(format: MetricChartProps["format"], locale: string, extra?: Intl.NumberFormatOptions) {
  if (typeof format === "function") return format
  const intl = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, ...format, ...extra })
  return (value: number) => intl.format(value)
}

// Pasos de 1, 2 o 5 por potencia de diez: los que se leen sin calcular.
function niceScale(min: number, max: number, ticks: number) {
  const span = max - min || 1
  const raw = span / Math.max(1, ticks - 1)
  const pow = 10 ** Math.floor(Math.log10(raw))
  const frac = raw / pow
  const step = (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10) * pow
  const lo = Math.floor(min / step) * step
  const hi = Math.max(Math.ceil(max / step) * step, lo + step)
  const values: number[] = []
  for (let value = lo; value <= hi + step / 1000; value += step) values.push(Number(value.toFixed(10)))
  return { lo, hi, values }
}

const fill = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""))

/**
 * Un gráfico de área o línea para una métrica, en SVG a mano: sin librería, así una card de
 * indicadores no paga el peso de Recharts. Trae guías horizontales, el eje Y a la derecha y, al pasar
 * el puntero o con el teclado, una línea punteada con un punto por serie y un tooltip con el rótulo y
 * el valor en negrita. Para ejes completos, varias escalas o barras, `chart`; para una curva
 * decorativa de una fila, `Sparkline`.
 *
 * Es un Server Component: el dibujo sale resuelto del servidor y solo el marco interactivo
 * (`internal/metric-chart-frame`) es cliente; con `interactive={false}` no se carga. Es una imagen con
 * nombre (`role="img"`) y, aparte, una tabla `sr-only` con todos los datos: el lector lee eso.
 * Flechas ← → mueven el punto, Inicio y Fin saltan a los extremos, Escape lo suelta.
 */
function MetricChart({
  data,
  series: seriesProp,
  name,
  height,
  format,
  axisFormat,
  locale = "es-AR",
  yTicks = 4,
  showAxis = false,
  area = true,
  color = "brand",
  interactive = true,
  labels: labelsProp,
  className,
  style,
  "aria-label": ariaLabel,
  ...props
}: MetricChartProps) {
  const id = React.useId()
  const labels = { ...metricChartLabels, ...Object.fromEntries(Object.entries(labelsProp ?? {}).filter(([, value]) => value !== undefined)) } as MetricChartLabels
  const all: MetricChartSeries[] = seriesProp ? [...seriesProp] : [{ name, data: data ?? [], color }]
  const base = all[0]?.data ?? []
  // Un punto vale si todas las series tienen un número ahí: lo demás se descarta junto.
  const keep = base.map((_, index) => index).filter((index) => all.every((one) => Number.isFinite(one.data[index]?.value)))
  if (keep.length < 2) return null

  const rows = all.map((one, position) => ({
    name: one.name,
    color: one.color ?? (seriesProp ? ORDER[position % ORDER.length]! : color),
    values: keep.map((index) => one.data[index]!.value),
  }))
  const names = keep.map((index) => base[index]!.label)
  const flat = rows.flatMap((row) => row.values)
  const scale = niceScale(Math.min(0, ...flat), Math.max(...flat), yTicks)
  const yOf = (value: number) => 100 - ((value - scale.lo) / (scale.hi - scale.lo)) * 100
  const xOf = (index: number) => (index / (keep.length - 1)) * 100

  const tipFormat = formatter(format, locale)
  // Compacto y sin el espacio de la unidad («2 K» → «2K»): la gutter del eje es angosta.
  const compact = formatter(typeof format === "function" ? undefined : format, locale, { notation: "compact", maximumFractionDigits: 1 })
  const axisOwn = axisFormat ? formatter(axisFormat, locale) : undefined
  const axis = axisOwn ? (typeof axisFormat === "function" ? axisOwn : (value: number) => axisOwn(value).replace(/\s/g, "")) : typeof format === "function" ? format : (value: number) => compact(value).replace(/\s/g, "")

  const points: MetricChartPoint[] = names.map((label, index) => ({
    x: Number(xOf(index).toFixed(2)),
    label,
    items: rows.map((row) => ({ color: row.color, name: row.name, text: tipFormat(row.values[index]!), y: Number(yOf(row.values[index]!).toFixed(2)) })),
  }))

  const summaryId = `${id}-summary`
  const first = rows[0]!
  const summary = `${fill(labels.summary, {
    count: keep.length,
    from: names[0]!,
    to: names[names.length - 1]!,
    min: tipFormat(Math.min(...first.values)),
    max: tipFormat(Math.max(...first.values)),
    last: tipFormat(first.values[first.values.length - 1]!),
  })}${interactive ? ` ${labels.keys}` : ""}`

  const drawing = (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-2.5 left-0" style={{ right: showAxis ? GUTTER : 0 }}>
        <svg className="absolute inset-0 size-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
          {showAxis &&
            scale.values.map((value) => (
              <line key={value} className="stroke-separator" strokeWidth="1" vectorEffect="non-scaling-stroke" x1="0" x2="100" y1={yOf(value)} y2={yOf(value)} />
            ))}
          {rows.map((row, position) => {
            const line = row.values.map((value, index) => `${xOf(index).toFixed(2)},${yOf(value).toFixed(2)}`)
            const gradient = `${id}-g${position}`
            return (
              <g key={position} className={metricChartColors[row.color]}>
                {area && (
                  <>
                    <defs>
                      <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="currentColor" stopOpacity={rows.length > 1 ? 0.14 : 0.22} />
                        <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon fill={`url(#${gradient})`} points={`0,100 ${line.join(" ")} 100,100`} stroke="none" />
                  </>
                )}
                <polyline points={line.join(" ")} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </g>
            )
          })}
        </svg>
      </div>
      {showAxis && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-2.5 right-0" style={{ width: GUTTER }} data-slot="metric-chart-axis">
          {scale.values.map((value) => (
            <span key={value} className="absolute left-2 -translate-y-1/2 text-footnote text-label-secondary tabular-nums" style={{ top: `${yOf(value)}%` }}>
              {axis(value)}
            </span>
          ))}
        </div>
      )}
    </>
  )

  const box = cn("relative", height == null && "h-full min-h-32 flex-1", className)
  const boxStyle = height == null ? style : { height, ...style }

  return (
    <div className="contents" {...props}>
      {interactive ? (
        <MetricChartFrame ariaLabel={ariaLabel} className={box} describedBy={summaryId} gutter={showAxis ? GUTTER : 0} points={points} style={boxStyle}>
          {drawing}
        </MetricChartFrame>
      ) : (
        <div className={box} data-slot="metric-chart" style={boxStyle}>
          <div aria-describedby={summaryId} aria-label={ariaLabel} className="absolute inset-0" role="img">
            {drawing}
          </div>
        </div>
      )}
      <p className="sr-only" id={summaryId}>
        {summary}
      </p>
      <table className="sr-only">
        <caption>
          {ariaLabel}. {labels.table}
        </caption>
        <thead>
          <tr>
            <th scope="col">{labels.period}</th>
            {rows.map((row, index) => (
              <th key={index} scope="col">
                {row.name ?? labels.value}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {names.map((label, index) => (
            <tr key={index}>
              <th scope="row">{label}</th>
              {rows.map((row, position) => (
                <td key={position}>{tipFormat(row.values[index]!)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { MetricChart, metricChartLabels, type MetricChartColor, type MetricChartDatum, type MetricChartLabels, type MetricChartProps, type MetricChartSeries }
