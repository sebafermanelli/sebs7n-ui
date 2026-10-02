"use client"

import { useState } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"

import { InvoiceFilters } from "../_components/invoice-filters"
import { InvoiceTable } from "../_components/invoice-table"
import { NewInvoiceDialog } from "../_components/new-invoice-dialog"
import { VoidInvoiceDialog } from "../_components/void-invoice-dialog"
import { filterInvoices, type Invoice, type InvoiceStatus } from "../_data/invoices-mock"
import { useInvoicesStore } from "../_state/invoices-context"

export default function InvoicesPage() {
  const { invoices, addInvoice, markPaid, voidInvoice } = useInvoicesStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all")
  const [voidTarget, setVoidTarget] = useState<Invoice | null>(null)
  const shown = filterInvoices(invoices, search, statusFilter)

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Facturas</PageHeaderTitle>
        <PageHeaderDescription>Emisión de comprobantes y seguimiento de cobranzas.</PageHeaderDescription>
        <PageHeaderActions>
          <NewInvoiceDialog onAddInvoice={addInvoice} />
        </PageHeaderActions>
      </PageHeader>
      <div className="flex flex-col gap-4">
        <InvoiceFilters
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          search={search}
          statusFilter={statusFilter}
          totalCount={shown.length}
        />
        <InvoiceTable invoices={shown} onMarkAsPaid={(id) => markPaid([id])} onOpenVoidDialog={setVoidTarget} />
      </div>
      <VoidInvoiceDialog invoice={voidTarget} onClose={() => setVoidTarget(null)} onConfirmVoid={voidInvoice} />
    </AppShellContent>
  )
}
