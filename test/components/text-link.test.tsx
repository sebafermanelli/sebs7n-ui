import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TextLink } from "../../src/components/text-link"
import { linkVariants } from "../../src/variants/link"

// El link de iCloud (Settings): 17/600 en el acento, con «›» para ir a otra pantalla y «↗» para
// salir del sitio. Medido: el ↗ va pegado a la última palabra con `&nbsp;` adentro de un span que no
// corta, y lleva el aviso «(opens in a new tab)» para el lector de pantalla.
describe("TextLink", () => {
  it("linkVariants accent: semibold en brand-900, subraya en hover y no pinta fondo", () => {
    const clases = linkVariants({ variant: "accent" }).split(" ")
    expect(clases).toEqual(expect.arrayContaining(["font-semibold", "text-brand-900", "hover:underline", "focus-visible:focus-ring"]))
    // El acento sobre un relleno no llega a 4,5:1 con todas las marcas: el link no pinta fondo.
    expect(clases.filter((c) => /(^|:)bg-/.test(c))).toEqual([])
  })

  it("por defecto es el acento, sin adorno", () => {
    render(<TextLink href="/planes">Planes</TextLink>)
    const link = screen.getByRole("link", { name: "Planes" })
    expect(link).toHaveAttribute("data-slot", "text-link")
    expect(link).toHaveClass("text-brand-900", "font-semibold")
    expect(link.querySelector("svg")).toBeNull()
    expect(link).not.toHaveAttribute("target")
  })

  it("chevron: la flecha › pegada a la última palabra, decorativa", () => {
    render(<TextLink href="/planes" trailing="chevron">Ver planes</TextLink>)
    const link = screen.getByRole("link", { name: "Ver planes" })
    const adorno = link.querySelector("[data-slot=text-link-trailing]")!
    expect(adorno).toHaveClass("whitespace-nowrap")
    expect(adorno.textContent?.startsWith(" ")).toBe(true)
    expect(adorno.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("external: ↗, pestaña nueva segura y el aviso para el lector de pantalla", () => {
    render(<TextLink href="https://example.com" trailing="external">example.com</TextLink>)
    const link = screen.getByRole("link", { name: /^example\.com\s*\(se abre en otra pestaña\)$/ })
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
    expect(link.querySelector("[data-slot=text-link-trailing] svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("external respeta rel y el texto del aviso que pone la app", () => {
    render(
      <TextLink href="https://example.com" trailing="external" rel="nofollow" externalLabel="(opens in a new tab)">
        example.com
      </TextLink>
    )
    const link = screen.getByRole("link", { name: /^example\.com\s*\(opens in a new tab\)$/ })
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "nofollow")
  })

  // Revisión de R4 (M4): el aviso dice «se abre en otra pestaña»; si la app lo abre en la misma
  // (target="_self"), el ↗ sigue diciendo «sale del sitio» pero el aviso sería mentira.
  it("external con otro target: el ↗ queda y el aviso de pestaña nueva no", () => {
    render(
      <TextLink href="https://example.com" trailing="external" target="_self">
        example.com
      </TextLink>
    )
    const link = screen.getByRole("link", { name: "example.com" })
    expect(link).toHaveAttribute("target", "_self")
    expect(link.querySelector(".sr-only")).toBeNull()
    expect(link.querySelector("[data-slot=text-link-trailing] svg")).not.toBeNull()
  })

  it("render: el <a> lo pone la app (next/link) y conserva el adorno", () => {
    render(
      <TextLink render={<a href="/docs" data-app="" />} trailing="chevron" variant="subtle">
        Docs
      </TextLink>
    )
    const link = screen.getByRole("link", { name: "Docs" })
    expect(link).toHaveAttribute("data-app")
    expect(link).toHaveClass("text-label-secondary")
    expect(link.querySelector("[data-slot=text-link-trailing]")).not.toBeNull()
  })
})
