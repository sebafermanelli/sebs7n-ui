import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { SettingsGrid, SettingsSection } from "../../src/components/settings-section"

describe("SettingsSection", () => {
  it("es una región nombrada por su título, con descripción, campos y pie", () => {
    render(
      <SettingsSection description="Cómo se llama." footer={<button type="button">Pie</button>} title="Perfil">
        <input aria-label="Nombre" />
      </SettingsSection>
    )
    const region = screen.getByRole("region", { name: "Perfil" })
    expect(region).toHaveAttribute("data-slot", "settings-section")
    expect(screen.getByText("Cómo se llama.")).toHaveAttribute("data-slot", "card-description")
    expect(region.querySelector("[data-slot=card-content]")).toContainElement(screen.getByLabelText("Nombre"))
    expect(region.querySelector("[data-slot=card-footer]")).toContainElement(screen.getByRole("button", { name: "Pie" }))
  })

  it("sin descripción ni pie no dibuja ninguno; con id, el título cuelga de él", () => {
    render(<SettingsSection id="empresa" title="Empresa">x</SettingsSection>)
    const region = screen.getByRole("region", { name: "Empresa" })
    expect(region).toHaveAttribute("id", "empresa")
    expect(region.querySelector("[data-slot=card-description]")).toBeNull()
    expect(region.querySelector("[data-slot=card-footer]")).toBeNull()
  })

  it("wide ocupa las dos columnas cuando la grilla las tiene (@3xl)", () => {
    render(<SettingsSection title="Ancha" wide>x</SettingsSection>)
    expect(screen.getByRole("region")).toHaveClass("@3xl:col-span-2")
  })

  it("el cuerpo tiene el mismo aire abajo que arriba y a los costados: nada lo pisa y la card sube el espaciado a 24", () => {
    render(
      <SettingsSection footer={<button type="button">Pie</button>} title="Aire">
        <input aria-label="Campo" />
      </SettingsSection>
    )
    const region = screen.getByRole("region", { name: "Aire" })
    const body = region.querySelector("[data-slot=card-content]")!
    expect(body).toHaveClass("p-(--card-spacing)")
    expect(body.className).not.toMatch(/(^|\s)(p[btylrx]?-0|pb-\d|py-\d|-mb-)/)
    expect(region.className).toContain("[--card-spacing:--spacing(6)]")
    expect(region.querySelector("[data-slot=card-footer]")).toHaveClass("pb-(--card-spacing)")
  })

  it("la grilla es 1 columna y 2 desde @3xl de su propio contenedor, con las filas compartidas", () => {
    render(
      <SettingsGrid data-testid="grid">
        <SettingsSection title="A">a</SettingsSection>
      </SettingsGrid>
    )
    expect(screen.getByTestId("grid")).toHaveClass("grid-cols-1", "@3xl:grid-cols-2")
    expect(screen.getByTestId("grid").parentElement).toHaveClass("@container")
    expect(screen.getByRole("region")).toHaveClass("grid-rows-subgrid")
  })

  it("se renderiza en el servidor, sin estado de cliente", () => {
    expect(renderToString(<SettingsSection title="Servidor">x</SettingsSection>)).toContain("Servidor")
  })
})
