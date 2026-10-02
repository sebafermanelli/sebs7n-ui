// El sitio corre en entorno `node` sin jsdom, igual que todos los tests del sitio.
// Usamos `renderToString` en lugar de `@testing-library/react` para evitar el
// problema de dos instancias de React (la del repo raíz y la del sitio).
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { MetricsGrid } from "../app/templates/dashboard/_components/metrics-grid"
import { calculateMetrics, INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"

describe("dashboard subcomponents", () => {
  it("MetricsGrid renderiza las tarjetas con valores calculados", () => {
    const metrics = calculateMetrics(INVOICES_MOCK)
    const html = renderToString(createElement(MetricsGrid, { metrics }))
    for (const label of ["Facturación total", "Pendientes de cobro", "Cobrado", "Facturas vencidas"]) {
      expect(html).toContain(label)
    }
  })

  it("MetricsGrid cargando: los rótulos quedan, las cifras no", () => {
    const html = renderToString(createElement(MetricsGrid, { metrics: calculateMetrics(INVOICES_MOCK), loading: true }))
    expect(html).toContain("Facturación total")
    expect(html).toContain('data-slot="skeleton"')
    expect(html).not.toContain("US$")
  })
})
