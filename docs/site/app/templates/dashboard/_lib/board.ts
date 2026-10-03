import type { Invoice } from "../_data/invoices-mock"

/** Las tres columnas del tablero de cobranza. Las anuladas no entran: ya no se cobran. */
export type BoardColumn = "pending" | "overdue" | "paid"

export const BOARD_COLUMNS: { id: BoardColumn; title: string; hint: string }[] = [
  { id: "pending", title: "Pendientes", hint: "En término" },
  { id: "overdue", title: "Vencidas", hint: "Las pasa el sistema al vencer" },
  { id: "paid", title: "Cobradas", hint: "Ya liquidadas" },
]

/** Lo que se puede hacer soltando una factura en una columna. */
export type BoardMove = "markPaid" | "reopen"

/**
 * Qué pasa al soltar `invoice` en `to`: cobrarla (de pendiente o vencida a cobradas), reabrirla (de
 * cobradas a pendientes) o nada. A «Vencidas» no se suelta: el vencimiento lo decide la fecha, no la mano.
 */
export function boardMove(invoice: Invoice, to: BoardColumn): BoardMove | null {
  if (to === "paid" && (invoice.status === "pending" || invoice.status === "overdue")) return "markPaid"
  if (to === "pending" && invoice.status === "paid") return "reopen"
  return null
}

/** Las facturas de cada columna: las que vencen antes arriba y, entre las cobradas, las más recientes. */
export function boardGroups(invoices: Invoice[]): Record<BoardColumn, Invoice[]> {
  const groups: Record<BoardColumn, Invoice[]> = { pending: [], overdue: [], paid: [] }
  for (const invoice of invoices) if (invoice.status !== "void") groups[invoice.status].push(invoice)
  for (const column of Object.keys(groups) as BoardColumn[]) groups[column].sort((a, b) => (column === "paid" ? b.dueDate.localeCompare(a.dueDate) : a.dueDate.localeCompare(b.dueDate)))
  return groups
}

/** A qué columnas se puede mover (el menú «Mover a», el camino sin arrastrar). */
export const movesFrom = (invoice: Invoice) => BOARD_COLUMNS.filter((column) => column.id !== invoice.status && boardMove(invoice, column.id) !== null)
