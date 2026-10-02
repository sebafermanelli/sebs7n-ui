import { Badge, type BadgeProps } from "sebs7n-ui/badge"
import { Card, CardContent } from "sebs7n-ui/card"
import { Skeleton } from "sebs7n-ui/skeleton"
import { Stat } from "sebs7n-ui/stat"

import type { calculateMetrics } from "../_data/invoices-mock"

type Metrics = ReturnType<typeof calculateMetrics>

const dollars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

function metricCards(metrics: Metrics) {
  return [
    { label: "Facturación total", value: dollars.format(metrics.totalBilled), hint: "Sin las anuladas" },
    {
      label: "Pendientes de cobro",
      value: `${metrics.pendingCount} facturas`,
      aside: dollars.format(metrics.pendingAmount),
      hint: "Todavía en término",
    },
    { label: "Cobrado", value: dollars.format(metrics.paidAmount), hint: "Liquidado en cuenta corriente" },
    {
      label: "Facturas vencidas",
      value: `${metrics.overdueCount} facturas`,
      badge:
        metrics.overdueCount > 0
          ? { color: "red" as BadgeProps["color"], text: dollars.format(metrics.overdueAmount) }
          : { color: "green" as BadgeProps["color"], text: "Al día" },
      hint: "Requiere gestión de cobranza",
    },
  ]
}

// Cargando, los rótulos quedan y las cifras pasan a esqueleto: la tarjeta no cambia de alto al llegar.
export function MetricsGrid({ metrics, loading = false }: { metrics: Metrics; loading?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metricCards(metrics).map((card) => (
        <Card key={card.label}>
          <CardContent>
            <Stat
              hint={card.hint}
              label={card.label}
              value={
                loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-title-2 font-semibold text-label">{card.value}</span>
                    {card.aside && <span className="text-callout text-label-secondary">{card.aside}</span>}
                    {card.badge && (
                      <Badge color={card.badge.color} size="sm">
                        {card.badge.text}
                      </Badge>
                    )}
                  </div>
                )
              }
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
