// @vitest-environment node
//
// Las superficies de iCloud web (2.0, catálogo §1.4 y §1.5): grises opacos en capas, un solo
// material translúcido y ningún vidrio. Los valores se leen de theme.css, no de una copia: si
// alguien sube el alfa de `label-secondary` «para que se vea más suave», el contraste lo marca acá.
import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { contrastRatio, flattenAlpha, luminanceOfHex } from "../src/lib/contrast.js"
import { cn } from "../src/lib/utils.js"
import { cardVariants } from "../src/variants/card.js"
import { menuPopupClassName } from "../src/variants/menu.js"
import { floatingPopupClassName, modalPopupClassName, tooltipSurfaceClassName } from "../src/variants/overlay.js"

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8")
const theme = read("../src/styles/theme.css")

/** El cuerpo de una `@utility`, hasta la llave que la cierra en la columna cero. */
const utility = (name: string) => {
  const inicio = theme.indexOf(`@utility ${name} {`)
  return inicio === -1 ? "" : theme.slice(inicio, theme.indexOf("\n}", inicio))
}

const bloque = (tema: "light" | "dark") => {
  const inicio = theme.indexOf(tema === "light" ? ":root {" : ".dark {")
  return theme.slice(inicio, theme.indexOf("\n  }", inicio))
}

const token = (tema: "light" | "dark", nombre: string): string => {
  const valor = new RegExp(`--sf-${nombre}:\\s*(#[0-9a-f]{6}(?:[0-9a-f]{2})?);`).exec(bloque(tema))?.[1]
  if (!valor) throw new Error(`--sf-${nombre} no tiene hex en ${tema}`)
  return valor
}

const ratio = (fg: string, bg: string) => contrastRatio(luminanceOfHex(fg), luminanceOfHex(bg))

/** Lo medido en icloud.com (y lo derivado de la escala de iOS donde iCloud no lo mostró). */
const ICLOUD = {
  light: {
    background: "#ffffff", surface: "#ffffff", "surface-secondary": "#fbfbfd", "surface-bar": "#f2f2f7",
    "surface-header": "#f2f2f7", group: "#f4f4f5", "fill-1": "#78788014", "fill-2": "#7676801f",
    "fill-3": "#78788029", separator: "#e5e5ea", "separator-strong": "#d1d1d6", hairline: "#78788014",
    label: "#000000e0", "label-secondary": "#0000008f", "label-tertiary": "#0000007a",
    "label-quaternary": "#78788029", "selection-inactive": "#dcdce0", translucent: "#f8f8fcd9",
  },
  dark: {
    background: "#1c1c1e", surface: "#1c1c1e", "surface-secondary": "#202023", "surface-bar": "#2c2c2e",
    "surface-header": "#323236", group: "#323235", "fill-1": "#74748040", "fill-2": "#7676804d",
    "fill-3": "#7878805c", separator: "#343436", "separator-strong": "#3c3c3e", hairline: "#74748040",
    label: "#fffffffa", "label-secondary": "#ffffffa8", "label-tertiary": "#ffffff80",
    "label-quaternary": "#7878805c", "selection-inactive": "#3c3c3e", translucent: "#38383d99",
  },
} as const

describe("superficies de iCloud", () => {
  for (const tema of ["light", "dark"] as const) {
    it(`${tema}: cada token vale lo de iCloud`, () => {
      for (const [nombre, valor] of Object.entries(ICLOUD[tema])) expect(token(tema, nombre), nombre).toBe(valor)
    })
  }

  it("cada token tiene su color de Tailwind", () => {
    for (const nombre of Object.keys(ICLOUD.light)) {
      if (nombre === "translucent") continue
      const color = nombre === "group" ? "grouped" : nombre
      expect(theme, nombre).toContain(`--color-${color}: var(--sf-${nombre});`)
    }
  })

  it("en oscuro las capas se despegan: la card de la página, la barra del sidebar", () => {
    expect(ratio(token("dark", "group"), token("dark", "background"))).toBeGreaterThan(1.2)
    expect(ratio(token("dark", "surface-bar"), token("dark", "surface-secondary"))).toBeGreaterThan(1.1)
  })
})

