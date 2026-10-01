import { describe, expect, it } from "vitest"
import { INVOICES_MOCK, filterInvoices, calculateMetrics, type Invoice } from "../app/templates/dashboard/_data/invoices-mock"

describe("invoices data & logic", () => {
  it("trae al menos 8 facturas de ejemplo con datos completos", () => {
    expect(INVOICES_MOCK.length).toBeGreaterThanOrEqual(8)
    const primera = INVOICES_MOCK[0]!
    expect(primera.id).toBeDefined()
    expect(primera.customer).toBeDefined()
    expect(primera.amount).toBeGreaterThan(0)
    expect(primera.status).toMatch(/paid|pending|overdue|void/)
  })

  it("filtra correctamente por término de búsqueda (ID o cliente)", () => {
    const filtradas = filterInvoices(INVOICES_MOCK, "Acme", "all")
    expect(filtradas.every((f) => f.customer.toLowerCase().includes("acme") || f.id.toLowerCase().includes("acme"))).toBe(true)
  })

  it("filtra por estado correctamente", () => {
    const pendientes = filterInvoices(INVOICES_MOCK, "", "pending")
    expect(pendientes.every((f) => f.status === "pending")).toBe(true)
  })

  it("calcula métricas de facturación consistentes", () => {
    const metricas = calculateMetrics(INVOICES_MOCK)
    expect(metricas.totalBilled).toBeGreaterThan(0)
    expect(metricas.pendingCount).toBeGreaterThanOrEqual(0)
    expect(metricas.paidAmount).toBeGreaterThanOrEqual(0)
  })
})
