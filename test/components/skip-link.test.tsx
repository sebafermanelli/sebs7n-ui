import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LabelsProvider } from "../../src/lib/labels"
import { SkipLink } from "../../src/components/skip-link"

describe("SkipLink", () => {
  it("es un link a #main con el texto del sistema, oculto hasta el foco", () => {
    render(<SkipLink />)
    const link = screen.getByRole("link", { name: "Ir al contenido" })
    expect(link).toHaveAttribute("href", "#main")
    expect(link).toHaveClass("sr-only", "focus-visible:not-sr-only", "focus-visible:focus-ring")
  })

  it("es la primera parada de Tab", async () => {
    render(
      <>
        <SkipLink href="#contenido" />
        <button type="button">otro</button>
      </>
    )
    await userEvent.tab()
    expect(screen.getByRole("link", { name: "Ir al contenido" })).toHaveFocus()
  })

  it("el texto se traduce con LabelsProvider", () => {
    render(
      <LabelsProvider value={{ appShell: { openMenu: "", navigation: "", skipToContent: "Skip to content" } }}>
        <SkipLink />
      </LabelsProvider>
    )
    expect(screen.getByRole("link", { name: "Skip to content" })).toBeInTheDocument()
  })
})
