// @vitest-environment node
//
// Alto contraste (3.0): `data-contrast="high"` y `prefers-contrast: more` suben filetes, rellenos y texto tenue. Se miden los valores
// del CSS sobre la página: el filete fuerte ≥ 3:1 (un borde de campo visible, WCAG 1.4.11), el texto secundario ≥ 7:1 y el terciario ≥ 4,5:1.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { composite, contrastRatio, luminanceOfHex } from "../src/lib/contrast.js"

const css = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const bloque = css.slice(css.indexOf("Alto contraste (3.0)"))
const sel = (selector: string) => bloque.slice(bloque.indexOf(selector), bloque.indexOf("}", bloque.indexOf(selector)))
const token = (cuerpo: string, nombre: string) => {
  const hex = cuerpo.match(new RegExp(`--sf-${nombre}: (#[0-9a-f]{6,8});`))![1]!
  return { color: hex.slice(0, 7), alpha: hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1 }
}
const FONDO = { light: "#ffffff", dark: "#1c1c1e" }

for (const [tema, selector] of [["light", ':root:root[data-contrast="high"]'], ["dark", ':root:root.dark[data-contrast="high"]']] as const) {
  describe(`alto contraste (${tema})`, () => {
    const cuerpo = sel(selector)
    const sobre = (nombre: string) => {
      const t = token(cuerpo, nombre)
      return contrastRatio(luminanceOfHex(composite(t.color, t.alpha, FONDO[tema])), luminanceOfHex(FONDO[tema]))
    }
    it("el filete fuerte llega a 3:1 y el filete común a 2:1", () => {
      expect(sobre("separator-strong")).toBeGreaterThanOrEqual(3)
      expect(sobre("separator")).toBeGreaterThanOrEqual(2)
    })
    it("el texto secundario llega a 7:1 y el terciario a 4,5:1", () => {
      expect(sobre("label-secondary")).toBeGreaterThanOrEqual(7)
      expect(sobre("label-tertiary")).toBeGreaterThanOrEqual(4.5)
    })
    it("apaga el grano", () => {
      expect(cuerpo).toContain("--grain-opacity: 0;")
    })
  })
}

describe("prefers-contrast y forced-colors", () => {
  it("prefers-contrast: more aplica los mismos valores salvo data-contrast=standard", () => {
    expect(bloque).toMatch(/@media \(prefers-contrast: more\) \{\s*:root:root:not\(\[data-contrast="standard"\]\)/)
  })
  it("forced-colors: el foco y lo elegido se dicen con contorno de sistema", () => {
    const fc = bloque.slice(bloque.indexOf("@media (forced-colors: active)"))
    expect(fc).toContain("outline: 2px solid Highlight;")
    expect(fc).toContain("[data-checked]")
  })
})

describe("impresión", () => {
  it("oculta el chrome, aplana fondos y repite las cabeceras de tabla", () => {
    const print = bloque.slice(bloque.indexOf("@media print"))
    for (const parte of ['[data-slot="app-shell-sidebar"]', '[data-slot="navbar"]', "[data-sonner-toaster]", "table-header-group", "break-inside: avoid", "box-shadow: none !important"]) expect(print).toContain(parte)
  })
})
