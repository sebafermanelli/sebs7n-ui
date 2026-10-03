import { describe, expect, it } from "vitest"

import { CUSTOMERS_MOCK, slugify } from "../app/templates/dashboard/_data/customers-mock"
import { INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"
import { initials, nameFromEmail, TEAM_MOCK } from "../app/templates/dashboard/_data/team-mock"
import { DEFAULT_SETTINGS } from "../app/templates/dashboard/_lib/settings"
import { downloadCsv, invoicesToCsv } from "../app/templates/dashboard/_lib/csv"
import { nextMemberId, uniqueCustomerId, workspaceReducer, type WorkspaceState } from "../app/templates/dashboard/_state/workspace-reducer"

const start: WorkspaceState = { customers: CUSTOMERS_MOCK, team: TEAM_MOCK, readIds: [], settings: DEFAULT_SETTINGS }

describe("clientes del ejemplo", () => {
  it("cubren todos los de las facturas, con ids únicos y aptos para la URL", () => {
    const names = new Set(CUSTOMERS_MOCK.map((c) => c.name))
    for (const inv of INVOICES_MOCK) expect(names.has(inv.customer)).toBe(true)
    expect(new Set(CUSTOMERS_MOCK.map((c) => c.id)).size).toBe(CUSTOMERS_MOCK.length)
    for (const c of CUSTOMERS_MOCK) expect(c.id).toMatch(/^[a-z0-9-]+$/)
  })

  it("slugify quita acentos y signos", () => {
    expect(slugify("  Cañuelas & Hijos S.A. ")).toBe("canuelas-hijos-s-a")
    expect(slugify("Nube Digital")).toBe("nube-digital")
  })
})

describe("workspaceReducer", () => {
  it("el alta de un cliente lo suma ordenado por nombre", () => {
    const next = workspaceReducer(start, { type: "addCustomer", customer: { id: "aaa", name: "Aaa", email: "a@b.example", phone: "", city: "" } })
    expect(next.customers[0]!.name).toBe("Aaa")
    expect(next.customers).toHaveLength(CUSTOMERS_MOCK.length + 1)
  })

  it("un id repetido recibe un número", () => {
    expect(uniqueCustomerId(CUSTOMERS_MOCK, "acme-corporation")).toBe("acme-corporation-2")
    expect(uniqueCustomerId(CUSTOMERS_MOCK, "otro")).toBe("otro")
    expect(uniqueCustomerId([], "")).toBe("cliente")
  })

  it("invitar suma un miembro con id nuevo y quitarlo lo saca; «restoreTeam» deshace", () => {
    const member = { id: nextMemberId(start.team), name: "Ana Paz", email: "ana.paz@acme.com", role: "member" as const }
    const invited = workspaceReducer(start, { type: "addMember", member })
    expect(invited.team.map((m) => m.id)).toContain(member.id)
    expect(new Set(invited.team.map((m) => m.id)).size).toBe(invited.team.length)
    const removed = workspaceReducer(invited, { type: "removeMember", id: member.id })
    expect(removed.team).toEqual(start.team)
    expect(workspaceReducer(removed, { type: "restoreTeam", team: invited.team }).team).toEqual(invited.team)
  })

  it("el propietario no se quita ni cambia de rol", () => {
    const owner = TEAM_MOCK.find((m) => m.role === "owner")!
    expect(workspaceReducer(start, { type: "removeMember", id: owner.id }).team).toEqual(start.team)
    expect(workspaceReducer(start, { type: "setRole", id: owner.id, role: "viewer" }).team).toEqual(start.team)
  })

  it("cambia el rol de un miembro", () => {
    const next = workspaceReducer(start, { type: "setRole", id: "m-3", role: "admin" })
    expect(next.team.find((m) => m.id === "m-3")!.role).toBe("admin")
  })

  it("marcar leídos no repite ids", () => {
    const once = workspaceReducer(start, { type: "read", ids: ["a", "b"] })
    expect(workspaceReducer(once, { type: "read", ids: ["b", "c"] }).readIds).toEqual(["a", "b", "c"])
  })
})

describe("equipo", () => {
  it("el nombre provisorio sale del correo y las iniciales de dos palabras", () => {
    expect(nameFromEmail("lucia.perez@acme.com")).toBe("Lucia Perez")
    expect(initials("Lucía Fernández Gómez")).toBe("LF")
    expect(initials("Administración")).toBe("A")
  })
})

describe("CSV de facturas", () => {
  it("lleva cabecera, una fila por factura y los montos como número", () => {
    const lines = invoicesToCsv(INVOICES_MOCK.slice(0, 2)).split("\n")
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe("Número,Cliente,Concepto,Monto (USD),Estado,Emisión,Vencimiento")
    expect(lines[1]!.startsWith("FAC-1001,")).toBe(true)
  })

  it("entrecomilla lo que trae coma o comillas y duplica las comillas", () => {
    const csv = invoicesToCsv([{ ...INVOICES_MOCK[0]!, concept: 'Licencias, "pro"' }])
    expect(csv).toContain('"Licencias, ""pro"""')
  })

  it("sin facturas queda solo la cabecera", () => {
    expect(invoicesToCsv([]).split("\n")).toHaveLength(1)
  })

  it("downloadCsv arma un enlace con el nombre y lo hace clic", () => {
    const link = { href: "", download: "", clicked: false, click() { this.clicked = true } }
    const original = { document: globalThis.document, URL: globalThis.URL }
    ;(globalThis as { document?: unknown }).document = { createElement: () => link }
    const created = URL.createObjectURL
    URL.createObjectURL = () => "blob:x"
    URL.revokeObjectURL = () => {}
    try {
      downloadCsv("facturas.csv", "a,b")
      expect(link).toMatchObject({ download: "facturas.csv", href: "blob:x", clicked: true })
    } finally {
      URL.createObjectURL = created
      ;(globalThis as { document?: unknown }).document = original.document
    }
  })
})

describe("guardar la configuración", () => {
  it("saveSettings reemplaza la configuración guardada y no toca el resto", () => {
    const next = workspaceReducer(start, { type: "saveSettings", settings: { ...DEFAULT_SETTINGS, company: "Otra S.A." } })
    expect(next.settings.company).toBe("Otra S.A.")
    expect(next.customers).toBe(start.customers)
  })
})
