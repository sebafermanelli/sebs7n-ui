// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { composite, contrastRatio, flattenAlpha, hexOfOklch, luminanceOfHex, luminanceOfOklch, type Oklch } from "../src/lib/contrast.js"

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

/** `#fff` → `#ffffff`: `luminanceOfHex` de `src/lib/contrast.ts` lee de a dos caracteres. */
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

// El Badge `subtle` es el mismo cuerpo en las nueve paletas: la tinta de la paleta sobre su
// propio `-700` en alfa, compuesto sobre lo que tenga debajo. Los tres números —cuánto de
// `-900` lleva la tinta, cuánto tinte lleva el fondo en cada tema— se leen de theme.css: si
// alguien sube el tinte para que «se note más», el contraste que pierde aparece acá.
//
// `-900` solo, que era el texto hasta 0.8, no aguanta un tinte visible: sobre el 12 % da
// 4,23:1 con el rojo. Por eso existe la tinta.
describe("Badge subtle: la tinta sobre su tinte (WCAG 1.4.3)", () => {
  const css = read("theme.css")
  const mezcla = Number(css.match(/--color-red-ink: color-mix\(in srgb, var\(--sf-red-900\) (\d+)%/)![1]) / 100
  const marcas = brands as Record<string, Record<string, { base: number[] }>>
  // Los mismos pasos de la escala de brand que declara theme.css: luminosidad fija y croma relativo.
  const ESCALA = { light: { 900: [0.535, 0.945], 1000: [0.269, 0.433] }, dark: { 900: [0.717, 0.705], 1000: [0.968, 0.077] } } as const

  it("la tinta de las ocho paletas de color sale de la misma mezcla", () => {
    for (const color of PALETAS) {
      if (color === "gray") continue
      expect(css, color).toContain(`--color-${color}-ink: color-mix(in srgb, var(--sf-${color}-900) ${mezcla * 100}%, var(--sf-${color}-1000));`)
    }
  })

  for (const theme of ["light", "dark"] as const) {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    const tinte = Number(css.slice(inicio, css.indexOf("\n  }", inicio)).match(/--sf-tint-fill: (\d+)%/)![1]) / 100
    for (const [donde, token] of Object.entries(FONDOS)) {
      const debajo = paleta[theme][token]!
      for (const color of PALETAS) {
        if (color === "gray" || color === "brand") continue
        const tinta = composite(paleta[theme][`--sf-${color}-900`]!, mezcla, paleta[theme][`--sf-${color}-1000`]!)
        const fondo = composite(paleta[theme][`--sf-${color}-700`]!, tinte, debajo)
        it(`${theme} · ${color} sobre ${donde}: ${tinta} sobre ${fondo} llega a 4.5:1`, () => {
          expect(ratio(tinta, fondo)).toBeGreaterThanOrEqual(4.5)
        })
      }
      // `brand` no tenía test: «lo cubre brand-contrast.test.ts» decía el comentario, pero ese
      // mide el texto sobre `brand-700` sólido, no el Badge. Con `-900` sobre `-100`, el verde
      // de ejemplo estaba en 4,50:1 clavado.
      for (const [marca, temas] of Object.entries(marcas)) {
        const base = temas[theme]!.base
        const paso = (n: 900 | 1000) => hexOfOklch([ESCALA[theme][n][0], base[1]! * ESCALA[theme][n][1], base[2]!] as unknown as Oklch)
        const tinta = composite(paso(900), mezcla, paso(1000))
        const fondo = composite(hexOfOklch(base as unknown as Oklch), tinte, debajo)
        it(`${theme} · brand ${marca} sobre ${donde}: ${tinta} sobre ${fondo} llega a 4.5:1`, () => {
          expect(ratio(tinta, fondo)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }
    it(`${theme} · gray: gray-900 sobre gray-alpha-200 llega a 4.5:1`, () => {
      const fondo = flattenAlpha(paleta[theme]["--sf-gray-alpha-200"]!, paleta[theme]["--sf-background-100"]!)
      expect(ratio(paleta[theme]["--sf-gray-900"]!, fondo)).toBeGreaterThanOrEqual(4.5)
    })
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
// 3,23:1 sobre la superficie del popup. Sobre el ítem resaltado lo mide el
// bloque de «Texto sobre la selección», más abajo.
describe("Atajo de menú sobre el popup (WCAG 1.4.3)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = paleta[theme]["--sf-gray-900"]!
    const bg = paleta[theme]["--sf-background-100"]!
    it(`${theme} · popup: ${fg} sobre ${bg} llega a 4.5:1`, () => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

// El borde del campo enfocado es el indicador de foco de los campos: es lo
// único que dice dónde estás parado al tabular por un formulario. WCAG 2.4.11
// (AA en 2.2) le pide 3:1 contra el fondo. Desde 1.0 ese borde es `brand-700`,
// el mismo color del anillo de foco, así que el número es el de arriba: lo que
// se verifica acá es que el token siga apuntando ahí en los dos temas, que es
// lo que hace que ese número valga también para los campos. El halo de 4px no
// se mide: es énfasis, y con puntero ni siquiera aparece.
describe("Borde de foco de los campos (WCAG 2.4.11)", () => {
  const css = read("theme.css")
  it("es brand-700, el color que ya verifica el anillo de foco", () => {
    expect(css.match(/--sf-focus-border:\s*var\(--sf-brand-700\);/g)).toHaveLength(1)
    // Una sola declaración, en `:root`: `.dark` la hereda, y `--sf-brand-700` ya cambia por tema.
    expect(css).not.toMatch(/--sf-focus-border:\s*var\(--sf-gray/)
  })
})

// El resaltado de un ítem de menú y el activo del Sidebar son el brand en tinte,
// compuesto sobre la superficie. El texto de adentro es `gray-1000` y el
// secundario —atajos, emails— `gray-900`.
describe("Texto sobre la selección, en las cuatro marcas (WCAG 1.4.3)", () => {
  const css = read("theme.css")
  const marcas = brands as Record<string, Record<string, { base: number[] }>>
  for (const theme of ["light", "dark"] as const) {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    const cuerpo = css.slice(inicio, css.indexOf("\n  }", inicio))
    const tinte = (token: string) =>
      Number(cuerpo.match(new RegExp(`${token}: color-mix\\(in srgb, var\\(--sf-brand-700\\) (\\d+)%`))![1]) / 100
    for (const [estado, token] of [["resaltado", "--sf-highlight"], ["apretado", "--sf-highlight-active"]] as const) {
      for (const [marca, temas] of Object.entries(marcas)) {
        const fondo = composite(hexOfOklch(temas[theme]!.base as unknown as Oklch), tinte(token), paleta[theme]["--sf-background-100"]!)
        it(`${theme} · ${marca} · ${estado}: gray-900 sobre ${fondo} llega a 4.5:1`, () => {
          expect(ratio(paleta[theme]["--sf-gray-900"]!, fondo)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }
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
