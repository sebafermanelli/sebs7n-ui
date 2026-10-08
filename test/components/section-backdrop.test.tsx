import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SectionBackdrop } from "../../src/components/section-backdrop"

const layer = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-slot=section-backdrop-layer]")!

describe("SectionBackdrop", () => {
  it("la capa es decorativa: aria-hidden, sin puntero y detrás del contenido", () => {
    const { container, getByText } = render(<SectionBackdrop>hola</SectionBackdrop>)
    expect(layer(container)).toHaveAttribute("aria-hidden", "true")
    expect(layer(container)).toHaveClass("pointer-events-none", "-z-10")
    expect(getByText("hola")).toBeInTheDocument()
  })

  it("wash es la marca al 7 %, sin violeta ni glow", () => {
    const { container } = render(<SectionBackdrop variant="wash">x</SectionBackdrop>)
    const bg = layer(container).style.backgroundImage
    expect(bg).toContain("--sf-brand-700")
    expect(bg).toContain("7%")
    expect(bg).not.toMatch(/purple|violet|#[0-9a-f]{6}/i)
  })

  it("grid son filetes de 1 px con el token separator", () => {
    const { container } = render(<SectionBackdrop variant="grid">x</SectionBackdrop>)
    expect(layer(container).style.backgroundImage).toContain("var(--sf-separator) 1px")
  })

  it("grain es ruido al 5 %", () => {
    const { container } = render(<SectionBackdrop variant="grain">x</SectionBackdrop>)
    expect(layer(container).style.backgroundImage).toContain("feTurbulence")
    expect(layer(container).style.opacity).toBe("0.05")
  })

  it("el contenedor aísla el apilado", () => {
    const { container } = render(<SectionBackdrop>x</SectionBackdrop>)
    expect(container.firstElementChild).toHaveClass("isolate", "relative")
  })
})
