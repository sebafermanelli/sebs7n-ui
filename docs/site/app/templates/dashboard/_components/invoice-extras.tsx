"use client"

import { BellRingIcon } from "lucide-react"
import { useId } from "react"
import { DateTimePicker } from "sebs7n-ui/date-time-picker"
import { TagsInput } from "sebs7n-ui/tags-input"
import { toast } from "sonner"

import type { Invoice } from "../_data/invoices-mock"
import { formatDateTime, fromIsoDateTime, toIsoDateTime } from "../_lib/format"
import { isCollectable } from "../_state/invoices-reducer"

interface InvoiceExtrasProps {
  invoice: Invoice
  onTagsChange: (tags: string[]) => void
  onSchedule: (at: string | null) => void
}

// Etiquetas y recordatorio del detalle, en su archivo para pedirlos recién al abrir el panel (`lazy` en
// `invoice-detail-sheet`): TagsInput y DateTimePicker no hacen falta para ver la tabla.
export default function InvoiceExtras({ invoice, onTagsChange, onSchedule }: InvoiceExtrasProps) {
  const tagsId = useId()
  const reminderId = useId()
  const collectable = isCollectable(invoice)

  return (
    <>
      <section aria-labelledby={tagsId} className="flex flex-col gap-3">
        <h3 className="text-headline text-label" id={tagsId}>
          Etiquetas
        </h3>
        {/* Se aplican al instante, como un ajuste: no hay «Guardar» en un panel de detalle. */}
        <TagsInput addOnBlur aria-labelledby={tagsId} max={5} onValueChange={onTagsChange} placeholder="Agregar etiqueta" value={invoice.tags ?? []} />
      </section>

      <section aria-labelledby={reminderId} className="flex flex-col gap-3">
        <h3 className="text-headline text-label" id={reminderId}>
          Recordatorio
        </h3>
        {collectable ? (
          <>
            <DateTimePicker
              aria-labelledby={reminderId}
              clearable
              onValueChange={(date) => {
                // Elegir solo el día deja las 00:00: a esa hora nadie quiere el aviso, así que arranca a las 9.
                if (date && !invoice.reminderAt && date.getHours() === 0 && date.getMinutes() === 0) date.setHours(9)
                onSchedule(date ? toIsoDateTime(date) : null)
                toast.success(date ? `Recordatorio programado para el ${formatDateTime(toIsoDateTime(date))}.` : "Recordatorio cancelado.")
              }}
              value={invoice.reminderAt ? fromIsoDateTime(invoice.reminderAt) : null}
            />
            <p className="flex items-center gap-2 text-callout text-label-secondary">
              <BellRingIcon aria-hidden="true" className="size-4 shrink-0" />
              {invoice.reminderAt ? `Se le avisa a ${invoice.customer} el ${formatDateTime(invoice.reminderAt)}.` : "Elegí cuándo avisarle al cliente que la factura sigue abierta."}
            </p>
          </>
        ) : (
          <p className="text-callout text-label-secondary">Solo se programa un recordatorio en las facturas por cobrar.</p>
        )}
      </section>
    </>
  )
}
