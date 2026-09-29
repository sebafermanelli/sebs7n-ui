// El disparador de `Collapsible` con `chevron` (el estilo del paquete) trae, desde 2.1, el texto de 14,
// un alto mínimo de 24 (WCAG 2.5.8) y 44 con el dedo. Es CSS en `theme.css` (`@layer base`, así una
// clase de la app le gana) y no JS: el barrel está en su tope. Sin `chevron`, el trigger sigue sin estilo.
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../src/components/collapsible"

const theme = readFileSync(join(import.meta.dirname, "../../src/styles/theme.css"), "utf8")

describe("CollapsibleTrigger chevron", () => {
  it("theme.css: 14/18, 24 de alto mínimo y el área de 44 con el dedo, en @layer base", () => {
    const block = theme.slice(theme.indexOf("/* CollapsibleTrigger */"))
    expect(block).toMatch(/@layer base \{\s*\[data-slot="collapsible-trigger"\]\.group\\\/collapsible-trigger \{/)
    expect(block).toContain("min-height: 24px;")
    expect(block).toContain("font-size: 14px;")
    expect(block).toContain("line-height: 18px;")
    expect(block).toMatch(/@media \(pointer: coarse\)[\s\S]*::after[\s\S]*height: max\(100%, 44px\)/)
  })

  it("con chevron lleva la clase que la regla busca, el foco y el chevron que gira", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger chevron>Más datos del cliente</CollapsibleTrigger>
        <CollapsibleContent>CUIT y domicilio fiscal</CollapsibleContent>
      </Collapsible>
    )
    const trigger = screen.getByRole("button", { name: "Más datos del cliente" })
    expect(trigger).toHaveAttribute("data-slot", "collapsible-trigger")
    expect(trigger).toHaveClass("group/collapsible-trigger", "focus-visible:focus-ring")
    expect(trigger.querySelector("svg")).toHaveClass("group-data-panel-open/collapsible-trigger:rotate-90")
  })

  it("sin chevron, sin estilo (2.0): la regla no lo toca", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Más datos</CollapsibleTrigger>
      </Collapsible>
    )
    expect(screen.getByRole("button")).not.toHaveClass("group/collapsible-trigger")
  })
})
