import { slugify, type CustomerRecord } from "./customers-mock"
import type { Invoice, InvoiceStatus } from "./invoices-mock"

export interface Customer {
  /** Para la URL del detalle. */
  id: string
  name: string
  email?: string
  phone?: string
  city?: string
  invoiceCount: number
  /** Lo facturado sin las anuladas. */
  billed: number
  /** Lo que falta cobrar: pendientes y vencidas. */
  outstanding: number
}

/**
 * Los clientes: los del alta (`records`, aunque todavía no tengan facturas) más los que solo aparecen
 * en una factura. Los números siempre salen de las facturas.
 */
export function deriveCustomers(invoices: Invoice[], records: CustomerRecord[] = []): Customer[] {
  const byName = new Map<string, Customer>(
    records.map((record) => [record.name, { ...record, invoiceCount: 0, billed: 0, outstanding: 0 }])
  )
  for (const inv of invoices) {
    const customer = byName.get(inv.customer) ?? { id: slugify(inv.customer), name: inv.customer, invoiceCount: 0, billed: 0, outstanding: 0 }
    customer.invoiceCount += 1
    if (inv.status !== "void") customer.billed += inv.amount
    if (inv.status === "pending" || inv.status === "overdue") customer.outstanding += inv.amount
    byName.set(inv.customer, customer)
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "es"))
}

/** El último mes con facturas emitidas en el mock: los gráficos no dependen de la fecha de hoy y no se vacían con el tiempo. */
export const LAST_MONTH = "2026-09"

export type BalanceFilter = "all" | "owing" | "settled"

/** Los clientes que coinciden con la búsqueda (por nombre) y con el filtro de saldo. */
export function filterCustomers(customers: Customer[], query: string, balance: BalanceFilter): Customer[] {
  const needle = query.trim().toLocaleLowerCase("es")
  return customers.filter(
    (customer) =>
      (!needle || customer.name.toLocaleLowerCase("es").includes(needle)) &&
      (balance === "all" || (balance === "owing" ? customer.outstanding > 0 : customer.outstanding === 0))
  )
}

/** La variación del último valor de una serie contra el anterior, en %: `null` sin base para comparar. */
export function lastChange(values: number[]): number | null {
  const [previous, last] = values.slice(-2)
  if (previous == null || last == null || previous === 0) return null
  return ((last - previous) / previous) * 100
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

/** Los períodos que elige el menú «…» de una métrica: 6 meses, 12 meses o lo que va del año. */
export type MetricPeriod = "6m" | "12m" | "ytd"
export const METRIC_PERIODS: { id: MetricPeriod; label: string }[] = [
  { id: "6m", label: "6 meses" },
  { id: "12m", label: "12 meses" },
  { id: "ytd", label: "Este año" },
]

/** Cuántos meses abarca un período que termina en `lastMonth`: «Este año» es de enero al último mes (mínimo 2, para que haya curva). */
export function periodMonths(period: MetricPeriod, lastMonth: string): number {
  if (period === "6m") return 6
  if (period === "12m") return 12
  return Math.max(2, Number(lastMonth.split("-")[1]))
}

/** El rótulo de cada mes de los `count` que terminan en `lastMonth`: «Sep 2026». */
export function monthLabels(lastMonth: string, count: number): string[] {
  const [year, month] = lastMonth.split("-").map(Number)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(year!, month! - 1 - (count - 1 - i), 1)
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  })
}

/** Lo que sumó un estado por mes de emisión, de los `count` meses que terminan en `lastMonth`. */
export function statusSeries(invoices: Invoice[], lastMonth: string, status: Invoice["status"], count = 6): number[] {
  const [year, month] = lastMonth.split("-").map(Number)
  const keys = Array.from({ length: count }, (_, i) => {
    const d = new Date(year!, month! - 1 - (count - 1 - i), 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  })
  return keys.map((key) => invoices.filter((inv) => inv.status === status && inv.date.slice(0, 7) === key).reduce((sum, inv) => sum + inv.amount, 0))
}

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

export interface InvoiceFilters {
  /** Los estados a mostrar; vacío = todos. */
  statuses: InvoiceStatus[]
  /** El nombre del cliente, o `all`. */
  customer: string
  /** `YYYY-MM-DD`, sobre el vencimiento. Cualquiera de las dos puntas puede faltar. */
  from: string | null
  to: string | null
}

export const NO_FILTERS: InvoiceFilters = { statuses: [], customer: "all", from: null, to: null }

/** Los filtros de la tabla de facturas. Las fechas `YYYY-MM-DD` se comparan como texto: ordenan igual. */
export function applyInvoiceFilters(invoices: Invoice[], filters: InvoiceFilters): Invoice[] {
  return invoices.filter(
    (inv) =>
      (filters.statuses.length === 0 || filters.statuses.includes(inv.status)) &&
      (filters.customer === "all" || inv.customer === filters.customer) &&
      (!filters.from || inv.dueDate >= filters.from) &&
      (!filters.to || inv.dueDate <= filters.to)
  )
}

export interface AppNotification {
  id: string
  title: string
  description: string
  /** El punto de la fila; el texto ya lo dice, el color solo lo refuerza. */
  tone: "red" | "green"
  date: string
}

/** Los avisos salen de las facturas: las vencidas y los últimos tres cobros. Cobrar una vencida la saca. */
export function notificationsOf(invoices: Invoice[]): AppNotification[] {
  const overdue = invoices
    .filter((inv) => inv.status === "overdue")
    .map<AppNotification>((inv) => ({
      id: `overdue:${inv.id}`,
      title: `Factura ${inv.id} vencida`,
      description: `${inv.customer} no pagó antes del ${inv.dueDate.split("-").reverse().join("/")}.`,
      tone: "red",
      date: inv.dueDate,
    }))
  const paid = invoices
    .filter((inv) => inv.status === "paid" && inv.paidAt)
    .sort((a, b) => b.paidAt!.localeCompare(a.paidAt!))
    .slice(0, 3)
    .map<AppNotification>((inv) => ({
      id: `paid:${inv.id}`,
      title: `Cobro de ${inv.customer}`,
      description: `Se registró el pago de ${inv.id}.`,
      tone: "green",
      date: inv.paidAt!,
    }))
  return [...overdue, ...paid].sort((a, b) => b.date.localeCompare(a.date))
}

/** Las cuatro series de Inicio para un período, con el rótulo de cada mes. Determinista: sale solo de las facturas. */
export function metricSeries(invoices: Invoice[], lastMonth: string, period: MetricPeriod) {
  const count = periodMonths(period, lastMonth)
  const months = monthlyTotals(invoices, lastMonth, count)
  return {
    labels: monthLabels(lastMonth, count),
    billed: months.map((month) => month.billed),
    collected: months.map((month) => month.collected),
    pending: statusSeries(invoices, lastMonth, "pending", count),
    overdue: statusSeries(invoices, lastMonth, "overdue", count),
  }
}
