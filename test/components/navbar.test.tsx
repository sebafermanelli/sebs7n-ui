import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Navbar, NavbarContent, useNavbar } from "../../src/components/navbar"

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

  it("bar: al pasar el umbral toma el fondo de la barra global, con borde abajo", () => {
    const { container } = render(<Navbar>x</Navbar>)
    scrollTo(40)
    expect(header(container)).toHaveAttribute("data-scrolled")
    expect(surface(container)).toHaveClass("bg-surface-header", "in-data-ambient:material-translucent", "border-b-separator")
    expect(surface(container)).not.toHaveClass("rounded-panel")
    expect(header(container)).toHaveClass("pt-0")
  })

  it("surfaceClassName llega a la superficie y le gana a la forma de `floating`", () => {
    const { container } = render(
      <Navbar surfaceClassName="max-w-none rounded-full" variant="floating">
        x
      </Navbar>
    )
    scrollTo(40)
    const surface = container.querySelector("[data-slot=navbar-surface]")!
    expect(surface).toHaveClass("max-w-none", "rounded-full")
    expect(surface).not.toHaveClass("max-w-6xl")
    expect(surface).not.toHaveClass("rounded-panel")
    // Al `<header>` no le llega: su `className` es otro.
    expect(container.querySelector("[data-slot=navbar]")).not.toHaveClass("rounded-full")
  })

  it("floating: arriba ocupa todo el ancho; al scrollear se despega con margen, radio y sombra", () => {
    const { container } = render(<Navbar variant="floating">x</Navbar>)
    expect(header(container)).toHaveClass("px-0", "pt-0")
    expect(surface(container)).toHaveClass("rounded-none")
    scrollTo(40)
    expect(header(container)).toHaveClass("px-3", "pt-3")
    expect(surface(container)).toHaveClass("rounded-panel", "border-separator", "shadow-menu", "bg-surface-header")
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

  it("useNavbar le avisa a un hijo si la barra ya tiene fondo y si está despegada", () => {
    const Hijo = () => {
      const { scrolled, floating } = useNavbar()
      return <span data-testid="hijo">{`${scrolled} ${floating}`}</span>
    }
    const { getByTestId, rerender } = render(<Navbar variant="floating"><Hijo /></Navbar>)
    expect(getByTestId("hijo")).toHaveTextContent("false false")
    scrollTo(40)
    expect(getByTestId("hijo")).toHaveTextContent("true true")
    // `bar` también tiene vidrio al scrollear, pero no se despega.
    rerender(<Navbar><Hijo /></Navbar>)
    expect(getByTestId("hijo")).toHaveTextContent("true false")
  })

  it("useNavbar afuera de un Navbar no rompe: todo en false", () => {
    const Hijo = () => <span data-testid="suelto">{String(useNavbar().floating)}</span>
    const { getByTestId } = render(<Hijo />)
    expect(getByTestId("suelto")).toHaveTextContent("false")
  })
})

// Revisión de R1: sin vidrio no hay `backdrop-filter` que animar ni cantos de cápsula de Safari.
describe("Navbar y Sidebar sin restos del vidrio", () => {
  it("la superficie del Navbar no transiciona backdrop-filter", async () => {
    const { readFileSync } = await import("node:fs")
    const { join } = await import("node:path")
    const navbar = readFileSync(join(import.meta.dirname, "../../src/components/navbar.tsx"), "utf8")
    const sidebar = readFileSync(join(import.meta.dirname, "../../src/components/sidebar.tsx"), "utf8")
    expect(navbar).not.toMatch(/backdrop-filter|canto especular|material grueso/)
    expect(sidebar).not.toMatch(/backdrop-filter-none|after:hidden/)
  })
})
