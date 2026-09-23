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
    expect(fallback).toHaveClass("bg-gray-200", "text-gray-900", "text-label-12", "uppercase")
    expect(fallback.closest("[data-slot=avatar]")).toHaveAttribute("data-size", "lg")
  })
})

describe("Tabs", () => {
  it("cambia de panel y marca data-active; subrayado gris, no de marca", async () => {
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
    expect(pagos).toHaveClass("text-gray-900", "hover:text-gray-1000", "after:bg-gray-1000", "data-active:after:opacity-100")
    // En hover solo cambia el texto: una pestaña no se pinta como botón.
    expect(pagos.className).not.toMatch(/hover:before:bg-/)
    expect(pagos.className).not.toMatch(/brand/)
    await userEvent.click(pagos)
    expect(pagos).toHaveAttribute("data-active")
    expect(screen.getByText("panel b")).toBeVisible()
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
    expect(screen.getByTestId("sk")).toHaveClass("animate-skeleton", "bg-gray-100", "rounded-md")
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
    expect(alert).toHaveClass("bg-background-100", "border-gray-400", "rounded-xl", "shadow-[inset_3px_0_0_var(--color-amber-700)]", "*:[svg]:text-amber-900")
    expect(screen.getByText("Cargalo antes de facturar.")).toHaveClass("text-gray-900")
  })
})
