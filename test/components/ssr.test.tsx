import { act } from "@testing-library/react"
import { InboxIcon } from "lucide-react"
import { ThemeProvider } from "next-themes"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { AppShell } from "../../src/components/app-shell"
import { DropdownMenuItem } from "../../src/components/dropdown-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarItem } from "../../src/components/sidebar"
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

afterEach(() => {
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

// Lo que arma el shell de dashboard de una app.
function Shell({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <AppShell
          pathname="/clientes"
          sidebar={
            <Sidebar collapsed={collapsed}>
              <SidebarHeader>Acme</SidebarHeader>
              <SidebarContent>
                <SidebarGroup data-testid="operacion">
                  <SidebarGroupLabel>Operación</SidebarGroupLabel>
                  <SidebarItem href="/clientes" active icon={<InboxIcon />}>
                    Clientes
                  </SidebarItem>
                </SidebarGroup>
                <SidebarGroup data-testid="propio">
                  <SidebarGroupLabel id="grupo-tienda">Tienda</SidebarGroupLabel>
                  <SidebarItem href="/tienda">Tienda</SidebarItem>
                </SidebarGroup>
                <SidebarGroup data-testid="sin-label">
                  <SidebarItem href="/ayuda">Ayuda</SidebarItem>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <UserMenu user={{ name: "Ana Pérez", email: "ana@example.com" }} signOut={<DropdownMenuItem>Cerrar sesión</DropdownMenuItem>} />
              </SidebarFooter>
            </Sidebar>
          }
        >
          <p>Contenido</p>
        </AppShell>
      </TooltipProvider>
    </ThemeProvider>
  )
}

function ssr(ui: React.ReactElement) {
  const container = document.createElement("div")
  container.innerHTML = renderToString(ui)
  document.body.append(container)
  return container
}

describe.each([false, true])("SSR del shell (colapsado: %s)", (collapsed) => {
  it("el HTML del server ya trae aria-labelledby apuntando al label", () => {
    const container = ssr(<Shell collapsed={collapsed} />)
    for (const group of container.querySelectorAll<HTMLElement>("[data-testid=operacion], [data-testid=propio]")) {
      const labelId = group.querySelector("[data-slot=sidebar-group-label]")!.id
      expect(labelId).not.toBe("")
      expect(group.getAttribute("aria-labelledby")).toBe(labelId)
    }
    expect(container.querySelector("[data-testid=propio]")).toHaveAttribute("aria-labelledby", "grupo-tienda")
    expect(container.querySelector("[data-testid=sin-label]")).not.toHaveAttribute("aria-labelledby")
  })

  it("hidrata sin mismatch y el cliente conserva los mismos ids", async () => {
    const container = ssr(<Shell collapsed={collapsed} />)
    const before = container.innerHTML
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await act(async () => {
      hydrateRoot(container, <Shell collapsed={collapsed} />, { onRecoverableError: recoverable })
    })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
    const ids = (html: string) => [...html.matchAll(/\s(?:id|aria-labelledby)="([^"]+)"/g)].map((m) => m[1])
    expect(ids(container.innerHTML)).toEqual(ids(before))
  })
})
