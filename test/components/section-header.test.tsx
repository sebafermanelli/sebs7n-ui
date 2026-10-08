import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { SectionHeader } from "../../src/components/section-header"

describe("SectionHeader", () => {
  it("un <h2> con la fuente de titulares y la bajada", () => {
    render(<SectionHeader description="Emití y cobrá desde un solo lugar." id="h-billing" title="Facturación" />)
    const heading = screen.getByRole("heading", { level: 2, name: "Facturación" })
    expect(heading).toHaveAttribute("id", "h-billing")
    expect(heading).toHaveClass("font-display", "text-title-1")
    expect(screen.getByText("Emití y cobrá desde un solo lugar.").tagName).toBe("P")
  })

  it("centrado por defecto; align=start a la izquierda", () => {
    const { container, rerender } = render(<SectionHeader title="Planes" />)
    const root = container.querySelector("[data-slot=section-header]")!
    expect(root).toHaveAttribute("data-align", "center")
    expect(root).toHaveClass("text-center")
    rerender(<SectionHeader align="start" title="Planes" />)
    expect(root).toHaveAttribute("data-align", "start")
    expect(root).not.toHaveClass("text-center")
  })

  it("level cambia el nivel sin cambiar el dibujo; sin descripción no hay <p>", () => {
    const { container } = render(<SectionHeader level={3} title="Clientes" />)
    expect(screen.getByRole("heading", { level: 3 })).toHaveClass("text-title-1")
    expect(container.querySelector("p")).toBeNull()
  })

  it("se renderiza en el servidor", () => {
    expect(renderToString(<SectionHeader title="Facturas" />)).toContain("<h2")
  })
})
