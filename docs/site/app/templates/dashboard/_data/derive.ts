import type { Invoice } from "./invoices-mock"

export interface Customer {
  name: string
  invoiceCount: number
  /** Lo facturado sin las anuladas. */
  billed: number
  /** Lo que falta cobrar: pendientes y vencidas. */
  outstanding: number
}

/** Los clientes salen de las facturas: el template no tiene alta de clientes. */
export function deriveCustomers(invoices: Invoice[]): Customer[] {
  const byName = new Map<string, Customer>()
  for (const inv of invoices) {
    const customer = byName.get(inv.customer) ?? { name: inv.customer, invoiceCount: 0, billed: 0, outstanding: 0 }
    customer.invoiceCount += 1
    if (inv.status !== "void") customer.billed += inv.amount
    if (inv.status === "pending" || inv.status === "overdue") customer.outstanding += inv.amount
    byName.set(inv.customer, customer)
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "es"))
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

/**
 * Facturado (por mes de emisión, sin anuladas) y cobrado (por mes de `paidAt`) de los `count` meses
 * que terminan en `lastMonth` (`YYYY-MM`).
 */
export function monthlyTotals(invoices: Invoice[], lastMonth: string, count = 6) {
  const [year, month] = lastMonth.split("-").map(Number)
  const months = Array.from({ length: count }, (_, i) => {
    const d = new Date(year!, month! - 1 - (count - 1 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    return { key, month: MONTHS[d.getMonth()]!, billed: 0, collected: 0 }
  })
  const byKey = new Map(months.map((row) => [row.key, row]))
  for (const inv of invoices) {
    const billedRow = inv.status === "void" ? undefined : byKey.get(inv.date.slice(0, 7))
    if (billedRow) billedRow.billed += inv.amount
    const collectedRow = inv.paidAt ? byKey.get(inv.paidAt.slice(0, 7)) : undefined
    if (collectedRow) collectedRow.collected += inv.amount
  }
  return months.map(({ month, billed, collected }) => ({ month, billed, collected }))
}

/** Lo que se debe, de la que vence antes a la que vence después. */
export function upcomingDue(invoices: Invoice[], limit = 5): Invoice[] {
  return invoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit)
}
