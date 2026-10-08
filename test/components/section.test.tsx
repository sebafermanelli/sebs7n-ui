import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Section } from "../../src/components/section"

describe("Section", () => {
  it("default: sin fondo, columna de 1080 px", () => {
    const { container } = render(<Section>hola</Section>)
    const section = container.querySelector("section")!
    expect(section).toHaveAttribute("data-variant", "default")
    expect(section.className).not.toContain("bg-grouped")
    expect((section.firstElementChild as HTMLElement).style.maxWidth).toBe("1080px")
  })

  it("grouped: franja a todo el ancho con filetes y la columna acotada por maxWidth", () => {
    const { container } = render(
      <Section aria-label="Seguridad" maxWidth="720px" variant="grouped">
        x
      </Section>
    )
    const section = container.querySelector("section")!
    expect(section).toHaveClass("w-full", "bg-grouped", "border-y", "border-separator")
    expect((section.firstElementChild as HTMLElement).style.maxWidth).toBe("720px")
  })

  it("con nombre es una región y deja scroll-mt para las anclas", () => {
    const { getByRole } = render(<Section aria-label="Seguridad">x</Section>)
    expect(getByRole("region", { name: "Seguridad" })).toHaveClass("scroll-mt-20")
  })
})
