// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import {
  composite,
  contrastRatio,
  glassAlpha,
  glassSurface,
  hexOfOklch,
  luminanceOfHex,
  type Oklch,
} from "../src/lib/contrast.js"

/**
 * Texto sobre vidrio.
 *
 * Sobre una superficie sólida el contraste es un número: el texto contra el fondo. Sobre un
 * vidrio depende de lo que pase por debajo, y eso no lo decide el paquete. Lo que sí decide es
 * cuánto del fondo deja pasar, y de ahí sale lo que se puede prometer:
 *
 * 1. **Texto principal (`gray-1000`), hasta `--glass: 0.6`: 4,5:1 contra cualquier fondo.**
 *    El peor caso es negro detrás de un vidrio claro y blanco detrás de uno oscuro. Es de
 *    donde sale el 0,6 del fill: con un coeficiente más alto, en oscuro no llega.
 * 2. **Texto secundario (`gray-900`), a cualquier intensidad: 4,5:1 sobre la página y sobre la
 *    luz ambiente**, que son los dos fondos que pone el sistema.
 * 3. **Con `--glass: 0` todo vale lo mismo que en 0.8.0.**
 *
 * Lo que NO se promete, y está medido: texto secundario sobre un vidrio que flota encima de
 * un color sólido y brillante. En oscuro, con `--glass: 0.6` y el `brand-700` de emerald
 * detrás, `gray-900` da 3,28:1. La regla está en la página de Accesibilidad del sitio: sobre
 * contenido saturado, texto principal o `--glass` más bajo en ese subárbol.
 *
 * El modelo no incluye el `saturate()` del `backdrop-filter` (ver `glassSurface`). Por eso los
 * umbrales son los de WCAG y no un decimal por encima: el margen ya está en los números
 * (7,11 y 4,68 para el caso 1).
 */
const root = join(import.meta.dirname, "..")
const theme = readFileSync(join(root, "src/styles/theme.css"), "utf8")
const colors = readFileSync(join(root, "src/styles/colors.css"), "utf8")

const bloque = (css: string, tema: "light" | "dark") => {
  const inicio = css.indexOf(tema === "light" ? ":root {" : ".dark {")
  return css.slice(inicio, css.indexOf("\n  }", inicio))
}
const hex = (css: string, tema: "light" | "dark", token: string) => {
  const m = bloque(css, tema).match(new RegExp(`${token}:\\s*(#[0-9a-f]{6});`))
  if (!m) throw new Error(`${token} no está en ${tema}`)
  return m[1]!
}

const GLASS = Number(theme.match(/--glass:\s*([\d.]+);/)![1])

const tokens = (tema: "light" | "dark") => ({
  surface: hex(colors, tema, "--sf-background-100"),
  lift: hex(theme, tema, "--sf-glass-lift"),
  page: hex(theme, tema, "--sf-background"),
  principal: hex(colors, tema, "--sf-gray-1000"),
  secundario: hex(colors, tema, "--sf-gray-900"),
  peor: tema === "light" ? "#000000" : "#ffffff",
})

/** Los tres focos de la luz ambiente de una marca, ya compuestos sobre la página. */
function ambiente(tema: "light" | "dark", base: number[], page: string): string[] {
  const css = bloque(theme, tema)
  const mezcla = Object.fromEntries(
    [...theme.matchAll(/var\(--sf-ambient-(\d)\) (\d+)%/g)].map(([, n, pct]) => [n, Number(pct) / 100])
  )
  const focos = [...css.matchAll(/--sf-ambient-(\d): oklch\(from var\(--sf-brand-src\) ([\d.]+) calc\(c \* ([\d.]+)\) (?:h|calc\(h ([+-]) (\d+)\))\)/g)]
  expect(focos, `focos de luz ambiente en ${tema}`).toHaveLength(3)
  return focos.map(([, n, l, k, signo, grados]) => {
    const h = base[2]! + (signo ? Number(`${signo}${grados}`) : 0)
    return composite(hexOfOklch([Number(l), base[1]! * Number(k), h] as unknown as Oklch), mezcla[n!]!, page)
  })
}

const ratio = (fg: string, bg: string) => contrastRatio(luminanceOfHex(fg), luminanceOfHex(bg))
const marcas = brands as Record<string, Record<string, { base: number[] }>>

describe("el modelo", () => {
  it("el default del paquete es 0,6 y su alfa es 0,64", () => {
    expect(GLASS).toBe(0.6)
    expect(glassAlpha(GLASS)).toBeCloseTo(0.64, 10)
  })

  it("con --glass: 0 la superficie es background-100, pase lo que pase por debajo", () => {
    for (const tema of ["light", "dark"] as const) {
      const t = tokens(tema)
      expect(glassSurface(0, t, t.peor)).toBe(t.surface)
    }
  })
})

describe("Texto principal sobre vidrio, contra cualquier fondo (WCAG 1.4.3)", () => {
  for (const tema of ["light", "dark"] as const) {
    const t = tokens(tema)
    const fondo = glassSurface(GLASS, t, t.peor)
    it(`${tema} · --glass ${GLASS}: ${t.principal} sobre ${fondo} (${t.peor} detrás) llega a 4.5:1`, () => {
      expect(ratio(t.principal, fondo)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe("Texto secundario sobre vidrio, sobre los fondos del sistema (WCAG 1.4.3)", () => {
  for (const tema of ["light", "dark"] as const) {
    const t = tokens(tema)
    for (const g of [GLASS, 1]) {
      it(`${tema} · --glass ${g} · página: llega a 4.5:1`, () => {
        expect(ratio(t.secundario, glassSurface(g, t, t.page))).toBeGreaterThanOrEqual(4.5)
      })
      for (const [marca, temas] of Object.entries(marcas)) {
        it(`${tema} · --glass ${g} · luz ambiente de ${marca}: llega a 4.5:1`, () => {
          for (const foco of ambiente(tema, temas[tema]!.base, t.page)) {
            expect(ratio(t.secundario, glassSurface(g, t, foco)), foco).toBeGreaterThanOrEqual(4.5)
          }
        })
      }
    }
  }
})
