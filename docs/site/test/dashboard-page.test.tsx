// El sitio corre en entorno `node` sin jsdom: `renderToString`, igual que showcase.test.ts.
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import DashboardPage from "../app/templates/dashboard/page"

describe("dashboard page", () => {
  const html = renderToString(createElement(DashboardPage))

  it("arma el shell con la barra global, el sidebar y el main", () => {
    expect(html).toContain('data-slot="app-shell-content"')
    expect(html).toContain("Acme Facturación")
    expect(html).toContain("<main")
  })

  it("muestra el encabezado, la acción principal, las métricas y la tabla", () => {
    expect(html).toContain("Facturación y comprobantes")
    expect(html).toContain("Nueva factura")
    expect(html).toContain("Facturación Total")
    expect(html).toContain("FAC-1001")
  })

  it("no duplica el título con un breadcrumb: la barra ya vuelve a Templates", () => {
    expect(html).not.toContain('data-slot="page-header-breadcrumb"')
  })
})
