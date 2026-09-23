import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "../../src/components/button"
import { Spinner } from "../../src/components/spinner"

describe("Spinner", () => {
  it("sin label es decoración: aria-hidden y sin rol", () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector("[data-slot=spinner]")!
    expect(spinner).toHaveAttribute("aria-hidden", "true")
    expect(spinner).not.toHaveAttribute("role")
    expect(spinner).not.toHaveAttribute("aria-label")
  })

  it("con label es una región de estado con nombre", () => {
    render(<Spinner label="Guardando" />)
    expect(screen.getByRole("status", { name: "Guardando" })).toHaveAttribute("data-slot", "spinner")
  })

  it("tamaños 16/20/24 y el color sale de currentColor, no de una prop", () => {
    const { container } = render(
      <>
        <Spinner data-testid="sm" size="sm" />
        <Spinner data-testid="md" />
        <Spinner data-testid="lg" size="lg" />
      </>
    )
    expect(screen.getByTestId("sm")).toHaveClass("size-4")
    expect(screen.getByTestId("md")).toHaveClass("size-5")
    expect(screen.getByTestId("lg")).toHaveClass("size-6")
    for (const spinner of container.querySelectorAll("[data-slot=spinner]")) {
      expect(spinner.getAttribute("stroke")).toBe("currentColor")
      expect(spinner.getAttribute("class")).not.toMatch(/text-(gray|brand)-/)
    }
  })

  it("con movimiento reducido se queda quieto, no se esconde", () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector("[data-slot=spinner]")!
    expect(spinner).toHaveClass("animate-spin", "motion-reduce:animate-none")
    // Lo que no puede pasar: que la única señal de carga desaparezca.
    expect(spinner.getAttribute("class")).not.toMatch(/motion-reduce:hidden|motion-reduce:opacity-0/)
  })

  it("el className del llamador gana sobre el tamaño", () => {
    render(<Spinner className="size-10" data-testid="s" />)
    const spinner = screen.getByTestId("s")
    expect(spinner).toHaveClass("size-10")
    expect(spinner).not.toHaveClass("size-5")
  })
})

describe("Button loading", () => {
  it("usa el Spinner del sistema, oculto al lector, y el botón dice que está ocupado", () => {
    render(<Button loading>Guardar</Button>)
    const button = screen.getByRole("button", { name: "Guardar" })
    expect(button).toHaveAttribute("aria-busy", "true")
    const spinner = button.querySelector("[data-slot=button-spinner]")!
    expect(spinner).toHaveAttribute("data-slot", "button-spinner")
    expect(spinner).toHaveAttribute("aria-hidden", "true")
    expect(spinner).toHaveClass("animate-spin", "size-4", "absolute")
  })

  it("en los tamaños grandes el spinner sube a 20px, como antes de unificarlo", () => {
    render(
      <Button loading size="lg">
        Guardar
      </Button>
    )
    expect(screen.getByRole("button").querySelector("[data-slot=button-spinner]")).toHaveClass("size-5")
  })
})
