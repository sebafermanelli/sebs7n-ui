import type { BadgeProps } from "sebs7n-ui/badge"

import type { InvoiceStatus } from "../_data/invoices-mock"

export const STATUS_BADGE: Record<InvoiceStatus, { label: string; color: BadgeProps["color"] }> = {
  paid: { label: "Cobrada", color: "green" },
  pending: { label: "Pendiente", color: "amber" },
  overdue: { label: "Vencida", color: "red" },
  void: { label: "Anulada", color: "gray" },
}

// `items` del Select: es lo que hace que el trigger muestre «Todas las facturas» y no `all`.
export const STATUS_ITEMS: Record<InvoiceStatus | "all", string> = {
  all: "Todas las facturas",
  paid: "Cobradas",
  pending: "Pendientes",
  overdue: "Vencidas",
  void: "Anuladas",
}
