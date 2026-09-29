import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CardRow } from "../../src/components/card"
import { PromoCard, PromoCardLink, WidgetCard } from "../../src/components/widget-card"

describe("WidgetCard", () => {
  it("es una región nombrada por su título, con la franja de ícono, título y subtítulo", () => {
    render(
      <WidgetCard action={<button type="button">Nueva</button>} icon={<svg data-testid="icono" />} subtitle="3 por cobrar" title="Facturas">
        <CardRow title="Acme S.A." />
      </WidgetCard>
    )
    const region = screen.getByRole("region", { name: "Facturas" })
    expect(region).toHaveAttribute("data-slot", "card")
    expect(screen.getByText("Facturas")).toHaveClass("text-title-2")
    expect(screen.getByText("3 por cobrar")).toHaveClass("text-callout", "text-label-secondary")
    expect(screen.getByTestId("icono").parentElement).toHaveClass("size-10")
    expect(screen.getByRole("button", { name: "Nueva" }).closest("[data-slot=card-action]")).not.toBeNull()
  })

  it("sobre el wallpaper es la Card translúcida: blur en la raíz, franja encima, el cuerpo interno no pinta", () => {
    render(
      <WidgetCard title="Facturas">
        <CardRow title="Acme S.A." />
      </WidgetCard>
    )
    const card = screen.getByRole("region")
    expect(card).toHaveClass("bg-surface", "in-data-ambient:material-translucent-body")
    expect(card.className).not.toContain("in-data-ambient:bg-transparent")
    const header = card.querySelector("[data-slot=card-header]")!
    expect(header).toHaveClass("in-data-ambient:group-data-[variant=default]/card:bg-translucent-strip")
    expect(header.className).not.toContain("material-translucent")
    const cuerpo = card.querySelector("[data-slot=widget-card-body]")!
    expect(cuerpo.className).not.toMatch(/(^|\s)\S*(bg-|backdrop-)/)
  })

  it("columns={2} reparte las filas y more pone el «…» abajo", () => {
    render(
      <WidgetCard columns={2} more={<button type="button">Más facturas</button>} title="Facturas">
        <CardRow title="Acme S.A." />
        <CardRow title="Nube Digital" />
      </WidgetCard>
    )
    expect(document.querySelector("[data-slot=card-content]")).toHaveAttribute("data-columns", "2")
    expect(screen.getByRole("button", { name: "Más facturas" }).closest("[data-slot=card-footer]")).not.toBeNull()
  })

  it("sin more ni filter no hay fila de abajo", () => {
    render(<WidgetCard title="Facturas">Nada</WidgetCard>)
    expect(document.querySelector("[data-slot=card-footer]")).toBeNull()
  })
})

describe("PromoCard", () => {
  it("la card promocional: degradado de marca, título grande, links con chevron y chip", () => {
    render(
      <PromoCard chip="200 GB" title="Plan Pro">
        <PromoCardLink href="#plan">Plan</PromoCardLink>
        <PromoCardLink href="#espacio">Espacio</PromoCardLink>
      </PromoCard>
    )
    const region = screen.getByRole("region", { name: "Plan Pro" })
    expect(region).toHaveClass("rounded-3xl", "text-brand-contrast")
    expect(region.className).toContain("linear-gradient")
    expect(screen.getByText("Plan Pro")).toHaveClass("text-large-title", "font-bold")
    const link = screen.getByRole("link", { name: "Plan" })
    expect(link).toHaveAttribute("href", "#plan")
    expect(link).toHaveClass("text-headline")
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByText("200 GB")).toHaveClass("rounded-menu", "text-title-3")
  })

  it("render: el link puede ser el Link de la app", () => {
    render(
      <PromoCard title="Plan Pro">
        <PromoCardLink render={<a data-testid="propio" href="/plan" />}>Plan</PromoCardLink>
      </PromoCard>
    )
    expect(screen.getByTestId("propio")).toHaveTextContent("Plan")
  })
})
