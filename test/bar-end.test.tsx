// El borde derecho de las barras (2.1): terminan a 16, como empiezan, y a 10 si lo último es un botón
// de ícono, cuyo aire de 6 completa los 16 hasta el glifo. Es CSS (`bar-end` en theme.css): jsdom no lo
// aplica, así que se verifica la regla y que cada barra la use; el resultado se mira en el navegador.
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AppShell } from "../src/components/app-shell"
import { Navbar, NavbarContent } from "../src/components/navbar"

const theme = readFileSync(join(import.meta.dirname, "../src/styles/theme.css"), "utf8")

describe("bar-end", () => {
  it("theme.css: 16 por defecto y 10 con un botón de ícono al final, directo o último de lo último", () => {
    const utility = theme.slice(theme.indexOf("@utility bar-end"), theme.indexOf("}\n}", theme.indexOf("@utility bar-end")) + 3)
    expect(utility).toContain("--sf-bar-end: 16px;")
    expect(utility).toContain('&:has(> [data-size^="icon"]:last-child, > :last-child > [data-size^="icon"]:last-child)')
    expect(utility).toContain("--sf-bar-end: 10px;")
  })

  it("theme.css: un Toolbar plain como fila del Navbar (fuera de NavbarContent) lleva 4 de cada lado, en @layer base", () => {
    expect(theme).toMatch(
      /@layer base \{\s*\[data-slot="navbar-surface"\] \[data-slot="toolbar"\]\[data-variant="plain"\]:not\(\[data-slot="navbar-content"\] \*\) \{\s*padding-inline: 4px;/
    )
  })

  it("NavbarContent termina con bar-end, y el px de una app lo reemplaza entero (tailwind-merge)", () => {
    const { container, rerender } = render(
      <Navbar>
        <NavbarContent>x</NavbarContent>
      </Navbar>
    )
    const content = () => container.querySelector("[data-slot=navbar-content]")!
    expect(content()).toHaveClass("ps-4", "pe-(--sf-bar-end)", "bar-end")
    expect(content()).not.toHaveClass("pe-1.5")
    rerender(
      <Navbar>
        <NavbarContent className="px-6">x</NavbarContent>
      </Navbar>
    )
    expect(content()).toHaveClass("px-6")
    expect(content()).not.toHaveClass("pe-(--sf-bar-end)")
  })

  it("las dos barras de AppShell también", () => {
    const { container } = render(
      <AppShell header={<span>Marca</span>} mobileBar={<span>Marca</span>} sidebar={<nav />}>
        x
      </AppShell>
    )
    for (const slot of ["app-shell-header", "app-shell-mobile-bar"]) {
      const bar = container.querySelector(`[data-slot=${slot}]`)!
      expect(bar).toHaveClass("ps-4", "pe-(--sf-bar-end)", "bar-end")
    }
  })
})