describe("sin vidrio (2.0)", () => {
  it("se fueron las utilidades y las variables del vidrio", () => {
    for (const nombre of ["glass", "glass-thin", "glass-thick", "glass-dense", "glass-control", "glass-rim", "sheen", "thumb-lens", "material-bar", "material-popover", "material-modal", "material-group"]) {
      expect(utility(nombre), nombre).toBe("")
    }
    expect(theme).not.toMatch(/--glass(-tint)?:/)
    expect(theme).not.toMatch(/--sf-glass-/)
  })

  it("ningún componente usa vidrio", () => {
    const usos: string[] = []
    for (const dir of ["../src/components/", "../src/variants/", "../src/internal/"]) {
      const url = new URL(dir, import.meta.url)
      for (const file of readdirSync(url)) {
        const codigo = readFileSync(new URL(file, url), "utf8")
          .split("\n")
          .filter((linea) => !/^\s*(\/\/|\*|\/\*)/.test(linea))
          .join("\n")
        for (const m of codigo.matchAll(/(?<![\w-])(glass[\w-]*|material-(?:bar|popover|modal|group)|sheen|thumb-lens)(?![\w-])/g)) {
          // `variant="glass"` de Toolbar queda como alias obsoleto de `bar` hasta 3.0: es un nombre, no la utilidad.
          if (file === "toolbar.tsx" && m[1] === "glass") continue
          usos.push(`${file}: ${m[1]}`)
        }
      }
    }
    expect(usos).toEqual([])
  })

  it("diálogos, popovers, menús y cards (widgets) son opacos", () => {
    expect(modalPopupClassName).toMatch(/(^|\s)bg-surface(\s|$)/)
    expect(floatingPopupClassName).toMatch(/(^|\s)bg-surface(\s|$)/)
    expect(menuPopupClassName).toMatch(/(^|\s)bg-surface(\s|$)/)
    expect(cardVariants()).toMatch(/(^|\s)bg-surface(\s|$)/)
  })

  it("los toasts son opacos, como un popover", () => {
    const sonner = read("../src/components/sonner.tsx")
    expect(sonner).toMatch(/\bbg-surface!/)
  })

  it("el toast habla como iCloud: título 600, acción en el acento y cancelar en gris", () => {
    const sonner = read("../src/components/sonner.tsx")
    expect(sonner).toContain('title: "text-callout! font-semibold! text-label!"')
    expect(sonner).toMatch(/actionButton: "[^"]*bg-brand-700![^"]*text-brand-contrast!/)
    expect(sonner).toMatch(/cancelButton: "[^"]*bg-fill-2!/)
    // Sin el botón negro de Vercel.
    expect(sonner).not.toMatch(/bg-label!/)
  })
})

