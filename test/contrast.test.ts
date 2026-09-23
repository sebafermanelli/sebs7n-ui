// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { contrastRatio, flattenAlpha, luminanceOfHex, luminanceOfOklch, type Oklch } from "../src/lib/contrast.js"

/**
 * La tabla de contraste del sistema.
 *
 * Los valores salen de los CSS del paquete, no de una copia: si alguien cambia
 * un token, cambia el número que se verifica acá. Están los pares que la
 * auditoría de 0.4.0 encontró abajo del umbral —para que la corrección no se
 * pierda en el próximo retoque de color— y también los que ya pasaban, que son
 * los que evitan que una corrección de allá rompa acá.
 *
 * Umbrales: 4,5:1 para texto (WCAG 1.4.3, AA, cuerpo normal) y 3:1 para lo que
 * dibuja un control o el foco (1.4.11 y 2.4.11).
 *
 * **Los estados deshabilitados quedan exentos a propósito.** 1.4.3 y 1.4.11
 * eximen explícitamente a los componentes inactivos, y tiene sentido: un
 * control apagado tiene que verse apagado, y subirlo a 4,5:1 lo haría
 * indistinguible de uno que anda. Por eso `gray-400` como borde y `gray-700`
 * como texto sobre `gray-100` no aparecen acá, y no es un olvido.
 *
 * El par texto/fondo del botón de marca lo verifica `brand-contrast.test.ts`;
 * acá está el otro uso de `brand-700`, que es el anillo de foco.
 */
const root = join(import.meta.dirname, "..")
const read = (file: string) => readFileSync(join(root, "src/styles", file), "utf8")

/** `#fff` → `#ffffff`: la fórmula de color.ts lee de a dos caracteres. */
const expandir = (hex: string) => (hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join("")}` : hex)

/**
 * `--x: #aabbcc;` dentro del bloque `:root` (claro) o `.dark` (oscuro).
 *
 * También junta los alias de un token a otro (`--sf-focus-border:
 * var(--sf-gray-alpha-800)`), que se resuelven después en `resolver()`: un
 * alias existe justamente para que el hexadecimal viva en un solo lugar, y si
 * el test lo copiara volvería a haber dos.
 */
