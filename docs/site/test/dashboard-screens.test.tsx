// Las pantallas nuevas del template, renderizadas a texto (el sitio corre en entorno `node`).
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import DashboardLayout from "../app/templates/dashboard/layout"
import InvoicesPage from "../app/templates/dashboard/invoices/page"
import LoginPage from "../app/templates/dashboard/login/page"
import SettingsPage from "../app/templates/dashboard/settings/page"
import { LoadError } from "../app/templates/dashboard/_components/load-error"
import { SettingsBilling } from "../app/templates/dashboard/_components/settings-billing"
import { INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"
import { DEFAULT_SETTINGS } from "../app/templates/dashboard/_lib/settings"
import { renderWithInvoices } from "./dashboard-render"

const nav = vi.hoisted(() => ({ pathname: "/templates/dashboard/login" }))
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname, useRouter: () => ({ push: () => {} }), useParams: () => ({ id: "acme-corporation" }) }))

describe("Facturas", () => {
  const html = renderWithInvoices(createElement(InvoicesPage))

  it("avisa las vencidas en un Alert, con la salida para verlas", () => {
    expect(html).toContain('data-slot="alert"')
    expect(html).toMatch(/3 facturas vencidas/)
    expect(html).toContain("Ver vencidas")
  })

  it("elige la vista con un ToggleGroup: tabla, tablero y calendario", () => {
    expect(html).toContain('aria-label="Vista"')
    for (const view of ["Tabla", "Tablero", "Calendario"]) expect(html).toContain(view)
  })

  it("la tabla trae la barra de filtros (FilterBar) con el filtro de estados múltiple", () => {
    expect(html).toContain('data-slot="filter-bar"')
    expect(html).toContain('aria-label="Estado"')
    expect(html).toContain('aria-label="Buscar facturas"')
  })

  it("«Nueva factura» ocupa todo el ancho en el teléfono", () => {
    expect(html).toMatch(/class="[^"]*w-full sm:w-auto[^"]*"[^>]*><span[^>]*>Nueva factura/)
  })
})

describe("Configuración", () => {
  const html = renderWithInvoices(createElement(SettingsPage))

  it("arranca sin cambios: «Todo guardado» y «Guardar» apagado", () => {
    expect(html).toContain("Todo guardado")
    expect(html).toMatch(/<button[^>]*disabled[^>]*type="submit"|<button[^>]*type="submit"[^>]*disabled/)
  })

  it("el cupo del plan y los avisos al cliente viven en Facturación", () => {
    const billing = renderToString(
      createElement(SettingsBilling, { saved: DEFAULT_SETTINGS, draft: DEFAULT_SETTINGS, invoices: INVOICES_MOCK, month: "2026-09", onDraftChange: () => {}, onSave: () => {}, onDiscard: () => {} })
    )
    // El bloque de plan: la PromoCard y un Meter por cupo (facturas, usuarios y espacio).
    expect(billing).toContain("Plan Pro")
    expect(billing).toContain("Cambiar de plan")
    expect(billing).toContain("9 de 12 facturas emitidas")
    for (const cupo of ["Cupo de facturas", "Usuarios", "Espacio"]) expect(billing).toContain(cupo)
    expect(billing.match(/role="meter"/g)).toHaveLength(3)
    expect(billing).toContain("Avisos al cliente")
  })

  it("con cambios, dice que hay cambios sin guardar", () => {
    const dirty = renderToString(
      createElement(SettingsBilling, { saved: DEFAULT_SETTINGS, draft: { ...DEFAULT_SETTINGS, dueDays: "60" }, invoices: INVOICES_MOCK, month: "2026-09", onDraftChange: () => {}, onSave: () => {}, onDiscard: () => {} })
    )
    expect(dirty).toContain("Cambios sin guardar")
  })
})

describe("Inicio de sesión", () => {
  it("es una pantalla de entrar: título, campos y recordarme, sin AppShell", () => {
    const html = renderWithInvoices(createElement(DashboardLayout, null, createElement(LoginPage)))
    expect(html).toContain("Iniciar sesión")
    expect(html).toContain("Recordarme en este equipo")
    expect(html).toContain('autoComplete="current-password"')
    expect(html).not.toContain('data-slot="app-shell"')
    expect(html).not.toContain("Acme Facturación</span>")
  })
})

describe("estado de error", () => {
  it("dice qué no se pudo cargar y ofrece reintentar", () => {
    const html = renderToString(createElement(LoadError, { what: "las facturas", onRetry: () => {} }))
    expect(html).toContain("No pudimos cargar las facturas")
    expect(html).toContain("Reintentar")
    expect(html).toContain('role="alert"')
  })
})
