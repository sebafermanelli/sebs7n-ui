import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HomeIcon } from "lucide-react"
import { ThemeProvider } from "next-themes"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { AppShell, useAppShell } from "../../src/components/app-shell"
import { DropdownMenuItem } from "../../src/components/dropdown-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarItem } from "../../src/components/sidebar"
import { UserMenu } from "../../src/components/user-menu"

// matchMedia controlable: el test decide cuándo el viewport pasa a ser ≥ lg.
let mediaListeners: Array<(e: { matches: boolean }) => void> = []
const originalMatchMedia = window.matchMedia
beforeEach(() => {
  mediaListeners = []
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => mediaListeners.push(cb),
    removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
      mediaListeners = mediaListeners.filter((l) => l !== cb)
    },
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
})
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

function CloseFromApp() {
  const { closeMobile } = useAppShell()
  return (
    <button type="button" onClick={() => closeMobile()}>
      Cerrar desde la app
    </button>
  )
}

function Example({ pathname }: { pathname?: string }) {
  return (
    <ThemeProvider attribute="class" enableSystem>
    <AppShell
      pathname={pathname}
      mobileBar={<span>Acme</span>}
      sidebar={
        <Sidebar>
          <SidebarContent>
            <SidebarItem href="#facturas" icon={<HomeIcon />}>
              Facturas
            </SidebarItem>
            <CloseFromApp />
          </SidebarContent>
          <SidebarFooter>
            <UserMenu user={{ name: "Ana Pérez", email: "ana@example.com" }}>
              <DropdownMenuItem>Ajustes de cuenta</DropdownMenuItem>
            </UserMenu>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <p>contenido</p>
    </AppShell>
    </ThemeProvider>
  )
}

describe("AppShell", () => {
  it("grilla [sidebar | main]: sidebar sticky a todo el alto solo en desktop, main min-w-0", () => {
    render(<Example />)
    const desktop = document.querySelector("[data-slot=app-shell-sidebar]")!
    expect(desktop).toHaveClass("hidden", "lg:flex", "sticky", "top-0", "h-(--app-shell-height)")
    expect(desktop.querySelector("[data-slot=sidebar]")).not.toBeNull()
    const main = screen.getByRole("main")
    expect(main).toHaveClass("min-w-0")
    expect(main).toHaveTextContent("contenido")
    const shell = document.querySelector("[data-slot=app-shell]")!
    expect(shell).toHaveClass("lg:grid-cols-[auto_minmax(0,1fr)]")
    expect(screen.getByRole("link", { name: "Ir al contenido" })).toHaveAttribute("href", `#${main.id}`)
  })

  it("barra mobile h-14 con hamburguesa que abre el sidebar en un Sheet izquierdo; navegar lo cierra", async () => {
    render(<Example />)
    const bar = document.querySelector("[data-slot=app-shell-mobile-bar]")!
    expect(bar).toHaveClass("h-14", "lg:hidden")
    expect(bar).toHaveTextContent("Acme")
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    const sheet = await screen.findByRole("dialog")
    expect(sheet).toHaveAttribute("data-side", "left")
    const item = within(sheet).getByRole("link", { name: "Facturas" })
    expect(within(sheet).getByRole("complementary")).not.toHaveAttribute("data-collapsed")
    await userEvent.click(item)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("useAppShell().closeMobile() cierra el Sheet", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    const sheet = await screen.findByRole("dialog")
    await userEvent.click(within(sheet).getByRole("button", { name: "Cerrar desde la app" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("cambiar el pathname cierra el Sheet y manda el foco al main", async () => {
    const { rerender } = render(<Example pathname="/a" />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    await screen.findByRole("dialog")
    rerender(<Example pathname="/b" />)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus())
  })

  it("navegar desde un SidebarItem manda el foco al main", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    const sheet = await screen.findByRole("dialog")
    await userEvent.click(within(sheet).getByRole("link", { name: "Facturas" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus())
  })

  it("⌘/Ctrl/click del medio en un SidebarItem no cierra el Sheet", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    const sheet = await screen.findByRole("dialog")
    const item = within(sheet).getByRole("link", { name: "Facturas" })
    fireEvent.click(item, { metaKey: true })
    fireEvent.click(item, { ctrlKey: true })
    fireEvent.click(item, { button: 1 })
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("elegir un ítem del UserMenu dentro del Sheet lo cierra", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    const sheet = await screen.findByRole("dialog")
    await userEvent.click(within(sheet).getByRole("button", { name: /Ana Pérez/ }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Ajustes de cuenta" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(screen.getByRole("main")).toHaveFocus())
  })

  it("si el viewport pasa a ≥ lg, el Sheet se cierra", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    await screen.findByRole("dialog")
    expect(mediaListeners.length).toBeGreaterThan(0)
    act(() => mediaListeners.forEach((l) => l({ matches: true })))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })
})
