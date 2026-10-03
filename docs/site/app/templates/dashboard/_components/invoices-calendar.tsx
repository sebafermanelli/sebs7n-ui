"use client"

import { useMemo } from "react"
import { CalendarAgenda } from "sebs7n-ui/calendar-agenda"
import { CalendarView } from "sebs7n-ui/calendar-view"

import type { Invoice } from "../_data/invoices-mock"
import { dueEvents } from "../_lib/calendar"

// Los vencimientos en un calendario: lo que no cabe en una tabla es «qué semana se amontona». Es
// de lectura: abrir una factura (click o Enter sobre su chip) lleva a su detalle.
export default function InvoicesCalendar({ invoices, onOpenDetail }: { invoices: Invoice[]; onOpenDetail: (invoice: Invoice) => void }) {
  const events = useMemo(() => dueEvents(invoices), [invoices])
  const open = (event: { id: string }) => {
    const invoice = invoices.find((item) => item.id === event.id)
    if (invoice) onOpenDetail(invoice)
  }
  // Un mes no entra en un teléfono: por debajo de 42 rem del contenedor, la agenda de los mismos eventos.
  return (
    <div className="@container w-full">
      <div className="hidden h-[640px] w-full overflow-hidden rounded-surface border border-separator @2xl:block">
        <CalendarView events={events} hour12={false} locale="es-AR" onEventClick={open} />
      </div>
      <CalendarAgenda className="@2xl:hidden" events={events} hour12={false} onEventClick={open} />
    </div>
  )
}