function tokens(file: string, theme: "light" | "dark"): Record<string, string> {
  const css = read(file)
  const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
  const cuerpo = css.slice(inicio, css.indexOf("\n  }", inicio))
  return Object.fromEntries(
    [...cuerpo.matchAll(/(--sf-[a-z0-9-]+):\s*(#[0-9a-f]{3,8}|var\(--sf-[a-z0-9-]+\));/g)].map(([, name, value]) => [
      name,
      value!.startsWith("#") ? expandir(value!) : value!,
    ])
  )
}

/** Sigue las cadenas `var(--sf-x)` hasta el hexadecimal. */
function resolver(tabla: Record<string, string>): Record<string, string> {
  const salida: Record<string, string> = {}
  for (const [name, value] of Object.entries(tabla)) {
    let actual = value
    for (let i = 0; i < 8 && actual.startsWith("var("); i++) actual = tabla[actual.slice(4, -1)] ?? actual
    if (actual.startsWith("#")) salida[name] = actual
  }
  return salida
}

const paleta = {
  light: resolver({ ...tokens("colors.css", "light"), ...tokens("theme.css", "light") }),
  dark: resolver({ ...tokens("colors.css", "dark"), ...tokens("theme.css", "dark") }),
}

/**
 * `--sf-button-error-*` se declara una sola vez, en `:root`: es igual en los dos
 * temas a propósito (ver el comentario en theme.css). Lo que sí cambia por tema
 * es el fondo de reposo, `bg-red-800`.
 */
const heredado = (theme: "light" | "dark", token: string) => paleta[theme][token] ?? paleta.light[token]!

const ratio = (fg: string, bg: string) => contrastRatio(luminanceOfHex(fg), luminanceOfHex(bg))

/** Los tres roles de fondo del sistema: página, superficie y banda. */
const FONDOS = {
  página: "--sf-background",
  superficie: "--sf-background-100",
  banda: "--sf-background-200",
} as const

/** Las nueve paletas del Badge y del Tag. */
const PALETAS = ["gray", "brand", "red", "amber", "green", "blue", "teal", "purple", "pink"] as const

// Los grises que el paquete usa COMO TEXTO, sobre los tres fondos. `gray-800` no
// está en la lista: no se usa como texto en ninguno de los 58 componentes, y en
// claro da 4,12:1, así que no podría. `gray-700` tampoco: quedó como color de
// borde y de estado deshabilitado, que es donde sí puede vivir.
describe("Grises de texto sobre los tres fondos (WCAG 1.4.3)", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const token of ["--sf-gray-900", "--sf-gray-1000"] as const) {
      for (const [donde, fondo] of Object.entries(FONDOS)) {
        const fg = paleta[theme][token]!
        const bg = paleta[theme][fondo]!
        it(`${theme} · ${token.replace("--sf-", "")} sobre ${donde}: ${fg} / ${bg} llega a 4.5:1`, () => {
          expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }
  }
})

// El Badge `subtle` es el mismo cuerpo en las nueve paletas: texto `-900` sobre
// fondo `-100`. Una paleta que se retoque de a un paso rompe acá antes de
// llegar a una pantalla.
describe("Badge subtle en las nueve paletas (WCAG 1.4.3)", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const color of PALETAS) {
      // `brand` se calcula en OKLCH desde la variable de la app: lo cubre brand-contrast.test.ts.
      if (color === "brand") continue
      const fg = paleta[theme][`--sf-${color}-900`]!
      const bg = paleta[theme][`--sf-${color}-100`]!
      it(`${theme} · ${color}: ${fg} sobre ${bg} llega a 4.5:1`, () => {
        expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

/**
 * El anillo de foco (`focus-ring`) es `0 0 0 2px background-100, 0 0 0 4px
 * brand-700`: el anillo de marca con un separador del color de la superficie
 * para que se despegue del control. Lo que tiene que llegar a 3:1 (WCAG 2.4.11)
 * es `brand-700` contra ese separador, que es la superficie.
 *
 * Las cuatro marcas de `tokens/brands.json` son las de ejemplo; una app define
 * la suya y no toca este archivo, pero el umbral es el mismo. Se calcula en
 * OKLCH porque así se declaran.
 */
describe("Anillo de foco en las cuatro marcas (WCAG 2.4.11)", () => {
  const marcas = brands as Record<string, Record<string, { base: number[]; contrast: string }>>
  for (const [marca, temas] of Object.entries(marcas)) {
    for (const [theme, { base }] of Object.entries(temas)) {
      const bg = paleta[theme as "light" | "dark"]["--sf-background-100"]!
      it(`${marca} (${theme}): el anillo sobre ${bg} llega a 3:1`, () => {
        const r = contrastRatio(luminanceOfOklch(base as unknown as Oklch), luminanceOfHex(bg))
        expect(r).toBeGreaterThanOrEqual(3)
      })
    }
  }
})

// El Badge `solid` gris: el texto es el fondo de la superficie sobre el gris más
// fuerte de la escala. Es el par que se invierte entre temas, y por eso vale
// verificarlo aunque sea obvio mirándolo.
describe("Badge solid gris (WCAG 1.4.3)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = paleta[theme]["--sf-background-100"]!
    const bg = paleta[theme]["--sf-gray-1000"]!
    it(`${theme}: ${fg} sobre ${bg} llega a 4.5:1`, () => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe("Button variant=\"destructive\" (WCAG 1.4.3, texto normal)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = heredado(theme, "--sf-button-error-fg")
    const estados = {
      reposo: paleta[theme]["--sf-red-800"]!,
      hover: heredado(theme, "--sf-button-error-hover"),
      active: heredado(theme, "--sf-button-error-active"),
    }
    for (const [estado, bg] of Object.entries(estados)) {
      it(`${theme} · ${estado}: ${fg} sobre ${bg} llega a 4.5:1`, () => {
        expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// Los atajos de DropdownMenu, ContextMenu y Menubar son contenido informativo,
// no decoración: enseñan el otro camino a la misma acción. En `gray-700` daban
// 3,23:1 sobre la superficie del popup y 2,71:1 sobre el ítem resaltado.
describe("Atajo de menú sobre el popup (WCAG 1.4.3)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = paleta[theme]["--sf-gray-900"]!
    const fondos = {
      popup: paleta[theme]["--sf-background-100"]!,
      "ítem resaltado": paleta[theme]["--sf-gray-200"]!,
      "ítem apretado": paleta[theme]["--sf-gray-300"]!,
    }
    for (const [fondo, bg] of Object.entries(fondos)) {
      it(`${theme} · ${fondo}: ${fg} sobre ${bg} llega a 4.5:1`, () => {
        expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// El borde del campo enfocado es el indicador de foco de los campos: es lo
// único que dice dónde estás parado al tabular por un formulario. WCAG 2.4.11
// (AA en 2.2) le pide 3:1 contra el fondo. Los `gray-alpha-*` son alfa, así que
// el ratio que se ve es el del color YA compuesto contra la superficie.
describe("Borde de foco de los campos (WCAG 2.4.11)", () => {
  for (const theme of ["light", "dark"] as const) {
    const bg = paleta[theme]["--sf-background-100"]!
    const fg = flattenAlpha(paleta[theme]["--sf-focus-border"]!, bg)
    it(`${theme}: ${fg} sobre ${bg} llega a 3:1`, () => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3)
    })
  }
})

// Checkbox, Radio, Switch y Toggle sin marcar no tienen relleno ni texto que
// los dibuje: si el contorno no se ve, el control no existe. Por eso caen bajo
// WCAG 1.4.11 (3:1 contra el fondo adyacente) y no bajo la licencia de la
// decoración. `gray-500` daba 1,66:1 en claro y `gray-400`, 1,20:1.
describe("Contorno de control sin marcar (WCAG 1.4.11)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = paleta[theme]["--sf-gray-700"]!
    const superficies = {
      "superficie del campo": paleta[theme]["--sf-background-100"]!,
      página: paleta[theme]["--sf-background"]!,
      banda: paleta[theme]["--sf-background-200"]!,
    }
    for (const [donde, bg] of Object.entries(superficies)) {
      it(`${theme} · ${donde}: ${fg} sobre ${bg} llega a 3:1`, () => {
        expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3)
      })
    }
    // El pulgar del Switch apagado es blanco puro: de qué lado está es lo que
    // dice si está prendido. Si la pista es demasiado clara, el pulgar
    // desaparece dentro de ella y el estado deja de leerse.
    it(`${theme} · pulgar del Switch apagado: #ffffff sobre ${fg} llega a 3:1`, () => {
      expect(ratio("#ffffff", fg)).toBeGreaterThanOrEqual(3)
    })
  }
})

// El placeholder es texto, no decoración: en un formulario largo es lo único
// que dice qué espera el campo hasta que alguien escribe. En `gray-700` —el
// tono de Geist— daba 3,23:1 en claro. Un solo tono para los dos temas: el
// mismo `gray-900` del texto secundario pasa en los dos.
describe("Placeholder sobre la superficie del campo (WCAG 1.4.3)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = paleta[theme]["--sf-gray-900"]!
    const bg = paleta[theme]["--sf-background-100"]!
    it(`${theme}: ${fg} sobre ${bg} llega a 4.5:1`, () => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })
  }
})
