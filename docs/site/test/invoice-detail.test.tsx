import { createElement } from "react"
import { describe, expect, it } from "vitest"

import { invoiceEvents } from "../app/templates/dashboard/_components/invoice-detail-sheet"
import InvoicesPage from "../app/templates/dashboard/invoices/page"
import type { Invoice } from "../app/templates/dashboard/_data/invoices-mock"
import { renderWithInvoices } from "./dashboard-render"

const base: Invoice = {
  id: "FAC-1",
  customer: "Acme S.A.",
  concept: "Licencias",
  amount: 100,
  date: "2026-09-10",
  dueDate: "2026-10-10",
  status: "pending",
}

describe("historial de una factura", () => {
  it("pendiente: emitida y cuándo vence", () => {
    expect(invoiceEvents(base).map((e) => e.title)).toEqual(["Emitida", "Vence"])
  })
  it("cobrada: emitida y cobrada, con la fecha de cobro", () => {
    const events = invoiceEvents({ ...base, status: "paid", paidAt: "2026-09-30" })
    expect(events.map((e) => [e.title, e.date])).toEqual([["Emitida", "2026-09-10"], ["Cobrada", "2026-09-30"]])
  })
  it("vencida y anulada", () => {
    expect(invoiceEvents({ ...base, status: "overdue" }).at(-1)?.title).toBe("Venció sin cobrar")
    expect(invoiceEvents({ ...base, status: "void", voidedAt: "2026-09-12" }).at(-1)?.title).toBe("Anulada")
  })
})

describe("página de Facturas", () => {
  it("monta sin el detalle abierto", () => {
    expect(renderWithInvoices(createElement(InvoicesPage))).not.toContain("Historial")
  })
})
