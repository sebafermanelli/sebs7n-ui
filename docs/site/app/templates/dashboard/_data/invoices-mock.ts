export type InvoiceStatus = "paid" | "pending" | "overdue" | "void"

export interface Invoice {
  id: string
  customer: string
  concept: string
  amount: number
  date: string
  dueDate: string
  status: InvoiceStatus
}

export const INVOICES_MOCK: Invoice[] = [
  {
    id: "FAC-1001",
    customer: "Acme Corporation",
    concept: "Suscripción Enterprise Anual",
    amount: 14500,
    date: "2026-09-15",
    dueDate: "2026-10-15",
    status: "pending",
  },
  {
    id: "FAC-1002",
    customer: "Globex Industries",
    concept: "Consultoría y Soporte Dedicado",
    amount: 8200,
    date: "2026-09-01",
    dueDate: "2026-10-01",
    status: "paid",
  },
  {
    id: "FAC-1003",
    customer: "Initech Soluciones",
    concept: "Licencias Adicionales (50 puestos)",
    amount: 3600,
    date: "2026-08-20",
    dueDate: "2026-09-20",
    status: "overdue",
  },
  {
    id: "FAC-1004",
    customer: "Soylent Logistics",
    concept: "Infraestructura Cloud Mensual",
    amount: 9800,
    date: "2026-09-28",
    dueDate: "2026-10-28",
    status: "pending",
  },
  {
    id: "FAC-1005",
    customer: "Umbrella Health",
    concept: "Integración de API y Webhooks",
    amount: 6400,
    date: "2026-09-10",
    dueDate: "2026-10-10",
    status: "paid",
  },
  {
    id: "FAC-1006",
    customer: "Hooli Systems",
    concept: "Mantenimiento Preventivo Q3",
    amount: 11200,
    date: "2026-08-15",
    dueDate: "2026-09-15",
    status: "overdue",
  },
  {
    id: "FAC-1007",
    customer: "Massive Dynamic",
    concept: "Auditoría de Seguridad y Tokens",
    amount: 5500,
    date: "2026-09-22",
    dueDate: "2026-10-22",
    status: "paid",
  },
  {
    id: "FAC-1008",
    customer: "Wayne Enterprises",
    concept: "Plataforma PaaS Plan Custom",
    amount: 22000,
    date: "2026-09-25",
    dueDate: "2026-10-25",
    status: "pending",
  },
]

export function filterInvoices(
  invoices: Invoice[],
  search: string,
  status: InvoiceStatus | "all"
): Invoice[] {
  const q = search.trim().toLowerCase()
  return invoices.filter((inv) => {
    const matchesSearch =
      !q ||
      inv.id.toLowerCase().includes(q) ||
      inv.customer.toLowerCase().includes(q) ||
      inv.concept.toLowerCase().includes(q)
    const matchesStatus = status === "all" || inv.status === status
    return matchesSearch && matchesStatus
  })
}

export function calculateMetrics(invoices: Invoice[]) {
  const active = invoices.filter((i) => i.status !== "void")
  const totalBilled = active.reduce((acc, curr) => acc + curr.amount, 0)
  const paid = active.filter((i) => i.status === "paid")
  const paidAmount = paid.reduce((acc, curr) => acc + curr.amount, 0)
  const pending = active.filter((i) => i.status === "pending")
  const pendingCount = pending.length
  const pendingAmount = pending.reduce((acc, curr) => acc + curr.amount, 0)
  const overdue = active.filter((i) => i.status === "overdue")
  const overdueCount = overdue.length
  const overdueAmount = overdue.reduce((acc, curr) => acc + curr.amount, 0)

  return {
    totalBilled,
    paidAmount,
    pendingCount,
    pendingAmount,
    overdueCount,
    overdueAmount,
  }
}
