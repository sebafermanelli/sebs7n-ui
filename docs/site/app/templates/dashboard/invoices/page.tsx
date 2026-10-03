"use client"

import { CalendarDaysIcon, KanbanIcon, TableIcon, TriangleAlertIcon } from "lucide-react"
import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "sebs7n-ui/alert"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { DropTarget } from "sebs7n-ui/drop-target"
import { useStoredState } from "sebs7n-ui/lib/use-stored-state"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Skeleton } from "sebs7n-ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"

import { InvoiceDetailSheet } from "../_components/invoice-detail-sheet"
import { InvoicesDataTable } from "../_components/invoices-data-table"
import { LoadError } from "../_components/load-error"
import { NewInvoiceDialog } from "../_components/new-invoice-dialog"
import { notifyPaid } from "../_components/notify-paid"
import { VoidInvoiceDialog } from "../_components/void-invoice-dialog"
import { deriveCustomers, NO_FILTERS, type InvoiceFilters } from "../_data/derive"
import type { Invoice } from "../_data/invoices-mock"
import type { BoardMove } from "../_lib/board"
import { plural, wholeMoney } from "../_lib/format"
import { isCollectable } from "../_state/invoices-reducer"
import { useInvoicesStore } from "../_state/invoices-context"

// El tablero y el calendario traen dnd-kit y la vista de calendario: se piden al elegir esa vista (`lazy`),
// no con la tabla, que es la que se abre siempre.
const InvoicesBoard = lazy(() => import("../_components/invoices-board"))
const InvoicesCalendar = lazy(() => import("../_components/invoices-calendar"))

type View = "table" | "board" | "calendar"
const VIEWS: View[] = ["table", "board", "calendar"]
const isView = (value: unknown): value is View => VIEWS.includes(value as View)

