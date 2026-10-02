// El sitio corre en entorno `node` sin jsdom: `renderToString`, igual que showcase.test.ts.
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { SearchProvider } from "../app/_components/search"
import TemplatesPage from "../app/templates/page"

// Fuera del router de Next no hay pathname: el SiteHeader lo necesita para marcar el link activo.
vi.mock("next/navigation", () => ({ usePathname: () => "/templates" }))

describe("templates gallery page", () => {
  // El `SearchButton` del SiteHeader necesita el provider que en el sitio pone `providers.tsx`.
  const html = renderToString(createElement(SearchProvider, null, createElement(TemplatesPage)))

  it("lista los cuatro arquetipos", () => {
    expect(html).toContain("Arquetipos de aplicación")
    for (const title of ["SaaS / Dashboard operativo", "Landing page", "Consola PaaS / Cloud", "Blog / Editorial"]) {
      expect(html).toContain(title)
    }
  })

  it("solo el disponible tiene link, y es el único acento sólido", () => {
    expect(html).toContain('href="/templates/dashboard"')
    expect(html.match(/bg-brand-700/g)).toHaveLength(1)
  })
})
