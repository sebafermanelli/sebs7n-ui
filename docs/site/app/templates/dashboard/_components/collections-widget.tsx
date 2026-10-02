"use client"

import { lazy, Suspense, useEffect, useState } from "react"
import { Skeleton } from "sebs7n-ui/skeleton"
import { WidgetCard } from "sebs7n-ui/widget-card"

import { monthlyTotals } from "../_data/derive"
import { useInvoicesStore } from "../_state/invoices-context"

// Recharts no entra en lo que Inicio pide al abrir: `lazy` (no `next/dynamic`, que mete un preload
// en el HTML y el chunk contaría igual) y montado recién después de hidratar. Ver `DemoSlot`.
const CollectionsChart = lazy(() => import("./collections-chart"))

/** El último mes con facturas emitidas en el mock: el gráfico no depende de la fecha de hoy y no se vacía con el tiempo. */
const LAST_MONTH = "2026-09"

export function CollectionsWidget() {
  const { invoices, loading } = useInvoicesStore()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const placeholder = <Skeleton className="aspect-[2/1] w-full" />

  return (
    <WidgetCard subtitle="Últimos seis meses, en dólares" title="Facturado y cobrado">
      {hydrated && !loading ? (
        <Suspense fallback={placeholder}>
          <CollectionsChart data={monthlyTotals(invoices, LAST_MONTH)} />
        </Suspense>
      ) : (
        placeholder
      )}
    </WidgetCard>
  )
}
