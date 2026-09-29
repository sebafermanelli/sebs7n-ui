// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { badgeVariants } from "../src/variants/badge.js"
import { buttonVariants } from "../src/variants/button.js"
import { composite, contrastRatio, flattenAlpha, hexOfOklch, luminanceOfHex, type Oklch } from "../src/lib/contrast.js"

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

/**
 * Tres fondos de iCloud (2.0): la página, lo que flota (menús, diálogos) y la columna del
 * sidebar. El resto de las superficies y los textos `label*` los cubre `surfaces.test.ts`.
 */
const FONDOS = {
  página: "--sf-background",
  superficie: "--sf-surface",
  sidebar: "--sf-surface-secondary",
} as const

/** Las nueve paletas del Badge y del Tag. */
const PALETAS = ["gray", "brand", "red", "amber", "green", "blue", "teal", "purple", "pink"] as const

// Los textos de los componentes (2.0) son los `label*` de iCloud, en alfa: su contraste sobre cada
// superficie lo mide `surfaces.test.ts`, que sabe componerlos. Acá quedan los colores sólidos.

/**
 * El anillo de foco de iCloud (2.0, catálogo §1.7): `inset 0 0 0 3px` del color de foco, que sale
 * del brand (`--sf-focus`, con `--sf-focus-alpha`). iCloud lo pinta al 70 %; con las marcas de
 * ejemplo el 70 % queda en 2,7–2,9:1 en claro, así que el default es la marca plena y el 70 % es
 * una opción de la app cuya marca lo aguante. Lo que tiene que llegar a 3:1 (WCAG 1.4.11 y
 * 2.4.11) es el anillo contra la página y contra lo que flota, con el alfa que declare el tema.
 *
 * Las cuatro marcas de `tokens/brands.json` son las de ejemplo; una app define la suya y no toca
 * este archivo, pero el umbral es el mismo. Se calcula en OKLCH porque así se declaran.
 */
describe("Anillo de foco interior en las cuatro marcas (WCAG 1.4.11)", () => {
  const css = read("theme.css")
  const alfa = (theme: "light" | "dark") => {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    const cuerpo = css.slice(inicio, css.indexOf("\n  }", inicio))
    const valor = /--sf-focus-alpha:\s*(\d+)%;/.exec(cuerpo)?.[1] ?? /--sf-focus-alpha:\s*(\d+)%;/.exec(css)![1]
    return Number(valor) / 100
  }

  it("focus-ring es el anillo interior de 3px, sin outline", () => {
    const util = css.slice(css.indexOf("@utility focus-ring {"), css.indexOf("\n}", css.indexOf("@utility focus-ring {")))
    expect(util).toContain("outline: none;")
    expect(util).toContain("box-shadow: inset 0 0 0 3px var(--sf-focus);")
    expect(css).toContain("--sf-focus: color-mix(in srgb, var(--sf-brand-700) var(--sf-focus-alpha), transparent);")
  })

  it("los campos llevan el mismo anillo: 1px de borde y 2 de sombra interior, 3 desde el filo", () => {
    const util = css.slice(css.indexOf("@utility focus-border {"), css.indexOf("\n}", css.indexOf("@utility focus-border {")))
    expect(util).toContain("border-color: var(--sf-focus);")
    expect(util).toContain("box-shadow: inset 0 0 0 2px var(--sf-focus);")
    expect(util).not.toContain("data-sf-modality")
  })

  // Sobre un fondo de marca (botón `accent`, casilla marcada) el anillo sería del mismo color que
  // el fondo: ahí va el color de contraste de la marca, el par que `brand-contrast.test.ts` ya
  // lleva a 4,5:1. Sobre el rojo destructivo, el blanco del botón.
  it("sobre la marca, el anillo es el color de contraste (focus-ring-inverse)", () => {
    const util = css.slice(css.indexOf("@utility focus-ring-inverse {"), css.indexOf("\n}", css.indexOf("@utility focus-ring-inverse {")))
    expect(util).toContain("box-shadow: inset 0 0 0 3px var(--sf-focus-inverse, var(--sf-brand-fg));")
    for (const variant of ["accent", "destructive"] as const) {
      expect(buttonVariants({ variant }).split(" "), variant).toContain("focus-visible:focus-ring-inverse")
      expect(buttonVariants({ variant }).split(" "), variant).not.toContain("focus-visible:focus-ring")
    }
    expect(buttonVariants({ variant: "destructive" })).toContain("[--sf-focus-inverse:var(--sf-button-error-fg)]")
    for (const file of ["checkbox.tsx", "radio-group.tsx", "switch.tsx"]) {
      expect(readFileSync(join(root, "src/components", file), "utf8"), file).toContain("data-checked:focus-visible:focus-ring-inverse")
    }
  })

  const marcas = brands as Record<string, Record<string, { base: number[]; contrast: string }>>
  for (const [marca, temas] of Object.entries(marcas)) {
    for (const [theme, { base }] of Object.entries(temas)) {
      const t = theme as "light" | "dark"
      for (const fondo of ["--sf-background", "--sf-surface"] as const) {
        const bg = paleta[t][fondo]!
        const anillo = composite(hexOfOklch(base as unknown as Oklch), alfa(t), bg)
        it(`${marca} (${theme}): el anillo (${anillo}) sobre ${fondo.replace("--sf-", "")} ${bg} llega a 3:1`, () => {
          expect(ratio(anillo, bg)).toBeGreaterThanOrEqual(3)
        })
      }
    }
  }
})

