export type InvoiceStatus = "paid" | "pending" | "overdue" | "void"

export interface Invoice {
  id: string
  customer: string
  concept: string
  amount: number
  date: string
  dueDate: string
  status: InvoiceStatus
  /** Cuándo se cobró (`YYYY-MM-DD`). Solo en las cobradas: el historial del detalle y el gráfico lo usan. */
  paidAt?: string
  /** Cuándo se anuló (`YYYY-MM-DD`). Solo en las anuladas. */
  voidedAt?: string
  /** Etiquetas que pone quien factura («urgente», «anual»): texto libre, sin repetidas. */
  tags?: string[]
  /** El recordatorio programado (`YYYY-MM-DDTHH:mm`, hora local). Solo en las que se deben. */
  reminderAt?: string
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
    tags: ["anual"],
  },
  {
    id: "FAC-1002",
    customer: "Globex Industries",
    concept: "Consultoría y Soporte Dedicado",
    amount: 8200,
    date: "2026-09-01",
    dueDate: "2026-10-01",
    status: "paid",
    paidAt: "2026-09-29",
  },
  {
    id: "FAC-1003",
    customer: "Initech Soluciones",
    concept: "Licencias Adicionales (50 puestos)",
    amount: 3600,
    date: "2026-08-20",
    dueDate: "2026-09-20",
    status: "overdue",
    tags: ["urgente"],
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
    paidAt: "2026-09-30",
  },
  {
    id: "FAC-1006",
    customer: "Hooli Systems",
    concept: "Mantenimiento Preventivo Q3",
    amount: 11200,
    date: "2026-08-15",
    dueDate: "2026-09-15",
    status: "overdue",
    tags: ["urgente", "mantenimiento"],
  },
  {
    id: "FAC-1007",
    customer: "Massive Dynamic",
    concept: "Auditoría de Seguridad y Tokens",
    amount: 5500,
    date: "2026-09-22",
    dueDate: "2026-10-22",
    status: "paid",
    paidAt: "2026-09-30",
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
  { id: "FAC-1009", customer: "Acme Corporation", concept: "Suscripción Enterprise mensual", amount: 4200, date: "2026-04-05", dueDate: "2026-05-05", status: "paid", paidAt: "2026-04-28" },
  { id: "FAC-1010", customer: "Globex Industries", concept: "Horas de consultoría (abril)", amount: 3100, date: "2026-04-18", dueDate: "2026-05-18", status: "paid", paidAt: "2026-05-10" },
  { id: "FAC-1011", customer: "Initech Soluciones", concept: "Licencias anuales", amount: 7800, date: "2026-05-02", dueDate: "2026-06-02", status: "paid", paidAt: "2026-05-30" },
  { id: "FAC-1012", customer: "Soylent Logistics", concept: "Infraestructura cloud (mayo)", amount: 9100, date: "2026-05-20", dueDate: "2026-06-20", status: "paid", paidAt: "2026-06-15" },
  { id: "FAC-1013", customer: "Umbrella Health", concept: "Soporte prioritario", amount: 2600, date: "2026-06-03", dueDate: "2026-07-03", status: "paid", paidAt: "2026-06-30" },
  { id: "FAC-1014", customer: "Hooli Systems", concept: "Migración de datos", amount: 12400, date: "2026-06-14", dueDate: "2026-07-14", status: "paid", paidAt: "2026-07-10" },
  { id: "FAC-1015", customer: "Massive Dynamic", concept: "Capacitación del equipo", amount: 1900, date: "2026-06-25", dueDate: "2026-07-25", status: "void", voidedAt: "2026-06-27" },
  { id: "FAC-1016", customer: "Wayne Enterprises", concept: "Plataforma PaaS (junio)", amount: 18000, date: "2026-07-01", dueDate: "2026-08-01", status: "paid", paidAt: "2026-07-29" },
  { id: "FAC-1017", customer: "Acme Corporation", concept: "Suscripción Enterprise mensual", amount: 4200, date: "2026-07-05", dueDate: "2026-08-05", status: "paid", paidAt: "2026-08-02" },
  { id: "FAC-1018", customer: "Globex Industries", concept: "Horas de consultoría (julio)", amount: 4700, date: "2026-07-19", dueDate: "2026-08-19", status: "paid", paidAt: "2026-08-18" },
  { id: "FAC-1019", customer: "Initech Soluciones", concept: "Puestos adicionales", amount: 2400, date: "2026-08-04", dueDate: "2026-09-04", status: "paid", paidAt: "2026-09-01" },
  { id: "FAC-1020", customer: "Soylent Logistics", concept: "Infraestructura cloud (agosto)", amount: 9300, date: "2026-08-20", dueDate: "2026-09-20", status: "overdue" },
  { id: "FAC-1021", customer: "Umbrella Health", concept: "Integración de pagos", amount: 5200, date: "2026-08-28", dueDate: "2026-09-28", status: "paid", paidAt: "2026-09-25" },
  { id: "FAC-1022", customer: "Hooli Systems", concept: "Auditoría de accesos", amount: 3900, date: "2026-09-08", dueDate: "2026-10-08", status: "pending" },
  { id: "FAC-1023", customer: "Massive Dynamic", concept: "Soporte trimestral", amount: 6100, date: "2026-09-18", dueDate: "2026-10-18", status: "pending" },
  { id: "FAC-1024", customer: "Wayne Enterprises", concept: "Plataforma PaaS (septiembre)", amount: 18000, date: "2026-09-30", dueDate: "2026-10-30", status: "pending" },
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
      inv.concept.toLowerCase().includes(q) ||
      (inv.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
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
