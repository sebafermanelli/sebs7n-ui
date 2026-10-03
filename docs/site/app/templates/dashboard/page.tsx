"use client"

import { useRouter } from "next/navigation"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { useWidgetLayout } from "sebs7n-ui/lib/widget-layout"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { WidgetBoard, WidgetBoardEditButton } from "sebs7n-ui/widget-board"

import { HOME_WIDGETS_KEY, useHomeWidgets } from "./_components/dashboard-widgets"
import { LoadError } from "./_components/load-error"
import { NewInvoiceDialog } from "./_components/new-invoice-dialog"
import { INVOICES_PATH } from "./_lib/routes"
import { useInvoicesStore } from "./_state/invoices-context"

// Inicio es un panel de widgets que se edita (`WidgetBoard`): una grilla estática hasta que se aprieta «Editar»,
// y recién ahí se pide el módulo de arrastre. El orden y los widgets visibles se guardan en este navegador.
export default function DashboardHomePage() {
  const { invoices, metrics, loading, error, retry, addInvoice, customers } = useInvoicesStore()
  const router = useRouter()
  const widgets = useHomeWidgets({
    invoices,
    metrics,
    loading,
    onDetail: (_, status) => router.push(status ? `${INVOICES_PATH}?status=${status}` : INVOICES_PATH),
  })
  const layout = useWidgetLayout({ storageKey: HOME_WIDGETS_KEY, widgets })
  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Inicio</PageHeaderTitle>
        <PageHeaderDescription>Lo facturado, lo cobrado y lo que vence pronto.</PageHeaderDescription>
        <PageHeaderActions>
          {/* «Editar» es secundario: el único acento de la pantalla es «Nueva factura». */}
          {!error && <WidgetBoardEditButton layout={layout} />}
          <NewInvoiceDialog customers={customers.map((customer) => customer.name)} onAddInvoice={addInvoice} />
        </PageHeaderActions>
      </PageHeader>
      {error ? <LoadError onRetry={retry} what="el resumen" /> : <WidgetBoard layout={layout} />}
    </AppShellContent>
  )
}
