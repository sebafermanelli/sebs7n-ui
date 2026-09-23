import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HomeIcon, UsersIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarItemBadge,
  SidebarSearch,
} from "../../src/components/sidebar"
import { TooltipProvider } from "../../src/components/tooltip"
import { sidebarItemVariants } from "../../src/variants/sidebar"

function Example({ collapsed = false, onSearch = () => {} }: { collapsed?: boolean; onSearch?: () => void }) {
  return (
    <TooltipProvider delay={0}>
      <Sidebar collapsed={collapsed}>
        <SidebarHeader>
          <SidebarSearch onClick={onSearch} shortcut="⌘K" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Operación</SidebarGroupLabel>
            <SidebarItem href="/admin" icon={<HomeIcon />} active>
              Inicio
            </SidebarItem>
            <SidebarItem href="/admin/clientes" icon={<UsersIcon />}>
              Clientes
              <SidebarItemBadge>3</SidebarItemBadge>
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>pie</SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}

describe("Sidebar", () => {
  it("aside a ras: w-60, background-200, borde derecho; colapsado w-16 sin animar el ancho", () => {
    const { rerender } = render(<Example />)
    const aside = screen.getByRole("complementary")
    expect(aside).toHaveAttribute("data-slot", "sidebar")
    expect(aside).toHaveClass("w-60", "data-collapsed:w-16", "bg-background-200", "border-r", "border-gray-400", "flex-col", "h-full")
    expect(aside).not.toHaveAttribute("data-collapsed")
    expect(aside.className).not.toMatch(/transition(-all|-\[width)|duration/)
    rerender(<Example collapsed />)
    expect(aside).toHaveAttribute("data-collapsed")
    expect(screen.getByText("pie").closest("[data-slot=sidebar-footer]")).toHaveClass("border-t", "border-gray-400")
  })

  it("items: links con el activo marcado por aria-current y data-active, y badge tabular", () => {
    render(<Example />)
    const home = screen.getByRole("link", { name: "Inicio" })
    expect(home).toHaveAttribute("href", "/admin")
    expect(home).toHaveAttribute("aria-current", "page")
    expect(home).toHaveAttribute("data-active")
    const clients = screen.getByRole("link", { name: /Clientes/ })
    expect(clients).not.toHaveAttribute("aria-current")
    expect(clients).toHaveClass(
      "h-8",
      "rounded-md",
      "px-2",
      "gap-2",
      "text-copy-14",
      "text-gray-900",
      "hover:bg-gray-alpha-100",
      "hover:text-gray-1000",
      "data-active:bg-gray-alpha-200",
      "aria-[current=page]:bg-gray-alpha-200",
      "focus-visible:focus-ring"
    )
    expect(clients.className).not.toMatch(/brand/)
    expect(screen.getByText("3")).toHaveClass("ml-auto", "text-label-12", "tabular-nums", "text-gray-900")
  })

  it("label de grupo label-12 gris sin uppercase; se oculta colapsado y nombra al grupo", () => {
    render(<Example />)
    const label = screen.getByText("Operación")
    expect(label).toHaveClass("text-label-12", "text-gray-900", "group-data-collapsed/sidebar:hidden")
    expect(label.className).not.toMatch(/uppercase/)
    expect(screen.getByRole("group", { name: "Operación" })).toBeInTheDocument()
  })

  it("colapsado: solo ícono, el label sigue siendo el nombre accesible y aparece en un tooltip", async () => {
    render(<Example collapsed />)
    const home = screen.getByRole("link", { name: "Inicio" })
    expect(screen.getByText("Inicio")).toHaveClass("group-data-collapsed/sidebar:sr-only")
    await userEvent.tab() // búsqueda
    await userEvent.tab()
    expect(home).toHaveFocus()
    const tip = await screen.findByText("Inicio", { selector: "[data-slot=tooltip-content]" })
    expect(tip).toBeInTheDocument()
  })

  it("SidebarSearch: botón con look de Input, ⌘K y onClick", async () => {
    const onSearch = vi.fn()
    render(<Example onSearch={onSearch} />)
    const search = screen.getByRole("button", { name: "Buscar…" })
    expect(search).toHaveClass("h-8", "border", "border-gray-400", "bg-background-100", "rounded-md", "hover:border-gray-500", "focus-visible:focus-ring")
    expect(search).toHaveAttribute("aria-keyshortcuts", "Meta+K")
    expect(search.querySelector("kbd")).toHaveTextContent("⌘K")
    await userEvent.click(search)
    expect(onSearch).toHaveBeenCalledOnce()
  })

  it("el badge se separa del label aunque venga dentro de un fragment", () => {
    render(
      <Sidebar>
        <SidebarItem href="/x">
          <>
            Reseñas
            <SidebarItemBadge>2</SidebarItemBadge>
          </>
        </SidebarItem>
      </Sidebar>
    )
    const label = screen.getByText("Reseñas")
    expect(label).toHaveAttribute("data-slot", "sidebar-item-label")
    expect(label).not.toContainElement(screen.getByText("2"))
  })

  it("aria-labelledby solo si hay SidebarGroupLabel, y respeta un id propio", () => {
    render(
      <Sidebar>
        <SidebarGroup data-testid="sin-label">
          <SidebarItem href="/a">A</SidebarItem>
        </SidebarGroup>
        <SidebarGroup data-testid="con-id">
          <SidebarGroupLabel id="grupo-tienda">Tienda</SidebarGroupLabel>
        </SidebarGroup>
      </Sidebar>
    )
    expect(screen.getByTestId("sin-label")).not.toHaveAttribute("aria-labelledby")
    expect(screen.getByTestId("con-id")).toHaveAttribute("aria-labelledby", "grupo-tienda")
    expect(screen.getByRole("group", { name: "Tienda" })).toBeInTheDocument()
  })

  it("el badge no se pega al label en el nombre accesible y acepta un label con contexto", () => {
    render(
      <Sidebar>
        <SidebarItem href="/c">
          Clientes
          <SidebarItemBadge>3</SidebarItemBadge>
        </SidebarItem>
        <SidebarItem href="/r">
          Reseñas
          <SidebarItemBadge label="2 sin responder">2</SidebarItemBadge>
        </SidebarItem>
      </Sidebar>
    )
    expect(screen.getByRole("link", { name: "Clientes, 3" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Reseñas, 2 sin responder" })).toBeInTheDocument()
  })

  it("colapsado: punto visual solo para badges distintos de cero", () => {
    render(
      <Sidebar collapsed>
        <SidebarItem href="/c" tooltip="Clientes">
          Clientes
          <SidebarItemBadge>3</SidebarItemBadge>
        </SidebarItem>
        <SidebarItem href="/r" tooltip="Reseñas">
          Reseñas
          <SidebarItemBadge>0</SidebarItemBadge>
        </SidebarItem>
      </Sidebar>
    )
    const dots = document.querySelectorAll("[data-slot=sidebar-item-dot]")
    expect(dots).toHaveLength(1)
    expect(dots[0]).toHaveAttribute("aria-hidden", "true")
    expect(dots[0]).toHaveClass("hidden", "group-data-collapsed/sidebar:block")
    expect(screen.getByRole("link", { name: "Clientes, 3" })).toContainElement(dots[0] as HTMLElement)
  })

  it("SidebarSearch sin shortcut no anuncia atajo ni muestra Kbd", () => {
    render(
      <Sidebar>
        <SidebarSearch />
      </Sidebar>
    )
    const search = screen.getByRole("button", { name: "Buscar…" })
    expect(search).not.toHaveAttribute("aria-keyshortcuts")
    expect(search.querySelector("kbd")).toBeNull()
  })

  it("con render={<a />} (o un Link) mantiene aria-current, data-active, href y clases", () => {
    render(
      <Sidebar>
        <SidebarItem render={<a href="/admin/viajes" />} active className="extra">
          Viajes
        </SidebarItem>
      </Sidebar>
    )
    const link = screen.getByRole("link", { name: "Viajes" })
    expect(link).toHaveAttribute("href", "/admin/viajes")
    expect(link).toHaveAttribute("aria-current", "page")
    expect(link).toHaveAttribute("data-active")
    expect(link).toHaveClass("extra", "h-8", "aria-[current=page]:bg-gray-alpha-200")
  })

  it("sidebarItemVariants sirve para un Link propio", () => {
    expect(sidebarItemVariants()).toContain("hover:bg-gray-alpha-100")
  })
})
