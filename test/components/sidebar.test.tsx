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
import { hidratar } from "../hidratar"

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
    expect(aside).toHaveClass("m-3", "mr-0", "h-[calc(100%-1.5rem)]", "rounded-panel", "border", "shadow-menu", "material-bar", "glass-thick", "glass-rim")
    expect(aside).not.toHaveClass("border-r")
  })

  it("variant=bar: a ras, w-60, vidrio grueso, borde derecho; colapsado w-16 sin animar el ancho", () => {
    const { rerender } = render(<Example variant="bar" />)
    const aside = screen.getByRole("complementary")
    expect(aside).toHaveAttribute("data-slot", "sidebar")
    expect(aside).toHaveClass("w-60", "data-collapsed:w-16", "material-bar", "glass-thick", "border-r", "border-gray-alpha-400", "flex-col", "h-full")
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
      "h-7",
      "rounded-control",
      "px-2",
      "gap-2",
      "text-subheadline",
      "text-gray-900",
      "hover:bg-gray-alpha-100",
      "hover:text-gray-1000",
      "data-active:bg-selection",
      "aria-[current=page]:bg-selection",
      "focus-visible:focus-ring"
    )
    // 2.0: el activo es la selección de macOS. Acento sólido, y texto e ícono en el color de
    // contraste; nada de `brand-*` en el texto.
    expect(clients).toHaveClass("data-active:text-on-selection", "data-active:[&_svg]:text-on-selection", "aria-[current=page]:text-on-selection")
    expect(clients.className).not.toMatch(/(^|\s)(data-active:|aria-\[current=page\]:)?text-brand/)
    expect(screen.getByText("3")).toHaveClass("ml-auto", "text-callout", "tabular-nums", "text-gray-900")
    // Adentro del activo, el contador también pasa al color de contraste.
    expect(screen.getByText("3")).toHaveClass("group-data-active/sidebar-item:text-on-selection", "group-aria-[current=page]/sidebar-item:text-on-selection")
  })

  it("label de grupo en callout gris sin uppercase; se oculta colapsado y nombra al grupo", () => {
    render(<Example />)
    const label = screen.getByText("Operación")
    expect(label).toHaveClass("text-callout", "font-semibold", "text-gray-900", "group-data-collapsed/sidebar:hidden")
    expect(label.className).not.toMatch(/uppercase/)
    expect(screen.getByRole("group", { name: "Operación" })).toBeInTheDocument()
  })

  it("colapsado: solo ícono, el label sigue siendo el nombre accesible y aparece en un tooltip", async () => {
    render(<Example collapsed />)
    const home = screen.getByRole("link", { name: "Inicio" })
    expect(screen.getByText("Inicio")).toHaveClass("group-data-collapsed/sidebar:sr-only")
    // Colapsado, el buscador es un ícono más de la columna: el cuadrado de 28 de los ítems.
    expect(screen.getByRole("button", { name: "Buscar…" })).toHaveClass("group-data-collapsed/sidebar:h-7", "group-data-collapsed/sidebar:w-7")
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

  it("hidratar colapsado con el Tooltip ya en memoria no da mismatch", async () => {
    const { renderToString } = await import("react-dom/server")
    // El cliente ya tiene el Tooltip: otro Sidebar colapsado lo cargó.
    const { unmount } = render(<Example collapsed />)
    await waitFor(() => expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("data-base-ui-tooltip-trigger"))
    unmount()

    // El servidor es otro proceso, que nunca lo cargó: una copia fresca de los módulos.
    vi.resetModules()
    const servidor = await import("../../src/components/sidebar")
    const arbol = (m: { Sidebar: typeof Sidebar; SidebarItem: typeof SidebarItem }) => (
      <TooltipProvider delay={0}>
        <m.Sidebar collapsed>
          <m.SidebarItem href="/a" icon={<HomeIcon />}>
            Inicio
          </m.SidebarItem>
        </m.Sidebar>
      </TooltipProvider>
    )
    const container = document.createElement("div")
    container.innerHTML = renderToString(arbol(servidor))
    document.body.append(container)
    const recoverable = vi.fn()
    const errores = vi.spyOn(console, "error").mockImplementation(() => {})
    await hidratar(container, arbol({ Sidebar, SidebarItem }), { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errores.mock.calls.filter(([m]) => /hydrat|did not match/i.test(String(m)))).toEqual([])
    errores.mockRestore()
    container.remove()
  })

  it("SidebarSearch: botón con look de Input, ⌘K y onClick", async () => {
    const onSearch = vi.fn()
    render(<Example onSearch={onSearch} />)
    const search = screen.getByRole("button", { name: "Buscar…" })
    // 32 px, el alto de un campo `md`: a 28 el atajo de 20 tocaba los bordes. Con el dedo, 44.
    expect(search).toHaveClass("h-8", "px-3", "pointer-coarse:h-11", "border", "border-gray-alpha-400", "glass-control", "rounded-field", "hover:border-gray-alpha-500", "focus-visible:focus-ring")
    expect(search).toHaveAttribute("aria-keyshortcuts", "Meta+K")
    expect(search.querySelector("kbd")).toHaveTextContent("⌘K")
    // El atajo chico (18 px) deja 7 px de aire arriba y abajo adentro de los 32.
    expect(search.querySelector("kbd")).toHaveAttribute("data-size", "sm")
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
    expect(link).toHaveClass("extra", "h-7", "aria-[current=page]:bg-selection")
  })

  it("sidebarItemVariants sirve para un Link propio", () => {
    expect(sidebarItemVariants()).toContain("hover:bg-gray-alpha-100")
  })
})
