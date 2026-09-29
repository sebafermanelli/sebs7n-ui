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
      // R4: la búsqueda de iCloud pierde el relleno con el foco y queda solo el anillo.
      expect(cuerpo, name).toContain("background-color: transparent;")
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

// R4: las dos tiras de iCloud. La de línea es la de Settings (la navegación de una página) y es el
// default; la segmentada es la de Calendar (§2.10).
describe("Tabs: línea de Settings y segmentado de Calendar", () => {
  const Ejemplo = ({ variant }: { variant?: "segmented" | "line" }) => (
    <Tabs defaultValue="a">
      <TabsList variant={variant}>
        <TabsTrigger value="a">Resumen</TabsTrigger>
        <TabsTrigger value="b">Pagos</TabsTrigger>
        <TabsTrigger value="c">Notas</TabsTrigger>
      </TabsList>
      <TabsContent value="a">a</TabsContent>
      <TabsContent value="b">b</TabsContent>
      <TabsContent value="c">c</TabsContent>
    </Tabs>
  )

  // Medido en Settings: 17/400 en label-secondary, la activa en label con un subrayado de 1 px del
  // ancho del texto encima de la línea base de 1 px (`fill-3`) de toda la barra; 60 de alto; de
  // texto a texto 46 (8 de padding + 30 + 8).
  it("por defecto es la de Settings de iCloud: a todo el ancho, 17 px y subrayado de 1 px", () => {
    render(<Ejemplo />)
    const list = screen.getByRole("tablist")
    expect(list).toHaveAttribute("data-variant", "line")
    expect(list).toHaveClass("w-full", "border-b", "border-fill-3", "gap-7.5")
    expect(list.querySelector("[data-slot=tabs-indicator]")).toBeNull()
    const tab = screen.getByRole("tab", { name: "Pagos" })
    expect(tab).toHaveClass("h-15", "px-2", "text-body", "text-label-secondary", "first:-ml-2")
    expect(tab).toHaveClass("after:inset-x-2", "after:-bottom-px", "after:h-px", "after:bg-label", "after:opacity-0", "data-active:after:opacity-100")
  })

  it("segmented es el de Calendar: pista de 28, segmento de 24 que se desliza, activo en semibold", () => {
    render(<Ejemplo variant="segmented" />)
    const list = screen.getByRole("tablist")
    expect(list).toHaveAttribute("data-variant", "segmented")
    expect(list).toHaveClass("rounded-control", "bg-fill-2", "p-0.5", "w-fit", "auto-cols-fr")
    expect(list).not.toHaveClass("border-b")
    const pastilla = list.querySelector("[data-slot=tabs-indicator]")!
    expect(pastilla).toHaveClass("bg-segment", "shadow-segment", "rounded-[calc(var(--radius-control)-2px)]", "transition-[left,width,translate]", "motion-reduce:transition-none")
    const tab = screen.getByRole("tab", { name: "Pagos" })
    expect(tab).toHaveClass("h-6", "text-callout", "text-label", "data-active:font-semibold")
  })

  // El separador vertical de 1 × 16 entre segmentos (medido: `::before` a 4 px de arriba). No va
  // antes del primero, ni en el activo, ni en el que sigue al activo: ahí lo tapa la pastilla.
  it("segmented lleva separadores entre los segmentos que no tocan al activo", () => {
    render(<Ejemplo variant="segmented" />)
    const tab = screen.getByRole("tab", { name: "Notas" })
    expect(tab).toHaveClass("after:w-px", "after:h-4", "after:top-1", "after:bg-fill-3", "first:after:hidden", "data-active:after:hidden", "[[data-active]+&]:after:hidden")
  })
})

// Las pestañas de adentro del ColorPicker (Paleta / Espectro / Valores) cambian de vista en un
// panel: son el segmentado, no la navegación de la página.
it("el ColorPicker pide el segmentado", () => {
  expect(readFileSync(join(import.meta.dirname, "../../src/components/color-picker.tsx"), "utf8")).toMatch(/<TabsList[^>]*variant="segmented"/)
})
