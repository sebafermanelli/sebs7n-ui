import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const here = fileURLToPath(new URL("..", import.meta.url))

describe("rutas de templates", () => {
  it("links.test.ts incluye /templates y /templates/dashboard en rutas válidas", () => {
    const fuente = readFileSync(join(here, "test/links.test.ts"), "utf8")
    expect(fuente).toContain('"/templates"')
    expect(fuente).toContain('"/templates/dashboard"')
    expect(fuente).toContain('"/templates/landing"')
    for (const ruta of ["/templates/dashboard/invoices", "/templates/dashboard/customers", "/templates/dashboard/settings"]) {
      expect(fuente).toContain(`"${ruta}"`)
    }
  })
})
