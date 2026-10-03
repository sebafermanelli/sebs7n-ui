// El sitio corre en entorno `node` sin jsdom: `renderToString`, igual que los demás tests del dashboard.
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { DashboardHeader } from "../app/templates/dashboard/_components/dashboard-header"
import { TeamPanel } from "../app/templates/dashboard/_components/team-panel"
import { notificationsOf } from "../app/templates/dashboard/_data/derive"
import { INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"
import { TEAM_MOCK } from "../app/templates/dashboard/_data/team-mock"
import CustomerDetailPage from "../app/templates/dashboard/customers/[id]/page"
import CustomersPage from "../app/templates/dashboard/customers/page"
import { navigationSequences, SHORTCUTS, shortcutOf } from "../app/templates/dashboard/_lib/shortcuts"
import { renderWithInvoices } from "./dashboard-render"

const nav = vi.hoisted(() => ({ id: "acme-corporation" }))
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: () => {} }), useParams: () => ({ id: nav.id }) }))

describe("Clientes", () => {
  const html = renderWithInvoices(createElement(CustomersPage))

  it("arranca en lista, con el selector de vista y el alta", () => {
    expect(html).toContain('aria-label="Vista"')
    expect(html).toContain('aria-label="Lista"')
    expect(html).toContain('aria-label="Tarjetas"')
    expect(html).toContain("Nuevo cliente")
  })

  it("cada fila lleva a la ficha del cliente (la primera página; el resto, paginado)", () => {
    expect(html).toContain('href="/templates/dashboard/customers/acme-corporation"')
    expect(html).toContain('href="/templates/dashboard/customers/soylent-logistics"')
    expect(html).not.toContain('href="/templates/dashboard/customers/wayne-enterprises"')
    expect(html).toContain('data-slot="pagination"')
  })

  it("trae la búsqueda, el filtro de saldo y la vista en una barra", () => {
    expect(html).toContain('data-slot="filter-bar"')
    expect(html).toContain('aria-label="Saldo"')
    expect(html).toContain("Con saldo")
  })
})

describe("ficha de un cliente", () => {
  it("muestra sus números, sus facturas y su contacto", () => {
    nav.id = "acme-corporation"
    const html = renderWithInvoices(createElement(CustomerDetailPage))
    expect(html).toContain("Acme Corporation")
    expect(html).toContain("pagos@acme.example")
    expect(html).toContain("Por cobrar")
    for (const inv of INVOICES_MOCK.filter((i) => i.customer === "Acme Corporation")) expect(html).toContain(inv.id)
    expect(html).not.toContain("Globex Industries")
    expect(html).toContain("Nueva factura")
  })

  it("un id que no existe dice que no lo encuentra y vuelve a Clientes", () => {
    nav.id = "no-existe"
    const html = renderWithInvoices(createElement(CustomerDetailPage))
    expect(html).toContain("No encontramos a ese cliente")
    expect(html).toContain('href="/templates/dashboard/customers"')
  })
})

describe("avisos", () => {
  it("la campana dice cuántos hay sin leer", () => {
    const unread = notificationsOf(INVOICES_MOCK).length
    expect(unread).toBeGreaterThan(0)
    expect(renderWithInvoices(createElement(DashboardHeader))).toContain(`aria-label="Avisos, ${unread} sin leer"`)
  })
})

describe("equipo", () => {
  const html = renderWithInvoices(createElement(TeamPanel))

  it("lista a cada miembro con su correo, y solo el propietario no se puede quitar", () => {
    for (const member of TEAM_MOCK) expect(html).toContain(member.email)
    expect(html).toContain("Propietario")
    for (const member of TEAM_MOCK.filter((m) => m.role !== "owner")) expect(html).toContain(`aria-label="Quitar a ${member.name}"`)
    expect(html).not.toContain('aria-label="Quitar a Administración"')
  })

  it("trae la acción de invitar", () => {
    expect(html).toContain("Invitar")
  })
})

describe("atajos", () => {
  it("cada secuencia de navegación es única y lleva a una sección", () => {
    const go = SHORTCUTS.filter((s) => s.href)
    expect(new Set(go.map((s) => s.keys.join(" "))).size).toBe(go.length)
    for (const s of go) expect(s.href).toMatch(/^\/templates\/dashboard/)
    for (const s of go) expect(s.sequence).toBe(true)
  })

  it("el mapa de `useKeySequence` navega a la ruta de cada secuencia", () => {
    const visited: string[] = []
    const map = navigationSequences((href) => visited.push(href))
    expect(Object.keys(map)).toEqual(expect.arrayContaining(["g i", "g f", "g c", "g s"]))
    map["g f"]!()
    expect(visited).toEqual(["/templates/dashboard/invoices"])
  })

  it("shortcutOf escribe «g luego f» para la sección con atajo y nada para la que no", () => {
    expect(shortcutOf("/templates/dashboard/invoices")).toBe("g luego f")
    expect(shortcutOf("/otra")).toBeUndefined()
  })
})
