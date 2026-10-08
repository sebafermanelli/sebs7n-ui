import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { WaitlistForm } from "../../src/components/waitlist-form"

const email = () => screen.getByRole("textbox", { name: /Email/ })

describe("WaitlistForm", () => {
  it("el email es obligatorio y válido, con mensajes en español, y no envía si falla", async () => {
    const onSubmit = vi.fn()
    render(<WaitlistForm onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole("button", { name: "Sumarme a la lista" }))
    expect(await screen.findByText("Escribí tu email")).toBeInTheDocument()
    await userEvent.type(email(), "no-es-un-email")
    await userEvent.click(screen.getByRole("button", { name: "Sumarme a la lista" }))
    expect(await screen.findByText("Revisá el email: falta algo")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("manda los valores (email y campos opcionales) y muestra el éxito en un status", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<WaitlistForm fields={[{ name: "team", label: "Nombre del equipo" }]} onSubmit={onSubmit} />)
    await userEvent.type(email(), "ana@ejemplo.com")
    await userEvent.type(screen.getByRole("textbox", { name: "Nombre del equipo" }), "Equipo Norte")
    await userEvent.click(screen.getByRole("button", { name: "Sumarme a la lista" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: "ana@ejemplo.com", team: "Equipo Norte" }))
    const status = await screen.findByRole("status")
    expect(status).toHaveTextContent("Listo, te anotamos")
  })

  it("mientras envía el botón queda en loading y bloquea el doble envío", async () => {
    let finish!: () => void
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    render(<WaitlistForm onSubmit={onSubmit} />)
    await userEvent.type(email(), "ana@ejemplo.com")
    await userEvent.click(screen.getByRole("button", { name: "Sumarme a la lista" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Sumarme a la lista" })).toHaveAttribute("data-loading"))
    finish()
    await screen.findByRole("status")
  })

  it("si el onSubmit falla muestra su mensaje en un alert y el formulario sigue editable", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("El servicio está caído."))
    render(<WaitlistForm onSubmit={onSubmit} />)
    await userEvent.type(email(), "ana@ejemplo.com")
    await userEvent.click(screen.getByRole("button", { name: "Sumarme a la lista" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("No pudimos anotarte")
    expect(alert).toHaveTextContent("El servicio está caído.")
    expect(email()).toHaveValue("ana@ejemplo.com")
  })

  it("status controla el estado desde afuera y gana al interno", () => {
    const { rerender } = render(<WaitlistForm error="Sin conexión." onSubmit={vi.fn()} status="error" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Sin conexión.")
    rerender(<WaitlistForm onSubmit={vi.fn()} status="success" success="Revisá tu casilla." />)
    expect(screen.getByRole("status")).toHaveTextContent("Revisá tu casilla.")
  })

  it("el consentimiento y el slot de Turnstile se dibujan; el honeypot no se ve ni se enfoca", () => {
    const { container } = render(
      <WaitlistForm consent="Al anotarte aceptás recibir un aviso." honeypot="website" onSubmit={vi.fn()} turnstile={<div data-testid="turnstile" />} />
    )
    expect(screen.getByText("Al anotarte aceptás recibir un aviso.")).toBeInTheDocument()
    expect(screen.getByTestId("turnstile")).toBeInTheDocument()
    const trap = container.querySelector<HTMLInputElement>("input[name=website]")!
    expect(trap.closest("[aria-hidden=true]")).not.toBeNull()
    expect(trap).toHaveAttribute("tabindex", "-1")
  })

  it("size lg por defecto, heredado por el botón y el campo (Form size)", () => {
    render(<WaitlistForm onSubmit={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Sumarme a la lista" })).toHaveClass("h-10")
    expect(email()).toHaveAttribute("data-size", "lg")
  })

  it("los textos se cambian con labels y el HTML del servidor trae el formulario", () => {
    const html = renderToString(<WaitlistForm labels={{ submit: "Join", email: "Email address" }} onSubmit={vi.fn()} />)
    expect(html).toContain("Join")
    expect(html).toContain("Email address")
  })
})
