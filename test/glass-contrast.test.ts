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
 * 1. **Con el default (`--glass: 1`), texto principal y secundario: 4,5:1 sobre la página y
 *    sobre la luz ambiente**, que son los dos fondos que pone el sistema.
 * 2. **Hasta `--glass: 0.5`, texto principal: 4,5:1 contra cualquier fondo.** El peor caso es
 *    negro detrás de un vidrio claro y blanco detrás de uno oscuro.
 * 3. **Con `--glass: 0` todo vale lo mismo que en 0.8.0.**
 *
 * Lo que NO se promete, y está medido acá abajo para que no sea una opinión: con el default,
 * el texto sobre un vidrio que flota encima de contenido arbitrario. Negro detrás de un
 * vidrio claro deja `gray-1000` en 2,12:1; blanco detrás de uno oscuro, en 1,64:1. Es el costo
 * del Liquid Glass, y fue una decisión (2026-09-27), no un descuido. La salida está en la
 * página de Accesibilidad del sitio: `--glass: 0.5` en el subárbol que flota sobre fotos o
 * video, y `prefers-reduced-transparency` / `prefers-contrast` vuelven todo sólido.
 *
 * El modelo no incluye el `backdrop-filter` ni el brillo del canto (ver `glassSurface`). Por
 * eso los umbrales son los de WCAG y no un decimal por encima: el margen ya está en los
 * números (5,07 el más justo del caso 1; 4,90 el del caso 2).
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
/** La intensidad más alta con la que el texto principal pasa contra cualquier fondo. */
const GLASS_SEGURO = 0.5

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
  // El peor caso es `--ambient: 1`, el default: con menos luz el fondo se acerca a la página.
  const ganancia = Number(/--sf-ambient-gain: ([\d.]+)/.exec(css)?.[1])
  expect(ganancia, `--sf-ambient-gain en ${tema}`).toBeGreaterThan(0)
  const mezcla = Object.fromEntries(
    [...theme.matchAll(/from var\(--sf-ambient-(\d)\) l c h \/ calc\(([\d.]+) \* var\(--ambient\) \* var\(--sf-ambient-gain\)\)/g)].map(([, n, alfa]) => [
      n,
      Number(alfa) * ganancia,
    ])
  )
  expect(Object.keys(mezcla), "focos en bg-ambient").toHaveLength(3)
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
  it("el default del paquete es 1 y su alfa es 0,3", () => {
    expect(GLASS).toBe(1)
    expect(glassAlpha(GLASS)).toBeCloseTo(0.3, 10)
  })

  it("con --glass: 0 la superficie es background-100, pase lo que pase por debajo", () => {
    for (const tema of ["light", "dark"] as const) {
      const t = tokens(tema)
      expect(glassSurface(0, t, t.peor)).toBe(t.surface)
    }
  })
})

describe("Texto sobre vidrio, sobre los fondos del sistema (WCAG 1.4.3)", () => {
  for (const tema of ["light", "dark"] as const) {
    const t = tokens(tema)
    for (const [rol, fg] of [["principal", t.principal], ["secundario", t.secundario]] as const) {
      it(`${tema} · --glass ${GLASS} · ${rol} sobre la página: llega a 4.5:1`, () => {
        expect(ratio(fg, glassSurface(GLASS, t, t.page))).toBeGreaterThanOrEqual(4.5)
      })
      for (const [marca, temas] of Object.entries(marcas)) {
        it(`${tema} · --glass ${GLASS} · ${rol} sobre la luz ambiente de ${marca}: llega a 4.5:1`, () => {
          for (const foco of ambiente(tema, temas[tema]!.base, t.page)) {
            expect(ratio(fg, glassSurface(GLASS, t, foco)), foco).toBeGreaterThanOrEqual(4.5)
          }
        })
      }
    }
  }
})

describe("Texto principal sobre vidrio, contra cualquier fondo (WCAG 1.4.3)", () => {
  for (const tema of ["light", "dark"] as const) {
    const t = tokens(tema)
    const fondo = glassSurface(GLASS_SEGURO, t, t.peor)
    it(`${tema} · --glass ${GLASS_SEGURO}: ${t.principal} sobre ${fondo} (${t.peor} detrás) llega a 4.5:1`, () => {
      expect(ratio(t.principal, fondo)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

// No es un test de que algo ande: es el límite, escrito donde no se puede desactualizar. Si
// alguien sube el fill y esto empieza a pasar de 4,5, el comentario de arriba y la página de
// Accesibilidad están prometiendo de menos y hay que corregirlos.
describe("El límite conocido del default", () => {
  for (const tema of ["light", "dark"] as const) {
    const t = tokens(tema)
    it(`${tema} · --glass ${GLASS}: el texto principal contra el peor fondo NO llega a 4.5:1`, () => {
      expect(ratio(t.principal, glassSurface(GLASS, t, t.peor))).toBeLessThan(4.5)
    })
  }
})