export default function InvoicesPage() {
  const { invoices, customers: records, loading, error, retry, metrics, addInvoice, markPaid, reopen, voidInvoice, restore, setTags, scheduleReminder } = useInvoicesStore()
  const [selected, setSelected] = useState<string[]>([])
  const [filters, setFilters] = useState<InvoiceFilters>(NO_FILTERS)
  // «Ver detalle» de una métrica de Inicio llega con `?status=overdue`. Se lee después de hidratar (no con
  // `useSearchParams`, que pediría un `Suspense` y desarma la página estática).
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("status")
    if (status === "paid" || status === "pending" || status === "overdue" || status === "void") setFilters({ ...NO_FILTERS, statuses: [status] })
  }, [])
  const [voidTarget, setVoidTarget] = useState<Invoice | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [view, setView] = useStoredState<View>("acme-dashboard:invoices-view", "table", isView)
  // Un PDF soltado sobre la página abre «Nueva factura» con el archivo adjunto.
  const [dropped, setDropped] = useState<string | null>(null)
  // Por id, no por objeto: después de cobrar o anular, el detalle muestra la factura actualizada.
  const detail = invoices.find((inv) => inv.id === detailId) ?? null
  const customers = useMemo(() => deriveCustomers(invoices, records), [invoices, records])
  const customerNames = customers.map((customer) => customer.name)
  const customerInfo = useMemo(() => Object.fromEntries(customers.map((customer) => [customer.name, customer])), [customers])

  const handleMarkPaid = (ids: string[]) => {
    notifyPaid(markPaid(ids), restore)
    setSelected((current) => current.filter((id) => !ids.includes(id)))
  }

  // Un recordatorio por cliente, no por factura: a quien debe tres le llega un solo correo.
  const handleRemind = (ids: string[]) => {
    const owed = invoices.filter((inv) => ids.includes(inv.id) && isCollectable(inv))
    const names = [...new Set(owed.map((inv) => inv.customer))]
    if (owed.length === 0) return toast.info("Las facturas elegidas ya están cobradas o anuladas: no hay nada que recordar.")
    toast.success(names.length === 1 ? `Recordatorio enviado a ${names[0]}.` : `Recordatorio enviado a ${names.length} clientes.`)
    setSelected((current) => current.filter((id) => !ids.includes(id)))
  }

  // Lo que sale de arrastrar una tarjeta (o de «Mover a»): cobrar, o reabrir con «Deshacer».
  const handleMove = (invoice: Invoice, move: BoardMove) => {
    if (move === "markPaid") return handleMarkPaid([invoice.id])
    const previous = reopen([invoice.id])
    toast.info(`${invoice.id} volvió a estar por cobrar.`, { action: { label: "Deshacer", onClick: () => restore(previous) } })
  }

  const showOverdue = () => {
    setFilters({ ...NO_FILTERS, statuses: ["overdue"] })
    setView("table")
  }

  const openDetail = (invoice: Invoice) => setDetailId(invoice.id)
  const fallback = <Skeleton className="h-[480px] w-full" />

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Facturas</PageHeaderTitle>
        <PageHeaderDescription>Emisión de comprobantes y seguimiento de cobranzas.</PageHeaderDescription>
        <PageHeaderActions>
          <NewInvoiceDialog customers={customerNames} onAddInvoice={addInvoice} />
        </PageHeaderActions>
      </PageHeader>

      {!loading && !error && metrics.overdueCount > 0 && (
        <Alert variant="warning">
          <TriangleAlertIcon />
          <AlertTitle>{`${plural(metrics.overdueCount, "factura vencida", "facturas vencidas")}: ${wholeMoney.format(metrics.overdueAmount)} sin cobrar`}</AlertTitle>
          <AlertDescription>
            <p>Pasaron su fecha de vencimiento. Mandales un recordatorio o revisalas una por una.</p>
            <Button className="mt-3" onClick={showOverdue} size="sm" variant="secondary">
              Ver vencidas
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error ? (
        <LoadError onRetry={retry} what="las facturas" />
      ) : (
        // Soltar un PDF sobre la lista abre el alta con el archivo. Arrastrar es un atajo: «Nueva factura» sigue ahí.
        <DropTarget accept=".pdf" className="flex flex-col gap-4" maxSize={5 * 1024 * 1024} onDrop={([file]) => file && setDropped(file.name)}>
          {/* Elegir una vista es elegir una de tres: ToggleGroup con `required`, que no deja ninguna apagada. */}
          <ToggleGroup aria-label="Vista" className="self-start" onValueChange={(value) => isView(value[0]) && setView(value[0])} required size="sm" value={[view]}>
            <ToggleGroupItem value="table">
              <TableIcon />
              Tabla
            </ToggleGroupItem>
            <ToggleGroupItem value="board">
              <KanbanIcon />
              Tablero
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar">
              <CalendarDaysIcon />
              Calendario
            </ToggleGroupItem>
          </ToggleGroup>

          {view === "table" && (
            <InvoicesDataTable
              customerInfo={customerInfo}
              customers={customerNames}
              filters={filters}
              invoices={invoices}
              loading={loading}
              onFiltersChange={setFilters}
              onMarkPaid={handleMarkPaid}
              onOpenDetail={openDetail}
              onRemind={handleRemind}
              onSelectedChange={setSelected}
              onVoid={setVoidTarget}
              selected={selected}
            />
          )}
          {view === "board" &&
            (loading ? (
              fallback
            ) : (
              <Suspense fallback={fallback}>
                <InvoicesBoard invoices={invoices} onMove={handleMove} onOpenDetail={openDetail} onVoid={setVoidTarget} />
              </Suspense>
            ))}
          {view === "calendar" &&
            (loading ? (
              fallback
            ) : (
              <Suspense fallback={fallback}>
                <InvoicesCalendar invoices={invoices} onOpenDetail={openDetail} />
              </Suspense>
            ))}
        </DropTarget>
      )}

      <NewInvoiceDialog attachment={dropped ?? undefined} customers={customerNames} hideTrigger onAddInvoice={addInvoice} onOpenChange={(open) => !open && setDropped(null)} open={dropped !== null} />
      <InvoiceDetailSheet
        invoice={detail}
        onClose={() => setDetailId(null)}
        onMarkPaid={(id) => handleMarkPaid([id])}
        onSchedule={scheduleReminder}
        onTagsChange={setTags}
        onVoid={setVoidTarget}
      />
      <VoidInvoiceDialog invoice={voidTarget} onClose={() => setVoidTarget(null)} onConfirmVoid={voidInvoice} />
    </AppShellContent>
  )
}
