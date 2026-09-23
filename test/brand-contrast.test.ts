// @vitest-environment node
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { contrastRatio, luminanceOfHex, luminanceOfOklch, type Oklch } from "./color"

type Theme = { base: number[]; contrast: string }

// tokens/brands.json son las marcas de ejemplo del sistema (playground y demos).
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
