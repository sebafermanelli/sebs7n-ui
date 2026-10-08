// @vitest-environment node
//
// Los cinco presets por industria (y el default), medidos: `createTheme` no avisa nada (el acento llega a AA como texto y sobre su tinte,
// en claro y oscuro), el texto sobre el acento llega a 4,5:1 y los neutros con el matiz del preset (marca, cálido o frío) no bajan el
// texto de AA. Imprime una tabla con los ratios (`npx vitest run test/theme-presets.test.ts`).
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { composite, contrastRatio, hexOfOklch, luminanceOfHex, luminanceOfOklch, type Oklch } from "../src/lib/contrast.js"
import { createTheme, oklchOfHex, PRESETS } from "../src/lib/theme.js"

const css = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const tint = css.slice(css.indexOf("Neutros con tinte de marca"), css.indexOf("Motor de tema (3.0)"))
const mitad = tint.indexOf(":root.dark:not(")
const tokens = { light: tint.slice(0, mitad), dark: tint.slice(mitad) }
function token(tema: "light" | "dark", nombre: string) {
  const m = tokens[tema].match(new RegExp(`--sf-${nombre}: oklch\\(from var\\(--sf-brand-src\\) ([\\d.]+) (?:var\\([^)]*\\)|calc\\(var\\([^)]*\\) \\* (\\d+)\\)) var\\(--neutral-tint-hue, h\\)(?: / ([\\d.]+))?\\);`))!
  return { l: Number(m[1]), k: m[2] ? Number(m[2]) : 1, alpha: m[3] ? Number(m[3]) : 1 }
}

const parse = (value: string): Oklch => {
  const [l, c, h] = value.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/)!.slice(1).map(Number)
  return [l!, c!, h!]
}
const filas: string[] = []

describe.each(Object.values(PRESETS))("preset $id", (preset) => {
  const theme = createTheme(preset.config)

  it("createTheme no avisa nada", () => {
    expect(theme.warnings).toEqual([])
  })

  for (const tema of ["light", "dark"] as const) {
    it(`${tema}: texto sobre el acento ≥ 4,5:1 y neutros con su matiz sin bajar el texto de AA`, () => {
      const base = parse(tema === "light" ? theme.variables.light["--brand-base"] ?? "oklch(0.573 0.214 258)" : theme.variables.dark["--brand-base-dark"] ?? theme.variables.light["--brand-base"] ?? "oklch(0.573 0.214 258)")
      const textoVar = tema === "light" ? theme.variables.light["--brand-contrast"] : theme.variables.dark["--brand-contrast-dark"]
      const texto = textoVar ?? "#ffffff"
      const sobreAcento = contrastRatio(luminanceOfOklch(base), luminanceOfHex(texto))
      expect(sobreAcento).toBeGreaterThanOrEqual(4.5)

      // Los neutros: con el matiz del preset (cálido 70, frío 240, o el de la marca) y su intensidad.
      const tinte = preset.config.neutrals?.tint ?? "brand"
      const matiz = tinte === "warm" ? 70 : tinte === "cool" ? 240 : base[2]
      const croma = tinte === "none" ? 0 : 0.01 * (preset.config.neutrals?.intensity ?? 1)
      let peor = 99
      for (const superficie of ["background", "surface-secondary", "group"]) {
        const s = token(tema, superficie)
        const bg = hexOfOklch([s.l, croma * s.k, matiz])
        for (const [nombre, minimo] of [["label", 7], ["label-secondary", 4.5]] as const) {
          const t = token(tema, nombre)
          const fg = composite(hexOfOklch([t.l, croma * t.k, matiz]), t.alpha, bg)
          const r = contrastRatio(luminanceOfHex(fg), luminanceOfHex(bg))
          if (nombre === "label-secondary") peor = Math.min(peor, r)
          expect(r, `${nombre} sobre ${superficie}`).toBeGreaterThanOrEqual(minimo)
        }
      }
      filas.push(`${preset.id.padEnd(20)} ${tema.padEnd(5)} acento/texto ${sobreAcento.toFixed(2)}  label-secondary mín ${peor.toFixed(2)}`)
    })
  }
})

it("tabla de ratios", () => {
  process.stdout.write(`\n${filas.join("\n")}\n`)
  expect(filas).toHaveLength(Object.keys(PRESETS).length * 2)
})

void oklchOfHex
