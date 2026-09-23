import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "../../src/components/breadcrumb"
import { linkVariants } from "../../src/variants/link"

function Migas({ ...props }: React.ComponentProps<typeof BreadcrumbList>) {
  return (
    <Breadcrumb>
      <BreadcrumbList {...props}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/clientes">Clientes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/clientes/acme">Acme S.A.</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/clientes/acme/facturas">Facturas</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>0012</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

describe("Breadcrumb", () => {
  it("es un <nav> con nombre y adentro un <ol>", () => {
    render(<Migas />)
    const nav = screen.getByRole("navigation", { name: "Migas de pan" })
    expect(nav.tagName).toBe("NAV")
    expect(within(nav).getByRole("list").tagName).toBe("OL")
  })

  it("el último ítem no es link y lleva aria-current=page", () => {
    render(<Migas />)
    expect(screen.queryByRole("link", { name: "0012" })).toBeNull()
    const actual = screen.getByText("0012")
    expect(actual).toHaveAttribute("aria-current", "page")
    expect(actual.tagName).toBe("SPAN")
  })

  it("los links usan linkVariants subtle, no un estilo propio", () => {
    render(<Migas />)
    const link = screen.getByRole("link", { name: "Clientes" })
    for (const clase of linkVariants({ variant: "subtle" }).split(/\s+/)) {
      expect(link, clase).toHaveClass(clase)
    }
  })

  it("los separadores los pone la lista y son decorativos", () => {
    const { container } = render(<Migas />)
    const separadores = container.querySelectorAll("[data-slot=breadcrumb-separator]")
    // Cinco ítems, cuatro separadores.
    expect(separadores).toHaveLength(4)
    for (const separador of separadores) {
      expect(separador).toHaveAttribute("aria-hidden", "true")
      expect(separador).toHaveAttribute("role", "presentation")
    }
    // La lista accesible sigue teniendo cinco ítems: los separadores no cuentan.
    expect(screen.getAllByRole("listitem")).toHaveLength(5)
  })

  it("maxItems colapsa el medio y deja el primero y los dos últimos", () => {
    const { container } = render(<Migas maxItems={4} />)
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Clientes" })).toBeNull()
    expect(screen.queryByRole("link", { name: "Acme S.A." })).toBeNull()
    expect(screen.getByRole("link", { name: "Facturas" })).toBeInTheDocument()
    expect(screen.getByText("0012")).toHaveAttribute("aria-current", "page")
    const ellipsis = container.querySelector("[data-slot=breadcrumb-ellipsis]")!
    expect(ellipsis.querySelector("[aria-hidden=true]")).toHaveTextContent("…")
    expect(within(ellipsis as HTMLElement).getByText("Rutas intermedias")).toHaveClass("sr-only")
  })

  it("no colapsa si el «…» taparía un solo ítem ni si hay pocos niveles", () => {
    const { container, rerender } = render(<Migas maxItems={5} />)
    expect(container.querySelector("[data-slot=breadcrumb-ellipsis]")).toBeNull()
    rerender(<Migas itemsAfter={3} maxItems={4} />)
    expect(container.querySelector("[data-slot=breadcrumb-ellipsis]")).toBeNull()
  })

  it("render={<a/>} mantiene el <a> y fusiona el className del llamador", async () => {
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault())
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="max-w-32" render={<a className="text-copy-13" href="/clientes" onClick={onClick} />}>
              Clientes
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    const link = screen.getByRole("link", { name: "Clientes" })
    expect(link.tagName).toBe("A")
    expect(link).toHaveAttribute("href", "/clientes")
    expect(link).toHaveClass("max-w-32", "text-copy-13", "hover:underline")
    await userEvent.click(link)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("se recorre con Tab y el ítem actual no entra al orden de tabulación", async () => {
    render(<Migas maxItems={4} />)
    await userEvent.tab()
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole("link", { name: "Facturas" })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByText("0012")).not.toHaveFocus()
  })
})
