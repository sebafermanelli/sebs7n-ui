// @vitest-environment node
//
// Grano de fondo (3.0): el ruido se mezcla en `overlay` sobre el wallpaper, así que el fondo se mueve unas milésimas. Acá se mide
// el PEOR caso —ruido todo blanco o todo negro en cada píxel— a las tres intensidades, con el texto secundario directo sobre cada
// tono del wallpaper (el peor par del sistema), en claro y oscuro y con las marcas de ejemplo. Debe seguir sobre 4,5:1.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { composite, contrastRatio, hexOfOklch, luminanceOfHex, type Oklch } from "../src/lib/contrast.js"

const css = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const INTENSIDADES = { ninguno: 0, sutil: 0.08, marcado: 0.18 } as const

// El ruido de `--grain-image` medido en Chrome (canvas, 160 × 160), con el centro corrido según el tema. Se prueban el p0,1 y
// el p99,9 —peor que cualquier píxel del 99,8 % central— y no 0 y 1, que casi no aparecen.
// El ruido de `--grain-image` medido en Chrome (canvas, 160 × 160): mediana 0,49, p0,1 = 0,08 y p99,9 = 0,90. Se prueban esos
// dos extremos —peor que cualquier píxel del 99,8 % central— y no 0 y 1, que casi no aparecen.
const RUIDO = [0.08, 0.9]
const hex2 = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0")
const canales = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
/** `mix-blend-mode: overlay` con una capa de gris `n` y opacidad `a`, canal a canal (sRGB). */
function overlay(bg: string, n: number, a: number) {
  const out = canales(bg).map((b) => {
    const r = b < 0.5 ? 2 * b * n : 1 - 2 * (1 - b) * (1 - n)
    return b + a * (r - b)
  })
  return `#${out.map(hex2).join("")}`
}

const tonos = (theme: "light" | "dark") => {
  const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
  const cuerpo = css.slice(inicio, css.indexOf("\n  }", inicio))
  return [...cuerpo.matchAll(/--sf-wallpaper-\d: oklch\(from var\(--sf-brand-src\) ([\d.]+) calc\(c \* ([\d.]+)\) (?:h|calc\(h ([+-]) (\d+)\))\);/g)].map(
    ([, l, k, signo, d]) => ({ l: Number(l), k: Number(k), d: d ? (signo === "-" ? -1 : 1) * Number(d) : 0 })
  )
}
const [, l0, c0, h0] = css.match(/--brand-base: oklch\(([\d.]+) ([\d.]+) ([\d.]+)\);/)!
const MARCAS: Record<string, Record<"light" | "dark", number[]>> = {
  "por defecto": { light: [l0, c0, h0].map(Number), dark: [l0, c0, h0].map(Number) },
  ...Object.fromEntries(Object.entries(brands as Record<string, Record<"light" | "dark", { base: number[] }>>).map(([m, t]) => [m, { light: t.light.base, dark: t.dark.base }])),
  pino: { light: [0.42, 0.09, 160], dark: [0.7, 0.11, 160] },
}
// Texto secundario: negro al 59 % en claro, blanco al 69 % en oscuro (theme.css; 3.0 los subió 3 puntos para dejar margen al grano); el principal es más fuerte.
const TEXTO = { light: { hex: "#000000", alpha: 0.59 }, dark: { hex: "#ffffff", alpha: 0.69 } } as const

describe("grano: tokens", () => {
  it("expone intensidad, tamaño, apagado y prefers-contrast", () => {
    expect(css).toMatch(/--grain-opacity: 0\.08;/)
    expect(css).toContain("--grain-size: 160px;")
    expect(css).toContain(':root[data-grain="off"]')
    expect(css).toContain(':root[data-grain="strong"]')
    expect(css).toMatch(/@media \(prefers-contrast: more\)\s*\{\s*:root,\s*:root\[data-grain\]\s*\{\s*--grain-opacity: 0 !important/)
    expect(Object.values(INTENSIDADES)).toContain(Number(/data-grain="strong"\]\s*\{\s*--grain-opacity: ([\d.]+)/.exec(css)![1]))
  })
  it("no se anima ni usa canvas o JS", () => {
    const bloque = css.slice(css.indexOf("Niveles del grano"), css.indexOf("El Skeleton (R5a)"))
    expect(bloque).not.toMatch(/animation|@keyframes|canvas/)
  })
})

for (const tema of ["light", "dark"] as const) {
  for (const [nombre, a] of Object.entries(INTENSIDADES)) {
    describe(`grano ${nombre} (${tema})`, () => {
      it("el texto secundario sigue sobre 4,5:1 en el peor píxel, en todas las marcas y tonos", () => {
        const fallas: string[] = []
        for (const [marca, temas] of Object.entries(MARCAS)) {
          const [, c, h] = temas[tema]
          for (const [i, t] of tonos(tema).entries()) {
            const base = hexOfOklch([t.l, c! * t.k, h! + t.d] as unknown as Oklch)
            for (const n of RUIDO) {
              const bg = overlay(base, n, a)
              const fg = composite(TEXTO[tema].hex, TEXTO[tema].alpha, bg)
              const r = contrastRatio(luminanceOfHex(fg), luminanceOfHex(bg))
              if (r < 4.5) fallas.push(`${marca} tono ${i + 1} n=${n}: ${r.toFixed(2)}`)
            }
          }
        }
        expect(fallas).toEqual([])
      })
    })
  }
}
