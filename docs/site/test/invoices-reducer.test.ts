import { describe, expect, it } from "vitest"

import type { Invoice } from "../app/templates/dashboard/_data/invoices-mock"
import { invoicesReducer, isCollectable, nextInvoiceId, type InvoicesState } from "../app/templates/dashboard/_state/invoices-reducer"

const invoice = (id: string, over: Partial<Invoice> = {}): Invoice => ({
  id,
  customer: "Acme S.A.",
  concept: "Licencias",
  amount: 100,
  date: "2026-09-10",
  dueDate: "2026-10-10",
  status: "pending",
  ...over,
})

const state = (invoices: Invoice[]): InvoicesState => ({ invoices, loading: false })

describe("invoicesReducer", () => {
  it("loaded apaga la carga", () => {
    expect(invoicesReducer({ invoices: [], loading: true }, { type: "loaded" }).loading).toBe(false)
  })

  it("add pone la nueva arriba", () => {
    const next = invoicesReducer(state([invoice("FAC-1001")]), { type: "add", invoice: invoice("FAC-1002") })
    expect(next.invoices.map((inv) => inv.id)).toEqual(["FAC-1002", "FAC-1001"])
  })

  it("markPaid cobra solo pendientes y vencidas, con la fecha", () => {
    const next = invoicesReducer(
      state([invoice("a"), invoice("b", { status: "overdue" }), invoice("c", { status: "void", voidedAt: "2026-09-11" })]),
      { type: "markPaid", ids: ["a", "b", "c"], date: "2026-10-02" }
    )
    expect(next.invoices.map((inv) => [inv.status, inv.paidAt])).toEqual([
      ["paid", "2026-10-02"],
      ["paid", "2026-10-02"],
      ["void", undefined],
    ])
  })

  it("restore deja las facturas como estaban (Deshacer)", () => {
    const before = [invoice("a"), invoice("b", { status: "overdue" })]
    const paid = invoicesReducer(state(before), { type: "markPaid", ids: ["a", "b"], date: "2026-10-02" })
    expect(invoicesReducer(paid, { type: "restore", previous: before }).invoices).toEqual(before)
  })

  it("void anula, guarda la fecha y saca la de cobro", () => {
    const next = invoicesReducer(state([invoice("a", { status: "paid", paidAt: "2026-09-30" })]), { type: "void", id: "a", date: "2026-10-02" })
    expect(next.invoices[0]).toMatchObject({ status: "void", voidedAt: "2026-10-02" })
    expect(next.invoices[0]!.paidAt).toBeUndefined()
  })
})

describe("helpers", () => {
  it("nextInvoiceId sigue al número más alto", () => {
    expect(nextInvoiceId([invoice("FAC-1003"), invoice("FAC-1024")])).toBe("FAC-1025")
    expect(nextInvoiceId([])).toBe("FAC-1001")
  })

  it("isCollectable: solo lo que se debe", () => {
    expect(isCollectable(invoice("a"))).toBe(true)
    expect(isCollectable(invoice("a", { status: "overdue" }))).toBe(true)
    expect(isCollectable(invoice("a", { status: "paid", paidAt: "2026-09-30" }))).toBe(false)
    expect(isCollectable(invoice("a", { status: "void", voidedAt: "2026-09-30" }))).toBe(false)
  })
})
