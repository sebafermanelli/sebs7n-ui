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
    expect(css).toMatch(/--glass:\s*1;/)
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
    expect(glass).toContain("calc((1 - var(--sf-g) * 0.35 * var(--sf-glass-clear, 1)) * 100%)")
    expect(glass).toContain("blur(calc(var(--sf-g) * var(--sf-glass-k, 1) * 16px))")
    expect(glass).toContain("saturate(calc(1 + var(--sf-g) * 0.8))")
    expect(glass).toContain("-webkit-backdrop-filter")
  })

  it("el canto es especular: dos esquinas opuestas y el brillo interno", () => {
    const glass = utility("glass")
    expect(glass).toContain("inset 1px 1px 0")
    expect(glass).toContain("inset -1px -1px 0")
    expect(glass).toContain("inset 0 0 14px")
    // Con --glass: 0 la esquina de atrás y el brillo desaparecen: los dos multiplican por g.
    expect(glass.match(/\* var\(--sf-g\)\)\)/g)?.length).toBeGreaterThanOrEqual(2)
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

describe("luz ambiente: un solo parámetro", () => {
  it("la app la regula con --ambient, y la utilidad lo lee en el elemento", () => {
    expect(css).toMatch(/--ambient:\s*1;/)
    expect(utility("bg-ambient").match(/var\(--ambient\)/g)).toHaveLength(3)
  })

  it("en oscuro llega menos luz que en claro: sobre negro el color se ve más", () => {
    const [claro, oscuro] = [...css.matchAll(/--sf-ambient-gain:\s*([\d.]+);/g)].map(([, n]) => Number(n))
    expect(claro).toBe(1)
    expect(oscuro).toBeLessThan(claro!)
  })
})

describe("glass-dense: el vidrio de las listas de texto", () => {
  it("cambia el fill y el brillo de lo de atrás, y no se hereda", () => {
    const dense = utility("glass-dense")
    expect(dense).toContain("--sf-glass-clear: calc((1 - var(--sf-glass-dense-fill)) / 0.35);")
    expect(dense).toContain("--sf-glass-backdrop: var(--sf-glass-dense-backdrop);")
    // Heredadas, un vidrio adentro de un menú saldría denso sin haberlo pedido.
    for (const nombre of ["--sf-glass-clear", "--sf-glass-backdrop"]) {
      const registro = css.slice(css.indexOf(`@property ${nombre} {`), css.indexOf("}", css.indexOf(`@property ${nombre} {`)))
      expect(registro, nombre).toContain("inherits: false;")
    }
  })

  it("sin glass-dense el vidrio es el de siempre: los valores iniciales son los del default", () => {
    expect(css).toMatch(/@property --sf-glass-clear \{[^}]*initial-value: 1;/)
    expect(css).toMatch(/@property --sf-glass-backdrop \{[^}]*initial-value: 0\.06;/)
  })

  it("lo llevan los menús, y nada más", async () => {
    const { menuPopupClassName } = await import("../src/variants/menu")
    const { floatingPopupClassName } = await import("../src/variants/overlay")
    expect(menuPopupClassName).toContain("glass-dense")
    expect(floatingPopupClassName).not.toContain("glass-dense")
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
    // Los campos son cápsulas, como los botones.
    expect(css).toMatch(/--radius-field:\s*9999px;/)
  })

  it("tailwind-merge los conoce: el radio del llamador gana", () => {
    expect(cn("rounded-control", "rounded-full")).toBe("rounded-full")
    expect(cn("rounded-full", "rounded-surface")).toBe("rounded-surface")
    expect(cn("rounded-panel", "rounded-none")).toBe("rounded-none")
    expect(cn("rounded-field", "rounded-[min(var(--radius-field),--spacing(5))]")).toBe("rounded-[min(var(--radius-field),--spacing(5))]")
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