describe("material-translucent: el único con blur", () => {
  it("fill y blur de iCloud (§1.5)", () => {
    const bloqueUtil = utility("material-translucent")
    expect(bloqueUtil).toContain("background-color: var(--sf-translucent);")
    expect(bloqueUtil).toContain("backdrop-filter: blur(15px) saturate(0.86);")
    expect(bloqueUtil).toContain("-webkit-backdrop-filter: blur(15px) saturate(0.86);")
  })

  // Revisión de R1: lo opaco es la barra global de iCloud (`surface-header`, rgb(50,50,54)), que es
  // lo que va translúcido sobre el wallpaper; `surface-bar` es la barra de detalle de una app.
  it("sin transparencia o con más contraste es opaco: la barra global", () => {
    const bloqueUtil = utility("material-translucent")
    expect(bloqueUtil).toMatch(/@media \(prefers-reduced-transparency: reduce\), \(prefers-contrast: more\) \{\s*background-color: var\(--sf-surface-header\);\s*-webkit-backdrop-filter: none;\s*backdrop-filter: none;/)
  })

  // `AppShell ambient` pone `bg-ambient` y todo lo translúcido cuelga de eso. La utilidad se fue sin
  // querer en el commit del Skeleton (R5a) y nada lo marcó: la clase que no existe no falla.
  it("existe el wallpaper (bg-ambient) sobre el que va", () => {
    expect(theme).toMatch(/@utility bg-ambient \{/)
    expect(utility("bg-ambient")).toContain("radial-gradient")
    expect(utility("bg-ambient")).toContain("background-attachment: fixed")
  })

  // Como la barra de la home de iCloud: el contenido pasa por abajo, desenfocado. Siempre, no solo sobre
  // el wallpaper; con el fill de la barra (`translucent-bar`), que es más denso que el del widget.
  it("la barra del Navbar es siempre translúcida, con su fill", () => {
    const navbar = read("../src/components/navbar.tsx")
    expect(navbar).toContain("material-translucent [--sf-translucent:var(--sf-translucent-bar)]")
    expect(navbar).not.toContain("in-data-ambient:material-translucent")
  })

  it("un bg-* de la app le gana", () => {
    expect(cn("material-translucent", "bg-red-100")).toBe("bg-red-100")
    expect(cn("bg-ambient", "bg-surface")).toBe("bg-surface")
  })
})

// Los textos de iCloud son alfas sobre la superficie que les toque: se componen antes de medir.
// Primario y secundario son texto (4,5:1). El terciario de iCloud en claro (48 % de negro, 3,7:1)
// no llega a texto: queda para contornos de control y lo deshabilitado (3:1, WCAG 1.4.11; lo
// deshabilitado está exento de 1.4.3).
describe("textos sobre las superficies (WCAG 1.4.3 y 1.4.11)", () => {
  const FONDOS = ["background", "surface", "surface-secondary", "surface-bar", "surface-header", "group"] as const
  for (const tema of ["light", "dark"] as const) {
    for (const fondo of FONDOS) {
      const bg = token(tema, fondo)
      for (const [rol, minimo] of [["label", 4.5], ["label-secondary", 4.5], ["label-tertiary", 3]] as const) {
        const fg = flattenAlpha(token(tema, rol), bg)
        it(`${tema} · ${rol} sobre ${fondo}: ${fg} / ${bg} llega a ${minimo}:1`, () => {
          expect(ratio(fg, bg)).toBeGreaterThanOrEqual(minimo)
        })
      }
    }

    // El resaltado de un menú (fill 2 sobre el panel) y el activo del sidebar (fill 1 sobre la
    // columna): el texto no cambia de color, así que tiene que leerse sobre el gris.
    for (const [donde, relleno, fondo] of [["menú resaltado", "fill-2", "surface"], ["sidebar activo", "fill-1", "surface-secondary"], ["selección fuerte", "fill-3", "surface"]] as const) {
      const bg = flattenAlpha(token(tema, relleno), token(tema, fondo))
      for (const rol of ["label", "label-secondary"] as const) {
        const fg = flattenAlpha(token(tema, rol), bg)
        it(`${tema} · ${rol} sobre ${donde} (${bg}) llega a 4.5:1`, () => {
          expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }

    it(`${tema} · label sobre la selección sin foco llega a 4.5:1`, () => {
      const bg = token(tema, "selection-inactive")
      expect(ratio(flattenAlpha(token(tema, "label"), bg), bg)).toBeGreaterThanOrEqual(4.5)
    })

    // El Navbar va sobre cualquier contenido que scrollee: se mide contra lo peor, blanco y negro
    // puros debajo del fill (el desenfoque promedia, así que un fondo parejo es el caso extremo).
    for (const debajo of ["#ffffff", "#000000"]) {
      for (const rol of ["label", "label-secondary"] as const) {
        it(`${tema} · ${rol} sobre la barra translúcida del Navbar con ${debajo} debajo llega a 4.5:1`, () => {
          const bg = flattenAlpha(token(tema, "translucent-bar"), debajo)
          expect(ratio(flattenAlpha(token(tema, rol), bg), bg)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }

    it(`${tema} · label sobre material-translucent llega a 4.5:1 sobre el fondo opaco de respaldo`, () => {
      const bg = flattenAlpha(token(tema, "translucent"), token(tema, "background"))
      expect(ratio(flattenAlpha(token(tema, "label"), bg), bg)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe("tooltip (R5a): gris oscuro en los dos temas", () => {
  for (const tema of ["light", "dark"] as const) {
    it(`${tema}: fondo oscuro con texto claro a 4.5:1, y se despega de la página`, () => {
      const fondo = token(tema, "tooltip")
      expect(luminanceOfHex(fondo)).toBeLessThan(0.08)
      expect(ratio(token(tema, "on-tooltip"), fondo)).toBeGreaterThanOrEqual(4.5)
      // En oscuro la página ya es casi negra: el tooltip tiene que ser un gris más claro que ella.
      expect(ratio(fondo, token(tema, "background"))).toBeGreaterThan(tema === "dark" ? 1.4 : 5)
    })
  }

  it("la superficie: 12 px, radio 6, sin flecha, sombra suave", () => {
    expect(tooltipSurfaceClassName.split(" ")).toEqual(
      expect.arrayContaining(["rounded-tooltip", "bg-tooltip", "text-on-tooltip", "text-footnote", "shadow-tooltip", "px-2", "py-1"])
    )
    expect(theme).toContain("--color-tooltip: var(--sf-tooltip);")
    expect(theme).toContain("--color-on-tooltip: var(--sf-on-tooltip);")
  })
})

describe("touch-target-y", () => {
  it("crece a 44 en alto, conserva el ancho y solo con el dedo", () => {
    const block = utility("touch-target-y")
    expect(block).toMatch(/@media \(pointer: coarse\)/)
    expect(block).toMatch(/width: 100%;/)
    expect(block).toMatch(/height: max\(100%, 44px\);/)
  })
})
