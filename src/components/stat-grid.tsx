import type * as React from "react"

import { StatActions } from "../internal/stat-actions.js"
import { cn } from "../lib/utils.js"
import { Badge, type BadgeProps } from "./badge.js"
import { Button } from "./button.js"
import { Card, CardContent } from "./card.js"
import { Skeleton } from "./skeleton.js"
import { Stat, type StatProps } from "./stat.js"

type StatGridItem = {
  /** La clave. Por defecto, el `label`. */
  id?: string
  /** El rótulo: «Cobrado». Queda visible aun cargando. */
  label: React.ReactNode
  /** La cifra, ya formateada. */
  value: React.ReactNode
  /** Un dato chico a la derecha de la cifra («US$ 1.200»). */
  aside?: React.ReactNode
  /** Una etiqueta de estado a la derecha de la cifra («Al día»): lleva texto, el color no es el dato. */
  badge?: { text: React.ReactNode; color?: BadgeProps["color"] }
  /** Variación respecto del período anterior. Ver `Stat`. */
  delta?: StatProps["delta"]
  /** Color del `delta`. Ver `Stat`. */
  trend?: StatProps["trend"]
  /** Contexto de la cifra. */
  hint?: React.ReactNode
  /**
   * Un gráfico al pie de la card, del ancho completo: un `MetricChart` (sin ejes por defecto, con tooltip, ocupa el
   * alto que sobra) o un `Sparkline` de `h-14` (decorativo, se oculta solo del lector: la cifra y el
   * `delta` dicen el dato). Va pegado abajo, así las cards de una fila
   * alinean su gráfico aunque el texto de arriba tenga distinto alto. Cargando, pasa a esqueleto.
   */
  chart?: React.ReactNode
  /**
   * Las acciones de la card: los ítems de un `DropdownMenu` (`DropdownMenuItem`, `DropdownMenuSub`,
   * `DropdownMenuSeparator`…). La grilla dibuja el botón «…» arriba a la derecha (con el nombre
   * «Opciones de {label}») y el menú. Con `chart`, la cifra y la variación van en una misma línea.
   */
  actions?: React.ReactNode
}

type StatGridLabels = {
  /** El nombre del botón «…»; `{label}` es el rótulo de la card. Por defecto, «Opciones de {label}». */
  actions: string
}

const statGridLabels: StatGridLabels = { actions: "Opciones de {label}" }

const trendClassName = { up: "text-green-900", down: "text-red-900", neutral: "text-label-secondary" } as const

type StatGridProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Los indicadores, en orden. */
  items: readonly StatGridItem[]
  /**
   * Cuántos a lo ancho como máximo en escritorio. Por defecto sale de la cantidad, para no dejar
   * huérfanos: 1 → 1, 2 → 2, 3 → 3, 4 → 4 (2 en tablet), 5 → 1 columna, 3 + 2 llenando el ancho desde 48 rem y una sola fila desde 72 rem; 6 → 3 (2 en tablet); más → 4.
   */
  columns?: 1 | 2 | 3 | 4
  /**
   * Dónde se apoya el gráfico de cada indicador (`chart`). `bleed` (default): pegado a los bordes de la
   * card, a lo ancho y hasta abajo, que la card recorta con su radio, como las cards de analítica.
   * `inset`: adentro del padding de la card, con aire alrededor.
   */
  chartLayout?: "bleed" | "inset"
  /** Cargando: los rótulos quedan y las cifras pasan a esqueleto del alto final, así la card no cambia de alto al llegar. */
  loading?: boolean
  /** Textos internos (español por defecto: `statGridLabels`). */
  labels?: Partial<StatGridLabels>
}

// Estático para que Tailwind vea las clases.
const COLUMNS = {
  1: "grid-cols-1",
  2: "grid-cols-1 @lg:grid-cols-2",
  3: "grid-cols-1 @3xl:grid-cols-3",
  4: "grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-4",
} as const

// Con 6 en tablet, 2 de ancho; en escritorio, 3. Un 3 en tablet dejaría las cards del medio angostas.
const COLUMNS_3_LARGE = "grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-3"

