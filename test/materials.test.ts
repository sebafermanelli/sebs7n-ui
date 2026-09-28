// @vitest-environment node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { contrastRatio, luminanceOfHex } from "../src/lib/contrast.js"
import { cn } from "../src/lib/utils.js"
import { cardVariants } from "../src/variants/card.js"
import { menuPopupClassName } from "../src/variants/menu.js"
import { floatingPopupClassName, modalPopupClassName } from "../src/variants/overlay.js"

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8")
const theme = read("../src/styles/theme.css")
const colors = read("../src/styles/colors.css")

/** El cuerpo de una `@utility`, hasta la llave que la cierra en la columna cero. */
const utility = (name: string) => {
  const inicio = theme.indexOf(`@utility ${name} {`)
  return inicio === -1 ? "" : theme.slice(inicio, theme.indexOf("\n}", inicio))
}

const bloque = (css: string, tema: "light" | "dark") => {
  const inicio = css.indexOf(tema === "light" ? ":root {" : ".dark {")
  return css.slice(inicio, css.indexOf("\n  }", inicio))
}

/** El hex de un token en un tema, siguiendo un `var()` hasta `colors.css` si hace falta. */
const resolver = (tema: "light" | "dark", token: string): string => {
  for (const css of [theme, colors]) {
    const valor = new RegExp(`${token}:\\s*([^;]+);`).exec(bloque(css, tema))?.[1]?.trim()
    if (!valor) continue
    const ref = /^var\((--[\w-]+)\)$/.exec(valor)?.[1]
    return ref ? resolver(tema, ref) : valor
  }
  throw new Error(`${token} no está en ${tema}`)
}

describe("material por rol (2.0)", () => {
  it("existen las cuatro utilidades", () => {
    for (const name of ["material-bar", "material-popover", "material-modal", "material-group"]) {
      expect(theme, name).toMatch(new RegExp(`@utility ${name} \\{`))
    }
  })

  it("el grupo es sólido: sin backdrop-filter", () => {
    const block = utility("material-group")
    expect(block).toMatch(/background-color: var\(--sf-group\)/)
    expect(block).not.toMatch(/backdrop-filter/)
  })

  it("el modal deja pasar la cuarta parte de lo que deja el vidrio: ≈91 % de fill con --glass: 1", () => {
    expect(utility("material-modal")).toMatch(/--sf-glass-clear: 0\.25;/)
    expect(1 - 0.35 * 0.25).toBeCloseTo(0.9125, 4)
  })

  it("los diálogos son casi opacos y los popups densos", () => {
    expect(modalPopupClassName).toMatch(/\bmaterial-modal\b/)
    expect(modalPopupClassName).not.toMatch(/(^|\s)glass(\s|$)/)
    expect(floatingPopupClassName).toMatch(/\bmaterial-popover\b/)
    expect(menuPopupClassName).toMatch(/\bmaterial-popover\b/)
  })

  // En macOS un aviso es un banner de notificación: flota sobre cualquier cosa, como un popover.
  // Se mira el fuente porque el toast solo existe después de llamar a `toast()` en un navegador.
  it("los toasts son popovers", () => {
    const sonner = read("../src/components/sonner.tsx")
    expect(sonner).toMatch(/\bmaterial-popover!/)
    expect(sonner).not.toMatch(/\bglass!/)
  })

  it("las cards son grupos", () => {
    expect(cardVariants()).toMatch(/\bmaterial-group\b/)
    expect(cardVariants()).not.toMatch(/(^|\s)glass(\s|$)/)
  })

  it("un bg-* de la app le gana al material, igual que a glass", () => {
    for (const name of ["material-bar", "material-popover", "material-modal", "material-group"]) {
      expect(cn(name, "bg-red-100"), name).toBe("bg-red-100")
    }
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

describe("--sf-group: el texto se lee sobre un grupo (WCAG 1.4.3)", () => {
  const ratio = (fg: string, bg: string) => contrastRatio(luminanceOfHex(fg), luminanceOfHex(bg))
  for (const tema of ["light", "dark"] as const) {
    const group = resolver(tema, "--sf-group")
    for (const [rol, token] of [["principal", "--sf-gray-1000"], ["secundario", "--sf-gray-900"]] as const) {
      const fg = resolver(tema, token)
      it(`${tema} · ${rol}: ${fg} sobre ${group} llega a 4.5:1`, () => {
        expect(ratio(fg, group)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  it("en oscuro el grupo se despega de la página: un paso más claro que el negro", () => {
    const page = resolver("dark", "--sf-background")
    expect(ratio(resolver("dark", "--sf-group"), page)).toBeGreaterThan(1.2)
  })
})
