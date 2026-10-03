import { describe, expect, it } from "vitest"

import { SHORTCUTS as CONSOLE_SHORTCUTS } from "../app/templates/console/_components/shortcuts"
import { INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"
import { answerFor, SUGGESTIONS } from "../app/templates/dashboard/_lib/assistant"
import { SHORTCUTS as DASHBOARD_SHORTCUTS } from "../app/templates/dashboard/_lib/shortcuts"

describe("asistente acoplado", () => {
  it("⌘J está en la hoja de atajos de la consola y del dashboard, sin chocar con ⌘K", () => {
    for (const list of [CONSOLE_SHORTCUTS, DASHBOARD_SHORTCUTS]) {
      expect(list.some((s) => s.keys.join("") === "⌘J")).toBe(true)
      expect(new Set(list.map((s) => s.keys.join(" "))).size).toBe(list.length)
    }
  })

  it("las respuestas del dashboard son deterministas y salen de las facturas", () => {
    for (const suggestion of SUGGESTIONS) {
      const first = answerFor(suggestion, INVOICES_MOCK)
      expect(first).toBe(answerFor(suggestion, INVOICES_MOCK))
      expect(first.length).toBeGreaterThan(10)
    }
    const overdue = INVOICES_MOCK.filter((i) => i.status === "overdue")
    const reminder = answerFor("Armá un recordatorio para las vencidas", INVOICES_MOCK)
    for (const inv of overdue) expect(reminder).toContain(inv.id)
    expect(answerFor("Armá un recordatorio para las vencidas", [])).toMatch(/No hay facturas vencidas/)
  })
})
