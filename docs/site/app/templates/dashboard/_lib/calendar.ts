import type { BadgeColor } from "sebs7n-ui/variants/badge"
import type { CalendarEvent } from "sebs7n-ui/calendar-view"

import type { Invoice } from "../_data/invoices-mock"
import { fromIsoDate } from "./format"

const COLOR: Record<Invoice["status"], BadgeColor> = { paid: "green", pending: "amber", overdue: "red", void: "gray" }

/** Un evento de todo el día por factura, en su fecha de vencimiento. Las anuladas no vencen. */
export function dueEvents(invoices: Invoice[]): CalendarEvent[] {
  return invoices
    .filter((inv) => inv.status !== "void")
    .map((inv) => ({
      id: inv.id,
      title: `${inv.id} · ${inv.customer}`,
      start: fromIsoDate(inv.dueDate),
      allDay: true,
      color: COLOR[inv.status],
    }))
}
