"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { AppShell } from "sebs7n-ui/app-shell"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { DashboardHeader } from "./_components/dashboard-header"
import { DashboardSidebar } from "./_components/dashboard-sidebar"
import { InvoiceFilters } from "./_components/invoice-filters"
import { InvoiceTable } from "./_components/invoice-table"
import { MetricsGrid } from "./_components/metrics-grid"
import { NewInvoiceDialog } from "./_components/new-invoice-dialog"
import { VoidInvoiceDialog } from "./_components/void-invoice-dialog"
import type { Invoice } from "./_data/invoices-mock"
import { useInvoices } from "./_hooks/use-invoices"

export default function DashboardPage() {
  const pathname = usePathname()
  const { invoices, metrics, search, setSearch, statusFilter, setStatusFilter, addInvoice, markAsPaid, voidInvoice } =
    useInvoices()
  const [voidTarget, setVoidTarget] = useState<Invoice | null>(null)

  return (
    <AppShell
      header={<DashboardHeader />}
      mobileBar={<DashboardHeader compact />}
      pathname={pathname}
      sidebar={<DashboardSidebar pendingCount={metrics.pendingCount} />}
    >
      <AppShellContent>
        {/* Sin breadcrumb: la barra global ya vuelve a Templates. */}
        <PageHeader>
          <PageHeaderTitle>Facturación y comprobantes</PageHeaderTitle>
          <PageHeaderDescription>
            Gestioná cuentas corrientes, emisión de comprobantes y seguimiento de cobranzas.
          </PageHeaderDescription>
          <PageHeaderActions>
            <NewInvoiceDialog onAddInvoice={addInvoice} />
          </PageHeaderActions>
        </PageHeader>

        <MetricsGrid metrics={metrics} />

        <div className="flex flex-col gap-4">
          <InvoiceFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            totalCount={invoices.length}
          />
          <InvoiceTable invoices={invoices} onMarkAsPaid={markAsPaid} onOpenVoidDialog={setVoidTarget} />
        </div>
      </AppShellContent>

      <VoidInvoiceDialog invoice={voidTarget} onClose={() => setVoidTarget(null)} onConfirmVoid={voidInvoice} />
    </AppShell>
  )
}
