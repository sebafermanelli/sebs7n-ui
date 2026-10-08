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

describe("sombras chicas (2.16)", () => {
  it("menú y diálogo: el filo del popover más dos capas cortas; el diálogo un nivel arriba del menú", () => {
    expect(sombra("light", "menu")).toBe("0 0 0 1px var(--sf-hairline), 0 1px 3px 0 #0000000f, 0 4px 14px 0 #0000001a")
    expect(sombra("dark", "menu")).toBe("0 0 0 1px var(--sf-hairline), 0 1px 3px 0 #00000059, 0 4px 14px 0 #00000080")
    expect(sombra("light", "modal")).toBe("0 0 0 1px var(--sf-hairline), 0 2px 6px 0 #0000000f, 0 10px 28px 0 #0000001f")
    expect(sombra("dark", "modal")).toBe("0 0 0 1px var(--sf-hairline), 0 2px 6px 0 #00000066, 0 10px 28px 0 #00000099")
  })

  it("widget, segmento, badge y miniatura", () => {
    expect(sombra("light", "widget")).toBe("0 0 0 1px var(--sf-hairline), 0 1px 2px 0 #0000000a, 0 2px 8px 0 #0000000f")
    expect(sombra("dark", "widget")).toBe("0 0 0 1px var(--sf-hairline), 0 1px 2px 0 #0000004d, 0 2px 8px 0 #00000059")
    expect(sombra("dark", "segment")).toBe("0 1px 2px 0 #0000004d")
    expect(sombra("dark", "badge")).toBe("0 1px 2px 0 #00000066")
    expect(sombra("dark", "thumbnail")).toBe("0 0 0 1px #000000a6")
  })

  it("ninguna sombra pasa de 28 px de blur ni de 10 px de desplazamiento", () => {
    for (const tema of ["light", "dark"] as const) {
      for (const m of bloque(tema).matchAll(/--sf-shadow-[\w-]+:\s*([^;]+);/g)) {
        for (const parte of m[1]!.split(/,\s*(?=-?\d)/)) {
          const [, x, y, blur] = /^(-?\d+)(?:px)? (-?\d+)(?:px)?(?: (-?\d+)(?:px)?)?/.exec(parte) ?? []
          if (x === undefined) continue
          expect(Math.abs(Number(y)), `${tema} ${parte}`).toBeLessThanOrEqual(10)
          expect(Number(blur ?? 0), `${tema} ${parte}`).toBeLessThanOrEqual(28)
        }
      }
    }
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

// La jerarquía de capas: reposo (widget) < flotante (menú) < overlay (modal), en blur y en alfa de
// la capa de ambiente, en los dos temas; y la oscura siempre más opaca que la clara.
describe("jerarquía de las sombras", () => {
  const ambiente = (tema: "light" | "dark", token: string) => {
    const valor = sombra(tema, token)!
    const capa = [...valor.matchAll(/(\d+)px (\d+)px 0 #000000([0-9a-f]{2})/g)].at(-1)!
    return { blur: Number(capa[2]), alfa: parseInt(capa[3]!, 16) / 255 }
  }
  for (const tema of ["light", "dark"] as const) {
    it(`${tema}: widget < menú < modal`, () => {
      const [w, m, d] = ["widget", "menu", "modal"].map((t) => ambiente(tema, t))
      expect(w!.blur).toBeLessThan(m!.blur)
      expect(m!.blur).toBeLessThan(d!.blur)
      expect(w!.alfa).toBeLessThan(m!.alfa)
      expect(m!.alfa).toBeLessThan(d!.alfa)
    })
  }
  for (const token of ["tooltip", "menu", "modal", "widget", "segment", "badge", "card-hover"]) {
    it(`${token}: la oscura es más opaca que la clara`, () => {
      expect(ambiente("dark", token).alfa).toBeGreaterThan(ambiente("light", token).alfa)
    })
  }
})
