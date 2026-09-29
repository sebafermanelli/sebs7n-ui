// @vitest-environment node
//
// Las sombras de iCloud web (2.0, catálogo §1.6). iCloud es plano en reposo: botones, campos,
// chips y cards no llevan sombra, y flota solo lo que se abre encima. Un `shadow-card` que vuelve
// a un botón no rompe nada a la vista —lo hace más «Mac»—, y por eso queda escrito acá.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { cn } from "../src/lib/utils"
import { buttonVariants } from "../src/variants/button"
import { cardVariants } from "../src/variants/card"
import { inputControlClassName } from "../src/variants/input"
import { menuPopupClassName } from "../src/variants/menu"
import { floatingPopupClassName, modalPopupClassName } from "../src/variants/overlay"
import { segmentedThumbClassName } from "../src/variants/segmented"
import { toggleVariants } from "../src/variants/toggle"

const root = join(import.meta.dirname, "..")
const src = (file: string) => readFileSync(join(root, "src", file), "utf8")
const css = src("styles/theme.css")

const bloque = (tema: "light" | "dark") => {
  const inicio = css.indexOf(tema === "light" ? ":root {" : ".dark {")
  return css.slice(inicio, css.indexOf("\n  }", inicio))
}
const sombra = (tema: "light" | "dark", nombre: string) => new RegExp(`--sf-shadow-${nombre}:\\s*([^;]+);`).exec(bloque(tema))?.[1]

describe("sombras de iCloud", () => {
  it("menú, popover y diálogo: 0 11 34 con el filo del popover, al 16 % en claro y al 65 % en oscuro", () => {
    expect(sombra("light", "menu")).toBe("0 0 0 1px var(--sf-hairline), 0 11px 34px 0 #00000029")
    expect(sombra("dark", "menu")).toBe("0 0 0 1px var(--sf-hairline), 0 11px 34px 0 #000000a6")
    // Se redeclara en `.dark`: un `var()` se resuelve donde se declara, y un subárbol oscuro
    // heredaría la sombra clara.
    for (const tema of ["light", "dark"] as const) expect(sombra(tema, "modal"), tema).toBe("var(--sf-shadow-menu)")
  })

  it("widget, segmento, badge y miniatura con los valores medidos en oscuro", () => {
    expect(sombra("dark", "widget")).toBe("0 17px 40px 0 #000000a6")
    expect(sombra("light", "widget")).toBe("0 17px 40px 0 #00000029")
    expect(sombra("dark", "segment")).toBe("0 3px 8px 0 #0000004d")
    expect(sombra("dark", "badge")).toBe("0 2px 4px 0 #00000080")
    expect(sombra("dark", "thumbnail")).toBe("0 0 0 1px #000000a6")
  })

  it("se fueron las sombras del vidrio", () => {
    for (const nombre of ["button", "button-inverted", "button-accent", "chip", "track", "border-base", "background-border"]) {
      expect(css, nombre).not.toContain(`--sf-shadow-${nombre}:`)
      expect(css, nombre).not.toContain(`--shadow-${nombre}:`)
    }
  })

  it("cada token tiene su utilidad y twMerge los conoce", () => {
    for (const nombre of ["tooltip", "menu", "modal", "widget", "segment", "badge", "thumbnail", "card", "card-hover", "ai"]) {
      expect(css, nombre).toContain(`--shadow-${nombre}: var(--sf-shadow-${nombre});`)
    }
    expect(cn("shadow-menu", "shadow-widget")).toBe("shadow-widget")
    expect(cn("shadow-segment", "shadow-none")).toBe("shadow-none")
  })
})

describe("plano en reposo, flota lo que se abre", () => {
  it("botones, campos y chips sin sombra ni hundimiento; la card es un widget con su sombra", () => {
    for (const variant of ["default", "secondary", "plain", "ghost", "destructive", "destructive-plain", "link"] as const) {
      expect(buttonVariants({ variant }), variant).not.toMatch(/shadow-|translate-y-px/)
    }
    expect(inputControlClassName).not.toMatch(/shadow-/)
    expect(toggleVariants()).not.toMatch(/shadow-/)
    // R5a: la Card es el widget de iCloud (catálogo §2.7), con la sombra de widget; la `subtle`, plana.
    expect(cardVariants()).toMatch(/(^|\s)shadow-widget(\s|$)/)
    expect(cardVariants({ variant: "subtle" })).not.toMatch(/(^|\s)shadow-/)
  })

  it("menús, popovers y diálogos flotan con la sombra de iCloud", () => {
    expect(menuPopupClassName).toMatch(/(^|\s)shadow-menu(\s|$)/)
    expect(floatingPopupClassName).toMatch(/(^|\s)shadow-menu(\s|$)/)
    expect(modalPopupClassName).toMatch(/(^|\s)shadow-modal(\s|$)/)
  })

  it("el segmento activo lleva la sombra de segmento", () => {
    expect(segmentedThumbClassName).toMatch(/(^|\s)shadow-segment(\s|$)/)
  })

  it("ningún componente usa las sombras que se fueron", () => {
    const usos: string[] = []
    for (const dir of ["components", "variants", "internal"]) {
      for (const file of readdirSync(join(root, "src", dir))) {
        for (const m of src(`${dir}/${file}`).matchAll(/(?<![\w-])shadow-(button[\w-]*|chip|track)(?![\w-])/g)) usos.push(`${file}: ${m[0]}`)
      }
    }
    expect(usos).toEqual([])
  })
})

// Revisión de R1: en claro iCloud solo mostró la sombra de menú y la de widget (16 % contra 65 % en
// oscuro). Las otras se derivan de la oscura con esa misma proporción; el comentario de theme.css lo
// dice y este test lo sostiene, para que no vuelvan a ser números sueltos.
describe("sombras claras derivadas de las oscuras", () => {
  const css = src("styles/theme.css")
  const bloque = (sel: string) => {
    const inicio = css.indexOf(sel)
    return css.slice(inicio, css.indexOf("\n  }", inicio))
  }
  const alfa = (cuerpo: string, token: string) => {
    const valor = new RegExp(`--sf-shadow-${token}: ([^;]+);`).exec(cuerpo)![1]!
    const hex = [...valor.matchAll(/#000000([0-9a-f]{2})/g)].at(-1)![1]!
    return parseInt(hex, 16) / 255
  }
  const claro = bloque(":root {")
  const oscuro = bloque(".dark {")
  const proporcion = alfa(claro, "menu") / alfa(oscuro, "menu")

  it("menú: 16 % en claro y 65 % en oscuro, las dos medidas", () => {
    expect(alfa(claro, "menu")).toBeCloseTo(0.16, 2)
    expect(alfa(oscuro, "menu")).toBeCloseTo(0.65, 2)
  })

  for (const token of ["tooltip", "widget", "segment", "badge", "thumbnail", "card-hover"]) {
    it(`${token}: la clara es la oscura por ${proporcion.toFixed(3)}`, () => {
      expect(alfa(claro, token)).toBeCloseTo(alfa(oscuro, token) * proporcion, 2)
    })
  }
})
