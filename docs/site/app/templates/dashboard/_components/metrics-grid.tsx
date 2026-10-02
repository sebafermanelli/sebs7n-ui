import { Card, CardContent } from "sebs7n-ui/card"
import { Stat } from "sebs7n-ui/stat"
import { Badge } from "sebs7n-ui/badge"
import type { calculateMetrics } from "../_data/invoices-mock"

export function MetricsGrid({ metrics }: { metrics: ReturnType<typeof calculateMetrics> }) {
  const formatter = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-widget">
        <CardContent className="p-4">
          <Stat
            label="Facturación total"
            value={
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-title-2 font-semibold text-label">{formatter.format(metrics.totalBilled)}</span>
                <Badge color="green" size="sm">+14%</Badge>
              </div>
            }
            hint="Comparado al mes anterior"
          />
        </CardContent>
      </Card>

      <Card className="shadow-widget">
        <CardContent className="p-4">
          <Stat
            label="Pendientes de cobro"
            value={
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-title-2 font-semibold text-label">{metrics.pendingCount} facturas</span>
                <span className="text-callout font-medium text-label-secondary">{formatter.format(metrics.pendingAmount)}</span>
              </div>
            }
            hint="A vencer en los próximos 30 días"
          />
        </CardContent>
      </Card>

      <Card className="shadow-widget">
        <CardContent className="p-4">
          <Stat
            label="Cobrado este período"
            value={
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-title-2 font-semibold text-label">{formatter.format(metrics.paidAmount)}</span>
                <Badge color="brand" size="sm">Al día</Badge>
              </div>
            }
            hint="Liquidado en cuenta corriente"
          />
        </CardContent>
      </Card>

      <Card className="shadow-widget">
        <CardContent className="p-4">
          <Stat
            label="Facturas vencidas"
            value={
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-title-2 font-semibold text-label">{metrics.overdueCount} facturas</span>
                {metrics.overdueCount > 0 ? (
                  <Badge color="red" size="sm">{formatter.format(metrics.overdueAmount)}</Badge>
                ) : (
                  <Badge color="green" size="sm">0</Badge>
                )}
              </div>
            }
            hint="Requiere gestión de cobranza"
          />
        </CardContent>
      </Card>
    </div>
  )
}
