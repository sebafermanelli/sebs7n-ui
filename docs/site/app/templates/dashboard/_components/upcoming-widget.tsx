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
              // El importe va fijo a la derecha, con su estado o fecha debajo: no se corta nunca (`trailing` no se
              // encoge) y es el nombre el que trunca, con su tooltip. Debajo del nombre queda solo el código.
              description={inv.id}
              key={inv.id}
              title={
                // Si el nombre igual no entra, el tooltip lo dice completo.
                <Tooltip>
                  <TooltipTrigger render={<span className="block truncate" />}>{inv.customer}</TooltipTrigger>
                  <TooltipContent>{inv.customer}</TooltipContent>
                </Tooltip>
              }
              trailing={
                <span className="flex flex-col items-end">
                  <span className="whitespace-nowrap">{wholeMoney.format(inv.amount)}</span>
                  <span className={inv.status === "overdue" ? "text-footnote text-red-ink" : "text-footnote text-label-secondary"}>
                    {inv.status === "overdue" ? "Vencida" : formatDayMonth(inv.dueDate)}
                  </span>
                </span>
              }
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