// El Badge y el Tag (2.0) son sólidos, como las etiquetas del Finder: la tinta (blanca o negra
// al 85 %) sobre el relleno del color, que es el mismo en los dos temas. Relleno y tinta se leen
// de `badgeVariants`, no de una copia: si alguien pasa el rojo a `-700` «porque es más vivo», el
// 4,05:1 aparece acá. El brand es el par `brand-700` / `brand-contrast` del botón `accent`, que
// cubre `brand-contrast.test.ts` en las cuatro marcas.
//
// También el hover del botón de quitar del Tag: el velo (`--sf-tag-press`) va del lado contrario
// a la tinta, y la X es un ícono (3:1), pero se le pide 4,5 porque es lo único que dice «quitar».
describe("Badge y Tag sólidos: la tinta sobre su relleno (WCAG 1.4.3)", () => {
  const rgba = (valor: string): [string, number] => {
    const [r, g, b, a] = valor.split(/[\s/]+/).map(Number)
    return [`#${[r, g, b].map((c) => c!.toString(16).padStart(2, "0")).join("")}`, a!]
  }
  for (const color of PALETAS) {
    if (color === "brand") continue
    const clases = badgeVariants({ color })
    const [, familia, paso] = clases.match(/(?:^|\s)bg-([a-z]+)-(\d+)(?:\s|$)/)!
    const tintaBlanca = /(?:^|\s)text-white(?:\s|$)/.test(clases)
    const velo = rgba(clases.match(/\[--sf-tag-press:rgb\(([^)]+)\)\]/)![1]!.replaceAll("_", " "))
    for (const theme of ["light", "dark"] as const) {
      const relleno = paleta[theme][`--sf-${familia}-${paso}`]!
      const tinta = tintaBlanca ? "#ffffff" : composite("#000000", 0.85, relleno)
      it(`${theme} · ${color}: ${tintaBlanca ? "blanco" : "negro 85 %"} sobre ${familia}-${paso} (${relleno}) llega a 4.5:1`, () => {
        expect(ratio(tinta, relleno)).toBeGreaterThanOrEqual(4.5)
      })
      const hover = composite(velo[0], velo[1], relleno)
      const tintaHover = tintaBlanca ? "#ffffff" : composite("#000000", 0.85, hover)
      it(`${theme} · ${color}: la X sobre el hover (${hover}) llega a 4.5:1`, () => {
        expect(ratio(tintaHover, hover)).toBeGreaterThanOrEqual(4.5)
      })
    }
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

// La tinta de cada paleta (`--color-*-ink`) sale de una sola mezcla de `-900` y `-1000`. La usaban
// los botones tintados de la fase 2, que se fueron en R2; el token queda para la app.
describe("La tinta de las paletas", () => {
  const css = read("theme.css")
  const mezcla = Number(css.match(/--color-red-ink: color-mix\(in srgb, var\(--sf-red-900\) (\d+)%/)![1]) / 100

  it("la tinta de las ocho paletas de color sale de la misma mezcla", () => {
    for (const color of PALETAS) {
      if (color === "gray") continue
      expect(css, color).toContain(`--color-${color}-ink: color-mix(in srgb, var(--sf-${color}-900) ${mezcla * 100}%, var(--sf-${color}-1000));`)
    }
  })

  it("se fueron los estados del botón teñido", () => {
    expect(css).not.toMatch(/--sf-tint-(hover|active)/)
  })
})

// El brand en tinte (`--sf-highlight`): el tramo del medio de un rango en Calendar, la burbuja del
// usuario en Chat. Adentro vive texto `label-secondary`, el alfa de iCloud compuesto sobre el tinte.
describe("Texto sobre el tinte de marca, en las cuatro marcas (WCAG 1.4.3)", () => {
  const css = read("theme.css")
  const marcas = brands as Record<string, Record<string, { base: number[] }>>
  const etiqueta = { light: tokens("theme.css", "light")["--sf-label-secondary"]!, dark: tokens("theme.css", "dark")["--sf-label-secondary"]! }
  for (const theme of ["light", "dark"] as const) {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    const cuerpo = css.slice(inicio, css.indexOf("\n  }", inicio))
    const tinte = (token: string) =>
      Number(cuerpo.match(new RegExp(`${token}: color-mix\\(in srgb, var\\(--sf-brand-700\\) (\\d+)%`))![1]) / 100
    for (const [estado, token] of [["resaltado", "--sf-highlight"], ["apretado", "--sf-highlight-active"]] as const) {
      for (const [marca, temas] of Object.entries(marcas)) {
        const fondo = composite(hexOfOklch(temas[theme]!.base as unknown as Oklch), tinte(token), paleta[theme]["--sf-surface"]!)
        const texto = flattenAlpha(etiqueta[theme], fondo)
        it(`${theme} · ${marca} · ${estado}: label-secondary (${texto}) sobre ${fondo} llega a 4.5:1`, () => {
          expect(ratio(texto, fondo)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }
  }
})

// La pista del Switch apagado es `gray-700` (iCloud no tiene Switch: se deriva). Checkbox, Radio y
// Toggle dibujan su contorno con `label-tertiary`, que mide `surfaces.test.ts`. Sin marcar no
// tienen relleno ni texto que los dibuje: caen bajo WCAG 1.4.11 (3:1 contra el fondo adyacente).
describe("Pista del Switch apagado (WCAG 1.4.11)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = paleta[theme]["--sf-gray-700"]!
    const superficies = {
      superficie: paleta[theme]["--sf-surface"]!,
      página: paleta[theme]["--sf-background"]!,
      sidebar: paleta[theme]["--sf-surface-secondary"]!,
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
