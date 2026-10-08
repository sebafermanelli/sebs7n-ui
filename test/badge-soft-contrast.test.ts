// @vitest-environment node
//
// Badge suave (3.0): la tinta de la paleta (`<color>-ink`, 60 % de -900 y 40 % de -1000) sobre su propio tinte (-700 al 12 %)
// compuesto sobre la página, el grupo y la superficie, en claro y oscuro. Para el brand, con las cinco marcas (cuatro de ejemplo y
// un verde pino). Todo ≥ 4,5:1.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { composite, contrastRatio, hexOfOklch, luminanceOfHex, type Oklch } from "../src/lib/contrast.js"

const colors = readFileSync(join(import.meta.dirname, "../src/styles/colors.css"), "utf8")
const corte = colors.indexOf("  .dark {")
const bloque = { light: colors.slice(colors.indexOf("  :root {"), corte), dark: colors.slice(corte) }
const paso = (tema: "light" | "dark", color: string, n: number) => bloque[tema].match(new RegExp(`--sf-${color}-${n}: (#[0-9a-f]{6})`))![1]!

const mix = (a: string, b: string, pa: number) => {
  const ch = (h: string, i: number) => parseInt(h.slice(1 + i, 3 + i), 16)
  return `#${[0, 2, 4].map((i) => Math.round(ch(a, i) * pa + ch(b, i) * (1 - pa)).toString(16).padStart(2, "0")).join("")}`
}
const FONDOS = { light: ["#ffffff", "#f4f4f5", "#fafafa"], dark: ["#1c1c1e", "#323235", "#2a2a2d"] }

function medir(tinta: string, base: string, tema: "light" | "dark") {
  return FONDOS[tema].map((f) => {
    const tinte = composite(base, 0.12, f)
    return contrastRatio(luminanceOfHex(tinta), luminanceOfHex(tinte))
  })
}

describe("Badge suave: tinta sobre tinte al 12 %", () => {
  for (const tema of ["light", "dark"] as const) {
    for (const color of ["red", "amber", "green", "blue", "teal", "purple", "pink"]) {
      it(`${color} (${tema})`, () => {
        const tinta = mix(paso(tema, color, 900), paso(tema, color, 1000), 0.6)
        for (const r of medir(tinta, paso(tema, color, 700), tema)) expect(r).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  const MARCAS: Record<string, Record<"light" | "dark", number[]>> = {
    ...Object.fromEntries(Object.entries(brands as Record<string, Record<"light" | "dark", { base: number[] }>>).map(([m, t]) => [m, { light: t.light.base, dark: t.dark.base }])),
    pino: { light: [0.42, 0.09, 160], dark: [0.7, 0.11, 160] },
  }
  for (const [marca, temas] of Object.entries(MARCAS)) {
    for (const tema of ["light", "dark"] as const) {
      it(`brand ${marca} (${tema})`, () => {
        const [, c, h] = temas[tema] as [number, number, number]
        const [l9, k9, l10, k10] = tema === "light" ? [0.535, 0.945, 0.269, 0.433] : [0.717, 0.705, 0.968, 0.077]
        const tinta = mix(hexOfOklch([l9, c * k9, h] as Oklch), hexOfOklch([l10, c * k10, h] as Oklch), 0.6)
        for (const r of medir(tinta, hexOfOklch(temas[tema] as unknown as Oklch), tema)) expect(r).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
