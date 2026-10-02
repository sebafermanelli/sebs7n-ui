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
})
