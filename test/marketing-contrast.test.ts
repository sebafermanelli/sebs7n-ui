// @vitest-environment node
//
// Auditoría de contraste AA del kit de marketing: el énfasis de color (`emphasis-accent` = `brand-ink`,
// `emphasis-muted` = `label-secondary`) sobre cada fondo que puede tener un titular o una bajada —la página,
// la franja `grouped`, el lavado de `SectionBackdrop` al 7 % y los neutros con tinte—, en claro y en oscuro,
// con las marcas de ejemplo del paquete y una verde profundo. Imprime la tabla de ratios (`npx vitest run
// test/marketing-contrast.test.ts`) y falla si algún texto queda bajo 4,5:1.
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { composite, contrastRatio, flattenAlpha, hexOfOklch, luminanceOfHex, type Oklch } from "../src/lib/contrast.js"

type Theme = { base: number[]; contrast: string }
const MARCAS: Record<string, Record<"light" | "dark", Theme>> = {
  ...(brands as Record<string, Record<"light" | "dark", Theme>>),
  // Un verde profundo (pino) como el de una marca sobria: claro 0,42 y oscuro aclarado.
  pino: { light: { base: [0.42, 0.09, 160], contrast: "#ffffff" }, dark: { base: [0.7, 0.11, 160], contrast: "#000000" } },
}

const hex = (c: Oklch) => hexOfOklch(c)
/** `color-mix(in srgb, a 60%, b)`: mezcla en sRGB sobre los canales ya recortados. */
function mix(a: string, b: string, pa: number): string {
  const ch = (h: string, i: number) => parseInt(h.slice(1 + i, 3 + i), 16)
  return `#${[0, 2, 4].map((i) => Math.round(ch(a, i) * pa + ch(b, i) * (1 - pa)).toString(16).padStart(2, "0")).join("")}`
}
/** brand-ink = 60 % brand-900 + 40 % brand-1000 (theme.css), con las L y los k de cada tema. */
function brandInk(base: number[], theme: "light" | "dark"): string {
  const [, c, h] = base as [number, number, number]
  const [l9, k9, l10, k10] = theme === "light" ? [0.535, 0.945, 0.269, 0.433] : [0.717, 0.705, 0.968, 0.077]
  return mix(hex([l9, c * k9, h]), hex([l10, c * k10, h]), 0.6)
}

const css = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const block = css.slice(css.indexOf("Neutros con tinte de marca"))
const tintCss = { light: block.slice(0, block.indexOf(":root.dark:not([data-neutral-tint=\"off\"])")), dark: block.slice(block.indexOf(":root.dark:not([data-neutral-tint=\"off\"])")) }
function tintToken(theme: "light" | "dark", name: string): { l: number; alpha: number } {
  const m = tintCss[theme].match(new RegExp(`--sf-${name}: oklch\\(from var\\(--sf-brand-src\\) ([\\d.]+) [^;]*?h(?: / ([\\d.]+))?\\);`))!
  return { l: Number(m[1]), alpha: m[2] ? Number(m[2]) : 1 }
}

const PLAIN = {
  light: { background: "#ffffff", group: "#f4f4f5", labelSecondary: ["#000000", 0x8f / 255] as const, label: ["#000000", 0xe0 / 255] as const },
  dark: { background: "#1c1c1e", group: "#323235", labelSecondary: ["#ffffff", 0xa8 / 255] as const, label: ["#ffffff", 0xfa / 255] as const },
}

type Row = { marca: string; tema: string; fondo: string; par: string; ratio: number }
const rows: Row[] = []

for (const [marca, themes] of Object.entries(MARCAS)) {
  for (const tema of ["light", "dark"] as const) {
    const { base } = themes[tema]
    const brand700 = hex(base as unknown as Oklch)
    const ink = brandInk(base, tema)
    for (const tinte of [false, true]) {
      const fondos: Record<string, string> = {}
      let secondary: (bg: string) => string
      let label: (bg: string) => string
      if (!tinte) {
        fondos.página = PLAIN[tema].background
        fondos.grouped = PLAIN[tema].group
        secondary = (bg) => composite(PLAIN[tema].labelSecondary[0], PLAIN[tema].labelSecondary[1], bg)
        label = (bg) => composite(PLAIN[tema].label[0], PLAIN[tema].label[1], bg)
      } else {
        const hue = base[2]!
        const mk = (name: string) => {
          const t = tintToken(tema, name)
          return { color: hex([t.l, 0.008, hue]), alpha: t.alpha }
        }
        fondos.página = mk("background").color
        fondos.grouped = mk("group").color
        secondary = (bg) => composite(mk("label-secondary").color, mk("label-secondary").alpha, bg)
        label = (bg) => composite(mk("label").color, mk("label").alpha, bg)
      }
      fondos.wash = composite(brand700, 0.07, fondos.página!)
      for (const [fondo, bg] of Object.entries(fondos)) {
        const lum = luminanceOfHex(bg)
        const push = (par: string, fg: string) => rows.push({ marca, tema, fondo: `${fondo}${tinte ? " + tinte" : ""}`, par, ratio: contrastRatio(luminanceOfHex(fg), lum) })
        push("emphasis-accent", ink)
        push("emphasis-muted", secondary(bg))
        push("label (titular)", label(bg))
      }
    }
  }
}

describe("kit de marketing: contraste AA del énfasis y los fondos", () => {
  it("imprime la tabla de ratios", () => {
    const worst = (par: string) => Math.min(...rows.filter((r) => r.par === par).map((r) => r.ratio))
    // `CONTRAST_OUT=ruta` guarda la tabla completa (la consola de los tests está silenciada).
    if (process.env.CONTRAST_OUT) writeFileSync(process.env.CONTRAST_OUT, rows.map((r) => [r.marca, r.tema, r.fondo, r.par, r.ratio.toFixed(2)].join("\t")).join("\n"))
    expect(worst("emphasis-accent")).toBeGreaterThanOrEqual(4.5)
    expect(rows.length).toBeGreaterThan(0)
  })

  for (const row of rows) {
    it(`${row.marca} ${row.tema} · ${row.par} sobre ${row.fondo}: ${row.ratio.toFixed(2)}:1`, () => {
      expect(row.ratio).toBeGreaterThanOrEqual(4.5)
    })
  }

  it("flattenAlpha y composite coinciden (sanidad del cálculo)", () => {
    expect(composite("#000000", 0x8f / 255, "#ffffff")).toBe(flattenAlpha("#0000008f", "#ffffff"))
  })
})
