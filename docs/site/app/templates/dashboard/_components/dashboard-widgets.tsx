"use client"

import { ClockIcon, LineChartIcon, PieChartIcon, ReceiptIcon } from "lucide-react"
import { Meter } from "sebs7n-ui/meter"
import { Sparkline } from "sebs7n-ui/sparkline"
import { StatGrid } from "sebs7n-ui/stat-grid"
import type { WidgetDef } from "sebs7n-ui/lib/widget-layout"

import { LAST_MONTH, metricSeries, upcomingDue } from "../_data/derive"
import type { calculateMetrics, Invoice, InvoiceStatus } from "../_data/invoices-mock"
import { wholeMoney } from "../_lib/format"
import { CollectionsSummaryWidget, collectedShare } from "./collections-summary-widget"
import { CollectionsWidget } from "./collections-widget"
import { useMetricItems, type MetricId } from "./dashboard-metrics"
import { UpcomingWidget } from "./upcoming-widget"

/** La clave donde se guarda el panel de Inicio: el orden y los widgets visibles. */
export const HOME_WIDGETS_KEY = "dashboard:home:widgets"

type HomeWidgetsInput = {
  invoices: Invoice[]
  metrics: ReturnType<typeof calculateMetrics>
  loading: boolean
  onDetail: (id: MetricId, status: InvoiceStatus | null) => void
}

const METRICS: { id: MetricId; title: string; description: string }[] = [
  { id: "billed", title: "Facturación total", description: "Lo emitido, sin las anuladas, con su tendencia." },
  { id: "pending", title: "Pendientes de cobro", description: "Cuántas facturas están todavía en término." },
  { id: "paid", title: "Cobrado", description: "Lo liquidado en cuenta corriente." },
  { id: "overdue", title: "Facturas vencidas", description: "Las que piden gestión de cobranza." },
]

/**
 * Los widgets de Inicio, en su orden original: las cuatro métricas (`sm`, una columna de cuatro), el
 * gráfico de facturado y cobrado (`md`, dos) y, de a una columna, lo que vence pronto y el resumen de
 * cobranza. Cada `render` lee del store de la pantalla; el estado de las métricas (período, «Actualizar»)
 * vive acá, no en cada card, así sobrevive a que el panel se monte de nuevo al editar.
 */
export function useHomeWidgets({ invoices, metrics, loading, onDetail }: HomeWidgetsInput): WidgetDef[] {
  const items = useMetricItems({ metrics, invoices, onDetail })
  const series = metricSeries(invoices, LAST_MONTH, "6m")
  const previews: Record<MetricId, number[]> = { billed: series.billed, pending: series.pending, paid: series.collected, overdue: series.overdue }
  const next = upcomingDue(invoices)[0]

  const metricWidgets: WidgetDef[] = METRICS.map(({ id, title, description }, index) => ({
    id,
    title,
    description,
    icon: <ReceiptIcon />,
    preview: <Sparkline values={previews[id]} />,
    render: () => <StatGrid columns={1} items={[items[index]!]} loading={loading} />,
  }))

  return [
    ...metricWidgets,
    {
      id: "collections",
      title: "Facturado y cobrado",
      size: "md",
      description: "Las barras de los últimos seis meses, en dólares.",
      icon: <LineChartIcon />,
      preview: <Sparkline values={series.billed} />,
      render: () => <CollectionsWidget />,
    },
    {
      id: "upcoming",
      title: "Vencen pronto",
      description: "Las próximas facturas por cobrar, por fecha.",
      icon: <ClockIcon />,
      preview: <span className="truncate text-footnote text-label">{next ? `${next.customer} · ${wholeMoney.format(next.amount)}` : "Nada por cobrar"}</span>,
      render: () => <UpcomingWidget />,
    },
    {
      id: "summary",
      title: "Resumen de cobranza",
      description: "Cobrado, pendiente y vencido sobre lo facturado.",
      icon: <PieChartIcon />,
      preview: <Meter aria-label="Cobrado" max={1} size="sm" value={collectedShare(metrics)} />,
      render: () => <CollectionsSummaryWidget loading={loading} metrics={metrics} />,
    },
  ]
}
