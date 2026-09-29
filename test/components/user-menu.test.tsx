import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LogOutIcon, SettingsIcon } from "lucide-react"
import { ThemeProvider } from "next-themes"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { DropdownMenuItem } from "../../src/components/dropdown-menu"
import { Sidebar, SidebarFooter } from "../../src/components/sidebar"
import { TooltipProvider } from "../../src/components/tooltip"
import { UserMenu } from "../../src/components/user-menu"

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
})

const user = { name: "Ana Pérez", email: "ana@example.com" }

function Example({ collapsed = false, onSignOut = () => {} }: { collapsed?: boolean; onSignOut?: () => void }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey={`u-${Math.random()}`}>
      <TooltipProvider delay={0}>
        <Sidebar collapsed={collapsed}>
          <SidebarFooter>
            <UserMenu
              user={user}
              signOut={
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOutIcon />
                  Cerrar sesión
                </DropdownMenuItem>
              }
            >
              <DropdownMenuItem>
                <SettingsIcon />
                Ajustes de cuenta
              </DropdownMenuItem>
            </UserMenu>
          </SidebarFooter>
        </Sidebar>
      </TooltipProvider>
    </ThemeProvider>
  )
}

describe("UserMenu", () => {
  it("fila de usuario: avatar con iniciales grises, nombre y email truncados", () => {
    render(<Example />)
    const trigger = screen.getByRole("button", { name: /Ana Pérez/ })
    expect(screen.getByText("AP")).toHaveClass("bg-fill-2", "text-label-secondary")
    expect(screen.getByText("Ana Pérez", { selector: "[data-slot=user-menu-name]" })).toHaveClass("text-callout", "text-label", "truncate")
    expect(screen.getByText("ana@example.com", { selector: "[data-slot=user-menu-email]" })).toHaveClass("text-callout", "text-label-secondary", "truncate")
    expect(trigger).toHaveClass("hover:bg-fill-1", "focus-visible:focus-ring", "data-popup-open:bg-fill-2")
  })

  it("abre hacia arriba con cabecera no interactiva, ítems de la app, tema y salir neutral", async () => {
    const onSignOut = vi.fn()
    render(<Example onSignOut={onSignOut} />)
    await userEvent.click(screen.getByRole("button", { name: /Ana Pérez/ }))
    const menu = await screen.findByRole("menu")
    expect(menu).toHaveAttribute("data-side", "top")
    expect(menu).toHaveClass("w-(--anchor-width)")
    const header = menu.querySelector("[data-slot=user-menu-header]")!
    expect(header).toHaveTextContent("Ana Pérez")
    expect(header).toHaveTextContent("ana@example.com")
    expect(header).not.toHaveAttribute("role", "menuitem")
    expect(screen.getByRole("menuitem", { name: "Ajustes de cuenta" })).toBeInTheDocument()
    // El tema no cierra el menú.
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Tema oscuro" }))
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
    expect(screen.getByRole("menu")).toBeInTheDocument()
    const signOut = screen.getByRole("menuitem", { name: "Cerrar sesión" })
    expect(signOut).toHaveAttribute("data-variant", "default")
    expect(signOut.className).not.toMatch(/(^|\s)(text|bg)-red/)
    await userEvent.click(signOut)
    expect(onSignOut).toHaveBeenCalled()
  })

  it("solo teclado: ArrowDown llega a las opciones de tema, elegir cambia el tema y el menú sigue abierto", async () => {
    render(<Example />)
    await userEvent.tab()
    expect(screen.getByRole("button", { name: /Ana Pérez/ })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    const menu = await screen.findByRole("menu")
    // Nada de radiogroup suelto dentro de role="menu": son menuitemradio de Base UI.
    expect(within(menu).queryByRole("radiogroup")).toBeNull()
    const dark = within(menu).getByRole("menuitemradio", { name: "Tema oscuro" })
    expect(within(menu).getAllByRole("menuitemradio")).toHaveLength(3)
    for (let i = 0; i < 8 && document.activeElement !== dark; i++) await userEvent.keyboard("{ArrowDown}")
    expect(dark).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
    expect(dark).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("menu")).toBeInTheDocument()
    expect(dark).toHaveClass("h-6", "w-8", "rounded-[calc(var(--radius-control)-2px)]", "data-checked:text-label", "focus-visible:focus-ring")
  })

  it("colapsado: solo el avatar, con tooltip \"Nombre · email\"", async () => {
    render(<Example collapsed />)
    expect(screen.queryByText("ana@example.com")).toBeNull()
    await userEvent.tab()
    expect(await screen.findByText("Ana Pérez · ana@example.com", { selector: "[data-slot=tooltip-content]" })).toBeInTheDocument()
    // Buscado de nuevo: al llegar el Tooltip (1.13.1) el trigger es otro nodo, y el foco lo sigue.
    expect(screen.getByRole("button", { name: "Ana Pérez · ana@example.com" })).toHaveFocus()
  })

  it("colapsar con el foco en el trigger: cuando llega el Tooltip, el foco sigue ahí", async () => {
    // Módulos de cero: el Tooltip todavía no está en memoria, como en la primera carga.
    vi.resetModules()
    const { UserMenu: Menu } = await import("../../src/components/user-menu")
    const { Sidebar: Lateral, SidebarFooter: Pie } = await import("../../src/components/sidebar")
    const { TooltipProvider: Proveedor } = await import("../../src/components/tooltip")
    const Arbol = ({ collapsed }: { collapsed: boolean }) => (
      <Proveedor delay={0}>
        <Lateral collapsed={collapsed}>
          <Pie>
            <Menu user={user} showTheme={false} />
          </Pie>
        </Lateral>
      </Proveedor>
    )
    const trigger = () => document.querySelector<HTMLElement>("[data-slot=user-menu-trigger]")!
    const { rerender } = render(<Arbol collapsed={false} />)
    act(() => trigger().focus())
    rerender(<Arbol collapsed />)
    await waitFor(() => expect(trigger()).toHaveAttribute("data-base-ui-tooltip-trigger"))
    expect(trigger()).toHaveFocus()
  })

  describe("separadores solo entre grupos no vacíos", () => {
    // Orden en el DOM de cabecera, separadores, ítems de la app, fila de tema y salida.
    const layout = (menu: HTMLElement) =>
      [...menu.querySelectorAll("[data-slot=user-menu-header], [data-slot=dropdown-menu-separator], [data-slot=user-menu-theme], [role=menuitem]")].map(
        (el) =>
          el.matches("[data-slot=user-menu-header]")
            ? "header"
            : el.matches("[data-slot=dropdown-menu-separator]")
              ? "sep"
              : el.matches("[data-slot=user-menu-theme]")
                ? "theme"
                : el.textContent === "Cerrar sesión"
                  ? "signOut"
                  : "item"
      )

    const cases = [true, false].flatMap((showTheme) =>
      [true, false].flatMap((withChildren) => [true, false].map((withSignOut) => ({ showTheme, withChildren, withSignOut })))
    )

    it.each(cases)("showTheme=$showTheme children=$withChildren signOut=$withSignOut", async ({ showTheme, withChildren, withSignOut }) => {
      render(
        <ThemeProvider attribute="class" storageKey={`u-${Math.random()}`}>
          <UserMenu user={user} showTheme={showTheme} signOut={withSignOut ? <DropdownMenuItem>Cerrar sesión</DropdownMenuItem> : undefined}>
            {withChildren ? <DropdownMenuItem>Ajustes de cuenta</DropdownMenuItem> : null}
          </UserMenu>
        </ThemeProvider>
      )
      await userEvent.click(screen.getByRole("button", { name: /Ana Pérez/ }))
      const groups = ["header", withChildren && "item", showTheme && "theme", withSignOut && "signOut"].filter(Boolean)
      const expected = groups.flatMap((group, i) => (i === 0 ? [group] : ["sep", group]))
      expect(layout(await screen.findByRole("menu"))).toEqual(expected)
    })

    it("children vacíos (false, [] o null) no cuentan como grupo", async () => {
      render(
        <ThemeProvider attribute="class" storageKey={`u-${Math.random()}`}>
          <UserMenu user={user} showTheme={false} signOut={<DropdownMenuItem>Cerrar sesión</DropdownMenuItem>}>
            {false}
            {[]}
            {null}
          </UserMenu>
        </ThemeProvider>
      )
      await userEvent.click(screen.getByRole("button", { name: /Ana Pérez/ }))
      expect(layout(await screen.findByRole("menu"))).toEqual(["header", "sep", "signOut"])
    })
  })
})
