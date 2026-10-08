import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { WindowFrame } from "../../src/components/window-frame"

describe("WindowFrame", () => {
  it("la barra es decorativa y el título nombra el grupo", () => {
    const { container } = render(<WindowFrame title="Facturas">contenido</WindowFrame>)
    const group = screen.getByRole("group", { name: "Facturas" })
    expect(group).toHaveTextContent("contenido")
    expect(container.querySelector("[data-slot=window-frame-bar]")).toHaveAttribute("aria-hidden", "true")
  })

  it("sin título no inventa un grupo", () => {
    render(<WindowFrame>x</WindowFrame>)
    expect(screen.queryByRole("group")).toBeNull()
  })

  it("la sombra sale del set chico y los puntos son neutros", () => {
    const { container, rerender } = render(<WindowFrame title="A">x</WindowFrame>)
    const frame = container.firstElementChild!
    expect(frame).toHaveClass("shadow-menu")
    rerender(<WindowFrame elevation="resting" title="A">x</WindowFrame>)
    expect(container.firstElementChild).toHaveClass("shadow-widget")
    rerender(<WindowFrame elevation="overlay" title="A">x</WindowFrame>)
    expect(container.firstElementChild).toHaveClass("shadow-modal")
    const dots = container.querySelectorAll("[data-slot=window-frame-controls] > span")
    expect(dots).toHaveLength(3)
    dots.forEach((dot) => expect(dot).toHaveClass("bg-fill-3"))
  })

  it("controls={false} saca los puntos y bar reemplaza el título", () => {
    const { container } = render(
      <WindowFrame bar={<span>pestañas</span>} controls={false} title="A">
        x
      </WindowFrame>
    )
    expect(container.querySelectorAll("[data-slot=window-frame-controls] > span")).toHaveLength(0)
    expect(screen.getByText("pestañas")).toBeInTheDocument()
  })

  it("sirve en el servidor (sin hooks de cliente)", () => {
    expect(renderToString(<WindowFrame title="Facturas">x</WindowFrame>)).toContain('data-slot="window-frame"')
  })
})
