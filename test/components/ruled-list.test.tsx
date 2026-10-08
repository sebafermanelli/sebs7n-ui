import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { DefinitionItem, DefinitionList, RuledList, RuledListItem } from "../../src/components/ruled-list"

describe("RuledList", () => {
  it("con marcador es una lista ordenada con una fila por ítem y título", () => {
    render(
      <RuledList marker="number">
        <RuledListItem title="Cargá">Desde un PDF.</RuledListItem>
        <RuledListItem title="Revisá">Con tu equipo.</RuledListItem>
      </RuledList>
    )
    const list = screen.getByRole("list")
    expect(list.tagName).toBe("OL")
    expect(list).toHaveAttribute("data-marker", "number")
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByText("Cargá")).toBeInTheDocument()
  })

  it("el número sale de un contador CSS: no se repite en el texto para un lector", () => {
    render(
      <RuledList marker="section">
        <RuledListItem title="Uno" />
      </RuledList>
    )
    expect(screen.getByRole("list").className).toContain("[counter-reset:ruled-item]")
    expect(screen.getByRole("listitem").className).toContain("[counter-increment:ruled-item]")
    expect(screen.getByRole("listitem").className).toContain("in-data-[marker=section]:before:content-['§_'counter(ruled-item)]")
    expect(screen.getByRole("listitem")).not.toHaveTextContent("§")
  })

  it("marker=none es una ul sin numeración", () => {
    render(
      <RuledList marker="none">
        <RuledListItem title="Uno" />
      </RuledList>
    )
    expect(screen.getByRole("list").tagName).toBe("UL")
  })

  it("filetes de 1 px (border-separator) y sin sombras ni bordes laterales", () => {
    const html = renderToString(
      <RuledList>
        <RuledListItem title="Uno" />
      </RuledList>
    )
    expect(html).toContain("border-separator")
    expect(html).not.toMatch(/border-s-|border-e-|shadow/)
  })
})

describe("DefinitionList", () => {
  it("es un dl con término y detalle por fila", () => {
    const { container } = render(
      <DefinitionList>
        <DefinitionItem term="Plazo">30 días corridos.</DefinitionItem>
        <DefinitionItem term="Moneda">Pesos.</DefinitionItem>
      </DefinitionList>
    )
    expect(container.querySelector("dl")).not.toBeNull()
    expect(container.querySelectorAll("dl > div > dt")).toHaveLength(2)
    expect(container.querySelector("dd")).toHaveTextContent("30 días corridos.")
  })
})
