import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NavbarLink } from "../../src/components/navbar-link"
import { navbarLinkClassName } from "../../src/variants/navbar-link"

describe("NavbarLink", () => {
  it("es un link de texto del escalón de la barra (28), secundario en reposo y label con el puntero", () => {
    render(<NavbarLink href="/ayuda">Ayuda</NavbarLink>)
    const link = screen.getByRole("link", { name: "Ayuda" })
    expect(link).toHaveAttribute("href", "/ayuda")
    expect(link).toHaveAttribute("data-slot", "navbar-link")
    expect(link).toHaveClass("h-7", "text-callout", "text-label-secondary", "hover:text-label", "focus-visible:focus-ring")
    expect(link).not.toHaveAttribute("aria-current")
  })

  it("el activo va en label y lo anuncia con aria-current=page", () => {
    render(<NavbarLink href="/viajes" active>Viajes</NavbarLink>)
    const link = screen.getByRole("link", { name: "Viajes" })
    expect(link).toHaveAttribute("aria-current", "page")
    expect(link).toHaveAttribute("data-active", "")
    expect(link).toHaveClass("aria-[current=page]:text-label")
  })

  it("acepta el Link del router por render y conserva sus props", () => {
    function RouterLink(props: React.ComponentProps<"a">) {
      return <a data-router="" {...props} />
    }
    render(<NavbarLink render={<RouterLink href="/precios" />}>Precios</NavbarLink>)
    const link = screen.getByRole("link", { name: "Precios" })
    expect(link).toHaveAttribute("data-router", "")
    expect(link).toHaveAttribute("href", "/precios")
    expect(link).toHaveClass("text-label-secondary")
  })

  it("la clase sirve para un control de ícono de la barra, con el mismo color", () => {
    const icono = navbarLinkClassName({ icon: true }).split(" ")
    expect(icono).toContain("size-7")
    expect(icono).toContain("text-label-secondary")
    expect(icono).toContain("hover:text-label")
  })
})
