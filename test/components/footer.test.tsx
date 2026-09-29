import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render, screen, within } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Footer, FooterBottom, FooterContent, FooterGroup } from "../../src/components/footer"

function Site() {
  return (
    <Footer>
      <FooterContent maxWidth={1200}>
        <div className="grid grid-cols-2 gap-6">
          <FooterGroup title="Producto">
            <a href="/facturas">Facturas</a>
            <a href="/precios">Precios</a>
          </FooterGroup>
        </div>
        <FooterBottom>© 2026 Acme S.A.</FooterBottom>
      </FooterContent>
    </Footer>
  )
}

describe("Footer", () => {
  it("es un <footer> a todo el ancho con la línea de arriba, opaco como la barra global y translúcido sobre el wallpaper", () => {
    render(<Site />)
    const footer = screen.getByRole("contentinfo")
    expect(footer.tagName).toBe("FOOTER")
    expect(footer).toHaveAttribute("data-slot", "footer")
    expect(footer).toHaveClass("w-full", "border-t", "border-separator-strong", "bg-surface-header", "in-data-ambient:material-translucent", "text-label")
  })

  it("FooterContent: 16 de cada lado y, con maxWidth, centrado en la columna del sitio", () => {
    render(<Site />)
    const content = document.querySelector<HTMLElement>("[data-slot=footer-content]")!
    expect(content).toHaveClass("w-full", "px-4", "mx-auto")
    expect(content.style.maxWidth).toBe("1200px")
  })

  it("FooterGroup: un título y una lista de links, cada hijo en su <li>, con los tonos del paquete", () => {
    render(<Site />)
    const group = document.querySelector<HTMLElement>("[data-slot=footer-group]")!
    const title = within(group).getByRole("heading", { name: "Producto" })
    expect(title).toHaveClass("text-callout", "text-label")
    const list = within(group).getByRole("list", { name: "Producto" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
    expect(list).toHaveClass("text-callout", "[&_a]:text-label-secondary", "[&_a:hover]:text-label")
  })

  it("FooterBottom: la línea y la fila chica de abajo", () => {
    render(<Site />)
    expect(document.querySelector("[data-slot=footer-bottom]")).toHaveClass("border-t", "border-separator", "text-callout", "text-label-secondary")
  })

  it("es Server Component: el archivo no lleva \"use client\" y renderiza en el servidor", () => {
    const source = readFileSync(join(import.meta.dirname, "../../src/components/footer.tsx"), "utf8")
    expect(source).not.toMatch(/^\s*["']use client["']/m)
    expect(renderToString(<Site />)).toContain("<footer")
  })
})

describe("FooterGroup headingLevel", () => {
  it("por defecto h2; headingLevel lo cambia para encajar en el esquema de la página", () => {
    render(
      <Footer>
        <FooterContent>
          <FooterGroup title="Producto">
            <a href="/precios">Precios</a>
          </FooterGroup>
          <FooterGroup headingLevel={3} title="Empresa">
            <a href="/equipo">Equipo</a>
          </FooterGroup>
        </FooterContent>
      </Footer>
    )
    expect(screen.getByRole("heading", { name: "Producto" }).tagName).toBe("H2")
    expect(screen.getByRole("heading", { name: "Empresa" }).tagName).toBe("H3")
    expect(screen.getByRole("list", { name: "Empresa" })).toBeInTheDocument()
  })
})
