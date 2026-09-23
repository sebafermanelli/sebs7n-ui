import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { HoverCard, HoverCardContent, HoverCardHeader, HoverCardTrigger } from "../../src/components/hover-card"

function Ficha(props: React.ComponentProps<typeof HoverCardTrigger>) {
  return (
    <HoverCard>
      <HoverCardTrigger href="/clientes/acme" {...props}>
        Acme S.A.
      </HoverCardTrigger>
      <HoverCardContent>
        <HoverCardHeader>
          <span>Acme S.A.</span>
        </HoverCardHeader>
        <p>12 facturas · $ 1.284.000 · última el 01/09</p>
      </HoverCardContent>
    </HoverCard>
  )
}

const panel = () => document.querySelector("[data-slot=hover-card-content]")

describe("HoverCard", () => {
  it("el trigger es un link de verdad, no un botón", () => {
    render(<Ficha />)
    const trigger = screen.getByRole("link", { name: "Acme S.A." })
    expect(trigger.tagName).toBe("A")
    expect(trigger).toHaveAttribute("href", "/clientes/acme")
  })

  it("abre al pasar el mouse y cierra al salir", async () => {
    render(<Ficha closeDelay={0} delay={0} />)
    const trigger = screen.getByRole("link", { name: "Acme S.A." })
    expect(panel()).toBeNull()

    await userEvent.hover(trigger)
    expect(await screen.findByText("12 facturas · $ 1.284.000 · última el 01/09")).toBeInTheDocument()

    await userEvent.unhover(trigger)
    await waitFor(() => expect(panel()).toBeNull())
  })

  it("también abre con el foco del teclado", async () => {
    render(<Ficha closeDelay={0} delay={0} />)
    await userEvent.tab()
    expect(screen.getByRole("link", { name: "Acme S.A." })).toHaveFocus()
    await waitFor(() => expect(panel()).not.toBeNull())
  })

  it("Escape cierra y deja el foco en el trigger", async () => {
    render(<Ficha closeDelay={0} delay={0} />)
    const trigger = screen.getByRole("link", { name: "Acme S.A." })
    await userEvent.tab()
    await waitFor(() => expect(panel()).not.toBeNull())
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(panel()).toBeNull())
    expect(trigger).toHaveFocus()
  })

  it("el retardo por defecto es 600ms para abrir y 300ms para cerrar", async () => {
    render(<Ficha />)
    const trigger = screen.getByRole("link", { name: "Acme S.A." })
    await userEvent.hover(trigger)
    // Sin esperar el retardo, la tarjeta no está: no se dispara al pasar de largo.
    expect(panel()).toBeNull()
    await waitFor(() => expect(panel()).not.toBeNull(), { timeout: 2000 })
  })

  it("es una superficie flotante del sistema: background-100, shadow-menu y sin borde", async () => {
    render(<Ficha closeDelay={0} delay={0} />)
    await userEvent.hover(screen.getByRole("link", { name: "Acme S.A." }))
    await waitFor(() => expect(panel()).not.toBeNull())
    expect(panel()).toHaveClass("bg-background-100", "shadow-menu", "rounded-xl", "text-copy-14")
    expect(panel()!.className).not.toMatch(/\bborder\b/)
    expect(panel()).toHaveClass("data-starting-style:opacity-0", "data-ending-style:opacity-0", "motion-reduce:transition-none")
  })

  it("el className del llamador le gana a la clase base", async () => {
    render(
      <HoverCard>
        <HoverCardTrigger closeDelay={0} delay={0} href="/x">
          Ver
        </HoverCardTrigger>
        <HoverCardContent className="w-96 rounded-md">contenido</HoverCardContent>
      </HoverCard>
    )
    await userEvent.hover(screen.getByRole("link", { name: "Ver" }))
    await waitFor(() => expect(panel()).not.toBeNull())
    expect(panel()).toHaveClass("w-96", "rounded-md")
    expect(panel()!.className).not.toMatch(/\bw-72\b/)
    expect(panel()!.className).not.toMatch(/\brounded-xl\b/)
  })
})
