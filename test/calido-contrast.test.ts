// @vitest-environment node
//
// 3.0 «cálido»: el campo con el puntero sube a `fill-2` (hover) y el tinte es el default. Mide los pares nuevos en claro y en
// oscuro con cinco marcas (las cuatro de ejemplo y un verde pino): `label` y `label-secondary` (placeholder, ayuda) sobre
// `fill-1` / `fill-2` / `fill-3` compuestos sobre página, superficie y grupo, con el croma por defecto (0,01) y el tope de
// lo medido. Si falla, el tinte o el relleno se corrigen: nunca se baja el umbral. Imprime el peor caso de cada marca.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { composite, contrastRatio, hexOfOklch, luminanceOfHex, type Oklch } from "../src/lib/contrast.js"

type Theme = { base: number[]; contrast: string }
const MARCAS: Record<string, Record<"light" | "dark", Theme>> = {
  ...(brands as Record<string, Record<"light" | "dark", Theme>>),
  pino: { light: { base: [0.42, 0.09, 160], contrast: "#ffffff" }, dark: { base: [0.7, 0.11, 160], contrast: "#000000" } },
}

const css = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")
const block = css.slice(css.indexOf("Neutros con tinte de marca"))
const cut = block.indexOf(":root.dark:not(")
const tintCss = { light: block.slice(0, cut), dark: block.slice(cut) }
function token(theme: "light" | "dark", name: string) {
  const m = tintCss[theme].match(new RegExp(`--sf-${name}: oklch\\(from var\\(--sf-brand-src\\) ([\\d.]+) (?:var\\([^)]*\\)|calc\\(var\\([^)]*\\) \\* (\\d+)\\)) h(?: / ([\\d.]+))?\\);`))!
  return { l: Number(m[1]), k: m[2] ? Number(m[2]) : 1, alpha: m[3] ? Number(m[3]) : 1 }
}

const SURFACES = ["background", "surface-secondary", "group"]
const FILLS = ["fill-1", "fill-2", "fill-3"]
const worst: Record<string, number> = {}

for (const [marca, themes] of Object.entries(MARCAS)) {
  for (const tema of ["light", "dark"] as const) {
    const hue = themes[tema].base[2]!
    for (const chroma of [0.01, 0.005]) {
      it(`${marca} (${tema}, croma ${chroma}): label y label-secondary sobre los rellenos`, () => {
        const color = (name: string) => {
          const t = token(tema, name)
          return { hex: hexOfOklch([t.l, chroma * t.k, hue] as Oklch), alpha: t.alpha }
        }
        for (const s of SURFACES) {
          const bg = color(s).hex
          for (const f of FILLS) {
            const fill = color(f)
            const base = composite(fill.hex, fill.alpha, bg)
            for (const [name, min] of [["label", 7], ["label-secondary", 4.5]] as const) {
              const t = color(name)
              const ratio = contrastRatio(luminanceOfHex(composite(t.hex, t.alpha, base)), luminanceOfHex(base))
              worst[`${marca}/${tema}`] = Math.min(worst[`${marca}/${tema}`] ?? 99, name === "label-secondary" ? ratio : 99)
              expect(ratio, `${name} sobre ${f} sobre ${s}`).toBeGreaterThanOrEqual(min)
            }
          }
        }
      })
    }
  }
}

it("peor label-secondary sobre un relleno, por marca y tema", () => {
  process.stdout.write(`\nPEOR ${JSON.stringify(Object.fromEntries(Object.entries(worst).map(([k, v]) => [k, Number(v.toFixed(2))])))}\n`)
  expect(Object.keys(worst).length).toBe(10)
})
