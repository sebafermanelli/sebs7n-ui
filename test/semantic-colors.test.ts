// @vitest-environment node
//
// Roles semánticos (3.0): success/warning/danger/info no dependen de la marca. Se mide la tinta sobre su propio tinte (el fondo de un
// Alert o un Badge suave) en claro y oscuro, y se comprueba que ningún rol semántico lee `--brand-*` ni `--sf-brand-*`. Con una marca
// verde, roja o ámbar el error sigue siendo rojo y el éxito verde.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { composite, contrastRatio, luminanceOfHex } from "../src/lib/contrast.js"

const css = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const colors = readFileSync(join(import.meta.dirname, "../src/styles/colors.css"), "utf8")
const corte = colors.indexOf("  .dark {")
const paso = (tema: "light" | "dark", color: string, n: number) => (tema === "light" ? colors.slice(0, corte) : colors.slice(corte)).match(new RegExp(`--sf-${color}-${n}: (#[0-9a-f]{6})`))![1]!
const mix = (a: string, b: string, pa: number) => {
  const ch = (h: string, i: number) => parseInt(h.slice(1 + i, 3 + i), 16)
  return `#${[0, 2, 4].map((i) => Math.round(ch(a, i) * pa + ch(b, i) * (1 - pa)).toString(16).padStart(2, "0")).join("")}`
}
const ROLES = { success: "green", warning: "amber", danger: "red", info: "blue" } as const

describe("roles semánticos", () => {
  for (const [rol, paleta] of Object.entries(ROLES)) {
    it(`${rol} sale de la paleta ${paleta} y no de la marca`, () => {
      for (const parte of ["", "-ink", "-soft"]) {
        const decl = css.match(new RegExp(`--color-${rol}${parte}: ([^;]+);`))![1]!
        expect(decl, `${rol}${parte}`).toContain(`--color-${paleta}-`)
        expect(decl).not.toMatch(/brand/)
      }
    })
    for (const tema of ["light", "dark"] as const) {
      it(`${rol} (${tema}): la tinta llega a 4,5:1 sobre su tinte y el sólido se distingue de la página (nunca va solo: lleva ícono y texto)`, () => {
        const tinta = mix(paso(tema, paleta, 900), paso(tema, paleta, 1000), 0.6)
        for (const fondo of tema === "light" ? ["#ffffff", "#f4f4f5"] : ["#1c1c1e", "#323235"]) {
          const tinte = composite(paso(tema, paleta, 700), 0.12, fondo)
          expect(contrastRatio(luminanceOfHex(tinta), luminanceOfHex(tinte))).toBeGreaterThanOrEqual(4.5)
        }
        expect(contrastRatio(luminanceOfHex(paso(tema, paleta, 700)), luminanceOfHex(tema === "light" ? "#ffffff" : "#1c1c1e"))).toBeGreaterThanOrEqual(1.8)
      })
    }
  }
})
