"use client"

import { useState } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"

import { InvoicesDataTable } from "../_components/invoices-data-table"
import { NewInvoiceDialog } from "../_components/new-invoice-dialog"
import { notifyPaid } from "../_components/notify-paid"
import { VoidInvoiceDialog } from "../_components/void-invoice-dialog"
import type { Invoice } from "../_data/invoices-mock"
import { useInvoicesStore } from "../_state/invoices-context"

export default function InvoicesPage() {
  const { invoices, loading, addInvoice, markPaid, voidInvoice, restore } = useInvoicesStore()
  const [selected, setSelected] = useState<string[]>([])
  const [voidTarget, setVoidTarget] = useState<Invoice | null>(null)

  const handleMarkPaid = (ids: string[]) => {
    notifyPaid(markPaid(ids), restore)
    setSelected((current) => current.filter((id) => !ids.includes(id)))
  }

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Facturas</PageHeaderTitle>
        <PageHeaderDescription>Emisión de comprobantes y seguimiento de cobranzas.</PageHeaderDescription>
        <PageHeaderActions>
          <NewInvoiceDialog onAddInvoice={addInvoice} />
        </PageHeaderActions>
      </PageHeader>
      <InvoicesDataTable
        invoices={invoices}
        loading={loading}
        onMarkPaid={handleMarkPaid}
        onOpenDetail={() => {}}
        onSelectedChange={setSelected}
        onVoid={setVoidTarget}
        selected={selected}
      />
      <VoidInvoiceDialog invoice={voidTarget} onClose={() => setVoidTarget(null)} onConfirmVoid={voidInvoice} />
    </AppShellContent>
  )
}
