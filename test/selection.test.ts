// @vitest-environment node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { menuItemClassName } from "../src/variants/menu.js"
import { sidebarItemVariants } from "../src/variants/sidebar.js"

const theme = readFileSync(fileURLToPath(new URL("../src/styles/theme.css", import.meta.url)), "utf8")
const sidebarItemClassName = sidebarItemVariants()

describe("selección de macOS (2.0)", () => {
  it("hay tokens de selección: el acento sólido y su texto", () => {
    expect(theme).toMatch(/--color-selection: var\(--sf-selection\);/)
    expect(theme).toMatch(/--color-on-selection: var\(--sf-on-selection\);/)
  })

  it("el ítem resaltado de un menú va en acento sólido con texto de contraste", () => {
    expect(menuItemClassName).toMatch(/data-highlighted:bg-selection/)
    expect(menuItemClassName).toMatch(/data-highlighted:text-on-selection/)
    expect(menuItemClassName).toMatch(/data-highlighted:\[&_svg\]:text-on-selection/)
    expect(menuItemClassName).not.toMatch(/data-highlighted:bg-highlight/)
  })

  it("un ítem deshabilitado no toma el acento aunque quede resaltado", () => {
    expect(menuItemClassName).toMatch(/data-disabled:data-highlighted:bg-transparent/)
    expect(menuItemClassName).toMatch(/data-disabled:data-highlighted:text-label-tertiary/)
  })

  it("el ítem activo del sidebar también", () => {
    expect(sidebarItemClassName).toMatch(/aria-\[current=page\]:bg-selection/)
    expect(sidebarItemClassName).toMatch(/aria-\[current=page\]:text-on-selection/)
    expect(sidebarItemClassName).toMatch(/data-active:bg-selection/)
    expect(sidebarItemClassName).not.toMatch(/bg-highlight/)
  })
})
