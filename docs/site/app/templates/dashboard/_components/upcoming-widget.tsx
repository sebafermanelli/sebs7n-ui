"use client"

import Link from "next/link"
import { EmptyState } from "sebs7n-ui/empty-state"
import { List, ListRow } from "sebs7n-ui/list-row"
import { Skeleton } from "sebs7n-ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { linkVariants } from "sebs7n-ui/variants/link"
import { WidgetCard } from "sebs7n-ui/widget-card"

import { upcomingDue } from "../_data/derive"
import { formatDayMonth, wholeMoney } from "../_lib/format"
import { INVOICES_PATH } from "../_lib/routes"
import { useInvoicesStore } from "../_state/invoices-context"

export function UpcomingWidget() {
  const { invoices, loading } = useInvoicesStore()
  const rows = upcomingDue(invoices)

  return (
    <WidgetCard subtitle="Pendientes y vencidas, por fecha" title="Vencen pronto">
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton className="h-10 w-full" key={i} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState description="Las facturas que se emitan aparecen acá." title="Nada por cobrar" variant="plain" />
      ) : (
        <List aria-label="Facturas que vencen pronto">
          {rows.map((inv) => (
            <ListRow
              // El monto va debajo del nombre, no al costado: en una columna angosta, a la derecha le comía
              // el ancho al nombre. Lo que queda a la derecha es corto («vencida», «8 oct») y el punto,
              // decorativo, no es el único dato.
              description={`${inv.id} · ${wholeMoney.format(inv.amount)}`}
              dot={inv.status === "overdue" ? "red" : "amber"}
              key={inv.id}
              title={
                // Si el nombre igual no entra, el tooltip lo dice completo.
                <Tooltip>
                  <TooltipTrigger render={<span className="block truncate" />}>{inv.customer}</TooltipTrigger>
                  <TooltipContent>{inv.customer}</TooltipContent>
                </Tooltip>
              }
              trailing={<span className="text-callout text-label-secondary">{inv.status === "overdue" ? "Vencida" : formatDayMonth(inv.dueDate)}</span>}
            />
          ))}
        </List>
      )}
      <Link className={linkVariants({ variant: "accent" })} href={INVOICES_PATH}>
        Ver todas las facturas
      </Link>
    </WidgetCard>
  )
}
