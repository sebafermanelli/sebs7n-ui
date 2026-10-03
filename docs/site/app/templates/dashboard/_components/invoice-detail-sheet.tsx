"use client"

import { lazy, Suspense, useId, useState } from "react"
import { Badge, type BadgeProps } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { Skeleton } from "sebs7n-ui/skeleton"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "sebs7n-ui/sheet"
import { Timeline, TimelineItem } from "sebs7n-ui/timeline"

import type { Invoice } from "../_data/invoices-mock"
import { formatDate, formatDateTime, money } from "../_lib/format"
import { isCollectable } from "../_state/invoices-reducer"
import { STATUS_BADGE } from "./invoice-status"

// Etiquetas y recordatorio traen TagsInput y DateTimePicker: se piden al abrir el panel, no con la tabla.
const InvoiceExtras = lazy(() => import("./invoice-extras"))

interface InvoiceEvent {
  title: string
  date: string
  description?: string
  dot: BadgeProps["color"]
}

/** El historial de la factura, del primer hecho al último. Puro: se prueba sin renderizar. */
export function invoiceEvents(inv: Invoice): InvoiceEvent[] {
  const events: InvoiceEvent[] = [
    { title: "Emitida", date: inv.date, description: `${money.format(inv.amount)} a ${inv.customer}`, dot: "gray" },
  ]
  if (inv.status === "paid" && inv.paidAt) events.push({ title: "Cobrada", date: inv.paidAt, dot: "green" })
  if (inv.status === "void" && inv.voidedAt) events.push({ title: "Anulada", date: inv.voidedAt, dot: "gray" })
  if (inv.status === "overdue") events.push({ title: "Venció sin cobrar", date: inv.dueDate, dot: "red" })
  if (inv.status === "pending") events.push({ title: "Vence", date: inv.dueDate, dot: "amber" })
  if (inv.reminderAt && (inv.status === "pending" || inv.status === "overdue"))
    events.push({ title: "Recordatorio programado", date: inv.reminderAt.slice(0, 10), description: formatDateTime(inv.reminderAt), dot: "blue" })
  return events
}

interface InvoiceDetailSheetProps {
  invoice: Invoice | null
  onClose: () => void
  onMarkPaid: (id: string) => void
  onVoid: (invoice: Invoice) => void
  /** Sin estas dos, el panel no ofrece etiquetas ni recordatorio. */
  onTagsChange?: (id: string, tags: string[]) => void
  onSchedule?: (id: string, at: string | null) => void
}

export function InvoiceDetailSheet({ invoice, onClose, onMarkPaid, onVoid, onTagsChange, onSchedule }: InvoiceDetailSheetProps) {
  const historyId = useId()
  // Al cerrar, `invoice` pasa a null antes de que termine la animación: se sigue mostrando la última.
  const [last, setLast] = useState<Invoice | null>(invoice)
  if (invoice && invoice !== last) setLast(invoice)
  const shown = invoice ?? last

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={invoice !== null}>
      <SheetContent>
        {shown && (
          <>
            <SheetHeader>
              <SheetTitle>Factura {shown.id}</SheetTitle>
              <SheetDescription>
                {shown.customer} · {shown.concept}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-5">
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-callout">
                <dt className="text-label-secondary">Estado</dt>
                <dd>
                  <Badge color={STATUS_BADGE[shown.status].color} size="sm">
                    {STATUS_BADGE[shown.status].label}
                  </Badge>
                </dd>
                <dt className="text-label-secondary">Monto</dt>
                <dd className="text-label tabular-nums">{money.format(shown.amount)}</dd>
                <dt className="text-label-secondary">Emitida</dt>
                <dd className="text-label">{formatDate(shown.date)}</dd>
                <dt className="text-label-secondary">Vence</dt>
                <dd className="text-label">{formatDate(shown.dueDate)}</dd>
              </dl>

              <section aria-labelledby={historyId} className="flex flex-col gap-3">
                <h3 className="text-headline text-label" id={historyId}>
                  Historial
                </h3>
                <Timeline aria-labelledby={historyId}>
                  {invoiceEvents(shown).map((event) => (
                    <TimelineItem
                      dateTime={event.date}
                      description={event.description}
                      dot={event.dot}
                      key={event.title}
                      time={formatDate(event.date)}
                      title={event.title}
                    />
                  ))}
                </Timeline>
              </section>

              {onTagsChange && onSchedule && (
                <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                  <InvoiceExtras invoice={shown} onSchedule={(at) => onSchedule(shown.id, at)} onTagsChange={(tags) => onTagsChange(shown.id, tags)} />
                </Suspense>
              )}
            </div>

            <SheetFooter>
              {shown.status !== "void" && (
                <Button onClick={() => onVoid(shown)} variant="secondary">
                  Anular
                </Button>
              )}
              {isCollectable(shown) && <Button onClick={() => onMarkPaid(shown.id)}>Marcar cobrada</Button>}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
