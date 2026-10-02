import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import DashboardLayout from "../app/templates/dashboard/layout"

const nav = vi.hoisted(() => ({ pathname: "/templates/dashboard/invoices" }))
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }))

const render = () => renderToString(createElement(DashboardLayout, null, createElement("p", null, "contenido")))

describe("layout del dashboard", () => {
  it("arma el shell con la barra, el sidebar y el contenido", () => {
    const html = render()
    expect(html).toContain("Acme Facturación")
    expect(html).toContain("contenido")
  })

  it("el sidebar navega a las cuatro secciones y marca la actual", () => {
    const html = render()
    for (const href of ["/templates/dashboard", "/templates/dashboard/invoices", "/templates/dashboard/customers", "/templates/dashboard/settings"]) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(html).toMatch(/aria-current="page"[^>]*href="\/templates\/dashboard\/invoices"|href="\/templates\/dashboard\/invoices"[^>]*aria-current="page"/)
  })

  it("trae la vuelta a la galería para el teléfono", () => {
    expect(render()).toContain('href="/templates"')
  })
})
describe("sin galería", () => {
  it("con GALLERY_PATH en null no hay vuelta a Templates", async () => {
    vi.resetModules()
    vi.doMock("../app/templates/dashboard/_lib/routes", async (importOriginal) => ({
      ...(await importOriginal<typeof import("../app/templates/dashboard/_lib/routes")>()),
      GALLERY_PATH: null,
    }))
    const { default: Layout } = await import("../app/templates/dashboard/layout")
    const html = renderToString(createElement(Layout, null, createElement("p", null, "contenido")))
    expect(html).not.toContain('href="/templates"')
    expect(html).toContain("Acme Facturación")
    vi.doUnmock("../app/templates/dashboard/_lib/routes")
  })
})
