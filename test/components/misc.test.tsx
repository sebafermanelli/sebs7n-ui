import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { InfoIcon } from "lucide-react"
import { describe, expect, it } from "vitest"

import { Alert, AlertDescription, AlertTitle } from "../../src/components/alert"
import { Avatar, AvatarFallback } from "../../src/components/avatar"
import { Separator } from "../../src/components/separator"
import { Skeleton } from "../../src/components/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/components/tabs"

describe("Avatar", () => {
  it("el monograma de iCloud: iniciales blancas sobre un gradiente gris, sin color por persona", () => {
    render(
      <Avatar size="lg">
        <AvatarFallback>sf</AvatarFallback>
      </Avatar>
    )
    const fallback = screen.getByText("sf")
    // #6e6e73 → #48484a: el blanco llega a 5,07:1 en el tono más claro del gradiente.
    expect(fallback).toHaveClass("bg-linear-to-b", "from-monogram-top", "to-monogram-bottom", "text-white", "font-semibold", "uppercase")
    expect(fallback.closest("[data-slot=avatar]")).toHaveAttribute("data-size", "lg")
  })

  it("tamaños de iCloud: 28 (barra), 32 (lista), 40 y 80 (ficha)", () => {
    render(
      <>
        <Avatar size="sm" data-testid="sm" />
        <Avatar data-testid="md" />
        <Avatar size="lg" data-testid="lg" />
        <Avatar size="xl" data-testid="xl" />
      </>
    )
    const clases = screen.getByTestId("md").className
    for (const c of ["data-[size=sm]:size-7", "data-[size=md]:size-8", "data-[size=lg]:size-10", "data-[size=xl]:size-20"]) expect(clases).toContain(c)
    expect(screen.getByTestId("xl")).toHaveAttribute("data-size", "xl")
  })
})

describe("Tabs", () => {
  it("cambia de panel y marca data-active; la activa no usa la marca", async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Resumen</TabsTrigger>
          <TabsTrigger value="b">Pagos</TabsTrigger>
        </TabsList>
        <TabsContent value="a">panel a</TabsContent>
        <TabsContent value="b">panel b</TabsContent>
      </Tabs>
    )
    const pagos = screen.getByRole("tab", { name: "Pagos" })
    expect(pagos).toHaveClass("text-label-secondary", "hover:text-label", "data-active:text-label", "after:bg-label", "data-active:after:opacity-100")
    // En hover solo cambia el texto: una pestaña no se pinta como botón.
    expect(pagos.className).not.toMatch(/hover:before:bg-/)
    expect(pagos.className).not.toMatch(/brand/)
    await userEvent.click(pagos)
    expect(pagos).toHaveAttribute("data-active")
    expect(screen.getByText("panel b")).toBeVisible()
  })

  // Las pestañas van pegadas: `touch-target` no sirve (el `::after` es el subrayado o el
  // separador, y taparía a la de al lado). La de línea mide 60 (Settings de iCloud); la segmentada
  // crece con el dedo a 40 (+ los 2 + 2 de la pista = 44).
  it("con el dedo las pestañas llegan a 44", () => {
    const { rerender } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Resumen</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole("tab", { name: "Resumen" })).toHaveClass("h-15")
    rerender(
      <Tabs defaultValue="a">
        <TabsList variant="segmented">
          <TabsTrigger value="a">Resumen</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    // Con el dedo no crece (se ve como el botón de ícono de al lado): el área de 44 es el `::before`
    // estirado solo en alto, y el anillo de foco pasa al segmento para no estirarse con él.
    const tab = screen.getByRole("tab", { name: "Resumen" })
    expect(tab).toHaveClass("h-6", "pointer-coarse:before:-inset-y-2.5", "focus-visible:focus-ring")
    expect(tab.className).not.toMatch(/pointer-coarse:h-|focus-visible:before:focus-ring/)
  })
})