// Con 5 no hay columnas que dividan parejo (2 + 2 + 1, 3 + 2 con un hueco): se usa una grilla de 6 donde las
// tres primeras ocupan 2 y las dos últimas 3 (3 + 2 que llenan el ancho), y en una grilla muy ancha, una sola fila.
const COLUMNS_5 =
  "grid-cols-1 @3xl:grid-cols-6 @3xl:[&>*]:col-span-2 @3xl:[&>*:nth-child(n+4)]:col-span-3 @6xl:grid-cols-5 @6xl:[&>*]:col-span-1 @6xl:[&>*:nth-child(n+4)]:col-span-1"

function autoColumns(count: number) {
  if (count === 5) return COLUMNS_5
  if (count <= 1) return COLUMNS[1]
  if (count === 2) return COLUMNS[2]
  if (count === 3) return COLUMNS[3]
  if (count === 4) return COLUMNS[4]
  if (count === 5 || count === 6) return COLUMNS_3_LARGE
  return COLUMNS[4]
}

/**
 * Una grilla de indicadores: cada uno es un `Stat` dentro de una `Card`, que es donde el verde y el
 * rojo de la variación llegan a contraste y donde, sobre el wallpaper, se pone la translucidez. 1
 * columna por debajo de 32 rem de ancho de la grilla, 2 desde ahí y hasta 4 desde 56 rem, sin huérfanos. Mide el ancho
 * de su contenedor (container queries, en una caja `@container` propia), no el de la ventana: con un panel lateral abierto se ve como en un teléfono.
 *
 * Con `loading`, la cifra es un esqueleto del alto de la final. Sin estado: va en un Server Component.
 */
function StatGrid({ items, columns, chartLayout = "bleed", loading = false, labels: labelsProp, className, ...props }: StatGridProps) {
  const labels = { ...statGridLabels, ...(labelsProp?.actions !== undefined && { actions: labelsProp.actions }) }
  return (
    <div data-slot="stat-grid-container" className="@container w-full">
    <div data-slot="stat-grid" className={cn("grid gap-4", columns ? COLUMNS[columns] : autoColumns(items.length), className)} aria-busy={loading || undefined} {...props}>
      {items.map((item, index) => {
        const inline = item.chart != null && !loading
        const name = labels.actions.replace("{label}", typeof item.label === "string" ? item.label : "")
        return (
          <Card key={item.id ?? (typeof item.label === "string" ? item.label : index)}>
            <CardContent className={cn("relative", item.chart != null && "flex h-full flex-col gap-3")}>
              <Stat
                className={item.actions != null ? "[&_[data-slot=stat-label]]:pe-8" : undefined}
                delta={loading || inline ? undefined : item.delta}
                hint={item.hint}
                label={item.label}
                trend={item.trend}
                value={
                  loading ? (
                    <Skeleton className="h-7 w-32" />
                  ) : (
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-title-2 font-semibold text-label tabular-nums">{item.value}</span>
                      {inline && item.delta != null && (
                        <span data-slot="stat-delta" className={cn("text-callout tabular-nums", trendClassName[item.trend ?? "neutral"])}>
                          {item.delta}
                        </span>
                      )}
                      {item.aside != null && <span className="text-callout text-label-secondary">{item.aside}</span>}
                      {item.badge && (
                        <Badge color={item.badge.color} size="sm">
                          {item.badge.text}
                        </Badge>
                      )}
                    </div>
                  )
                }
              />
              {item.actions != null && (
                <div className="absolute top-(--card-spacing) end-(--card-spacing) -mt-1 -me-1.5" data-slot="stat-grid-actions">
                  <StatActions loading={loading} name={name.trim()}>
                    {item.actions}
                  </StatActions>
                </div>
              )}
              {item.chart != null && (
                <div data-slot="stat-grid-chart" className={cn("mt-auto flex min-h-0 flex-1 flex-col justify-end pt-1", chartLayout === "bleed" && "-mx-(--card-spacing) -mb-(--card-spacing) pt-2")}>
                  {loading ? <Skeleton className="min-h-32 w-full flex-1" /> : item.chart}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
    </div>
  )
}

export { StatGrid, statGridLabels, type StatGridItem, type StatGridLabels, type StatGridProps }
