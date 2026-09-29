// @vitest-environment node
//
// La selección de iCloud web (2.0, catálogo §1.8 y §2.3–2.8): lo neutro es gris translúcido y el
// texto no cambia de color —el ítem resaltado de un menú (fill 2), el activo del sidebar (fill 1),
// el link de la página actual—; solo la fila elegida de una lista CON FOCO es acento sólido con
// texto blanco, y sin foco pasa al gris de `selection-inactive`, como en Drive.
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { menuItemClassName, menuItemSecondaryClassName } from "../src/variants/menu.js"
import { sidebarItemVariants } from "../src/variants/sidebar.js"

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8")
const theme = read("../src/styles/theme.css")
const clases = (s: string) => s.split(/\s+/)

describe("selección de iCloud (2.0)", () => {
  it("quedan los tokens del acento sólido (fila con foco) y el gris sin foco", () => {
    expect(theme).toMatch(/--color-selection: var\(--sf-selection\);/)
    expect(theme).toMatch(/--color-on-selection: var\(--sf-on-selection\);/)
    expect(theme).toMatch(/--color-selection-inactive: var\(--sf-selection-inactive\);/)
  })

  it("el ítem resaltado de un menú va en fill 2 y el texto no cambia", () => {
    const menu = clases(menuItemClassName)
    expect(menu).toContain("data-highlighted:bg-fill-2")
    expect(menu).toContain("active:bg-fill-3")
    expect(menuItemClassName).not.toMatch(/selection/)
    expect(menuItemSecondaryClassName).not.toMatch(/selection/)
  })

  it("un ítem deshabilitado no se resalta", () => {
    const menu = clases(menuItemClassName)
    expect(menu).toContain("data-disabled:data-highlighted:bg-transparent")
    // iCloud apaga el ítem entero al 30 % (catálogo §2.8), ícono incluido.
    expect(menu).toContain("data-disabled:opacity-30")
  })

  it("el activo del sidebar va en fill 1, con el texto principal", () => {
    const item = clases(sidebarItemVariants())
    for (const estado of ["data-active", "aria-[current=page]"]) {
      expect(item, estado).toContain(`${estado}:bg-fill-1`)
      expect(item, estado).toContain(`${estado}:text-label`)
    }
    expect(sidebarItemVariants()).not.toMatch(/selection/)
  })

  it("los submenús abiertos y el link de la página actual son grises", () => {
    for (const file of ["dropdown-menu.tsx", "context-menu.tsx", "menubar.tsx", "navigation-menu.tsx", "sidebar.tsx"]) {
      expect(read(`../src/components/${file}`), file).not.toMatch(/bg-selection|text-on-selection|bg-on-selection/)
    }
    expect(read("../src/components/navigation-menu.tsx")).toContain("data-[active]:bg-fill-1")
  })

  it("la fila elegida de una tabla: acento con foco en la tabla, gris sin foco", () => {
    const table = read("../src/components/table.tsx")
    // El fondo va en las celdas (R5a): así la fila elegida lleva el radio 10 de Drive en los extremos.
    expect(table).toContain("data-[state=selected]:[&>td]:bg-selection-inactive")
    expect(table).toContain("data-[state=selected]:group-focus-within/table:[&>td]:bg-selection")
    expect(table).toContain("data-[state=selected]:group-focus-within/table:text-on-selection")
    expect(table).toContain("group-data-[state=selected]/table-row:group-focus-within/table:text-on-selection")
  })

  it("inside-selection solo mira la fila elegida de una tabla o una lista con foco", () => {
    const variante = /@custom-variant inside-selection \((.+)\);/.exec(theme)![1]!
    expect(variante).toContain('.group\\/table:focus-within .group\\/selectable[data-state="selected"] *')
    // R5b: las listas de filas (`List`, `Tree`, `FileGrid`) son `group/list`.
    expect(variante).toContain('.group\\/list:focus-within .group\\/selectable[data-state="selected"] *')
    expect(variante).not.toMatch(/data-highlighted|data-active|aria-current/)
  })
})
