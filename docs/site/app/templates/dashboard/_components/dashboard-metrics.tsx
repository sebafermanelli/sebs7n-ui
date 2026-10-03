"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "sebs7n-ui/dropdown-menu"
import { MetricChart } from "sebs7n-ui/metric-chart"
import { Skeleton } from "sebs7n-ui/skeleton"
import { StatGrid, type StatGridItem } from "sebs7n-ui/stat-grid"

import { LAST_MONTH, lastChange, METRIC_PERIODS, metricSeries, type MetricPeriod } from "../_data/derive"
import type { calculateMetrics, Invoice, InvoiceStatus } from "../_data/invoices-mock"
import { downloadCsv, seriesToCsv } from "../_lib/csv"
import { plural, wholeMoney } from "../_lib/format"

type Metrics = ReturnType<typeof calculateMetrics>

/** Los últimos meses de cada indicador, para el gráfico de su card; `labels` es el rótulo de cada mes. */
export interface MetricSeries {
  billed: number[]
  collected: number[]
  pending: number[]
  overdue: number[]
  labels?: string[]
}

export type MetricId = "billed" | "pending" | "paid" | "overdue"

/** Lo que hace el menú «…» de cada card: la página lo conecta a la ruta, el estado y el CSV. */
export interface MetricActions {
  period: (id: MetricId) => MetricPeriod
  refreshing?: (id: MetricId) => boolean
  onDetail?: (id: MetricId) => void
  onRefresh?: (id: MetricId) => void
  onPeriod?: (id: MetricId, period: MetricPeriod) => void
  onExport?: (id: MetricId) => void
}

const SERIES_KEY = { billed: "billed", pending: "pending", paid: "collected", overdue: "overdue" } as const
const TITLE: Record<MetricId, string> = { billed: "Facturación total", pending: "Pendientes de cobro", paid: "Cobrado", overdue: "Facturas vencidas" }
/** A qué estado filtra «Ver detalle» en Facturas; la facturación total no filtra. */
export const DETAIL_STATUS: Record<MetricId, InvoiceStatus | null> = { billed: null, pending: "pending", paid: "paid", overdue: "overdue" }

// El gráfico: eje y tooltip en dólares, y el rótulo de cada mes. Cada card trae su color.
const chart = (id: MetricId, series: MetricSeries | undefined, period: MetricPeriod, color: "brand" | "red" = "brand") => {
  const values = series?.[SERIES_KEY[id]]
  if (!values || values.length < 2) return undefined
  const label = METRIC_PERIODS.find((item) => item.id === period)!.label.toLocaleLowerCase("es")
  return (
    <MetricChart
      aria-label={`${TITLE[id]}, ${label}`}
      color={color}
      data={values.map((value, index) => ({ label: series?.labels?.[index] ?? `Mes ${index + 1}`, value }))}
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      axisFormat={{ notation: "compact", maximumFractionDigits: 1 }}
      name={TITLE[id]}
    />
  )
}

// El cambio contra el mes anterior, con flecha y signo (no solo color). `goodWhenUp` dice si subir es bueno.
function change(values: number[] | undefined, goodWhenUp = true): Pick<StatGridItem, "delta" | "trend"> {
  const value = values ? lastChange(values) : null
  if (value == null) return {}
  const rounded = Math.round(Math.abs(value) * 10) / 10
  if (rounded === 0) return { delta: "= 0 %", trend: "neutral" }
  const up = value > 0
  return { delta: `${up ? "↗" : "↘"} ${rounded.toLocaleString("es-AR")} %`, trend: up === goodWhenUp ? "up" : "down" }
}

