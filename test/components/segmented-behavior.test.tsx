import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { AppShell } from "../../src/components/app-shell"
import { Input } from "../../src/components/input"
import { Sidebar } from "../../src/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/components/tabs"

const theme = readFileSync(join(import.meta.dirname, "../../src/styles/theme.css"), "utf8")

afterEach(() => {
  delete document.documentElement.dataset.sfModality
})

// Un `<input>` de texto cumple `:focus-visible` también con el clic, así que el halo de 4px
// aparecía cada vez que se tocaba un campo. El paquete anota cómo llegó el foco y la utilidad
// `focus-border` guarda el halo para el teclado.
describe("el halo de foco de un campo es del teclado", () => {
  it("sin ninguna interacción no hay atributo: el default es el halo visible", () => {
    render(<Input aria-label="Nombre" />)
    expect(document.documentElement).not.toHaveAttribute("data-sf-modality")
  })

  it("un puntero lo marca como pointer, y Tab lo devuelve a keyboard", () => {
    render(<Input aria-label="Nombre" />)
    fireEvent.pointerDown(screen.getByRole("textbox"))
    expect(document.documentElement).toHaveAttribute("data-sf-modality", "pointer")
    fireEvent.keyDown(document.body, { key: "Tab" })
    expect(document.documentElement).toHaveAttribute("data-sf-modality", "keyboard")
  })

  it("tipear no cambia la modalidad: quien hizo clic y escribe sigue sin halo", () => {
    render(<Input aria-label="Nombre" />)
    fireEvent.pointerDown(screen.getByRole("textbox"))
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "a" })
    expect(document.documentElement).toHaveAttribute("data-sf-modality", "pointer")
  })

  // Desde 2.0 (iCloud) el anillo interior de un campo es el indicador y se ve también con el
  // puntero: la modalidad ya no lo decide. El atributo se sigue escribiendo (R4 decide si queda).
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

// El clic que abre un diálogo pasa antes de que exista el campo de adentro. Si la modalidad se
// instalara recién al montar el primer campo, ese clic no lo anotaría nadie y el campo se
// abriría con el halo de teclado para alguien que acaba de usar el mouse.
describe("la modalidad se anota aunque no haya ningún campo montado", () => {
  it("un clic en una página sin campos ya cuenta", () => {
    render(<button type="button">Buscar</button>)
    expect(document.querySelector("input")).toBeNull()
    fireEvent.pointerDown(screen.getByRole("button", { name: "Buscar" }))
    expect(document.documentElement).toHaveAttribute("data-sf-modality", "pointer")
  })
})
