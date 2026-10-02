"use client"

import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"

import { CollectionsWidget } from "./_components/collections-widget"
import { MetricsGrid } from "./_components/metrics-grid"
import { NewInvoiceDialog } from "./_components/new-invoice-dialog"
import { UpcomingWidget } from "./_components/upcoming-widget"
import { useInvoicesStore } from "./_state/invoices-context"

export default function DashboardHomePage() {
  const { metrics, loading, addInvoice } = useInvoicesStore()
  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Inicio</PageHeaderTitle>
        <PageHeaderDescription>Lo facturado, lo cobrado y lo que vence pronto.</PageHeaderDescription>
        <PageHeaderActions>
          <NewInvoiceDialog onAddInvoice={addInvoice} />
        </PageHeaderActions>
      </PageHeader>
      <MetricsGrid loading={loading} metrics={metrics} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <CollectionsWidget />
        <UpcomingWidget />
      </div>
    </AppShellContent>
  )
}
