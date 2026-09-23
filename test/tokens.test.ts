// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { renderColors } from "../scripts/gen-colors.mjs"
import geist from "../tokens/geist.json"

const root = fileURLToPath(new URL("..", import.meta.url))

describe("tokens de Geist", () => {
  it("colors.css está al día con tokens/geist.json (correr `npm run tokens`)", () => {
    const onDisk = readFileSync(join(root, "src/styles/colors.css"), "utf8")
    expect(onDisk).toBe(renderColors(geist))
  })

  it("tiene las 10 escalas con 10 pasos en light y dark", () => {
    for (const theme of ["light", "dark"] as const) {
      const scales = geist[theme] as Record<string, Record<string, string>>
      expect(Object.keys(scales)).toEqual([
        "background", "gray", "gray-alpha", "blue", "red", "amber", "green", "teal", "purple", "pink",
      ])
      for (const [scale, steps] of Object.entries(scales)) {
        const expected = scale === "background" ? ["100", "200"] : ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000"]
        expect(Object.keys(steps)).toEqual(expected)
        for (const hex of Object.values(steps)) expect(hex).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/)
      }
    }
  })
})

/**
 * Semántica de fondos. El bug que cierra: en oscuro background-100 y
 * background-200 valían los dos #000 y el body usaba background-100, así que
 * inputs, popups y tarjetas quedaban del mismo negro que la página.
 */
describe("fondos: página vs superficie", () => {
  const theme = readFileSync(join(root, "src/styles/theme.css"), "utf8")
  const base = readFileSync(join(root, "src/styles/base.css"), "utf8")
  const appShell = readFileSync(join(root, "src/components/app-shell.tsx"), "utf8")

  it("la superficie en oscuro es #0a0a0a, como --ds-background-100 de vercel.com", () => {
    expect(geist.dark.background["100"]).toBe("#0a0a0a")
    expect(geist.light.background["100"]).toBe("#ffffff")
  })

  it("el fondo sutil es el tono que no es el de la página en cada tema", () => {
    expect(geist.light.background["200"]).toBe("#fafafa")
    expect(geist.dark.background["200"]).toBe("#0a0a0a")
  })

  it("--sf-background es blanco en claro y negro puro en oscuro", () => {
    expect(theme).toMatch(/--sf-background:\s*#ffffff;/)
    expect(theme).toMatch(/--sf-background:\s*#000000;/)
    expect(theme).toContain("--color-background: var(--sf-background);")
  })

  it("la página no usa la superficie: body y raíz del AppShell van con el token de página", () => {
    expect(base).toContain("background-color: var(--color-background);")
    expect(base).not.toContain("var(--color-background-100)")
    expect(appShell).toContain("grid-cols-1 bg-background [--app-shell-height:100dvh]")
  })

  it("en oscuro la superficie se despega de la página", () => {
    expect(geist.dark.background["100"]).not.toBe("#000000")
  })
})
