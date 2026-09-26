import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Navbar, NavbarContent } from "../../src/components/navbar"

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true })
    window.dispatchEvent(new Event("scroll"))
  })
}

afterEach(() => scrollTo(0))

const surface = (c: HTMLElement) => c.querySelector("[data-slot=navbar-surface]") as HTMLElement
const header = (c: HTMLElement) => c.querySelector("[data-slot=navbar]") as HTMLElement

describe("Navbar", () => {
  it("es un <header> sticky, transparente arriba de todo", () => {
    const { container } = render(<Navbar><NavbarContent>x</NavbarContent></Navbar>)
    expect(header(container).tagName).toBe("HEADER")
    expect(header(container)).toHaveClass("sticky", "top-0")
    expect(header(container)).not.toHaveAttribute("data-scrolled")
    expect(surface(container)).toHaveClass("bg-transparent")
    expect(surface(container).className).not.toMatch(/backdrop-blur/)
  })

  it("bar: al pasar el umbral se vuelve translúcida con blur y borde abajo", () => {
    const { container } = render(<Navbar>x</Navbar>)
    scrollTo(40)
    expect(header(container)).toHaveAttribute("data-scrolled")
    expect(surface(container)).toHaveClass("bg-background-100/80", "backdrop-blur-md", "border-b-gray-400")
    expect(surface(container)).not.toHaveClass("rounded-2xl")
    expect(header(container)).toHaveClass("pt-0")
  })

  it("floating: arriba ocupa todo el ancho; al scrollear se despega con margen, radio y sombra", () => {
    const { container } = render(<Navbar variant="floating">x</Navbar>)
    expect(header(container)).toHaveClass("px-0", "pt-0")
    expect(surface(container)).toHaveClass("rounded-none")
    scrollTo(40)
    expect(header(container)).toHaveClass("px-3", "pt-3")
    expect(surface(container)).toHaveClass("rounded-2xl", "border-gray-400", "shadow-menu", "backdrop-blur-md")
    scrollTo(0)
    expect(surface(container)).toHaveClass("rounded-none")
  })

  it("el umbral se configura y la transición cubre padding, radio y fondo", () => {
    const { container } = render(<Navbar scrollThreshold={100}>x</Navbar>)
    scrollTo(50)
    expect(header(container)).not.toHaveAttribute("data-scrolled")
    scrollTo(150)
    expect(header(container)).toHaveAttribute("data-scrolled")
    expect(header(container).className).toMatch(/transition-\[padding\]/)
    expect(surface(container).className).toMatch(/transition-\[background-color,border-color,border-radius/)
  })

  it("position fixed se superpone al contenido", () => {
    const { container } = render(<Navbar position="fixed">x</Navbar>)
    expect(header(container)).toHaveClass("fixed", "inset-x-0")
    expect(header(container)).not.toHaveClass("sticky")
  })
})
