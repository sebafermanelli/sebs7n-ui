import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Field, FieldLabel } from "../../src/components/field"
import { PasswordInput, passwordStrength } from "../../src/components/password-input"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

afterEach(() => vi.restoreAllMocks())

const field = () => document.querySelector("input") as HTMLInputElement

describe("passwordStrength", () => {
  it.each([
    ["", 0],
    ["abc", 1],
    ["abcdefg", 1],
    ["abcdefgh", 1],
    ["abcdefg1", 2],
    ["Abcdefg1", 3],
    ["Abcdefg1!", 4],
    ["abcdefghijkl", 2],
    ["Abcdefghijk1!", 4],
  ] as const)("%j → %i", (password, level) => {
    expect(passwordStrength(password)).toBe(level)
  })
})

describe("PasswordInput", () => {
  it("es un campo de contraseña en la superficie de InputGroup, nombrado por su Field", () => {
    render(
      <Field>
        <FieldLabel>Contraseña</FieldLabel>
        <PasswordInput />
      </Field>
    )
    const input = screen.getByLabelText("Contraseña")
    expect(input).toHaveAttribute("type", "password")
    expect(input.closest("[data-slot=input-group]")).toHaveAttribute("data-size", "md")
  })

  it("el ojo es un botón de alternar: Tab llega, Enter muestra y oculta", async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Contraseña" defaultValue="secreta" />)
    const eye = screen.getByRole("button", { name: "Mostrar contraseña" })
    expect(eye).toHaveAttribute("aria-pressed", "false")
    await user.tab()
    expect(field()).toHaveFocus()
    await user.tab()
    expect(eye).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(eye).toHaveAttribute("aria-pressed", "true")
    expect(field()).toHaveAttribute("type", "text")
    await user.keyboard(" ")
    expect(field()).toHaveAttribute("type", "password")
  })

  it("strength: barra de 4 niveles con el nivel en texto y anunciado", async () => {
    const user = userEvent.setup()
    render(<PasswordInput aria-label="Contraseña nueva" strength />)
    const bar = screen.getByRole("meter", { name: "Seguridad" })
    expect(bar).toHaveAttribute("aria-valuemax", "4")
    expect(bar).toHaveAttribute("aria-valuenow", "0")
    expect(screen.getByRole("status")).toHaveTextContent("")
    await user.type(field(), "Abcdefg1")
    expect(bar).toHaveAttribute("aria-valuenow", "3")
    expect(bar).toHaveAttribute("aria-valuetext", "Buena")
    expect(screen.getByRole("status")).toHaveTextContent("Seguridad: Buena")
    expect(bar).toHaveClass("[&_[data-slot=meter-indicator]]:bg-green-700")
    await user.type(field(), "!")
    expect(screen.getByRole("status")).toHaveTextContent("Seguridad: Fuerte")
  })

  it("strength controlado sigue al value", () => {
    const { rerender } = render(<PasswordInput aria-label="Contraseña" onChange={() => {}} strength value="abc" />)
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "Débil")
    rerender(<PasswordInput aria-label="Contraseña" onChange={() => {}} strength value="abcdefg1" />)
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "Aceptable")
  })

  it("viaja en un form con su name, se vea o no", async () => {
    const user = userEvent.setup()
    render(
      <form data-testid="form">
        <PasswordInput aria-label="Contraseña" name="password" />
      </form>
    )
    await user.type(field(), "Abcdefg1")
    await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }))
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("password")).toBe("Abcdefg1")
  })

  it("disabled apaga el campo y el ojo", () => {
    render(<PasswordInput aria-label="Contraseña" disabled />)
    expect(field()).toBeDisabled()
    expect(screen.getByRole("button", { name: "Mostrar contraseña" })).toHaveAttribute("data-disabled")
  })

  it("los textos salen de LabelsProvider y la prop labels le gana", () => {
    render(
      <LabelsProvider value={{ passwordInput: { show: "Show password", strength: "Strength" } }}>
        <PasswordInput aria-label="Password" strength />
        <PasswordInput aria-label="PIN" labels={{ show: "Mostrar el PIN" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Strength" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Mostrar el PIN" })).toBeInTheDocument()
  })

  it("hidrata sin mismatch", async () => {
    const ui = <PasswordInput aria-label="Contraseña" defaultValue="Abcdefg1" strength />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
  })
})
