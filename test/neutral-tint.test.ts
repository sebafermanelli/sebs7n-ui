// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { composite, contrastRatio, hexOfOklch, luminanceOfHex } from "../src/lib/contrast.js"

const theme = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const block = theme.slice(theme.indexOf("Neutros con tinte de marca"))
const light = block.slice(block.indexOf(":root:not([data-neutral-tint=\"off\"])"), block.indexOf(":root.dark:not([data-neutral-tint=\"off\"])"))
const dark = block.slice(block.indexOf(":root.dark:not([data-neutral-tint=\"off\"])"))

type Token = { l: number; k: number; alpha: number }
/** Lee `oklch(from var(--sf-brand-src) L croma-o-calc h [/ alfa])` de un bloque. */
function parse(css: string): Record<string, Token> {
  const out: Record<string, Token> = {}
  for (const [, name, l, mult, alpha] of css.matchAll(/--sf-([\w-]+): oklch\(from var\(--sf-brand-src\) ([\d.]+) (?:var\(--neutral-tint-chroma, [\d.]+\)|calc\(var\(--neutral-tint-chroma, [\d.]+\) \* (\d+)\)) h(?: \/ ([\d.]+))?\);/g))
    out[name!] = { l: Number(l), k: mult ? Number(mult) : 1, alpha: alpha ? Number(alpha) : 1 }
  return out
}
const tint = { light: parse(light), dark: parse(dark) }

const color = (t: Token, hue: number, chroma: number) => hexOfOklch([t.l, chroma * t.k, hue])

describe("neutros con tinte: default, con salida", () => {
  it("todas las reglas se apagan con data-neutral-tint=off: vuelven los grises de 2.x", () => {
    const selectors = [...block.matchAll(/^\s*(:root[^{]*)\{/gm)].map((m) => m[1]!.trim())
    expect(selectors).toEqual([":root:not([data-neutral-tint=\"off\"])", ":root.dark:not([data-neutral-tint=\"off\"])"])
    expect(block).not.toMatch(/^\s*(:root|\.dark|html|body)\s*\{/m)
  })

  it("tiñe las mismas variables en claro y en oscuro, con croma 0,01 por defecto", () => {
    expect(Object.keys(tint.light).sort()).toEqual(Object.keys(tint.dark).sort())
    expect(Object.keys(tint.light)).toEqual(expect.arrayContaining(["background", "surface", "group", "separator", "label", "label-secondary", "fill-1"]))
    expect(block).toContain("var(--neutral-tint-chroma, 0.01)")
  })
})

// Los pares de texto sobre neutros: el tinte no puede bajarlos de AA. Se prueban varios matices
// (incluidos los más difíciles: amarillo y verde) y el rango de croma 0,005–0,01.
const HUES = [25, 90, 160, 205, 258, 300, 340]
const CHROMAS = [0.005, 0.008, 0.01]
const surfaces = ["background", "surface", "surface-secondary", "surface-bar", "group"]

for (const theme_ of ["light", "dark"] as const) {
  const t = tint[theme_]
  describe(`neutros con tinte (${theme_}): contraste de texto`, () => {
    for (const hue of HUES) {
      for (const chroma of CHROMAS) {
        it(`matiz ${hue}, croma ${chroma}`, () => {
          for (const name of surfaces) {
            const bg = color(t[name]!, hue, chroma)
            const fg = (key: string) => composite(color(t[key]!, hue, chroma), t[key]!.alpha, bg)
            expect(contrastRatio(luminanceOfHex(fg("label")), luminanceOfHex(bg)), `label sobre ${name}`).toBeGreaterThanOrEqual(7)
            expect(contrastRatio(luminanceOfHex(fg("label-secondary")), luminanceOfHex(bg)), `label-secondary sobre ${name}`).toBeGreaterThanOrEqual(4.5)
            // label-tertiary no es para texto chico (glifos y deshabilitados): 3:1.
            expect(contrastRatio(luminanceOfHex(fg("label-tertiary")), luminanceOfHex(bg)), `label-tertiary sobre ${name}`).toBeGreaterThanOrEqual(3)
          }
        })
      }
    }
  })
}
