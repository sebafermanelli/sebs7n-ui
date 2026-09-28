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
  it("fallback gris con iniciales, sin color por persona", () => {
    render(
      <Avatar size="lg">
        <AvatarFallback>sf</AvatarFallback>
      </Avatar>
    )
    const fallback = screen.getByText("sf")
    expect(fallback).toHaveClass("bg-gray-200", "text-gray-900", "text-callout", "uppercase")
    expect(fallback.closest("[data-slot=avatar]")).toHaveAttribute("data-size", "lg")
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
    expect(pagos).toHaveClass("text-gray-900", "hover:text-gray-1000", "after:bg-gray-1000", "group-data-[variant=line]/tabs-list:data-active:after:opacity-100")
    // En hover solo cambia el texto: una pestaña no se pinta como botón.
    expect(pagos.className).not.toMatch(/hover:before:bg-/)
    expect(pagos.className).not.toMatch(/brand/)
    await userEvent.click(pagos)
    expect(pagos).toHaveAttribute("data-active")
    expect(screen.getByText("panel b")).toBeVisible()
  })

  // Las pestañas van pegadas: `touch-target` no sirve (el `::after` es el subrayado, y taparía a
  // la de al lado). Con el dedo crecen de verdad: la de línea a 44, la segmentada a 40 (+ los
  // 2 + 2 de la pista = 44).
  it("con el dedo las pestañas llegan a 44", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Resumen</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole("tab", { name: "Resumen" })).toHaveClass(
      "pointer-coarse:group-data-[variant=line]/tabs-list:h-11",
      "pointer-coarse:group-data-[variant=segmented]/tabs-list:h-10"
    )
  })
})

describe("Separator / Skeleton", () => {
  it("separator de 1px gray-400", () => {
    render(<Separator />)
    expect(screen.getByRole("separator")).toHaveClass("bg-gray-400", "data-[orientation=horizontal]:h-px")
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

  it("skeleton con el pulso de Geist", () => {
    render(<Skeleton data-testid="sk" />)
    expect(screen.getByTestId("sk")).toHaveClass("animate-skeleton", "bg-gray-alpha-200", "rounded-control")
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
    expect(alert).toHaveClass("glass-control", "border-gray-alpha-400", "rounded-surface", "shadow-card", "before:bg-amber-700", "*:[svg]:text-amber-900")
    expect(screen.getByText("Cargalo antes de facturar.")).toHaveClass("text-gray-900")
  })

  it("es alfa y no vidrio: vive adentro de una Card sin apilar dos blur", () => {
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
