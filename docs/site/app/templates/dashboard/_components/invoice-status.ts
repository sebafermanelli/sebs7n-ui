import type { BadgeProps } from "sebs7n-ui/badge"

import type { InvoiceStatus } from "../_data/invoices-mock"

export const STATUS_BADGE: Record<InvoiceStatus, { label: string; color: BadgeProps["color"] }> = {
  paid: { label: "Cobrada", color: "green" },
  pending: { label: "Pendiente", color: "amber" },
  overdue: { label: "Vencida", color: "red" },
  void: { label: "Anulada", color: "gray" },
}

// Las opciones del filtro de estados (`MultiSelect`): sin «todas», porque vacío ya es todas.
export const STATUS_OPTIONS = (Object.keys(STATUS_BADGE) as InvoiceStatus[]).map((value) => ({ value, label: STATUS_BADGE[value].label }))
