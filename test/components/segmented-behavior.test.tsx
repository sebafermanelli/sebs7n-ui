import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AppShell } from "../../src/components/app-shell"
import { Input } from "../../src/components/input"
import { Sidebar } from "../../src/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/components/tabs"

const theme = readFileSync(join(import.meta.dirname, "../../src/styles/theme.css"), "utf8")

// Revisión de R1: desde 2.0 el anillo interior de un campo es el indicador y se ve también con el
// puntero, así que nada lee `data-sf-modality`. El módulo que lo escribía (`internal/modality.ts`)
// era código muerto de 1.x y se fue.
describe("el foco de un campo no depende de la modalidad", () => {
  it("un clic no escribe data-sf-modality", () => {
    render(<Input aria-label="Nombre" />)
    fireEvent.pointerDown(screen.getByRole("textbox"))
    fireEvent.keyDown(document.body, { key: "Tab" })
    expect(document.documentElement).not.toHaveAttribute("data-sf-modality")
  })

  it("ningún componente importa el módulo de modalidad", () => {
    expect(existsSync(join(import.meta.dirname, "../../src/internal/modality.ts"))).toBe(false)
  })

  // Desde 2.0 (iCloud) el anillo interior de un campo es el indicador y se ve también con el
  // puntero: la modalidad ya no lo decide.
  it("focus-border es el anillo interior, con puntero y con teclado", () => {
    for (const name of ["focus-border", "focus-border-error"]) {
      const inicio = theme.indexOf(`@utility ${name} {`)
      const cuerpo = theme.slice(inicio, theme.indexOf("\n}", inicio))
      expect(cuerpo, name).toContain("border-color:")
      expect(cuerpo, name).toContain("--tw-inset-ring-shadow: inset 0 0 0 2px")
      expect(cuerpo, name).not.toContain("data-sf-modality")
    }
  })
})

describe("AppShell: luz ambiente", () => {
  it("es opt-in: sin la prop, la raíz pinta el fondo de página liso", () => {
    const { container } = render(<AppShell sidebar={<Sidebar />}>x</AppShell>)
    const root = container.querySelector("[data-slot=app-shell]")!
    expect(root).toHaveClass("bg-background")
    expect(root).not.toHaveClass("bg-ambient")
    expect(root).not.toHaveAttribute("data-ambient")
  })

  it("con ambient, la raíz pinta la luz y no deja el fondo liso al lado", () => {
    const { container } = render(
      <AppShell ambient sidebar={<Sidebar />}>
        x
      </AppShell>
    )
    const root = container.querySelector("[data-slot=app-shell]")!
    expect(root).toHaveClass("bg-ambient")
    // Los dos pintan `background-color`: si conviven, gana el que Tailwind emitió último.
    expect(root).not.toHaveClass("bg-background")
    expect(root).toHaveAttribute("data-ambient")
  })
})

describe("Tabs: pista segmentada", () => {
  const Ejemplo = ({ variant }: { variant?: "segmented" | "line" }) => (
    <Tabs defaultValue="a">
      <TabsList variant={variant}>
        <TabsTrigger value="a">Resumen</TabsTrigger>
        <TabsTrigger value="b">Pagos</TabsTrigger>
      </TabsList>
      <TabsContent value="a">a</TabsContent>
      <TabsContent value="b">b</TabsContent>
    </Tabs>
  )

  it("por defecto es una cápsula hundida con una pastilla que se desliza", () => {
    render(<Ejemplo />)
    const list = screen.getByRole("tablist")
    expect(list).toHaveAttribute("data-variant", "segmented")
    expect(list).toHaveClass("rounded-control", "bg-fill-2", "w-fit")
    expect(list).not.toHaveClass("border-b")
    const pastilla = list.querySelector("[data-slot=tabs-indicator]")!
    expect(pastilla).toHaveClass("bg-segment", "shadow-segment", "rounded-[calc(var(--radius-control)-2px)]", "transition-[left,width,translate]", "motion-reduce:transition-none")
    // Alfa y no vidrio: la pista ya vive adentro de una superficie.
    expect(pastilla.className).not.toMatch(/(^|\s)glass(\s|$)/)
  })

  it("line es la de Geist: a todo el ancho, línea abajo y sin pastilla", () => {
    render(<Ejemplo variant="line" />)
    const list = screen.getByRole("tablist")
    expect(list).toHaveClass("w-full", "border-b", "border-separator")
    expect(list.querySelector("[data-slot=tabs-indicator]")).toBeNull()
  })
})

