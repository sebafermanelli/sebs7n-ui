import { render, screen } from "@testing-library/react"
import { InboxIcon } from "lucide-react"
import { describe, expect, it } from "vitest"

import { AppShellContent } from "../../src/components/app-shell-content"
import { Button } from "../../src/components/button"
import { EmptyState } from "../../src/components/empty-state"
import { Kbd } from "../../src/components/kbd"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "../../src/components/page-header"
import { Stat } from "../../src/components/stat"

describe("Kbd", () => {
  it("es un <kbd> mono con borde gris y radio xs", () => {
    render(<Kbd>⌘K</Kbd>)
    const kbd = screen.getByText("⌘K")
    expect(kbd.tagName).toBe("KBD")
    expect(kbd).toHaveClass("text-label-12-mono", "bg-gray-100", "border", "border-gray-400", "rounded-xs", "px-1", "h-5", "text-gray-900")
  })
})

describe("PageHeader", () => {
  it("título h1 heading-32, descripción gris, acciones y breadcrumb", () => {
    render(
      <PageHeader breadcrumb={<a href="/viajes">Viajes</a>}>
        <PageHeaderTitle>Viajes</PageHeaderTitle>
        <PageHeaderDescription>12 activos · 3 salen esta semana</PageHeaderDescription>
        <PageHeaderActions>
          <Button>Nuevo viaje</Button>
        </PageHeaderActions>
        <div data-testid="filtros">filtros</div>
      </PageHeader>
    )
    const title = screen.getByRole("heading", { level: 1, name: "Viajes" })
    expect(title).toHaveClass("text-heading-32", "text-gray-1000")
    expect(screen.getByText("12 activos · 3 salen esta semana")).toHaveClass("text-copy-14", "text-gray-900")
    const actions = screen.getByRole("button", { name: "Nuevo viaje" }).parentElement!
    expect(actions).toHaveAttribute("data-slot", "page-header-actions")
    expect(actions).toHaveClass("flex-wrap", "sm:col-start-2", "sm:row-start-1")
    const crumbs = screen.getByRole("navigation", { name: "Migas de pan" })
    expect(crumbs).toHaveAttribute("data-slot", "page-header-breadcrumb")
    expect(crumbs).toContainElement(screen.getByRole("link", { name: "Viajes" }))
    const header = title.closest("[data-slot=page-header]")!
    expect(header.className).not.toMatch(/\bm[btxy]?-\d/)
  })

  it.each([true, false])("título y descripción van en la columna 1 (con acciones: %s)", (withActions) => {
    render(
      <PageHeader>
        <PageHeaderTitle>Clientes</PageHeaderTitle>
        <PageHeaderDescription>Todos los inquilinos</PageHeaderDescription>
        {withActions && (
          <PageHeaderActions>
            <Button>Nuevo</Button>
          </PageHeaderActions>
        )}
      </PageHeader>
    )
    // Sin col-start-1 explícito, sin acciones la descripción caía en la columna 2 al lado del título.
    expect(screen.getByRole("heading", { level: 1, name: "Clientes" })).toHaveClass("sm:col-start-1")
    expect(screen.getByText("Todos los inquilinos")).toHaveClass("sm:col-start-1")
  })
})

describe("EmptyState", () => {
  it("superficie subtle centrada con ícono, título, descripción y acción", () => {
    render(
      <EmptyState
        icon={<InboxIcon />}
        title="Todavía no hay viajes"
        description="Creá el primero para empezar a cargar pasajeros."
        action={<Button>Nuevo viaje</Button>}
      />
    )
    const title = screen.getByRole("heading", { level: 2, name: "Todavía no hay viajes" })
    expect(title).toHaveClass("text-heading-16", "text-gray-1000")
    expect(screen.getByText("Creá el primero para empezar a cargar pasajeros.")).toHaveClass("text-copy-14", "text-gray-900")
    const root = title.closest("[data-slot=empty-state]")!
    expect(root).toHaveClass("bg-background-200", "rounded-xl", "items-center", "text-center", "py-12")
    expect(root.className).not.toMatch(/\bborder\b|shadow/)
    expect(root.querySelector("[data-slot=empty-state-icon]")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByRole("button", { name: "Nuevo viaje" })).toBeInTheDocument()
  })
})

describe("EmptyState titleAs", () => {
  it("el nivel del heading se puede cambiar", () => {
    render(<EmptyState title="Sin reseñas" titleAs="h3" />)
    expect(screen.getByRole("heading", { level: 3, name: "Sin reseñas" })).toBeInTheDocument()
  })
})

describe("Stat", () => {
  it("label gris, valor heading-24 tabular, delta con color semántico; sin card", () => {
    render(<Stat label="Ingresos" value="$48.200" delta="+12%" trend="up" hint="vs. mes anterior" />)
    expect(screen.getByText("Ingresos")).toHaveClass("text-label-13", "text-gray-900")
    expect(screen.getByText("$48.200")).toHaveClass("text-heading-24", "tabular-nums", "text-gray-1000")
    expect(screen.getByText("+12%")).toHaveClass("text-label-12", "text-green-900", "tabular-nums")
    expect(screen.getByText("vs. mes anterior")).toHaveClass("text-label-12", "text-gray-900")
    const root = screen.getByText("Ingresos").closest("[data-slot=stat]")!
    expect(root.className).not.toMatch(/\bborder\b|bg-/)
  })

  it("trend down en rojo", () => {
    render(<Stat label="Cancelaciones" value="4" delta="−2" trend="down" />)
    expect(screen.getByText("−2")).toHaveClass("text-red-900")
  })
})

describe("AppShellContent", () => {
  it("contenedor estándar: centrado, ancho completo, padding y gap de página", () => {
    render(<AppShellContent data-testid="c">hola</AppShellContent>)
    const el = screen.getByTestId("c")
    expect(el.tagName).toBe("DIV")
    expect(el).toHaveAttribute("data-slot", "app-shell-content")
    expect(el).toHaveAttribute("data-size", "default")
    expect(el).toHaveClass("mx-auto", "w-full", "max-w-7xl", "px-4", "py-6", "md:px-6", "md:py-8", "flex", "flex-col", "gap-6")
  })

  it.each([
    ["default", "max-w-7xl"],
    ["wide", "max-w-[1600px]"],
    ["full", null],
  ] as const)("size=%s", (size, maxWidth) => {
    render(<AppShellContent data-testid="c" size={size} className="gap-8" />)
    const el = screen.getByTestId("c")
    expect(el).toHaveAttribute("data-size", size)
    const maxClasses = el.className.split(/\s+/).filter((c) => c.startsWith("max-w-"))
    expect(maxClasses).toEqual(maxWidth ? [maxWidth] : [])
    // className de la app gana (cn).
    expect(el).toHaveClass("gap-8")
    expect(el).not.toHaveClass("gap-6")
  })
})
