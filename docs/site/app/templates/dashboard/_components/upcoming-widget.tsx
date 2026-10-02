"use client"

import Link from "next/link"
import { List, ListRow } from "sebs7n-ui/list-row"
import { Skeleton } from "sebs7n-ui/skeleton"
import { linkVariants } from "sebs7n-ui/variants/link"
import { WidgetCard } from "sebs7n-ui/widget-card"

import { upcomingDue } from "../_data/derive"
import { formatDate, money } from "../_lib/format"
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
        <p className="text-callout text-label-secondary">No hay nada por cobrar.</p>
      ) : (
        <List aria-label="Facturas que vencen pronto">
          {rows.map((inv) => (
            <ListRow
              // El punto es decorativo: el estado también está escrito en la descripción.
              description={inv.status === "overdue" ? `${inv.id} · vencida` : `${inv.id} · vence el ${formatDate(inv.dueDate)}`}
              dot={inv.status === "overdue" ? "red" : "amber"}
              key={inv.id}
              title={inv.customer}
              trailing={money.format(inv.amount)}
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
