import { createElement } from "react"
import { describe, expect, it } from "vitest"

import DashboardHomePage from "../app/templates/dashboard/page"
import InvoicesPage from "../app/templates/dashboard/invoices/page"
import { renderWithInvoices } from "./dashboard-render"

describe("páginas del dashboard", () => {
  it("Inicio muestra su encabezado, la acción principal y las métricas", () => {
    const html = renderWithInvoices(createElement(DashboardHomePage))
    expect(html).toContain("Inicio")
    expect(html).toContain("Nueva factura")
    expect(html).toContain("Facturación total")
  })

  it("Facturas muestra la tabla", () => {
    const html = renderWithInvoices(createElement(InvoicesPage))
    expect(html).toContain("Facturas")
    expect(html).toContain("FAC-1001")
  })
  it("Inicio trae el gráfico (en esqueleto hasta hidratar) y lo que vence pronto", () => {
    const html = renderWithInvoices(createElement(DashboardHomePage))
    expect(html).toContain("Facturado y cobrado")
    expect(html).toContain('data-slot="skeleton"')
    expect(html).toContain("Vencen pronto")
    expect(html).toContain('href="/templates/dashboard/invoices"')
  })

  it("mientras carga, Inicio muestra esqueletos en vez de cifras", () => {
    const html = renderWithInvoices(createElement(DashboardHomePage), true)
    expect(html).not.toContain("US$")
  })
})
