import { LAST_MONTH } from "../_data/derive"
import { calculateMetrics, type Invoice } from "../_data/invoices-mock"
import { addDays, formatDate, plural, wholeMoney } from "./format"

/** «Hoy» de la demo: fijo, igual que los datos de ejemplo, así la misma pregunta da siempre la misma respuesta. */
export const REFERENCE_DAY = "2026-10-02"

export const SUGGESTIONS = ["¿Qué facturas vencen esta semana?", "Resumime lo cobrado este mes", "Armá un recordatorio para las vencidas", "¿Quién nos debe más?"]

const plain = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
const has = (text: string, words: string[]) => words.some((word) => text.includes(word))
const line = (inv: Invoice) => `${inv.id} · ${inv.customer} · ${wholeMoney.format(inv.amount)} (vence el ${formatDate(inv.dueDate)})`

/**
 * La respuesta simulada del asistente de facturación: reglas sobre las facturas del store, sin modelo ni red
 * y sin leer el reloj. La misma pregunta da siempre la misma respuesta.
 */
export function answerFor(question: string, invoices: Invoice[]): string {
  const q = plain(question)
  const open = invoices.filter((inv) => inv.status === "pending" || inv.status === "overdue")
  const overdue = invoices.filter((inv) => inv.status === "overdue")

  if (has(q, ["recordatorio", "vencida"])) {
    if (overdue.length === 0) return "No hay facturas vencidas: no hace falta mandar recordatorios."
    return [
      `Borrador para ${plural(overdue.length, "factura vencida", "facturas vencidas")}:`,
      ...overdue.map((inv) => `• ${inv.customer}: «Hola, te recordamos que la factura ${inv.id} por ${wholeMoney.format(inv.amount)} venció el ${formatDate(inv.dueDate)}. ¿Podés confirmarnos la fecha de pago?»`),
      "Programalos desde el detalle de cada factura.",
    ].join("\n")
  }

  if (has(q, ["semana", "vencen", "proxim"])) {
    const limit = addDays(REFERENCE_DAY, 7)
    const soon = open.filter((inv) => inv.status === "pending" && inv.dueDate >= REFERENCE_DAY && inv.dueDate <= limit).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    const late = overdue.length > 0 ? `\nAdemás, ${plural(overdue.length, "ya está vencida", "ya están vencidas")}.` : ""
    if (soon.length === 0) return `No hay facturas que venzan entre el ${formatDate(REFERENCE_DAY)} y el ${formatDate(limit)}.${late}`
    return `${plural(soon.length, "factura vence", "facturas vencen")} esta semana:\n${soon.map(line).join("\n")}${late}`
  }

  if (has(q, ["cobrad", "mes", "resum"])) {
    const paid = invoices.filter((inv) => inv.status === "paid" && inv.paidAt?.startsWith(LAST_MONTH))
    const total = paid.reduce((sum, inv) => sum + inv.amount, 0)
    const metrics = calculateMetrics(invoices)
    return `En ${LAST_MONTH} se cobraron ${plural(paid.length, "factura", "facturas")} por ${wholeMoney.format(total)}.\nQueda por cobrar ${wholeMoney.format(metrics.pendingAmount)} (${plural(metrics.pendingCount, "pendiente", "pendientes")}) y ${wholeMoney.format(metrics.overdueAmount)} vencido (${metrics.overdueCount}).`
  }

  if (has(q, ["debe", "deuda", "cliente", "mas"])) {
    const owed = new Map<string, number>()
    for (const inv of open) owed.set(inv.customer, (owed.get(inv.customer) ?? 0) + inv.amount)
    const ranking = [...owed].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3)
    if (ranking.length === 0) return "Nadie debe nada: todo está cobrado."
    return `Los que más deben:\n${ranking.map(([name, amount], index) => `${index + 1}. ${name}: ${wholeMoney.format(amount)}`).join("\n")}`
  }

  return "Puedo contarte qué vence esta semana, resumir lo cobrado, redactar recordatorios para las vencidas o decirte quién debe más. Probá con una de las sugerencias."
}
