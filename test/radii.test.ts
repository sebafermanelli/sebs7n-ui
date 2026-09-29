// @vitest-environment node
//
// Los radios de iCloud web (2.0, catálogo §1.3): 8 los controles, 10 los campos y los ítems de
// lista, 11 las cards y los diálogos, 12 los menús y popovers. Nada de cápsulas en controles: en
// iCloud la búsqueda es 10, el segmentado 8 y los botones 8. Si alguien vuelve a poner un
// `rounded-full` en un botón «porque se ve más moderno», este archivo lo dice.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { cn } from "../src/lib/utils"
import { buttonVariants } from "../src/variants/button"
import { inputControlClassName } from "../src/variants/input"
import { menuItemClassName, menuPopupClassName } from "../src/variants/menu"
import { floatingPopupClassName } from "../src/variants/overlay"
import { segmentedThumbClassName, segmentedTrackClassName } from "../src/variants/segmented"
import { sidebarItemVariants } from "../src/variants/sidebar"
import { toggleVariants } from "../src/variants/toggle"

const css = readFileSync(join(import.meta.dirname, "..", "src/styles/theme.css"), "utf8")
const radio = (token: string) => Number(new RegExp(`--radius-${token}:\\s*(\\d+)px;`).exec(css)?.[1])
const clases = (s: string) => s.split(/\s+/)

describe("radios de iCloud", () => {
  it("cada token vale lo medido", () => {
    expect(radio("control")).toBe(8)
    expect(radio("field")).toBe(10)
    expect(radio("item")).toBe(10)
    expect(radio("surface")).toBe(11)
    expect(radio("panel")).toBe(11)
    expect(radio("menu")).toBe(12)
    expect(radio("menu-item")).toBe(8)
    expect(radio("tag")).toBe(4)
    // Revisión de R5a: lo que estaba como valor suelto pasa a token.
    expect(radio("tooltip")).toBe(6)
    expect(radio("meter")).toBe(6)
    // La cabecera de cuenta adentro del menú: radio 12 menos el padding de 5.
    expect(radio("menu-header")).toBe(7)
    // Revisión de R5b: el logo de 32 de una fila (5,3 en iCloud) y la píldora del nombre de FileGrid.
    expect(radio("thumb")).toBe(5)
  })

  it("sin radios sueltos en px en los componentes", async () => {
    const { readdirSync, readFileSync } = await import("node:fs")
    const { join } = await import("node:path")
    const dir = join(import.meta.dirname, "../src/components")
    const sueltos = readdirSync(dir).filter((archivo) => /rounded-\[\d+px\]/.test(readFileSync(join(dir, archivo), "utf8")))
    expect(sueltos).toEqual([])
  })

  // iCloud no los hace concéntricos: radio 12 con 5 de padding e ítem de 8 (menú de fila de Drive).
  it("el panel de un menú es el de iCloud: radio 12, padding 5, ítem de 8", () => {
    expect(radio("menu-item")).toBe(8)
    expect(clases(menuPopupClassName)).toEqual(expect.arrayContaining(["rounded-menu", "p-1.25"]))
    expect(clases(menuItemClassName)).toContain("rounded-menu-item")
  })

  it("popovers con el radio de los menús", () => {
    expect(clases(floatingPopupClassName)).toContain("rounded-menu")
  })

  it("sin cápsula: botones, campos, chips y segmentado", () => {
    for (const size of ["sm", "md", "lg", "icon-sm", "icon-md", "icon-lg"] as const) {
      expect(clases(buttonVariants({ size })), size).toContain("rounded-control")
      expect(clases(buttonVariants({ size })), size).not.toContain("rounded-full")
    }
    expect(clases(inputControlClassName)).toContain("rounded-field")
    expect(clases(toggleVariants())).toContain("rounded-control")
    expect(clases(toggleVariants())).not.toContain("rounded-full")
    expect(clases(segmentedTrackClassName)).toContain("rounded-control")
    // El segmento activo mide 2 menos que la pista (el `p-0.5`): 6, como en Calendar.
    expect(clases(segmentedThumbClassName)).toContain("rounded-[calc(var(--radius-control)-2px)]")
  })

  it("el ítem del sidebar lleva el radio de ítem de lista (10)", () => {
    expect(clases(sidebarItemVariants())).toContain("rounded-item")
  })

  it("tailwind-merge los conoce: el radio del llamador gana", () => {
    expect(cn("rounded-control", "rounded-full")).toBe("rounded-full")
    expect(cn("rounded-full", "rounded-surface")).toBe("rounded-surface")
    expect(cn("rounded-panel", "rounded-none")).toBe("rounded-none")
    expect(cn("rounded-menu-item", "rounded-none")).toBe("rounded-none")
    expect(cn("rounded-item", "rounded-none")).toBe("rounded-none")
    expect(cn("rounded-menu", "rounded-control")).toBe("rounded-control")
  })
})
