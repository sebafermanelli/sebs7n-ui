"use client"

import { useMemo } from "react"
import { CalendarView } from "sebs7n-ui/calendar-view"

import type { Invoice } from "../_data/invoices-mock"
import { dueEvents } from "../_lib/calendar"

// Los vencimientos en un calendario: lo que no cabe en una tabla es «qué semana se amontona». Es
// de lectura: abrir una factura (click o Enter sobre su chip) lleva a su detalle.
export default function InvoicesCalendar({ invoices, onOpenDetail }: { invoices: Invoice[]; onOpenDetail: (invoice: Invoice) => void }) {
  const events = useMemo(() => dueEvents(invoices), [invoices])
  return (
    <div className="h-[640px] w-full overflow-hidden rounded-surface border border-separator">
      <CalendarView
        events={events}
        hour12={false}
        locale="es-AR"
        onEventClick={(event) => {
          const invoice = invoices.find((item) => item.id === event.id)
          if (invoice) onOpenDetail(invoice)
        }}
      />
    </div>
  )
}
