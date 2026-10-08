// @vitest-environment node
//
// Paleta de datos (3.0): 8 series para Chart/MetricChart/Meter que (1) llegan a 3:1 contra la página (WCAG 1.4.11, objetos gráficos) en
// claro y en oscuro y (2) se distinguen con daltonismo: la distancia en OKLab entre cada par, simulada para deuteranopía, protanopía y
// tritanopía (matrices de Machado, severidad 1), es de al menos 0,06. El color nunca es el único dato —la leyenda lleva el nombre—, pero
// la paleta tiene que ayudar.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { contrastRatio, luminanceOfHex } from "../src/lib/contrast.js"

const css = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const corte = css.indexOf("  .dark {")
const paleta = (parte: string) => [...parte.matchAll(/--sf-data-(\d): (#[0-9a-f]{6});/g)].map((m) => m[2]!)
const SERIES = { light: paleta(css.slice(0, corte)), dark: paleta(css.slice(corte)) }
const FONDO = { light: "#ffffff", dark: "#1c1c1e" }

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const rgb = (h: string) => [1, 3, 5].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255))
const MACHADO: Record<string, number[][]> = {
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
}
const oklab = (v: number[]) => {
  const [l, m, s] = [0.4122214708 * v[0]! + 0.5363325363 * v[1]! + 0.0514459929 * v[2]!, 0.2119034982 * v[0]! + 0.6806995451 * v[1]! + 0.1073969566 * v[2]!, 0.0883024619 * v[0]! + 0.2817188376 * v[1]! + 0.6299787005 * v[2]!].map(Math.cbrt)
  return [0.2104542553 * l! + 0.793617785 * m! - 0.0040720468 * s!, 1.9779984951 * l! - 2.428592205 * m! + 0.4505937099 * s!, 0.0259040371 * l! + 0.7827717662 * m! - 0.808675766 * s!]
}
const simular = (hex: string, tipo: string) => {
  const c = rgb(hex)
  return oklab(MACHADO[tipo]!.map((f) => Math.min(1, Math.max(0, f[0]! * c[0]! + f[1]! * c[1]! + f[2]! * c[2]!))))
}
const dist = (a: number[], b: number[]) => Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!)

for (const tema of ["light", "dark"] as const) {
  describe(`paleta de datos (${tema})`, () => {
    const serie = SERIES[tema]
    it("tiene 8 series y `--sf-chart-n` las alias", () => {
      expect(serie).toHaveLength(8)
      for (let i = 1; i <= 8; i++) expect(css).toContain(`--sf-chart-${i}: var(--sf-data-${i});`)
    })
    it("cada serie llega a 3:1 contra la página", () => {
      for (const [i, c] of serie.entries()) expect(contrastRatio(luminanceOfHex(c), luminanceOfHex(FONDO[tema])), `serie ${i + 1} ${c}`).toBeGreaterThanOrEqual(3)
    })
    for (const tipo of Object.keys(MACHADO)) {
      it(`todo par se distingue con ${tipo} (ΔOKLab ≥ 0,06)`, () => {
        for (let i = 0; i < serie.length; i++)
          for (let j = i + 1; j < serie.length; j++) expect(dist(simular(serie[i]!, tipo), simular(serie[j]!, tipo)), `${i + 1}-${j + 1}`).toBeGreaterThanOrEqual(0.06)
      })
    }
  })
}