// «Ver detalle», «Actualizar», «Período ▸», y «Exportar CSV» después del separador.
function menu(id: MetricId, actions: MetricActions) {
  return (
    <>
      <DropdownMenuItem onClick={() => actions.onDetail?.(id)}>Ver detalle</DropdownMenuItem>
      <DropdownMenuItem onClick={() => actions.onRefresh?.(id)}>Actualizar</DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Período</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup onValueChange={(value) => actions.onPeriod?.(id, value as MetricPeriod)} value={actions.period(id)}>
            {METRIC_PERIODS.map((item) => (
              <DropdownMenuRadioItem key={item.id} value={item.id}>
                {item.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => actions.onExport?.(id)}>Exportar CSV</DropdownMenuItem>
    </>
  )
}

/** Los cuatro indicadores de Inicio, listos para `StatGrid`. Puro: se prueba sin renderizar. */
export function metricItems(metrics: Metrics, series?: MetricSeries, actions?: MetricActions, periods?: Record<MetricId, MetricSeries | undefined>): StatGridItem[] {
  const seriesOf = (id: MetricId) => periods?.[id] ?? series
  const periodOf = (id: MetricId) => actions?.period(id) ?? "6m"
  // Actualizando: el gráfico pasa a esqueleto un instante, como una recarga.
  const view = (id: MetricId, color?: "brand" | "red") => (actions?.refreshing?.(id) ? <Skeleton className="min-h-32 w-full flex-1" /> : chart(id, seriesOf(id), periodOf(id), color))
  const hintOf = (id: MetricId, text: string) => (actions?.refreshing?.(id) ? "Actualizando…" : text)
  const base = { billed: seriesOf("billed")?.billed, collected: seriesOf("paid")?.collected }
  const span = (id: MetricId) => METRIC_PERIODS.find((item) => item.id === periodOf(id))!.label.toLocaleLowerCase("es")
  return [
    { id: "billed", label: TITLE.billed, value: wholeMoney.format(metrics.totalBilled), ...change(base.billed), chart: view("billed"), actions: actions && menu("billed", actions), hint: series ? `Sin anuladas, ${span("billed")}` : "Sin las anuladas" },
    {
      id: "pending",
      label: TITLE.pending,
      value: plural(metrics.pendingCount, "factura", "facturas"),
      aside: wholeMoney.format(metrics.pendingAmount),
      chart: view("pending"),
      actions: actions && menu("pending", actions),
      hint: hintOf("pending", "Todavía en término"),
    },
    {
      id: "paid",
      label: TITLE.paid,
      value: wholeMoney.format(metrics.paidAmount),
      ...change(base.collected),
      chart: view("paid"),
      actions: actions && menu("paid", actions),
      hint: series ? `En cuenta, ${span("paid")}` : "Liquidado en cuenta corriente",
    },
    {
      id: "overdue",
      label: TITLE.overdue,
      value: plural(metrics.overdueCount, "factura", "facturas"),
      badge: metrics.overdueCount > 0 ? { color: "red", text: wholeMoney.format(metrics.overdueAmount) } : { color: "green", text: "Al día" },
      chart: view("overdue", "red"),
      actions: actions && menu("overdue", actions),
      hint: hintOf("overdue", "Requiere gestión de cobranza"),
    },
  ]
}

const IDS: MetricId[] = ["billed", "pending", "paid", "overdue"]

type MetricsInput = {
  metrics: Metrics
  /** Las series ya calculadas (6 meses). Sin `invoices`, es lo único que hay. */
  series?: MetricSeries
  /** Las facturas, para recalcular las series al cambiar el período. */
  invoices?: Invoice[]
  /** «Ver detalle»: la página navega a Facturas con el filtro de la métrica. */
  onDetail?: (id: MetricId, status: InvoiceStatus | null) => void
}

/**
 * Los cuatro indicadores de Inicio con su estado (período por card, «Actualizar» con esqueleto, CSV). Es un hook
 * para que el estado viva en la pantalla y no en cada card: Inicio los reparte como widgets, que se montan y
 * desmontan al editar el panel, y el período elegido no se pierde.
 */
export function useMetricItems({ metrics, series, invoices, onDetail }: MetricsInput): StatGridItem[] {
  const [periods, setPeriods] = useState<Record<MetricId, MetricPeriod>>({ billed: "6m", pending: "6m", paid: "6m", overdue: "6m" })
  const [refreshing, setRefreshing] = useState<MetricId[]>([])
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const bySeries = useMemo(() => {
    if (!invoices) return undefined
    return Object.fromEntries(IDS.map((id) => [id, metricSeries(invoices, LAST_MONTH, periods[id])])) as Record<MetricId, MetricSeries>
  }, [invoices, periods])

  const current = (id: MetricId) => bySeries?.[id] ?? series
  return metricItems(
    metrics,
    series ?? bySeries?.billed,
    {
      period: (id) => periods[id],
      refreshing: (id) => refreshing.includes(id),
      onDetail: (id) => onDetail?.(id, DETAIL_STATUS[id]),
      onPeriod: (id, period) => setPeriods((now) => ({ ...now, [id]: period })),
      onRefresh: (id) => {
        setRefreshing((now) => [...now, id])
        timers.current.push(window.setTimeout(() => setRefreshing((now) => now.filter((item) => item !== id)), 700))
      },
      onExport: (id) => {
        const data = current(id)
        const values = data?.[SERIES_KEY[id]]
        if (!data || !values) return
        downloadCsv(`${TITLE[id].toLocaleLowerCase("es").replace(/\s+/g, "-")}.csv`, seriesToCsv(["Mes", "Monto (USD)"], data.labels ?? values.map((_, index) => `Mes ${index + 1}`), values))
      },
    },
    bySeries
  )
}

/**
 * Cuatro cards de métricas con gráfico, eje y tooltip, y un menú «…» que funciona. El período
 * se elige por card y las series se recalculan de las facturas (`metricSeries`); «Actualizar» muestra
 * el esqueleto un momento, como una recarga. Cargando, los rótulos quedan y lo demás es esqueleto.
 */
export function DashboardMetrics({ loading = false, ...input }: MetricsInput & { loading?: boolean }) {
  return <StatGrid items={useMetricItems(input)} loading={loading} />
}
