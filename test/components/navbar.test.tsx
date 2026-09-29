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
  it("es un <header> sticky a todo el ancho, translúcido desde arriba: la barra de la home de iCloud", () => {
    const { container } = render(<Navbar><NavbarContent>x</NavbarContent></Navbar>)
    expect(header(container).tagName).toBe("HEADER")
    expect(header(container)).toHaveClass("sticky", "top-0", "w-full")
    expect(header(container)).not.toHaveAttribute("data-scrolled")
    // Sin estado transparente: translúcida con desenfoque siempre (el contenido pasa por abajo), con
    // el fill denso de la barra fuera del wallpaper y el de `material-translucent` sobre él. Opaca con
    // menos transparencia: lo resuelve la utilidad.
    expect(surface(container)).toHaveClass(
      "material-translucent",
      "not-in-data-ambient:[--sf-translucent:var(--sf-translucent-bar)]",
      "shadow-[inset_0_-1px_0_var(--color-separator-strong)]"
    )
    expect(surface(container).className).not.toMatch(/bg-transparent|rounded-|shadow-menu|backdrop-blur/)
  })

  it("NavbarContent: 44 de alto, 0 6px 0 16px y a todo el ancho", () => {
    const { container } = render(<Navbar><NavbarContent>x</NavbarContent></Navbar>)
    const content = container.querySelector("[data-slot=navbar-content]")!
    expect(content).toHaveClass("h-11", "w-full", "ps-4", "pe-1.5")
    expect(content.className).not.toMatch(/max-w-6xl|h-14/)
  })

  it("scrollear no cambia la superficie; data-scrolled sigue para quien la quiera usar", () => {
    const { container } = render(<Navbar scrollThreshold={100}>x</Navbar>)
    const antes = surface(container).className
    scrollTo(50)
    expect(header(container)).not.toHaveAttribute("data-scrolled")
    scrollTo(150)
    expect(header(container)).toHaveAttribute("data-scrolled")
    expect(surface(container).className).toBe(antes)
  })

  it("surfaceClassName llega a la superficie; variant=bar (obsoleta) no llega al DOM", () => {
    const { container } = render(
      <Navbar surfaceClassName="extra" variant="bar">
        x
      </Navbar>
    )
    expect(surface(container)).toHaveClass("extra")
    expect(header(container)).not.toHaveAttribute("variant")
    expect(header(container)).not.toHaveAttribute("data-variant")
  })

  it("position fixed se superpone al contenido", () => {
    const { container } = render(<Navbar position="fixed">x</Navbar>)
    expect(header(container)).toHaveClass("fixed", "inset-x-0")
    expect(header(container)).not.toHaveClass("sticky")
  })

  it("useNavbar le avisa a un hijo si la ventana ya bajó", () => {
    const Hijo = () => <span data-testid="hijo">{String(useNavbar().scrolled)}</span>
    const { getByTestId } = render(<Navbar><Hijo /></Navbar>)
    expect(getByTestId("hijo")).toHaveTextContent("false")
    scrollTo(40)
    expect(getByTestId("hijo")).toHaveTextContent("true")
  })

  it("useNavbar afuera de un Navbar no rompe", () => {
    const Hijo = () => <span data-testid="suelto">{String(useNavbar().scrolled)}</span>
    const { getByTestId } = render(<Hijo />)
    expect(getByTestId("suelto")).toHaveTextContent("false")
    // `floating` se fue con la cápsula.
    const Otro = () => <span data-testid="claves">{Object.keys(useNavbar()).join(",")}</span>
    render(<Otro />)
    expect(document.querySelector("[data-testid=claves]")).toHaveTextContent(/^scrolled$/)
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

describe("NavbarContent maxWidth", () => {
  it("la barra a todo el ancho y el contenido en la columna del sitio, centrado", () => {
    const { container } = render(
      <Navbar>
        <NavbarContent maxWidth={1448}>x</NavbarContent>
      </Navbar>
    )
    const content = container.querySelector<HTMLElement>("[data-slot=navbar-content]")!
    expect(content.style.maxWidth).toBe("1448px")
    expect(content).toHaveClass("mx-auto", "w-full")
    expect(surface(container)).not.toHaveStyle({ maxWidth: "1448px" })
  })

  it("acepta cualquier largo de CSS y respeta el style del llamador", () => {
    const { container } = render(
      <Navbar>
        <NavbarContent maxWidth="80rem" style={{ color: "red" }}>
          x
        </NavbarContent>
      </Navbar>
    )
    const content = container.querySelector<HTMLElement>("[data-slot=navbar-content]")!
    expect(content.style.maxWidth).toBe("80rem")
    expect(content.style.color).toBe("red")
  })

  it("sin maxWidth, lo de 2.0: sin mx-auto ni style", () => {
    const { container } = render(
      <Navbar>
        <NavbarContent>x</NavbarContent>
      </Navbar>
    )
    const content = container.querySelector<HTMLElement>("[data-slot=navbar-content]")!
    expect(content).not.toHaveClass("mx-auto")
    expect(content).not.toHaveAttribute("style")
  })
})
