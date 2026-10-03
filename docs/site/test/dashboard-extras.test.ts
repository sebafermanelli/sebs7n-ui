import { describe, expect, it } from "vitest"

import type { Invoice } from "../app/templates/dashboard/_data/invoices-mock"
import { INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"
import { BOARD_COLUMNS, boardGroups, boardMove, movesFrom } from "../app/templates/dashboard/_lib/board"
import { dueEvents } from "../app/templates/dashboard/_lib/calendar"
import { addDays, formatDateTime, fromIsoDateTime, plural, toIsoDateTime } from "../app/templates/dashboard/_lib/format"
import { DEMO_CODE, DEMO_PASSWORD, INITIAL_LOGIN, loginReducer } from "../app/templates/dashboard/_lib/login"
import { pageCountOf, pageOf } from "../app/templates/dashboard/_lib/paging"
import { applyKeys, attach, BILLING_KEYS, DEFAULT_SETTINGS, fileSizeLabel, GENERAL_KEYS, isDirty, planUsage } from "../app/templates/dashboard/_lib/settings"

const invoice = (id: string, over: Partial<Invoice> = {}): Invoice => ({ id, customer: "Acme S.A.", concept: "Licencias", amount: 100, date: "2026-09-10", dueDate: "2026-10-10", status: "pending", ...over })

describe("tablero de cobranza", () => {
  it("agrupa por estado, sin anuladas, las que vencen antes arriba", () => {
    const groups = boardGroups([invoice("a", { dueDate: "2026-10-20" }), invoice("b", { dueDate: "2026-10-05" }), invoice("c", { status: "void" }), invoice("d", { status: "paid", paidAt: "2026-09-30" })])
    expect(groups.pending.map((inv) => inv.id)).toEqual(["b", "a"])
    expect(groups.paid.map((inv) => inv.id)).toEqual(["d"])
    expect(Object.values(groups).flat().map((inv) => inv.id)).not.toContain("c")
  })

  it("soltar en Cobradas cobra (de pendiente o vencida); en Pendientes reabre una cobrada; a Vencidas nunca", () => {
    expect(boardMove(invoice("a"), "paid")).toBe("markPaid")
    expect(boardMove(invoice("a", { status: "overdue" }), "paid")).toBe("markPaid")
    expect(boardMove(invoice("a", { status: "paid", paidAt: "2026-09-30" }), "pending")).toBe("reopen")
    expect(boardMove(invoice("a"), "overdue")).toBeNull()
    expect(boardMove(invoice("a", { status: "paid", paidAt: "2026-09-30" }), "overdue")).toBeNull()
    expect(boardMove(invoice("a"), "pending")).toBeNull()
  })

  it("el menú «Mover a» ofrece solo lo que se puede hacer", () => {
    expect(movesFrom(invoice("a")).map((column) => column.id)).toEqual(["paid"])
    expect(movesFrom(invoice("a", { status: "paid", paidAt: "2026-09-30" })).map((column) => column.id)).toEqual(["pending"])
    expect(movesFrom(invoice("a", { status: "void" }))).toEqual([])
  })

  it("hay una columna por estado que se cobra", () => {
    expect(BOARD_COLUMNS.map((column) => column.id)).toEqual(["pending", "overdue", "paid"])
  })
})

describe("calendario de vencimientos", () => {
  it("un evento de todo el día por factura que no está anulada, en su fecha", () => {
    const events = dueEvents(INVOICES_MOCK)
    expect(events).toHaveLength(INVOICES_MOCK.filter((inv) => inv.status !== "void").length)
    const first = events.find((event) => event.id === "FAC-1001")!
    expect(first.allDay).toBe(true)
    expect([first.start.getFullYear(), first.start.getMonth(), first.start.getDate()]).toEqual([2026, 9, 15])
    expect(first.color).toBe("amber")
  })
})

describe("formatos de fecha y hora", () => {
  it("toIsoDateTime y fromIsoDateTime son inversas, en hora local", () => {
    const date = new Date(2026, 9, 8, 9, 30)
    expect(toIsoDateTime(date)).toBe("2026-10-08T09:30")
    expect(fromIsoDateTime("2026-10-08T09:30").getTime()).toBe(date.getTime())
    expect(formatDateTime("2026-10-08T09:30")).toMatch(/8 oct.*09:30/)
  })
  it("addDays cruza el fin de mes y plural escribe el singular", () => {
    expect(addDays("2026-10-02", 30)).toBe("2026-11-01")
    expect(addDays("2026-12-20", 15)).toBe("2027-01-04")
    expect(plural(1, "factura", "facturas")).toBe("1 factura")
    expect(plural(0, "factura", "facturas")).toBe("0 facturas")
  })
})

describe("inicio de sesión", () => {
  it("correo y contraseña llevan al código; un error deja el paso donde estaba", () => {
    const wrong = loginReducer(INITIAL_LOGIN, { type: "credentials", email: "ana@acme.example", password: "mala" })
    expect(wrong).toMatchObject({ step: "credentials" })
    expect(wrong.error).toMatch(/no son correctos/)
    expect(loginReducer(INITIAL_LOGIN, { type: "credentials", email: "  ", password: DEMO_PASSWORD }).step).toBe("credentials")
    expect(loginReducer(wrong, { type: "credentials", email: " ana@acme.example ", password: DEMO_PASSWORD })).toEqual({ step: "code", error: null, email: "ana@acme.example" })
  })
  it("el código correcto entra; el incorrecto no, y no se puede saltear el paso", () => {
    const code = { step: "code" as const, error: null, email: "ana@acme.example" }
    expect(loginReducer(code, { type: "code", code: DEMO_CODE }).step).toBe("done")
    expect(loginReducer(code, { type: "code", code: "000000" })).toMatchObject({ step: "code", error: expect.stringMatching(/código/) })
    expect(loginReducer(INITIAL_LOGIN, { type: "code", code: DEMO_CODE })).toBe(INITIAL_LOGIN)
  })
  it("«Usar otra cuenta» vuelve al principio", () => {
    expect(loginReducer({ step: "code", error: "x", email: "a@b.c" }, { type: "back" })).toEqual(INITIAL_LOGIN)
  })
})

describe("paginación de clientes", () => {
  it("cuenta páginas (al menos una) y corta la que pide, llevando lo que se pasa al borde", () => {
    expect(pageCountOf(0, 6)).toBe(1)
    expect(pageCountOf(8, 6)).toBe(2)
    expect(pageOf([1, 2, 3, 4, 5, 6, 7, 8], 2, 6)).toEqual([7, 8])
    expect(pageOf([1, 2, 3], 9, 6)).toEqual([1, 2, 3])
    expect(pageOf([1, 2, 3], 0, 2)).toEqual([1, 2])
  })
})

describe("configuración con borrador", () => {
  it("isDirty compara por contenido y solo las claves de la pestaña", () => {
    const draft = { ...DEFAULT_SETTINGS, company: "Otra", customerNotices: ["paid"] }
    expect(isDirty(DEFAULT_SETTINGS, DEFAULT_SETTINGS, GENERAL_KEYS)).toBe(false)
    expect(isDirty(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, brand: [0.573, 0.214, 258] }, GENERAL_KEYS)).toBe(false)
    expect(isDirty(DEFAULT_SETTINGS, draft, GENERAL_KEYS)).toBe(true)
    expect(isDirty(DEFAULT_SETTINGS, draft, BILLING_KEYS)).toBe(true)
    expect(isDirty(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, company: "Otra" }, BILLING_KEYS)).toBe(false)
  })
  it("applyKeys guarda una pestaña sin llevarse los cambios de la otra", () => {
    const draft = { ...DEFAULT_SETTINGS, company: "Otra", dueDays: "60" }
    const saved = applyKeys(DEFAULT_SETTINGS, draft, GENERAL_KEYS)
    expect(saved.company).toBe("Otra")
    expect(saved.dueDays).toBe(DEFAULT_SETTINGS.dueDays)
    expect(applyKeys(draft, saved, GENERAL_KEYS).dueDays).toBe("60")
  })
  it("planUsage cuenta las facturas del mes contra el cupo y no pasa de 100 %", () => {
    expect(planUsage(INVOICES_MOCK, "2026-09", 12)).toMatchObject({ used: 9, remaining: 3, percent: 75 })
    expect(planUsage(INVOICES_MOCK, "2026-09", 4)).toMatchObject({ remaining: 0, percent: 100 })
  })
  it("attach suma archivos con ids únicos y fileSizeLabel los escribe", () => {
    const files = attach([], [{ name: "a.pdf", size: 2048 }, { name: "a.pdf", size: 2048 }])
    expect(new Set(files.map((file) => file.id)).size).toBe(2)
    expect(fileSizeLabel(2048)).toBe("2 KB")
    expect(fileSizeLabel(1.5 * 1024 * 1024)).toBe("1,5 MB")
  })
})
