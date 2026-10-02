import { describe, expect, it } from "vitest"

import { deriveCustomers, monthlyTotals, upcomingDue } from "../app/templates/dashboard/_data/derive"
import { INVOICES_MOCK, type Invoice } from "../app/templates/dashboard/_data/invoices-mock"
import { formatDate } from "../app/templates/dashboard/_lib/format"

const invoice = (over: Partial<Invoice>): Invoice => ({
  id: "FAC-1",
  customer: "Acme S.A.",
  concept: "Licencias",
  amount: 100,
  date: "2026-09-10",
  dueDate: "2026-10-10",
  status: "pending",
  ...over,
})

describe("mock de facturas", () => {
  it("trae 24, con ids únicos y la fecha de cada estado", () => {
    expect(INVOICES_MOCK).toHaveLength(24)
    expect(new Set(INVOICES_MOCK.map((inv) => inv.id)).size).toBe(24)
    for (const inv of INVOICES_MOCK) {
      expect(Boolean(inv.paidAt)).toBe(inv.status === "paid")
      expect(Boolean(inv.voidedAt)).toBe(inv.status === "void")
    }
  })
})

describe("deriveCustomers", () => {
  it("agrupa por cliente: cuenta todas, factura sin anuladas, debe pendientes y vencidas", () => {
    const customers = deriveCustomers([
      invoice({ id: "1", customer: "Nube Digital", amount: 100, status: "pending" }),
      invoice({ id: "2", customer: "Nube Digital", amount: 50, status: "paid", paidAt: "2026-09-20" }),
      invoice({ id: "3", customer: "Nube Digital", amount: 30, status: "void", voidedAt: "2026-09-21" }),
      invoice({ id: "4", customer: "Acme S.A.", amount: 70, status: "overdue" }),
    ])
    expect(customers).toEqual([
      { name: "Acme S.A.", invoiceCount: 1, billed: 70, outstanding: 70 },
      { name: "Nube Digital", invoiceCount: 3, billed: 150, outstanding: 100 },
    ])
  })
})

describe("monthlyTotals", () => {
  it("factura por mes de emisión (sin anuladas) y cobra por mes de cobro", () => {
    const rows = monthlyTotals(
      [
        invoice({ amount: 100, date: "2026-09-10", status: "paid", paidAt: "2026-10-02" }),
        invoice({ amount: 40, date: "2026-09-12", status: "void", voidedAt: "2026-09-13" }),
      ],
      "2026-10",
      2
    )
    expect(rows).toEqual([
      { month: "Sep", billed: 100, collected: 0 },
      { month: "Oct", billed: 0, collected: 100 },
    ])
  })
})

describe("upcomingDue", () => {
  it("solo lo que se debe, de la que vence antes a la que vence después", () => {
    const rows = upcomingDue([
      invoice({ id: "a", dueDate: "2026-10-20" }),
      invoice({ id: "b", dueDate: "2026-09-01", status: "overdue" }),
      invoice({ id: "c", dueDate: "2026-08-01", status: "paid", paidAt: "2026-08-01" }),
      invoice({ id: "d", dueDate: "2026-10-05" }),
    ], 2)
    expect(rows.map((inv) => inv.id)).toEqual(["b", "d"])
  })
})

describe("formatDate", () => {
  it("lee `YYYY-MM-DD` como fecha local, no UTC", () => {
    expect(formatDate("2026-10-01")).toContain("1 de oct")
  })
})
