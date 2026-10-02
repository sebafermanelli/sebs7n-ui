// El sitio corre en entorno `node` sin jsdom, igual que todos los tests del sitio.
// Usamos `renderToString` en lugar de `@testing-library/react` para evitar el
// problema de dos instancias de React (la del repo raíz y la del sitio).
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { MetricsGrid } from "../app/templates/dashboard/_components/metrics-grid"
import { InvoiceFilters } from "../app/templates/dashboard/_components/invoice-filters"
import { calculateMetrics, INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"

describe("dashboard subcomponents", () => {
  it("MetricsGrid renderiza las tarjetas con valores calculados", () => {
    const metrics = calculateMetrics(INVOICES_MOCK)
    const html = renderToString(createElement(MetricsGrid, { metrics }))
    expect(html).toContain("Facturación total")
    expect(html).toContain("Pendientes de cobro")
    expect(html).toContain("Cobrado este período")
    expect(html).toContain("Facturas vencidas")
  })

  it("InvoiceFilters muestra el campo de búsqueda", () => {
    const html = renderToString(
      createElement(InvoiceFilters, {
        search: "",
        onSearchChange: () => {},
        statusFilter: "all",
        onStatusFilterChange: () => {},
        totalCount: 8,
      })
    )
    expect(html).toContain("Buscar factura o cliente")
    expect(html).toContain("Mostrando")
  })
})
