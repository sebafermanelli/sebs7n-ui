// @vitest-environment node
//
// El contrato del material. Todo el vidrio del sistema sale de `--glass`: si una utilidad deja de
// leerlo, o si el interruptor de accesibilidad se pierde en un refactor, nada se rompe a la vista
// —el componente sigue viéndose bien en la máquina de quien lo tocó— y por eso queda escrito acá.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { cn } from "../src/lib/utils"

const css = readFileSync(join(import.meta.dirname, "..", "src/styles/theme.css"), "utf8")

/** El cuerpo de una `@utility`, hasta la llave que la cierra en la columna cero. */
const utility = (name: string) => {
  const inicio = css.indexOf(`@utility ${name} {`)
  return inicio === -1 ? "" : css.slice(inicio, css.indexOf("\n}", inicio))
}

describe("glass: un solo parámetro", () => {
  it("la app regula el material con --glass y --glass-tint", () => {
    expect(css).toMatch(/--glass:\s*0\.6;/)
    expect(css).toMatch(/--glass-tint:\s*0;/)
  })

  it("las utilidades calculan la intensidad en el elemento, no en :root", () => {
    // Si `--sf-g` solo viviera en `:root`, pisar `--glass` en un subárbol no haría nada: una
    // custom property con `var()` se resuelve donde se declara, no donde se usa.
    for (const name of ["glass", "glass-control"]) {
      expect(utility(name), name).toContain("--sf-g: calc(var(--glass) * var(--sf-glass-on));")
    }
  })

  it("fill, blur y saturación salen de la intensidad", () => {
    const glass = utility("glass")
    expect(glass).toContain("calc((1 - var(--sf-g) * 0.6) * 100%)")
    expect(glass).toContain("blur(calc(var(--sf-g) * var(--sf-glass-k, 1) * 40px))")
    expect(glass).toContain("saturate(calc(1 + var(--sf-g) * 1.3))")
    expect(glass).toContain("-webkit-backdrop-filter")
  })

  it("un control adentro de un vidrio no lleva blur: nunca vidrio sobre vidrio", () => {
    expect(utility("glass-control")).not.toContain("backdrop-filter")
  })

  it("el grosor sigue al tamaño", () => {
    expect(utility("glass-thin")).toContain("--sf-glass-k: 0.6;")
    expect(utility("glass-thick")).toContain("--sf-glass-k: 1.5;")
  })

  it("están las utilidades del cromo, del brand y de la luz ambiente", () => {
    for (const name of ["glass-rim", "sheen", "bg-ambient"]) expect(utility(name), name).not.toBe("")
  })
})

describe("glass: accesibilidad", () => {
  it("sin transparencia o con más contraste, el material se apaga", () => {
    expect(css).toMatch(/--sf-glass-on:\s*1;/)
    const media = css.slice(css.indexOf("@media (prefers-reduced-transparency: reduce), (prefers-contrast: more)"))
    expect(media.slice(0, 200)).toMatch(/--sf-glass-on:\s*0;/)
  })
})

describe("radios semánticos", () => {
  it("los tres tokens existen y la app los puede pisar", () => {
    expect(css).toMatch(/--radius-control:\s*10px;/)
    expect(css).toMatch(/--radius-surface:\s*20px;/)
    expect(css).toMatch(/--radius-panel:\s*26px;/)
  })

  it("tailwind-merge los conoce: el radio del llamador gana", () => {
    expect(cn("rounded-control", "rounded-full")).toBe("rounded-full")
    expect(cn("rounded-full", "rounded-surface")).toBe("rounded-surface")
    expect(cn("rounded-panel", "rounded-none")).toBe("rounded-none")
  })
})

describe("glass y tailwind-merge", () => {
  it("un bg-* del llamador le gana al vidrio, y al revés", () => {
    expect(cn("glass", "bg-gray-100")).toBe("bg-gray-100")
    expect(cn("glass-control", "bg-transparent")).toBe("bg-transparent")
    expect(cn("bg-background-100", "glass")).toBe("glass")
  })

  it("el grosor no es un fondo: sobrevive al lado de glass", () => {
    expect(cn("glass", "glass-thick")).toBe("glass glass-thick")
  })

  it("conoce la sombra del botón de marca", () => {
    expect(cn("shadow-button", "shadow-button-accent")).toBe("shadow-button-accent")
  })
})
