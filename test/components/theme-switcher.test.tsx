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
    expect(group).toHaveClass("rounded-control", "bg-gray-alpha-200", "shadow-track", "p-0.5")
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
      "rounded-[calc(var(--radius-control)-2px)]",
      "text-gray-900",
      "hover:text-gray-1000",
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

  // El camino sin "system" no solo esconde una opción: cambia cuál queda marcada, porque
  // el valor por defecto deja de ser "system" y pasa a ser el tema resuelto. Era la rama
  // sin cubrir del componente.
  it("sin enableSystem marca el tema actual y sigue cambiándolo", async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey={`n-${Math.random()}`}>
        <ThemeSwitcher />
      </ThemeProvider>
    )
    const claro = screen.getByRole("radio", { name: "Tema claro" })
    await waitFor(() => expect(claro).toHaveAttribute("aria-checked", "true"))

    await userEvent.click(screen.getByRole("radio", { name: "Tema oscuro" }))

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
    expect(claro).toHaveAttribute("aria-checked", "false")
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

// El ThemeSwitcher es el control segmentado de Tabs con íconos: la opción elegida no se pinta,
// la marca una pastilla que se desliza.
describe("ThemeSwitcher: la pastilla", () => {
  const pastilla = () => document.querySelector<HTMLElement>("[data-slot=theme-switcher-indicator]")

  it("es la misma pista y la misma pastilla que Tabs", async () => {
    const { segmentedThumbClassName, segmentedTrackClassName } = await import("../../src/variants/segmented")
    render(withTheme(<ThemeSwitcher />))
    const grupo = screen.getByRole("radiogroup", { name: "Tema" })
    for (const clase of segmentedTrackClassName.split(" ")) if (clase !== "flex") expect(grupo).toHaveClass(clase)
    await waitFor(() => expect(pastilla()).not.toBeNull())
    for (const clase of segmentedThumbClassName.split(" ")) expect(pastilla()).toHaveClass(clase)
  })

  it("en oscuro es más clara que la pista, no un hueco", async () => {
    render(withTheme(<ThemeSwitcher />))
    await waitFor(() => expect(pastilla()).not.toBeNull())
    expect(pastilla()).toHaveClass("glass-control", "dark:bg-gray-alpha-400")
  })

  it("se corre al índice de la opción elegida, sin medir nada", async () => {
    render(withTheme(<ThemeSwitcher />))
    // Claro 0, Oscuro 1, Sistema 2. Arranca en Sistema.
    await waitFor(() => expect(pastilla()?.style.getPropertyValue("--index")).toBe("2"))
    await userEvent.click(screen.getByRole("radio", { name: "Tema oscuro" }))
    await waitFor(() => expect(pastilla()?.style.getPropertyValue("--index")).toBe("1"))
    await userEvent.click(screen.getByRole("radio", { name: "Tema claro" }))
    await waitFor(() => expect(pastilla()?.style.getPropertyValue("--index")).toBe("0"))
    expect(pastilla()).toHaveClass("size-7", "translate-x-[calc(var(--index)*--spacing(7.5))]")
  })

  it("no es parte del grupo para un lector de pantalla, ni recibe clics", async () => {
    render(withTheme(<ThemeSwitcher />))
    await waitFor(() => expect(pastilla()).not.toBeNull())
    expect(pastilla()).toHaveAttribute("aria-hidden", "true")
    expect(pastilla()).toHaveClass("pointer-events-none")
    expect(screen.getAllByRole("radio")).toHaveLength(3)
  })

  it("en el servidor no se dibuja: no sabe cuál es el tema, y no tiene que viajar al hidratar", () => {
    const html = renderToString(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ThemeSwitcher />
      </ThemeProvider>
    )
    expect(html).not.toContain("theme-switcher-indicator")
  })

  it("adentro de un menú lleva la misma pastilla", async () => {
    render(
      withTheme(
        <DropdownMenu open>
          <DropdownMenuContent>
            <ThemeMenuRadio />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    )
    await waitFor(() => expect(pastilla()?.style.getPropertyValue("--index")).toBe("2"))
  })
})
