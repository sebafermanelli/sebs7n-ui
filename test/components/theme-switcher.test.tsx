import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "next-themes"
import { renderToString } from "react-dom/server"
import { beforeAll, describe, expect, it } from "vitest"

import { Button } from "../../src/components/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../src/components/dropdown-menu"
import { ThemeMenuRadio, ThemeSwitcher } from "../../src/components/theme-switcher"

beforeAll(() => {
  // jsdom no trae matchMedia y next-themes lo usa para "system".
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

function withTheme(ui: React.ReactNode) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey={`t-${Math.random()}`}>
      {ui}
    </ThemeProvider>
  )
}

describe("ThemeSwitcher", () => {
  it("es un radiogroup con nombres en español y cambia el tema", async () => {
    render(withTheme(<ThemeSwitcher />))
    const group = screen.getByRole("radiogroup", { name: "Tema" })
    expect(group).toHaveClass("rounded-full", "border-gray-alpha-400", "bg-background-100", "p-0.5")
    const system = await screen.findByRole("radio", { name: "Tema del sistema" })
    await waitFor(() => expect(system).toHaveAttribute("aria-checked", "true"))
    const dark = screen.getByRole("radio", { name: "Tema oscuro" })
    await userEvent.click(dark)
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
    expect(dark).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Tema claro" })).toHaveAttribute("aria-checked", "false")
  })

  it("contrato de clases de los ítems", () => {
    render(withTheme(<ThemeSwitcher />))
    expect(screen.getByRole("radio", { name: "Tema claro" })).toHaveClass(
      "size-7",
      "rounded-full",
      "text-gray-900",
      "hover:text-gray-1000",
      "data-checked:bg-gray-200",
      "data-checked:text-gray-1000",
      "focus-visible:focus-ring"
    )
  })

  it("en SSR no marca ninguna opción (el servidor no conoce el tema)", () => {
    const html = renderToString(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ThemeSwitcher />
      </ThemeProvider>
    )
    expect(html).toContain('role="radio"')
    expect(html).not.toContain('aria-checked="true"')
    expect(html).not.toMatch(/\sdata-checked[=\s/>]/)
  })

  it("sin enableSystem no ofrece Sistema", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey={`n-${Math.random()}`}>
        <ThemeSwitcher />
        <DropdownMenu open>
          <DropdownMenuContent>
            <ThemeMenuRadio />
          </DropdownMenuContent>
        </DropdownMenu>
      </ThemeProvider>
    )
    expect(screen.getAllByRole("radio")).toHaveLength(2)
    expect(screen.queryByRole("radio", { name: "Tema del sistema" })).toBeNull()
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(2)
  })

  it("los labels se pueden sobreescribir", () => {
    render(withTheme(<ThemeSwitcher labels={{ group: "Theme", light: "Light", dark: "Dark", system: "System" }} />))
    expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Dark" })).toBeInTheDocument()
  })

  it("dentro de un DropdownMenu, elegir un tema no cierra el menú", async () => {
    render(
      withTheme(
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>Cuenta</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Ajustes</DropdownMenuItem>
            <ThemeSwitcher />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    )
    await userEvent.click(screen.getByRole("button", { name: "Cuenta" }))
    await userEvent.click(await screen.findByRole("radio", { name: "Tema oscuro" }))
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
    expect(screen.getByRole("menu")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Ajustes" })).toBeInTheDocument()
    // Las flechas mueven el tema, no el foco del menú.
    screen.getByRole("radio", { name: "Tema oscuro" }).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Tema del sistema" })).toHaveFocus()
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })
})
