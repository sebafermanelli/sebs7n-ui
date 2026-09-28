import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HomeIcon } from "lucide-react"
import { ThemeProvider } from "next-themes"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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
    // Flotante por defecto: el Navbar del paquete, con la fila de 56px adentro.
    const bar = document.querySelector("[data-slot=app-shell-mobile-bar]")!
    expect(bar).toHaveClass("lg:hidden", "pt-3")
    expect(bar).toHaveAttribute("data-variant", "floating")
    expect(bar.querySelector(".h-14")).not.toBeNull()
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

// 1.13.1: el Sheet se pide recién al usar la hamburguesa. Cada test carga el AppShell de cero
// (`resetModules`) para arrancar sin el Sheet en memoria, que es lo que pasa en la primera
// visita; los de arriba ya lo encuentran cargado.
describe("AppShell: el Sheet se carga al usarlo", () => {
  async function fresco() {
    vi.resetModules()
    const cargado = vi.fn()
    vi.doMock("../../src/components/sheet", async (original) => {
      cargado()
      return await original()
    })
    const { AppShell: Shell } = await import("../../src/components/app-shell")
    const { Sidebar: Lateral, SidebarContent: Contenido, SidebarItem: Item } = await import("../../src/components/sidebar")
    render(
      <Shell
        mobileBar={<span>Acme</span>}
        sidebar={
          <Lateral>
            <Contenido>
              <Item href="#facturas">Facturas</Item>
            </Contenido>
          </Lateral>
        }
      >
        <p>contenido</p>
      </Shell>
    )
    return cargado
  }

  afterEach(() => {
    vi.doUnmock("../../src/components/sheet")
  })

  it("no lo pide al montar, y la hamburguesa se anuncia igual que el trigger del Sheet", async () => {
    const cargado = await fresco()
    await new Promise((resolver) => setTimeout(resolver, 50))
    expect(cargado).not.toHaveBeenCalled()
    const hamburguesa = screen.getByRole("button", { name: "Abrir menú" })
    expect(hamburguesa).toHaveAttribute("aria-haspopup", "dialog")
    expect(hamburguesa).toHaveAttribute("aria-expanded", "false")
    expect(hamburguesa).toHaveAttribute("data-slot", "sheet-trigger")
  })

  it("el primer toque abre el Sheet: no se pierde mientras llega", async () => {
    const cargado = await fresco()
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    const sheet = await screen.findByRole("dialog")
    expect(cargado).toHaveBeenCalled()
    expect(within(sheet).getByRole("link", { name: "Facturas" })).toBeInTheDocument()
  })

  it("la primera apertura también se desliza: el popup pasa por data-starting-style", async () => {
    await fresco()
    // `data-starting-style` vive un frame: se registra cada vez que aparece en un dialog.
    let deslizo = false
    const observer = new MutationObserver((cambios) => {
      for (const cambio of cambios) {
        const nodos = cambio.type === "childList" ? [...cambio.addedNodes] : [cambio.target]
        for (const nodo of nodos) {
          if (!(nodo instanceof HTMLElement)) continue
          const popups = [nodo, ...nodo.querySelectorAll<HTMLElement>("[role=dialog]")]
          if (popups.some((el) => el.getAttribute("role") === "dialog" && el.hasAttribute("data-starting-style"))) deslizo = true
        }
      }
    })
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-starting-style"] })
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    await screen.findByRole("dialog")
    await waitFor(() => expect(deslizo).toBe(true))
    observer.disconnect()
  })

  it("tocada, la hamburguesa provisoria anuncia aria-expanded mientras llega el Sheet", async () => {
    await fresco()
    const hamburguesa = screen.getByRole("button", { name: "Abrir menú" })
    fireEvent.click(hamburguesa)
    expect(hamburguesa).toHaveAttribute("aria-expanded", "true")
    await screen.findByRole("dialog")
  })

  it("con teclado: enfocarla no la cambia de nodo, Enter abre y Escape devuelve el foco", async () => {
    const cargado = await fresco()
    act(() => screen.getByRole("button", { name: "Abrir menú" }).focus())
    await new Promise((resolver) => setTimeout(resolver, 50))
    expect(cargado).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveFocus())
  })
})

// Con el Sheet ya en memoria (otro AppShell lo cargó), un AppShell que hidrata después tiene que
// arrancar igual que el HTML del servidor, que nunca lo tiene.
describe("AppShell: hidratar con el Sheet ya cargado", () => {
  it("no hay mismatch y el Sheet se toma después de hidratar", async () => {
    const { renderToString } = await import("react-dom/server")
    const { hydrateRoot } = await import("react-dom/client")
    // Carga el Sheet en el módulo del cliente con un primer shell.
    const { unmount } = render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    await screen.findByRole("dialog")
    unmount()

    // El servidor es otro proceso, que nunca cargó el Sheet: una copia fresca del módulo.
    vi.resetModules()
    const { AppShell: ShellDelServidor } = await import("../../src/components/app-shell")
    const arbol = (Shell: typeof AppShell) => (
      <Shell mobileBar={<span>Acme</span>} sidebar={<nav>menú</nav>}>
        <p>contenido</p>
      </Shell>
    )
    const container = document.createElement("div")
    container.innerHTML = renderToString(arbol(ShellDelServidor))
    document.body.append(container)
    const recoverable = vi.fn()
    const errores = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(container, arbol(AppShell), { onRecoverableError: recoverable })
    })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errores.mock.calls.filter(([m]) => /hydrat|did not match/i.test(String(m)))).toEqual([])
    errores.mockRestore()
    // Ya hidratado, la hamburguesa pasa a ser el trigger de Base UI.
    await waitFor(() =>
      expect(within(container).getByRole("button", { name: "Abrir menú" })).toHaveAttribute("data-base-ui-click-trigger")
    )
    container.remove()
  })
})
