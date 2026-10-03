import { describe, expect, it } from "vitest"

import { applyInvoiceFilters, deriveCustomers, filterCustomers, monthlyTotals, NO_FILTERS, notificationsOf, upcomingDue } from "../app/templates/dashboard/_data/derive"
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
      { id: "acme-s-a", name: "Acme S.A.", invoiceCount: 1, billed: 70, outstanding: 70 },
      { id: "nube-digital", name: "Nube Digital", invoiceCount: 3, billed: 150, outstanding: 100 },
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

describe("deriveCustomers con altas", () => {
  it("un cliente dado de alta aparece sin facturas y conserva su contacto", () => {
    const customers = deriveCustomers([invoice({ id: "1", customer: "Nube Digital", amount: 100 })], [
      { id: "stark", name: "Stark Industries", email: "pagos@stark.example", phone: "", city: "NY" },
    ])
    const stark = customers.find((c) => c.name === "Stark Industries")!
    expect(stark).toMatchObject({ id: "stark", email: "pagos@stark.example", invoiceCount: 0, billed: 0, outstanding: 0 })
    expect(customers.map((c) => c.name)).toEqual(["Nube Digital", "Stark Industries"])
  })

  it("las facturas de un cliente con alta se suman a su ficha, no a una nueva", () => {
    const record = { id: "nube", name: "Nube Digital", email: "a@b.example", phone: "", city: "" }
    const customers = deriveCustomers([invoice({ customer: "Nube Digital", amount: 40 })], [record])
    expect(customers).toHaveLength(1)
    expect(customers[0]).toMatchObject({ id: "nube", invoiceCount: 1, billed: 40 })
  })
})

describe("applyInvoiceFilters", () => {
  const rows = [
    invoice({ id: "1", customer: "Acme S.A.", status: "paid", dueDate: "2026-09-10", paidAt: "2026-09-09" }),
    invoice({ id: "2", customer: "Acme S.A.", status: "pending", dueDate: "2026-10-10" }),
    invoice({ id: "3", customer: "Nube Digital", status: "overdue", dueDate: "2026-09-30" }),
  ]
  it("sin filtros devuelve todo", () => {
    expect(applyInvoiceFilters(rows, NO_FILTERS)).toHaveLength(3)
  })
  it("combina estado, cliente y rango de vencimiento (extremos incluidos)", () => {
    expect(applyInvoiceFilters(rows, { ...NO_FILTERS, customer: "Acme S.A." }).map((r) => r.id)).toEqual(["1", "2"])
    expect(applyInvoiceFilters(rows, { ...NO_FILTERS, statuses: ["overdue"] }).map((r) => r.id)).toEqual(["3"])
    expect(applyInvoiceFilters(rows, { ...NO_FILTERS, from: "2026-09-30", to: "2026-10-10" }).map((r) => r.id)).toEqual(["2", "3"])
    expect(applyInvoiceFilters(rows, { ...NO_FILTERS, from: "2026-10-11" })).toEqual([])
  })
  it("varios estados a la vez: suma, no cruza", () => {
    expect(applyInvoiceFilters(rows, { ...NO_FILTERS, statuses: ["paid", "overdue"] }).map((r) => r.id)).toEqual(["1", "3"])
  })
})

describe("notificationsOf", () => {
  it("avisa las vencidas y los últimos tres cobros, lo más nuevo primero", () => {
    const list = notificationsOf(INVOICES_MOCK)
    expect(list.filter((n) => n.tone === "red")).toHaveLength(INVOICES_MOCK.filter((i) => i.status === "overdue").length)
    expect(list.filter((n) => n.tone === "green")).toHaveLength(3)
    expect(new Set(list.map((n) => n.id)).size).toBe(list.length)
    const dates = list.map((n) => n.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })
  it("cobrar una vencida la saca de los avisos", () => {
    const rows = [invoice({ id: "9", status: "overdue" })]
    expect(notificationsOf(rows)).toHaveLength(1)
    expect(notificationsOf([{ ...rows[0]!, status: "paid", paidAt: "2026-10-01" }]).map((n) => n.id)).toEqual(["paid:9"])
  })
})

describe("filterCustomers", () => {
  const rows = deriveCustomers(
    [invoice({ id: "1", customer: "Acme S.A.", status: "pending" }), invoice({ id: "2", customer: "Nube Digital", status: "paid", paidAt: "2026-09-01" })],
    []
  )
  it("busca por nombre sin distinguir mayúsculas", () => {
    expect(filterCustomers(rows, " NUBE ", "all").map((c) => c.name)).toEqual(["Nube Digital"])
  })
  it("separa los que deben de los que están al día", () => {
    expect(filterCustomers(rows, "", "owing").map((c) => c.name)).toEqual(["Acme S.A."])
    expect(filterCustomers(rows, "", "settled").map((c) => c.name)).toEqual(["Nube Digital"])
  })
})