describe("Separator / Skeleton", () => {
  it("separator de 1px gray-400", () => {
    render(<Separator />)
    expect(screen.getByRole("separator")).toHaveClass("bg-separator", "data-[orientation=horizontal]:h-px")
  })

  // Dejó de ser el primitivo de Base UI —que traía `'use client'` por un elemento sin
  // estado— y pasó a ser un `<div>` a mano. Lo que no puede cambiar es lo que anuncia.
  it("separator anuncia su orientación por rol y por data-orientation", () => {
    render(
      <>
        <Separator />
        <Separator orientation="vertical" />
      </>
    )
    const [horizontal, vertical] = screen.getAllByRole("separator")
    expect(horizontal).toHaveAttribute("aria-orientation", "horizontal")
    expect(horizontal).toHaveAttribute("data-orientation", "horizontal")
    expect(vertical).toHaveAttribute("aria-orientation", "vertical")
    expect(vertical).toHaveAttribute("data-orientation", "vertical")
  })

  it("skeleton: gris con el brillo que cruza", () => {
    render(<Skeleton data-testid="sk" />)
    expect(screen.getByTestId("sk")).toHaveClass("animate-skeleton", "bg-fill-2", "rounded-control")
  })

  it("el brillo cruza de izquierda a derecha en 1,5–2 s, con la misma fase en todos los bloques, y se queda quieto con movimiento reducido", async () => {
    const { readFileSync } = await import("node:fs")
    const { join } = await import("node:path")
    const theme = readFileSync(join(import.meta.dirname, "../../src/styles/theme.css"), "utf8")
    const inicio = theme.indexOf("@utility animate-skeleton {")
    const util = theme.slice(inicio, theme.indexOf("\n}", inicio))
    // `fixed`: el degradado se ubica contra la ventana, así todos los bloques muestran la misma franja.
    expect(util).toContain("background-attachment: fixed")
    expect(util).toMatch(/linear-gradient\(\s*90deg/)
    const segundos = Number(/animation: skeleton ([\d.]+)s/.exec(util)?.[1])
    expect(segundos).toBeGreaterThanOrEqual(1.5)
    expect(segundos).toBeLessThanOrEqual(2)
    expect(util).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*animation: none;[^}]*background-image: none;/)
    // Sin el pulso de opacidad de 1.x.
    expect(theme).not.toMatch(/@keyframes skeleton \{[^}]*opacity/)
  })
})

describe("Alert", () => {
  it("fondo neutro; la variante solo cambia franja e ícono", () => {
    render(
      <Alert variant="warning">
        <InfoIcon />
        <AlertTitle>Falta el CUIT</AlertTitle>
        <AlertDescription>Cargalo antes de facturar.</AlertDescription>
      </Alert>
    )
    const alert = screen.getByRole("alert")
    expect(alert).toHaveClass("bg-fill-1", "border-transparent", "rounded-surface", "before:bg-amber-700", "*:[svg]:text-amber-900")
    expect(screen.getByText("Cargalo antes de facturar.")).toHaveClass("text-label-secondary")
  })

  it("es un relleno sin blur: vive adentro de una Card", () => {
    render(<Alert>x</Alert>)
    expect(screen.getByRole("alert").className).not.toMatch(/(^|\s)glass(\s|$)/)
  })

  it("la franja es una píldora adentro de la superficie, no pegada al borde", () => {
    render(<Alert variant="error">x</Alert>)
    const alert = screen.getByRole("alert")
    expect(alert).toHaveClass("before:left-2", "before:inset-y-3", "before:w-1", "before:rounded-full", "before:bg-red-700")
    // Pegada al borde, con el radio de 20px las puntas quedaban afuera del contorno.
    expect(alert.className).not.toMatch(/before:left-0|before:rounded-r-full/)
    // El texto deja lugar: 20px de padding contra los 12 donde termina la franja.
    expect(alert).toHaveClass("pl-5")
  })
})
