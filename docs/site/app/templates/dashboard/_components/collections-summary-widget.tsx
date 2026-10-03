"use client"

import { Meter, StackedMeter } from "sebs7n-ui/meter"
import { Skeleton } from "sebs7n-ui/skeleton"
import { WidgetCard } from "sebs7n-ui/widget-card"

import type { calculateMetrics } from "../_data/invoices-mock"
import { wholeMoney } from "../_lib/format"

type Metrics = ReturnType<typeof calculateMetrics>

/** Cuánto de lo facturado ya se cobró, de 0 a 1. Sin facturas, 0 (no `NaN`). */
export const collectedShare = (metrics: Metrics) => (metrics.totalBilled > 0 ? metrics.paidAmount / metrics.totalBilled : 0)

/**
 * El resumen de cobranza: qué parte de lo facturado entró, y cómo se reparte entre cobrado, pendiente y
 * vencido. Es un widget de Inicio: el `Meter` dice un porcentaje y el `StackedMeter` los montos.
 */
export function CollectionsSummaryWidget({ metrics, loading = false }: { metrics: Metrics; loading?: boolean }) {
  return (
    <WidgetCard subtitle="Lo facturado, repartido por estado" title="Resumen de cobranza">
      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Meter format={{ style: "percent", maximumFractionDigits: 0 }} label="Cobrado" locale="es-AR" max={1} showValue value={collectedShare(metrics)} />
          <StackedMeter
            aria-label="Facturado por estado"
            format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
            legend
            locale="es-AR"
            max={metrics.totalBilled}
            segments={[
              { label: "Cobrado", value: metrics.paidAmount, color: "green" },
              { label: "Pendiente", value: metrics.pendingAmount, color: "amber" },
              { label: "Vencido", value: metrics.overdueAmount, color: "red" },
            ]}
          />
          <p className="text-callout text-label-secondary">{`Total facturado: ${wholeMoney.format(metrics.totalBilled)}`}</p>
        </div>
      )}
    </WidgetCard>
  )
}
