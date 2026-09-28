// @vitest-environment node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { contrastRatio, luminanceOfHex, luminanceOfOklch, type Oklch } from "../src/lib/contrast.js"

type Theme = { base: number[]; contrast: string }

// tokens/brands.json son las marcas de ejemplo del sistema (demos del sitio).
// Una app real define sus tres variables en su propio CSS y no toca este archivo,
// pero el umbral que se verifica acá es el mismo que tiene que cumplir.
describe("brand-700 + brand-contrast", () => {
  for (const [brand, themes] of Object.entries(brands as Record<string, Record<string, Theme>>)) {
    for (const [theme, { base, contrast }] of Object.entries(themes)) {
      it(`${brand} (${theme}) llega a AA 4.5:1`, () => {
        const ratio = contrastRatio(luminanceOfOklch(base as unknown as Oklch), luminanceOfHex(contrast))
        expect(ratio).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// La selección de 2.0 (`bg-selection` + `text-on-selection`) es el mismo par que el botón
// `accent`. Este bloque ata las dos cosas: si alguien cambia el token de selección a otro
// escalón o a otro texto, la cuenta de contraste de arriba deja de cubrirlo y esto falla.
describe("selección: on-selection sobre selection", () => {
  const theme = readFileSync(fileURLToPath(new URL("../src/styles/theme.css", import.meta.url)), "utf8")

  it("en claro y en oscuro, selection es brand-700 y on-selection es el contraste del brand", () => {
    expect(theme.match(/--sf-selection: var\(--sf-brand-700\);/g)).toHaveLength(2)
    expect(theme.match(/--sf-on-selection: var\(--sf-brand-fg\);/g)).toHaveLength(2)
    expect(theme).toMatch(/--sf-brand-src: var\(--brand-base\);\s*--sf-brand-fg: var\(--brand-contrast\);/)
    expect(theme).toMatch(/--sf-brand-src: var\(--brand-base-dark\);\s*--sf-brand-fg: var\(--brand-contrast-dark\);/)
    expect(theme).toMatch(/--sf-brand-700: var\(--sf-brand-src\);[\s\S]*--sf-brand-700: var\(--sf-brand-src\);/)
  })

  // El brand por defecto del paquete: `--brand-base` y `--brand-contrast` de `:root`, que
  // `--brand-base-dark` y `--brand-contrast-dark` heredan.
  const [, l, c, h] = theme.match(/--brand-base: oklch\(([\d.]+) ([\d.]+) ([\d.]+)\);/) ?? []
  const [, corto = ""] = theme.match(/--brand-contrast: (#[0-9a-f]{3,6});/i) ?? []
  // `luminanceOfHex` lee #rrggbb: el `#fff` del tema se expande.
  const hex = corto.length === 4 ? `#${[...corto.slice(1)].map((d) => d + d).join("")}` : corto
  const porDefecto: Record<string, Theme> = {
    light: { base: [l, c, h].map(Number), contrast: hex },
    dark: { base: [l, c, h].map(Number), contrast: hex },
  }
  const casos = { "por defecto": porDefecto, ...(brands as Record<string, Record<string, Theme>>) }

  for (const [brand, themes] of Object.entries(casos)) {
    for (const [tema, { base: b, contrast: c }] of Object.entries(themes)) {
      it(`${brand} (${tema}): la selección llega a AA 4.5:1`, () => {
        const ratio = contrastRatio(luminanceOfOklch(b as unknown as Oklch), luminanceOfHex(c))
        expect(ratio).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
