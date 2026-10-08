// @vitest-environment node
//
// El fondo del sitio de docs (`SiteBackdrop`, el de la home): un lavado de la marca de hasta 22 % (7 % del lavado + 9 % del foco más
// fuerte + 6 % del otro, apilados en el peor caso) y el grano encima. Se mide el PEOR píxel —marca plena al 22 % y ruido en los extremos
// a la intensidad marcada— con el texto secundario y las superficies sobre él, en claro y oscuro y con las cinco marcas de ejemplo.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { composite, contrastRatio, hexOfOklch, luminanceOfHex, type Oklch } from "../src/lib/contrast.js"

const css = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const fuente = readFileSync(join(import.meta.dirname, "../docs/site/app/_components/site-backdrop.tsx"), "utf8")
const hex2 = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0")
const canales = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
function overlay(bg: string, n: number, a: number) {
  return `#${canales(bg)
    .map((b) => hex2(b + a * ((b < 0.5 ? 2 * b * n : 1 - 2 * (1 - b) * (1 - n)) - b)))
    .join("")}`
}
const fondo = (tema: "light" | "dark") => {
  const bloque = tema === "light" ? css.slice(css.indexOf(":root {")) : css.slice(css.indexOf(".dark {"))
  return /--sf-background: (#[0-9a-f]{6});/i.exec(bloque)![1]!
}
const [, l0, c0, h0] = css.match(/--brand-base: oklch\(([\d.]+) ([\d.]+) ([\d.]+)\);/)!
const MARCAS: Record<"light" | "dark", Oklch[]> = {
  light: [[Number(l0), Number(c0), Number(h0)], ...Object.values(brands as Record<string, Record<"light" | "dark", { base: number[] }>>).map((t) => t.light.base as unknown as Oklch)],
  dark: [[Number(l0), Number(c0), Number(h0)], ...Object.values(brands as Record<string, Record<"light" | "dark", { base: number[] }>>).map((t) => t.dark.base as unknown as Oklch)],
}
const TEXTO = { light: { hex: "#000000", alpha: 0.59 }, dark: { hex: "#ffffff", alpha: 0.69 } } as const

describe("SiteBackdrop", () => {
  it("es solo decorativo: aria-hidden, sin puntero, detrás del contenido y con el grano del sistema", () => {
    expect(fuente).toContain('aria-hidden="true"')
    expect(fuente).toContain("pointer-events-none")
    expect(fuente).toContain("-z-10")
    expect(fuente).toContain("var(--grain-image)")
    expect(fuente).toContain("opacity-(--grain-opacity)")
  })

  it("los tres lavados suman a lo sumo 22 % de la marca", () => {
    const alfas = [...fuente.matchAll(/var\(--sf-brand-700\)_(\d+)%/g)].map((m) => Number(m[1]))
    expect(alfas.length).toBe(3)
    expect(alfas[0]! + Math.max(...alfas.slice(1))! + Math.min(...alfas.slice(1))!).toBeLessThanOrEqual(22)
  })

  for (const tema of ["light", "dark"] as const) {
    it(`el texto secundario sigue sobre 4,5:1 sobre el peor píxel del fondo (${tema})`, () => {
      const fallas: string[] = []
      for (const [i, marca] of MARCAS[tema].entries()) {
        const lavado = composite(hexOfOklch(marca), 0.22, fondo(tema))
        for (const n of [0.08, 0.9]) {
          const bg = overlay(lavado, n, 0.18)
          const r = contrastRatio(luminanceOfHex(composite(TEXTO[tema].hex, TEXTO[tema].alpha, bg)), luminanceOfHex(bg))
          if (r < 4.5) fallas.push(`marca ${i} n=${n}: ${r.toFixed(2)}`)
        }
      }
      expect(fallas).toEqual([])
    })
  }
})
