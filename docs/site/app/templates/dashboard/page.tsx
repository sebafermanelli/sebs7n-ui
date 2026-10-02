"use client"

import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"

import { MetricsGrid } from "./_components/metrics-grid"
import { NewInvoiceDialog } from "./_components/new-invoice-dialog"
import { useInvoicesStore } from "./_state/invoices-context"

export default function DashboardHomePage() {
  const { metrics, addInvoice } = useInvoicesStore()
  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Inicio</PageHeaderTitle>
        <PageHeaderDescription>Lo facturado, lo cobrado y lo que vence pronto.</PageHeaderDescription>
        <PageHeaderActions>
          <NewInvoiceDialog onAddInvoice={addInvoice} />
        </PageHeaderActions>
      </PageHeader>
      <MetricsGrid metrics={metrics} />
    </AppShellContent>
  )
}
