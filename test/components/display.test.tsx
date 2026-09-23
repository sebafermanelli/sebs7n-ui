import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Badge } from "../../src/components/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../src/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../src/components/table"
import { Toggle } from "../../src/components/toggle"
import { ToggleGroup, ToggleGroupItem } from "../../src/components/toggle-group"
import { cardVariants } from "../../src/variants/card"

describe("Toggle (chip)", () => {
  it("apagado punteado, prendido sólido con fondo, sin color de marca", async () => {
    render(<Toggle>Activos</Toggle>)
    const chip = screen.getByRole("button", { name: "Activos" })
    expect(chip).toHaveClass("rounded-full", "border-dashed", "border-gray-700", "text-gray-900", "hover:border-gray-800")
    expect(chip).toHaveClass("data-pressed:border-solid", "data-pressed:border-gray-900", "data-pressed:bg-gray-100")
    expect(chip.className).not.toMatch(/brand/)
    await userEvent.click(chip)
    expect(chip).toHaveAttribute("aria-pressed", "true")
    expect(chip).toHaveAttribute("data-pressed")
  })

  it("ToggleGroup deja uno solo prendido por defecto", async () => {
    render(
      <ToggleGroup defaultValue={["a"]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    )
    await userEvent.click(screen.getByRole("button", { name: "B" }))
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "false")
  })
})

describe("Badge", () => {
  it("subtle por color: fondo 100, texto 900, borde 400", () => {
    render(<Badge color="amber">Pendiente</Badge>)
    expect(screen.getByText("Pendiente")).toHaveClass("bg-amber-100", "text-amber-900", "border-amber-400", "rounded-full", "text-label-12", "h-6")
  })

  it("solid gray y brand", () => {
    render(
      <>
        <Badge variant="solid">Nuevo</Badge>
        <Badge variant="solid" color="brand">Pro</Badge>
      </>
    )
    expect(screen.getByText("Nuevo")).toHaveClass("bg-gray-1000", "text-background-100")
    expect(screen.getByText("Pro")).toHaveClass("bg-brand-700", "text-brand-contrast")
  })

  it("dot agrega un punto 700 oculto al lector", () => {
    render(<Badge color="green" dot>Listo</Badge>)
    const dot = screen.getByText("Listo").querySelector("[data-slot=badge-dot]")
    expect(dot).toHaveClass("bg-green-700", "size-1.5")
    expect(dot).toHaveAttribute("aria-hidden", "true")
  })

  // `render` pasó de `useRender` de Base UI a `renderElement`, que es lo que deja
  // al Badge sin `"use client"`. Esto fija que el cambio no se ve desde afuera:
  // el elemento del llamador manda, sus props sobreviven y el punto sigue adentro.
  it("render reemplaza el span y conserva las props del elemento", () => {
    render(
      <Badge color="green" dot render={<a className="underline" href="/planes" />}>
        Pro
      </Badge>
    )
    const link = screen.getByRole("link", { name: "Pro" })
    expect(link).toHaveAttribute("href", "/planes")
    expect(link).toHaveAttribute("data-slot", "badge")
    expect(link).toHaveAttribute("data-color", "green")
    expect(link).toHaveClass("bg-green-100", "underline")
    expect(link.querySelector("[data-slot=badge-dot]")).not.toBeNull()
  })
})

describe("Card", () => {
  it("superficie Geist: borde gray-400, radio 12, sin sombra, padding 24", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Ingresos</CardTitle>
          <CardDescription>Últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>$48.200</CardContent>
        <CardFooter>pie</CardFooter>
      </Card>
    )
    const card = screen.getByText("Ingresos").closest("[data-slot=card]")!
    expect(card).toHaveClass("border-gray-400", "bg-background-100", "rounded-xl", "[--card-spacing:--spacing(6)]")
    expect(card.className).not.toMatch(/shadow/)
    expect(screen.getByText("Ingresos")).toHaveClass("text-heading-20")
    expect(screen.getByText("Últimos 30 días")).toHaveClass("text-copy-14", "text-gray-900")
    expect(screen.getByText("pie")).toHaveClass("border-t", "border-gray-400")
  })

  it("interactiva y seleccionada", () => {
    expect(cardVariants({ interactive: true })).toContain("hover:border-gray-500 hover:bg-gray-100 active:bg-gray-200 focus-visible:focus-ring")
    render(<Card selected>sel</Card>)
    const card = screen.getByText("sel")
    expect(card).toHaveAttribute("data-selected")
    expect(card).toHaveClass("border-brand-700", "ring-brand-700")
  })
})

describe("Table", () => {
  it("una sola superficie, header 40px en background-200, filas 48px con hover", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead numeric>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ana</TableCell>
            <TableCell numeric>$1.200</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const container = screen.getByRole("table").parentElement!
    expect(container).toHaveClass("rounded-xl", "border", "border-gray-400", "overflow-x-auto")
    expect(screen.getByRole("table").querySelector("thead")).toHaveClass("bg-background-200", "[&_tr]:h-10")
    expect(screen.getByText("Cliente")).toHaveClass("text-label-12", "text-gray-900")
    expect(screen.getByText("Ana").closest("tr")).toHaveClass("h-12", "hover:bg-gray-100", "data-[state=selected]:bg-brand-100")
    expect(screen.getByText("$1.200")).toHaveClass("text-right", "tabular-nums")
  })

  it("density compact", () => {
    render(<Table density="compact"><tbody /></Table>)
    expect(screen.getByRole("table").parentElement).toHaveAttribute("data-density", "compact")
  })
})
