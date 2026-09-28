import { act, render, screen, waitFor } from "@testing-library/react"
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

function Example({
  collapsed = false,
  onSearch = () => {},
  variant,
}: {
  collapsed?: boolean
  onSearch?: () => void
  variant?: "floating" | "bar"
}) {
  return (
    <TooltipProvider delay={0}>
      <Sidebar collapsed={collapsed} variant={variant}>
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
  it("flotante por defecto: una píldora de vidrio despegada del borde, con el canto del cromo", () => {
    render(<Example />)
    const aside = screen.getByRole("complementary")
    expect(aside).toHaveAttribute("data-variant", "floating")
    expect(aside).toHaveClass("m-3", "mr-0", "h-[calc(100%-1.5rem)]", "rounded-panel", "border", "shadow-menu", "glass", "glass-thick", "glass-rim")
    expect(aside).not.toHaveClass("border-r")
  })

  it("variant=bar: a ras, w-60, vidrio grueso, borde derecho; colapsado w-16 sin animar el ancho", () => {
    const { rerender } = render(<Example variant="bar" />)
    const aside = screen.getByRole("complementary")
    expect(aside).toHaveAttribute("data-slot", "sidebar")
    expect(aside).toHaveClass("w-60", "data-collapsed:w-16", "glass", "glass-thick", "border-r", "border-gray-alpha-400", "flex-col", "h-full")
    expect(aside).not.toHaveAttribute("data-collapsed")
    expect(aside.className).not.toMatch(/transition(-all|-\[width)|duration/)
    rerender(<Example collapsed variant="bar" />)
    expect(aside).toHaveAttribute("data-collapsed")
    expect(screen.getByText("pie").closest("[data-slot=sidebar-footer]")).toHaveClass("border-t", "border-gray-alpha-400")
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
      "rounded-control",
      "px-2",
      "gap-2",
      "text-copy-14",
      "text-gray-900",
      "hover:bg-gray-alpha-100",
      "hover:text-gray-1000",
      "data-active:bg-highlight",
      "aria-[current=page]:bg-highlight",
      "focus-visible:focus-ring"
    )
    // El brand va en el fondo y en el ícono del activo. En el texto no: `brand-900` sobre el
    // tinte da 4,35:1 con el blue del paquete.
    expect(clients).toHaveClass("data-active:[&_svg]:text-brand-900")
    expect(clients.className).not.toMatch(/(^|\s)(data-active:|aria-\[current=page\]:)?text-brand/)
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

  // 1.13.1: el Tooltip se carga recién al colapsar. Estos tres cubren que se sigue viendo igual
  // que antes —con mouse, en el buscador— y que expandido ni siquiera se pide el módulo.
  it("colapsado: el tooltip también aparece con el mouse", async () => {
    render(<Example collapsed />)
    await userEvent.hover(screen.getByRole("link", { name: /Clientes/ }))
    expect(await screen.findByText("Clientes", { selector: "[data-slot=tooltip-content]" })).toBeInTheDocument()
  })

  it("colapsado: el buscador muestra su tooltip al enfocarlo", async () => {
    render(
      <TooltipProvider delay={0}>
        <Sidebar collapsed>
          <SidebarSearch placeholder="Buscar clientes" />
        </Sidebar>
      </TooltipProvider>
    )
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Buscar clientes" })).toHaveFocus()
    expect(await screen.findByText("Buscar clientes", { selector: "[data-slot=tooltip-content]" })).toBeInTheDocument()
  })

  it("expandido no carga el módulo del Tooltip", async () => {
    vi.resetModules()
    const cargado = vi.fn()
    vi.doMock("../../src/components/tooltip", async (original) => {
      cargado()
      return await original()
    })
    try {
      const fresco = await import("../../src/components/sidebar")
      render(
        <fresco.Sidebar>
          <fresco.SidebarItem href="/a" icon={<HomeIcon />}>
            A
          </fresco.SidebarItem>
        </fresco.Sidebar>
      )
      await new Promise((resolver) => setTimeout(resolver, 50))
      expect(screen.getByRole("link", { name: "A" })).toBeInTheDocument()
      expect(cargado).not.toHaveBeenCalled()
    } finally {
      vi.doUnmock("../../src/components/tooltip")
    }
  })

  it("colapsar con el foco en un ítem: cuando llega el Tooltip, el foco sigue en el ítem", async () => {
    // Módulos de cero: el Tooltip todavía no está en memoria, como en la primera carga.
    vi.resetModules()
    const fresco = await import("../../src/components/sidebar")
    const { TooltipProvider: Proveedor } = await import("../../src/components/tooltip")
    const Lateral = ({ collapsed }: { collapsed: boolean }) => (
      <Proveedor delay={0}>
        <fresco.Sidebar collapsed={collapsed}>
          <fresco.SidebarItem href="/a" icon={<HomeIcon />}>
            Inicio
          </fresco.SidebarItem>
        </fresco.Sidebar>
      </Proveedor>
    )
    const { rerender } = render(<Lateral collapsed={false} />)
    act(() => screen.getByRole("link", { name: "Inicio" }).focus())
    rerender(<Lateral collapsed />)
    await waitFor(() => expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("data-base-ui-tooltip-trigger"))
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveFocus()

    // Ya cargado, expandir y colapsar no vuelve a montar el ítem: mismo nodo, mismo foco.
    const item = screen.getByRole("link", { name: "Inicio" })
    rerender(<Lateral collapsed={false} />)
    expect(screen.getByRole("link", { name: "Inicio" })).toBe(item)
    rerender(<Lateral collapsed />)
    expect(screen.getByRole("link", { name: "Inicio" })).toBe(item)
    expect(item).toHaveFocus()
  })

  it("SidebarSearch: botón con look de Input, ⌘K y onClick", async () => {
    const onSearch = vi.fn()
    render(<Example onSearch={onSearch} />)
    const search = screen.getByRole("button", { name: "Buscar…" })
    expect(search).toHaveClass("h-8", "border", "border-gray-alpha-400", "glass-control", "rounded-field", "hover:border-gray-alpha-500", "focus-visible:focus-ring")
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
    expect(link).toHaveClass("extra", "h-8", "aria-[current=page]:bg-highlight")
  })

  it("sidebarItemVariants sirve para un Link propio", () => {
    expect(sidebarItemVariants()).toContain("hover:bg-gray-alpha-100")
  })
})
