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
  // Borde lleno en los dos estados (el punteado se leía como un hueco para soltar algo, no como
  // un control). Prendido se distingue sin depender del color: fondo, borde más oscuro y texto
  // pleno.
  it("borde lleno siempre; prendido con fondo, borde y texto más fuertes, sin color de marca", async () => {
    render(<Toggle>Activos</Toggle>)
    const chip = screen.getByRole("button", { name: "Activos" })
    expect(chip).toHaveClass("rounded-control", "border", "border-label-tertiary", "text-label-secondary", "hover:border-label-secondary")
    expect(chip.className).not.toMatch(/border-(dashed|dotted)/)
    expect(chip).toHaveClass("data-pressed:border-label", "data-pressed:bg-fill-2", "data-pressed:text-label")
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
  // 2.0: la etiqueta del Finder. Relleno sólido, sin borde, sin brillo ni vidrio, 4 px de radio.
  it("sólido por color: relleno lleno, sin borde, sin brillo, radio de etiqueta", () => {
    render(<Badge color="amber">Pendiente</Badge>)
    const badge = screen.getByText("Pendiente")
    expect(badge).toHaveClass("bg-amber-700", "text-black/85", "rounded-tag", "text-footnote", "h-6")
    expect(badge.className).not.toMatch(/(^|\s)border(\s|$|-)|sheen|shadow-|glass|material-|--sf-tint|rounded-full/)
    expect(badge).toHaveAttribute("data-variant", "solid")
  })

  it("los nueve colores son sólidos, con tinta blanca o negra según el relleno", () => {
    const esperado = {
      gray: ["bg-gray-700", "text-black/85"],
      brand: ["bg-brand-700", "text-brand-contrast"],
      red: ["bg-red-800", "text-white"],
      amber: ["bg-amber-700", "text-black/85"],
      green: ["bg-green-700", "text-black/85"],
      blue: ["bg-blue-800", "text-white"],
      teal: ["bg-teal-700", "text-black/85"],
      purple: ["bg-purple-700", "text-white"],
      pink: ["bg-pink-800", "text-white"],
    } as const
    for (const [color, clases] of Object.entries(esperado)) {
      const { unmount } = render(<Badge color={color as keyof typeof esperado}>{color}</Badge>)
      expect(screen.getByText(color), color).toHaveClass(...clases)
      unmount()
    }
  })

  // `subtle` queda por compatibilidad: se ve igual que `solid`.
  it("subtle (obsoleto) se ve igual que solid", () => {
    render(
      <>
        <Badge color="red" variant="subtle">
          Vencida
        </Badge>
        <Badge color="red" variant="solid">
          Anulada
        </Badge>
      </>
    )
    expect(screen.getByText("Vencida").className).toBe(screen.getByText("Anulada").className)
  })

  it("el punto va en el color de la tinta, así se lee sobre el relleno", () => {
    render(
      <Badge color="green" dot>
        Listo
      </Badge>
    )
    const dot = screen.getByText("Listo").querySelector("[data-slot=badge-dot]")
    expect(dot).toHaveClass("bg-current", "size-1.5")
    expect(dot!.className).not.toMatch(/bg-green/)
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
    expect(link).toHaveClass("bg-green-700", "underline")
    expect(link.querySelector("[data-slot=badge-dot]")).not.toBeNull()
  })
})

describe("Card", () => {
  it("grupo opaco: radio de superficie, plana, padding 24", () => {
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
    expect(card).toHaveClass("bg-grouped", "rounded-surface", "[--card-spacing:--spacing(6)]")
    // Plana, como las cards de iCloud: sin sombra en reposo.
    expect(card.className).not.toMatch(/(^|\s)shadow-/)
    expect(card.className).not.toMatch(/shadow-(menu|modal|tooltip)/)
    expect(screen.getByText("Ingresos")).toHaveClass("text-title-2")
    expect(screen.getByText("Últimos 30 días")).toHaveClass("text-callout", "text-label-secondary")
    expect(screen.getByText("pie")).toHaveClass("border-t", "border-separator")
  })

  it("interactiva y seleccionada", () => {
    const interactive = cardVariants({ interactive: true })
    // Sube un pixel con la sombra grande; al apretar vuelve a su lugar y a la sombra de reposo.
    expect(interactive).toContain("hover:-translate-y-px hover:border-separator-strong hover:shadow-card-hover")
    expect(interactive.split(" ")).toEqual(expect.arrayContaining(["active:translate-y-0", "active:shadow-card", "focus-visible:focus-ring"]))
    // Apretada se oscurece con una capa encima (`background-image`) y no cambiando el fondo: un
    // `bg-gray-alpha-*` reemplazaba el sólido del grupo por un alfa y la card se volvía
    // transparente justo al tocarla.
    expect(interactive).toContain("active:bg-[linear-gradient(var(--color-fill-2),var(--color-fill-2))]")
    expect(interactive).not.toMatch(/active:bg-gray-alpha/)
    expect(interactive).toMatch(/\bbg-grouped\b/)
    // `translate` no está en `transition-control`: la interactiva usa la transición que sí lo incluye.
    expect(interactive).toContain("transition-surface")
    render(<Card selected>sel</Card>)
    const card = screen.getByText("sel")
    expect(card).toHaveAttribute("data-selected")
    expect(card).toHaveClass("border-brand-700", "ring-brand-700")
  })
})

describe("Table", () => {
  it("una sola superficie, header 40px hundido, filas 48px con hover", () => {
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
    expect(container).toHaveClass("rounded-surface", "border", "border-separator", "bg-surface", "overflow-x-auto")
    expect(screen.getByRole("table").querySelector("thead")).toHaveClass("bg-fill-1", "[&_tr]:h-10")
    expect(screen.getByText("Cliente")).toHaveClass("text-callout", "text-label-secondary")
    expect(screen.getByText("Ana").closest("tr")).toHaveClass("h-12", "hover:bg-fill-1", "data-[state=selected]:bg-selection-inactive", "data-[state=selected]:group-focus-within/table:bg-selection")
    expect(screen.getByText("$1.200")).toHaveClass("text-right", "tabular-nums")
  })

  it("density compact", () => {
    render(<Table density="compact"><tbody /></Table>)
    expect(screen.getByRole("table").parentElement).toHaveAttribute("data-density", "compact")
  })
})
