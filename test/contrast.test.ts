// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import brands from "../tokens/brands.json"
import { badgeVariants } from "../src/variants/badge.js"
import { buttonVariants } from "../src/variants/button.js"
import { menuItemExternalClassName } from "../src/variants/menu.js"
import { sliderThumbClassName } from "../src/variants/slider.js"
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
/**
 * Revisión de R1: el anillo va en `--tw-inset-ring-shadow` y el `box-shadow` es la composición de
 * Tailwind, así un elemento con sombra (el panel de NavigationMenu, un popover enfocado) conserva
 * su `shadow-menu` y su filo mientras tiene el foco. Antes el anillo la reemplazaba.
 */
const COMPUESTA = "var(--tw-inset-shadow, 0 0 #0000), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow, 0 0 #0000)"

describe("Anillo de foco interior en las cuatro marcas (WCAG 1.4.11)", () => {
  const css = read("theme.css")

  it("se compone con la sombra: el panel de NavigationMenu enfocado sigue con shadow-menu", () => {
    const panel = readFileSync(join(root, "src/components/navigation-menu.tsx"), "utf8")
    expect(panel).toContain("shadow-menu outline-none focus-visible:focus-ring")
    for (const nombre of ["focus-ring", "focus-ring-inverse", "focus-border", "focus-border-error"]) {
      const util = css.slice(css.indexOf(`@utility ${nombre} {`), css.indexOf("\n}", css.indexOf(`@utility ${nombre} {`)))
      expect(util, nombre).toContain("var(--tw-shadow, 0 0 #0000)")
      expect(util, nombre).not.toMatch(/box-shadow: inset/)
    }
  })
  const alfa = (theme: "light" | "dark") => {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    const cuerpo = css.slice(inicio, css.indexOf("\n  }", inicio))
    const valor = /--sf-focus-alpha:\s*(\d+)%;/.exec(cuerpo)?.[1] ?? /--sf-focus-alpha:\s*(\d+)%;/.exec(css)![1]
    return Number(valor) / 100
  }

  it("focus-ring es el anillo interior de 3px, sin outline", () => {
    const util = css.slice(css.indexOf("@utility focus-ring {"), css.indexOf("\n}", css.indexOf("@utility focus-ring {")))
    expect(util).toContain("outline: none;")
    expect(util).toContain("--tw-inset-ring-shadow: inset 0 0 0 3px var(--sf-focus);")
    expect(util).toContain(`box-shadow: ${COMPUESTA};`)
    expect(css).toContain("--sf-focus: color-mix(in srgb, var(--sf-brand-700) var(--sf-focus-alpha), transparent);")
  })

  it("los campos llevan el mismo anillo: 1px de borde y 2 de sombra interior, 3 desde el filo", () => {
    const util = css.slice(css.indexOf("@utility focus-border {"), css.indexOf("\n}", css.indexOf("@utility focus-border {")))
    expect(util).toContain("border-color: var(--sf-focus);")
    expect(util).toContain("--tw-inset-ring-shadow: inset 0 0 0 2px var(--sf-focus);")
    expect(util).toContain(`box-shadow: ${COMPUESTA};`)
    expect(util).not.toContain("data-sf-modality")
  })

  // Sobre un fondo de marca (botón `accent`, casilla marcada) el anillo sería del mismo color que
  // el fondo: ahí va el color de contraste de la marca, el par que `brand-contrast.test.ts` ya
  // lleva a 4,5:1.
  it("sobre la marca, el anillo es el color de contraste (focus-ring-inverse)", () => {
    const util = css.slice(css.indexOf("@utility focus-ring-inverse {"), css.indexOf("\n}", css.indexOf("@utility focus-ring-inverse {")))
    expect(util).toContain("--tw-inset-ring-shadow: inset 0 0 0 3px var(--sf-focus-inverse, var(--sf-brand-fg));")
    expect(util).toContain(`box-shadow: ${COMPUESTA};`)
    for (const variant of ["default", "accent"] as const) {
      expect(buttonVariants({ variant }).split(" "), variant).toContain("focus-visible:focus-ring-inverse")
      expect(buttonVariants({ variant }).split(" "), variant).not.toContain("focus-visible:focus-ring")
    }
    // El destructivo de R4 es gris (fill-2): lleva el anillo del acento, que llega a 3:1 sobre fill-2.
    expect(buttonVariants({ variant: "destructive" }).split(" ")).toContain("focus-visible:focus-ring")
    for (const file of ["checkbox.tsx", "radio-group.tsx"]) {
      expect(readFileSync(join(root, "src/components", file), "utf8"), file).toContain("data-checked:focus-visible:focus-ring-inverse")
    }
  })

  // Revisión de R1: más lugares donde el anillo del acento caía sobre un fondo de color y no se veía.
  it("sobre un fondo de color, el anillo es el inverso: día elegido, casilla indeterminada, X del Tag, IA sólida", () => {
    const fuente = (file: string) => readFileSync(join(root, "src", file), "utf8")
    expect(fuente("components/calendar.tsx")).toContain("data-selected:focus-visible:focus-ring-inverse")
    expect(fuente("components/checkbox.tsx")).toContain("data-indeterminate:focus-visible:focus-ring-inverse")
    // La X de un Tag sólido: la tinta blanca del Tag ya llega a 4,5:1 sobre el relleno.
    const tag = fuente("variants/tag.ts")
    expect(tag).toContain("focus-visible:focus-ring-inverse [--sf-focus-inverse:currentColor]")
    expect(tag).not.toMatch(/focus-visible:focus-ring(\s|")/)
    // El AiButton sólido es violeta con texto blanco: el anillo, blanco.
    expect(fuente("components/ai-button.tsx")).toContain("focus-visible:focus-ring-inverse [--sf-focus-inverse:white]")
  })

  // La pista apagada del Switch es `gray-700`: el anillo interior del acento encima daba ~1,3:1.
  // El Switch lleva el anillo por fuera, sobre la página, donde el acento ya llega a 3:1 (abajo).
  it("el Switch lleva el anillo por fuera de la pista", () => {
    const sw = readFileSync(join(root, "src/components/switch.tsx"), "utf8")
    expect(sw).toContain("focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(color:--sf-focus)")
    expect(sw).not.toMatch(/focus-visible:focus-ring/)
  })

  // El anillo no se ve solo sobre la página: los campos y la búsqueda son `fill-1`, el ítem
  // resaltado de un menú `fill-2`, y las barras `surface-bar`/`surface-header`. En oscuro esas
  // capas son más claras que la página, y la marca a su luz (brand-700) no llegaba a 3:1 sobre la
  // barra con las marcas más oscuras. Por eso el tema puede apuntar el foco a otro paso de la
  // marca; el paso sale de `--sf-focus` del tema, no de una copia.
  const marcas = brands as Record<string, Record<string, { base: number[]; contrast: string }>>
  const ESCALA = { light: { 900: [0.535, 0.945] }, dark: { 900: [0.717, 0.705] } } as const
  const paso = (theme: "light" | "dark") => {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    const cuerpo = css.slice(inicio, css.indexOf("\n  }", inicio))
    return Number(/--sf-focus: color-mix\(in srgb, var\(--sf-brand-(\d+)\)/.exec(cuerpo)![1]) as 700 | 900
  }
  const anilloDe = (theme: "light" | "dark", base: number[]) => {
    const n = paso(theme)
    if (n === 700) return hexOfOklch(base as unknown as Oklch)
    const [l, c] = ESCALA[theme][n]
    return hexOfOklch([l, base[1]! * c, base[2]!] as unknown as Oklch)
  }
  const capas = (t: "light" | "dark") => ({
    página: paleta[t]["--sf-background"]!,
    superficie: paleta[t]["--sf-surface"]!,
    "surface-bar": paleta[t]["--sf-surface-bar"]!,
    "surface-header": paleta[t]["--sf-surface-header"]!,
    "fill-1 sobre la superficie": flattenAlpha(paleta[t]["--sf-fill-1"]!, paleta[t]["--sf-surface"]!),
    "fill-2 sobre la superficie": flattenAlpha(paleta[t]["--sf-fill-2"]!, paleta[t]["--sf-surface"]!),
  })
  // Revisión de R4 (M5): el botón `plain` apretado pinta el tinte de la marca (`highlight`) debajo
  // del anillo, y ahí el anillo es del mismo matiz. Se mide sobre la superficie, como el resto.
  const tinteHighlight = (t: "light" | "dark") => {
    const inicio = css.indexOf(t === "light" ? ":root {" : ".dark {")
    const cuerpo = css.slice(inicio, css.indexOf("\n  }", inicio))
    const propio = /--sf-highlight: color-mix\(in srgb, var\(--sf-brand-700\) (\d+)%/.exec(cuerpo)
    return Number((propio ?? /--sf-highlight: color-mix\(in srgb, var\(--sf-brand-700\) (\d+)%/.exec(css)!)[1]) / 100
  }
  for (const [marca, temas] of Object.entries(marcas)) {
    for (const [theme, { base }] of Object.entries(temas)) {
      const t = theme as "light" | "dark"
      const highlight = composite(hexOfOklch(base as unknown as Oklch), tinteHighlight(t), paleta[t]["--sf-surface"]!)
      for (const [donde, bg] of Object.entries({ ...capas(t), "highlight (plain apretado)": highlight })) {
        const anillo = composite(anilloDe(t, base), alfa(t), bg)
        it(`${marca} (${theme}): el anillo (${anillo}) sobre ${donde} ${bg} llega a 3:1`, () => {
          expect(ratio(anillo, bg)).toBeGreaterThanOrEqual(3)
        })
      }
    }
  }
})

// El Badge y el Tag (2.0) son sólidos, como las etiquetas del Finder: la tinta blanca en todos
// (con dos tintas una fila de estados se leía mezclada) sobre el relleno del color, que es el
// mismo en los dos temas. Relleno y tinta se leen
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
    // El relleno es un paso de la paleta (`bg-red-800`) o uno propio del badge (`bg-badge-gray`).
    const [, familia, paso] = clases.match(/(?:^|\s)bg-([a-z]+)-(\d+|[a-z]+)(?:\s|$)/)!
    const tintaBlanca = /(?:^|\s)text-white(?:\s|$)/.test(clases)
    it(`${color}: la tinta es blanca, la misma en los nueve colores`, () => {
      expect(tintaBlanca).toBe(true)
    })
    const velo = rgba(clases.match(/\[--sf-tag-press:rgb\(([^)]+)\)\]/)![1]!.replaceAll("_", " "))
    for (const theme of ["light", "dark"] as const) {
      const relleno = heredado(theme, `--sf-${familia}-${paso}`)
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

// El destructivo de iCloud (R4) es gris con el texto rojo (`block.secondary.destructive`) o el texto
// rojo sin fondo: la tinta es `red-ink` en los dos, y sus números sobre fill-2/fill-3 y el panel
// están en los bloques de la alerta y del menú, más abajo. Acá se ata la variante a esa tinta.
describe("Button variant=\"destructive\" (WCAG 1.4.3, texto normal)", () => {
  it("destructive y destructive-plain escriben en red-ink", () => {
    expect(buttonVariants({ variant: "destructive" }).split(" ")).toEqual(expect.arrayContaining(["bg-fill-2", "text-red-ink"]))
    expect(buttonVariants({ variant: "destructive-plain" }).split(" ")).toContain("text-red-ink")
  })
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

// La pista del Switch apagado es `gray-700` (iCloud no tiene Switch: se deriva). Checkbox y Radio
// dibujan su contorno con `label-tertiary`, que mide `surfaces.test.ts`. Sin marcar no tienen
// relleno ni texto que los dibuje: caen bajo WCAG 1.4.11 (3:1 contra el fondo adyacente). El Toggle
// (R4) es un token con texto, como los filtros de iCloud: lo nombra su texto (`label`, 4,5:1).
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

// La perilla del Slider (R4, la de Photos en iCloud) es un círculo de 14 con borde de 2 px en el
// label y el centro de la superficie. Lo que se agarra es ese borde: cae bajo WCAG 1.4.11 (3:1
// contra la página y contra el centro, que es la superficie).
describe("La perilla del Slider se ve sobre la página (WCAG 1.4.11)", () => {
  it("lleva un borde de 2 px en el label", () => {
    expect(sliderThumbClassName.split(" ")).toEqual(expect.arrayContaining(["border-2", "border-label", "bg-surface"]))
  })

  for (const theme of ["light", "dark"] as const) {
    for (const [donde, token] of Object.entries(FONDOS)) {
      const bg = paleta[theme][token]!
      const borde = flattenAlpha(paleta[theme]["--sf-label"]!, bg)
      it(`${theme} · el borde (${borde}) sobre ${donde} ${bg} llega a 3:1`, () => {
        expect(ratio(borde, bg)).toBeGreaterThanOrEqual(3)
      })
    }
  }
})

// La acción destructiva de una alerta (R2, la alerta real de iCloud): gris (`secondary`, fill-2 y
// fill-3 con el puntero) con el texto rojo. El rojo es la tinta de la paleta (`red-ink`): `red-900`
// daba 3,6–4,0:1 sobre el gris en oscuro.
describe("La acción destructiva de la alerta: rojo sobre gris (WCAG 1.4.3)", () => {
  const css = read("theme.css")
  const mezcla = Number(css.match(/--color-red-ink: color-mix\(in srgb, var\(--sf-red-900\) (\d+)%/)![1]) / 100
  for (const theme of ["light", "dark"] as const) {
    const tinta = composite(paleta[theme]["--sf-red-900"]!, mezcla, paleta[theme]["--sf-red-1000"]!)
    for (const fill of ["--sf-fill-2", "--sf-fill-3"] as const) {
      const fondo = flattenAlpha(paleta[theme][fill]!, paleta[theme]["--sf-surface"]!)
      it(`${theme} · ${tinta} sobre ${fill.replace("--sf-", "")} ${fondo} llega a 4.5:1`, () => {
        expect(ratio(tinta, fondo)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// El ítem destructivo de un menú (R3, el «Delete Selected» de Drive): texto rojo sobre el panel en
// reposo y sobre el gris del resaltado (fill-2) y del apretado (fill-3). Misma tinta que la acción
// destructiva de la alerta: `red-900` no llegaba a 4,5:1 sobre el resaltado en oscuro.
describe("El ítem destructivo de un menú: rojo sobre el panel y sobre el resaltado (WCAG 1.4.3)", () => {
  const css = read("theme.css")
  const mezcla = Number(css.match(/--color-red-ink: color-mix\(in srgb, var\(--sf-red-900\) (\d+)%/)![1]) / 100
  for (const theme of ["light", "dark"] as const) {
    const tinta = composite(paleta[theme]["--sf-red-900"]!, mezcla, paleta[theme]["--sf-red-1000"]!)
    const panel = paleta[theme]["--sf-surface"]!
    const fondos = {
      panel,
      resaltado: flattenAlpha(paleta[theme]["--sf-fill-2"]!, panel),
      apretado: flattenAlpha(paleta[theme]["--sf-fill-3"]!, panel),
    }
    for (const [estado, fondo] of Object.entries(fondos)) {
      it(`${theme} · ${estado}: ${tinta} sobre ${fondo} llega a 4.5:1`, () => {
        expect(ratio(tinta, fondo)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// El acento como texto (R4): el link de iCloud («Find Devices ›», «account.apple.com ↗») y el botón
// `plain` (texto en el acento, hover `fill-2`, apretado `highlight`). Medido con las cinco marcas:
// `brand-900` sobre la página da 4,85–5,53:1, pero sobre un relleno baja a 4,0–4,5 en claro (teal,
// emerald). La regla del sistema:
//
// - texto de acento **sobre la página** (link) → `brand-900`;
// - texto de acento **sobre un relleno** (el `plain` con el puntero, barras, ítems resaltados) →
//   `brand-ink`, la tinta de la marca (900 mezclado con 1000), que pasa en todos los fondos;
// - **glifos** de acento (el ícono de un botón de la toolbar) → `brand-900`, a 3:1 (WCAG 1.4.11).
//
// Los pasos de la marca salen de theme.css (`--sf-brand-900`/`-1000` con `oklch(from …)`), no de
// una copia.
describe("El acento como texto y como glifo, en las cinco marcas (WCAG 1.4.3 y 1.4.11)", () => {
  const css = read("theme.css")
  const cuerpo = (theme: "light" | "dark") => {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    return css.slice(inicio, css.indexOf("\n  }", inicio))
  }
  const pasoDe = (theme: "light" | "dark", n: 900 | 1000) => {
    const [, l, c] = new RegExp(`--sf-brand-${n}: oklch\\(from var\\(--sf-brand-src\\) ([\\d.]+) calc\\(c \\* ([\\d.]+)\\) h\\);`).exec(cuerpo(theme))!
    return (base: number[]) => hexOfOklch([Number(l), base[1]! * Number(c), base[2]!] as unknown as Oklch)
  }
  const mezcla = Number(css.match(/--color-brand-ink: color-mix\(in srgb, var\(--sf-brand-900\) (\d+)%, var\(--sf-brand-1000\)\);/)![1]) / 100
  const tinte = (theme: "light" | "dark") => Number(/--sf-highlight: color-mix\(in srgb, var\(--sf-brand-700\) (\d+)%/.exec(cuerpo(theme))![1]) / 100
  const [, l, c, h] = css.match(/--brand-base: oklch\(([\d.]+) ([\d.]+) ([\d.]+)\);/) ?? []
  const porDefecto = [l, c, h].map(Number)
  const marcas: Record<string, Record<"light" | "dark", number[]>> = {
    "por defecto": { light: porDefecto, dark: porDefecto },
    ...Object.fromEntries(
      Object.entries(brands as Record<string, Record<"light" | "dark", { base: number[] }>>).map(([m, t]) => [m, { light: t.light.base, dark: t.dark.base }])
    ),
  }

  for (const theme of ["light", "dark"] as const) {
    const p = paleta[theme]
    const superficie = p["--sf-surface"]!
    const pagina = { página: p["--sf-background"]!, superficie, sidebar: p["--sf-surface-secondary"]! }
    const rellenos = {
      "fill-1": flattenAlpha(p["--sf-fill-1"]!, superficie),
      "fill-2 (hover)": flattenAlpha(p["--sf-fill-2"]!, superficie),
      "fill-3": flattenAlpha(p["--sf-fill-3"]!, superficie),
      "surface-bar": p["--sf-surface-bar"]!,
    }
    for (const [marca, temas] of Object.entries(marcas)) {
      const base = temas[theme]
      const b900 = pasoDe(theme, 900)(base)
      const tinta = composite(b900, mezcla, pasoDe(theme, 1000)(base))
      const resaltado = composite(hexOfOklch(base as unknown as Oklch), tinte(theme), superficie)
      for (const [donde, bg] of Object.entries(pagina)) {
        it(`${theme} · ${marca} · link: brand-900 ${b900} sobre ${donde} ${bg} llega a 4.5:1`, () => {
          expect(ratio(b900, bg)).toBeGreaterThanOrEqual(4.5)
        })
      }
      for (const [donde, bg] of Object.entries({ ...rellenos, "highlight (apretado)": resaltado })) {
        it(`${theme} · ${marca} · plain: brand-ink ${tinta} sobre ${donde} ${bg} llega a 4.5:1`, () => {
          expect(ratio(tinta, bg)).toBeGreaterThanOrEqual(4.5)
        })
        it(`${theme} · ${marca} · glifo: brand-900 ${b900} sobre ${donde} ${bg} llega a 3:1`, () => {
          expect(ratio(b900, bg)).toBeGreaterThanOrEqual(3)
        })
      }
    }
  }
})

// Revisión de R4 (I4): el ítem prendido de un ToggleGroup se tiene que distinguir de la pista (WCAG
// 1.4.11, estado). La pastilla blanca daba 1,16:1 en claro. Ahora es el acento sólido: `brand-700`
// con `brand-contrast` en claro y, en oscuro, `brand-900` (L fija 0,717) con el texto oscuro de la
// página, porque `brand-700` en oscuro quedaba en 2,27–2,6:1 contra la pista con terracotta y blue.
describe("ToggleGroup: el prendido contra la pista y su texto (WCAG 1.4.11 y 1.4.3)", () => {
  const css = read("theme.css")
  const cuerpo = (theme: "light" | "dark") => {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    return css.slice(inicio, css.indexOf("\n  }", inicio))
  }
  const paso900 = (theme: "light" | "dark", base: number[]) => {
    const [, l, c] = new RegExp(`--sf-brand-900: oklch\\(from var\\(--sf-brand-src\\) ([\\d.]+) calc\\(c \\* ([\\d.]+)\\) h\\);`).exec(cuerpo(theme))!
    return hexOfOklch([Number(l), base[1]! * Number(c), base[2]!] as unknown as Oklch)
  }
  for (const [marca, temas] of Object.entries(brands as Record<string, Record<"light" | "dark", { base: number[]; contrast: string }>>)) {
    for (const theme of ["light", "dark"] as const) {
      const p = paleta[theme]
      const pista = flattenAlpha(p["--sf-fill-2"]!, p["--sf-background"]!)
      const { base, contrast } = temas[theme]
      const relleno = theme === "light" ? hexOfOklch(base as unknown as Oklch) : paso900(theme, base)
      const texto = theme === "light" ? contrast : p["--sf-background"]!
      it(`${theme} · ${marca}: el prendido ${relleno} contra la pista ${pista} llega a 3:1`, () => {
        expect(ratio(relleno, pista)).toBeGreaterThanOrEqual(3)
      })
      it(`${theme} · ${marca}: el texto ${texto} sobre el prendido llega a 4.5:1`, () => {
        expect(ratio(texto, relleno)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// El ítem externo de un menú (revisión de R3): el texto en el acento sobre el panel en reposo y sobre
// el gris del resaltado (fill-2) y del apretado (fill-3). Con `brand-900` teal y emerald en claro
// quedaban en 4,0–4,2:1 sobre el resaltado: va en `brand-ink`, como el texto del botón `plain`.
describe("El ítem externo de un menú: acento sobre el panel y sobre el resaltado (WCAG 1.4.3)", () => {
  it("menuItemExternalClassName escribe en brand-ink", () => {
    expect(menuItemExternalClassName.split(" ")).toContain("text-brand-ink")
    expect(menuItemExternalClassName).not.toMatch(/brand-900/)
  })

  const css = read("theme.css")
  const cuerpo = (theme: "light" | "dark") => {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    return css.slice(inicio, css.indexOf("\n  }", inicio))
  }
  const paso = (theme: "light" | "dark", n: 900 | 1000, base: number[]) => {
    const [, l, c] = new RegExp(`--sf-brand-${n}: oklch\\(from var\\(--sf-brand-src\\) ([\\d.]+) calc\\(c \\* ([\\d.]+)\\) h\\);`).exec(cuerpo(theme))!
    return hexOfOklch([Number(l), base[1]! * Number(c), base[2]!] as unknown as Oklch)
  }
  const mezcla = Number(css.match(/--color-brand-ink: color-mix\(in srgb, var\(--sf-brand-900\) (\d+)%/)![1]) / 100
  for (const [marca, temas] of Object.entries(brands as Record<string, Record<"light" | "dark", { base: number[] }>>)) {
    for (const theme of ["light", "dark"] as const) {
      const base = temas[theme].base
      const tinta = composite(paso(theme, 900, base), mezcla, paso(theme, 1000, base))
      const panel = paleta[theme]["--sf-surface"]!
      const fondos = {
        panel,
        resaltado: flattenAlpha(paleta[theme]["--sf-fill-2"]!, panel),
        apretado: flattenAlpha(paleta[theme]["--sf-fill-3"]!, panel),
      }
      for (const [estado, fondo] of Object.entries(fondos)) {
        it(`${theme} · ${marca} · ${estado}: ${tinta} sobre ${fondo} llega a 4.5:1`, () => {
          expect(ratio(tinta, fondo)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }
  }
})

/**
 * W · El wallpaper de la home (spec 2026-09-29). Cada superficie translúcida se compone sobre los
 * puntos extremos del wallpaper —sus cuatro tonos y la página lisa (`--ambient: 0`)— con las cinco
 * marcas, en claro y en oscuro. Con `--ambient` entre 0 y 1 cada punto queda entre su tono y la
 * página, y un degradado queda entre dos tonos: si los extremos pasan, pasa lo del medio. El blur
 * promedia lo de abajo, así que tampoco puede dar un fondo peor que el peor punto.
 *
 * El texto suelto sobre el wallpaper (el título de la home, lo que la app ponga sin card) también
 * tiene que llegar: la L de los tonos está elegida para eso.
 */
describe("Sobre el wallpaper: superficies translúcidas y texto (WCAG 1.4.3)", () => {
  const css = read("theme.css")
  const cuerpo = (theme: "light" | "dark") => {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    return css.slice(inicio, css.indexOf("\n  }", inicio))
  }
  /** `--sf-wallpaper-N: oklch(from var(--sf-brand-src) L calc(c * K) h | calc(h ± D));` */
  const tonos = (theme: "light" | "dark") =>
    [...cuerpo(theme).matchAll(/--sf-wallpaper-\d: oklch\(from var\(--sf-brand-src\) ([\d.]+) calc\(c \* ([\d.]+)\) (?:h|calc\(h ([+-]) (\d+)\))\);/g)].map(
      ([, l, k, signo, d]) => ({ l: Number(l), k: Number(k), d: d ? (signo === "-" ? -1 : 1) * Number(d) : 0 })
    )
  const [, l, c, h] = css.match(/--brand-base: oklch\(([\d.]+) ([\d.]+) ([\d.]+)\);/) ?? []
  const porDefecto = [l, c, h].map(Number)
  const marcas: Record<string, Record<"light" | "dark", number[]>> = {
    "por defecto": { light: porDefecto, dark: porDefecto },
    ...Object.fromEntries(
      Object.entries(brands as Record<string, Record<"light" | "dark", { base: number[] }>>).map(([m, t]) => [m, { light: t.light.base, dark: t.dark.base }])
    ),
  }

  for (const theme of ["light", "dark"] as const) {
    const p = paleta[theme]

    it(`${theme}: el wallpaper tiene cuatro tonos`, () => {
      expect(tonos(theme)).toHaveLength(4)
    })

    const puntos: [string, string][] = Object.entries(marcas).flatMap(([marca, temas]) => {
      const [, cb, hb] = temas[theme]
      return tonos(theme).map((t, i): [string, string] => [`${marca} · tono ${i + 1}`, hexOfOklch([t.l, cb! * t.k, hb! + t.d] as unknown as Oklch)])
    })
    puntos.push(["página lisa", p["--sf-background"]!])

    const cuerpoSobre = (wp: string) => flattenAlpha(p["--sf-translucent-body"]!, wp)
    const superficies: Record<string, (wp: string) => string> = {
      "el wallpaper, directo": (wp) => wp,
      "material-translucent (barra del AppShell, Toolbar)": (wp) => flattenAlpha(p["--sf-translucent"]!, wp),
      "material-translucent-body (cuerpo de Card, Sidebar)": cuerpoSobre,
      "la franja de la Card sobre el cuerpo": (wp) => flattenAlpha(p["--sf-translucent-strip"]!, cuerpoSobre(wp)),
    }

    for (const [superficie, componer] of Object.entries(superficies)) {
      for (const rol of ["--sf-label", "--sf-label-secondary"] as const) {
        it(`${theme} · ${rol.slice(5)} sobre ${superficie} llega a 4.5:1 en todos los puntos`, () => {
          const fallas = puntos.flatMap(([donde, wp]) => {
            const bg = componer(wp)
            const valor = ratio(flattenAlpha(p[rol]!, bg), bg)
            return valor < 4.5 ? [`${donde} (${wp} → ${bg}): ${valor.toFixed(2)}`] : []
          })
          expect(fallas).toEqual([])
        })
      }
    }

    // Stat no trae superficie: sobre el wallpaper va adentro de una Card, y la variación en color se
    // tiene que leer sobre ese cuerpo. Directo sobre el wallpaper no llega, y la doc lo dice.
    for (const tinta of ["--sf-green-900", "--sf-red-900"] as const) {
      it(`${theme} · la variación de Stat (${tinta.slice(5)}) sobre el cuerpo de la Card llega a 4.5:1`, () => {
        const fallas = puntos.flatMap(([donde, wp]) => {
          const valor = ratio(p[tinta]!, cuerpoSobre(wp))
          return valor < 4.5 ? [`${donde}: ${valor.toFixed(2)}`] : []
        })
        expect(fallas).toEqual([])
      })
    }

    // Con menos transparencia el cuerpo es `surface` opaco y la franja queda encima.
    it(`${theme} · sin transparencia: el secundario sobre la franja y la superficie opaca llega a 4.5:1`, () => {
      const bg = flattenAlpha(p["--sf-translucent-strip"]!, p["--sf-surface"]!)
      expect(ratio(flattenAlpha(p["--sf-label-secondary"]!, bg), bg)).toBeGreaterThanOrEqual(4.5)
    })

    // El otro lado del contraste: que el wallpaper SE VEA a través de lo translúcido. Con el cuerpo al
    // 80 % y la barra al 88 %, en claro una card sobre el wallpaper y otra sobre la página lisa
    // quedaban a menos de 2,5 de distancia OKLab (×100): el efecto no se veía. El piso es por marca,
    // el tono del wallpaper que más se nota contra la página lisa; en claro el techo lo pone el
    // secundario directo sobre el wallpaper (la L de los tonos no puede bajar), así que es menor.
    const piso = theme === "light" ? 4 : 5
    for (const [superficie, fill] of [["el cuerpo de la Card", "--sf-translucent-body"], ["la barra (material-translucent)", "--sf-translucent"]] as const) {
      it(`${theme} · el wallpaper se ve a través de ${superficie}: ΔOKLab ≥ ${piso}`, () => {
        const flojas = Object.entries(marcas).flatMap(([marca, temas]) => {
          const [, cb, hb] = temas[theme]
          const liso = flattenAlpha(p[fill]!, p["--sf-background"]!)
          const delta = Math.max(
            ...tonos(theme).map((t) => distanciaOklab(flattenAlpha(p[fill]!, hexOfOklch([t.l, cb! * t.k, hb! + t.d] as unknown as Oklch)), liso))
          )
          return delta < piso ? [`${marca}: ${delta.toFixed(1)}`] : []
        })
        expect(flojas).toEqual([])
      })
    }
  }
})

/** Distancia OKLab ×100 entre dos `#rrggbb`: ~2 es lo mínimo que se nota, 5 ya se ve de lejos. */
function distanciaOklab(a: string, b: string) {
  const lab = (hex: string) => {
    const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    const [r, g, bl] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255)) as [number, number, number]
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * bl)
    const m = Math.cbrt(0.2119034982 * r + 0.6806995253 * g + 0.1073969765 * bl)
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * bl)
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ]
  }
  const [x, y] = [lab(a), lab(b)]
  return 100 * Math.hypot(x[0]! - y[0]!, x[1]! - y[1]!, x[2]! - y[2]!)
}

describe("El «−» de SortableGrid/SortableList en edición (revisión R10)", () => {
  // Va medio sobre la cabecera de la card (`surface-bar`) y medio afuera (página o superficie): un
  // gris fijo, `gray-800`, que en los dos temas llega a 3:1 contra todos, con el «−» en blanco.
  for (const theme of ["light", "dark"] as const) {
    it(`${theme}: gray-800 ≥ 3:1 contra surface-bar, surface y la página; el «−» blanco ≥ 3:1`, () => {
      const circulo = paleta[theme]["--sf-gray-800"]!
      for (const fondo of ["--sf-surface-bar", "--sf-surface", "--sf-background"]) {
        expect(ratio(circulo, paleta[theme][fondo]!), fondo).toBeGreaterThanOrEqual(3)
      }
      expect(ratio("#ffffff", circulo)).toBeGreaterThanOrEqual(3)
    })
  }
})


/**
 * El borde de la elegida de FileGrid (como iCloud Drive): la caja gris `selection-inactive` más un
 * borde de 2 px por dentro en el acento de la selección. Es lo único que distingue «elegida» de
 * «con el puntero» (las dos son la caja gris), así que cae bajo WCAG 1.4.11: 3:1 contra lo que
 * tiene al lado, que es la caja gris por dentro y, por fuera, donde esté la grilla: la página, lo
 * que flota, el sidebar, el cuerpo translúcido de una Card sobre el wallpaper o el wallpaper
 * directo. El token sale de `file-grid.tsx` y su paso de la marca de theme.css, no de una copia.
 */
describe("El borde de la elegida de FileGrid, en las cinco marcas (WCAG 1.4.11)", () => {
  const css = read("theme.css")
  const fuente = readFileSync(join(root, "src/components/file-grid.tsx"), "utf8")
  const token = /data-\[state=selected\]:inset-ring-([a-z-]+?)(?=[\s"])/.exec(fuente.replace(/inset-ring-\d+/g, ""))?.[1]
  const cuerpo = (theme: "light" | "dark") => {
    const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
    return css.slice(inicio, css.indexOf("\n  }", inicio))
  }
  const paso = (theme: "light" | "dark") => {
    const propio = new RegExp(`--sf-${token}: var\\(--sf-brand-(\\d+)\\);`).exec(cuerpo(theme))
    return Number(propio?.[1])
  }
  const tonos = (theme: "light" | "dark") =>
    [...cuerpo(theme).matchAll(/--sf-wallpaper-\d: oklch\(from var\(--sf-brand-src\) ([\d.]+) calc\(c \* ([\d.]+)\) (?:h|calc\(h ([+-]) (\d+)\))\);/g)].map(
      ([, l, k, signo, d]) => ({ l: Number(l), k: Number(k), d: d ? (signo === "-" ? -1 : 1) * Number(d) : 0 })
    )
  const [, l, c, h] = css.match(/--brand-base: oklch\(([\d.]+) ([\d.]+) ([\d.]+)\);/) ?? []
  const porDefecto = [l, c, h].map(Number)
  const marcas: Record<string, Record<"light" | "dark", number[]>> = {
    "por defecto": { light: porDefecto, dark: porDefecto },
    ...Object.fromEntries(
      Object.entries(brands as Record<string, Record<"light" | "dark", { base: number[] }>>).map(([m, t]) => [m, { light: t.light.base, dark: t.dark.base }])
    ),
  }

  // En oscuro la marca plena (`brand-700`) no llega: 2,1–2,4:1 contra la caja gris #3c3c3e y 2,0–2,7
  // contra los tonos oscuros del wallpaper. Ahí va el paso claro, `brand-900`, como el foco.
  it("el borde es su propio token: la marca plena en claro, el paso claro (brand-900) en oscuro", () => {
    expect(token).toBe("selection-border")
    expect(paso("light")).toBe(700)
    expect(paso("dark")).toBe(900)
  })
  const color = (theme: "light" | "dark", base: number[]) => {
    if (paso(theme) === 700) return hexOfOklch(base as unknown as Oklch)
    const [, pl, pc] = new RegExp(`--sf-brand-${paso(theme)}: oklch\\(from var\\(--sf-brand-src\\) ([\\d.]+) calc\\(c \\* ([\\d.]+)\\) h\\);`).exec(cuerpo(theme))!
    return hexOfOklch([Number(pl), base[1]! * Number(pc), base[2]!] as unknown as Oklch)
  }

  // Sin esto, un cambio en theme.css que rompa la regex dejaba cero tonos (o un fondo `undefined`) y
  // los contrastes de abajo pasaban sin medir nada.
  it("se leen los cuatro tonos del wallpaper y cada fondo de la paleta, en los dos temas", () => {
    for (const theme of ["light", "dark"] as const) {
      expect(tonos(theme)).toHaveLength(4)
      for (const token of ["--sf-selection-inactive", "--sf-background", "--sf-surface", "--sf-surface-secondary", "--sf-translucent-body"]) {
        expect(paleta[theme][token], `${theme} ${token}`).toBeDefined()
      }
    }
  })

  for (const theme of ["light", "dark"] as const) {
    const p = paleta[theme]
    for (const [marca, temas] of Object.entries(marcas)) {
      const base = temas[theme]
      const borde = color(theme, base)
      const fondos: Record<string, string> = {
        "la caja gris (selection-inactive)": p["--sf-selection-inactive"]!,
        página: p["--sf-background"]!,
        superficie: p["--sf-surface"]!,
        sidebar: p["--sf-surface-secondary"]!,
      }
      tonos(theme).forEach((t, i) => {
        const wp = hexOfOklch([t.l, base[1]! * t.k, base[2]! + t.d] as unknown as Oklch)
        fondos[`el wallpaper, tono ${i + 1}`] = wp
        fondos[`cuerpo translúcido de Card sobre el tono ${i + 1}`] = flattenAlpha(p["--sf-translucent-body"]!, wp)
      })
      it(`${theme} · ${marca}: el borde ${borde} llega a 3:1 contra la caja y contra lo de afuera`, () => {
        expect(Object.entries(fondos).filter(([, bg]) => !bg)).toEqual([])
        const fallas = Object.entries(fondos).flatMap(([donde, bg]) => {
          const valor = ratio(borde, bg)
          return valor < 3 ? [`${donde} ${bg}: ${valor.toFixed(2)}`] : []
        })
        expect(fallas).toEqual([])
      })
    }
  }
})

// El Footer (2.1) es la barra global de abajo: opaco en `surface-header` y, sobre el wallpaper,
// `material-translucent` (ese ya lo cubre el bloque del wallpaper). El texto de sus grupos es
// `label` (título) y `label-secondary` (links y la fila de abajo).
describe("Footer: el texto sobre surface-header", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const rol of ["--sf-label", "--sf-label-secondary"] as const) {
      it(`${theme} · ${rol.slice(5)} sobre surface-header llega a 4.5:1`, () => {
        const bg = paleta[theme]["--sf-surface-header"]!
        expect(ratio(flattenAlpha(paleta[theme][rol]!, bg), bg)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// Carousel `controls="overlay"` (2.1): la pastilla de los puntos y las flechas van encima de una foto,
// que puede ser blanca o negra. La pastilla es el gris opaco del tooltip con un filo blanco al 50 %: sobre
// una foto clara la separa el gris; sobre una negra, el filo. Los puntos inactivos, blanco al 60 %.
// Los alfas son los de las clases (`ring-white/50`, `before:bg-white/60`), que fija carousel.test.tsx.
describe("Carousel overlay sobre la peor foto (WCAG 1.4.11)", () => {
  const carouselOverlayColors = { ring: "80", dot: "99" }
  for (const theme of ["light", "dark"] as const) {
    const pill = paleta[theme]["--sf-tooltip"]!
    it(`${theme} · la pastilla se separa de una foto blanca por el gris y de una negra por el filo`, () => {
      expect(ratio(pill, "#ffffff")).toBeGreaterThanOrEqual(3)
      expect(ratio(flattenAlpha(`#ffffff${carouselOverlayColors.ring}`, "#000000"), "#000000")).toBeGreaterThanOrEqual(3)
    })
    it(`${theme} · el punto inactivo y el anillo de foco sobre la pastilla`, () => {
      expect(ratio(flattenAlpha(`#ffffff${carouselOverlayColors.dot}`, pill), pill)).toBeGreaterThanOrEqual(3)
      expect(ratio("#ffffff", pill)).toBeGreaterThanOrEqual(3)
    })
  }
})
