import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../../src/components/input-group"
import { Kbd } from "../../src/components/kbd"

const grupo = () => document.querySelector("[data-slot=input-group]") as HTMLElement

describe("InputGroup", () => {
  it("un campo con lo de antes y lo de después adentro de la misma superficie", () => {
    render(
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput aria-label="Importe" />
        <InputGroupAddon>ARS</InputGroupAddon>
      </InputGroup>
    )
    const input = screen.getByRole("textbox", { name: "Importe" })
    // La superficie (relleno, radio 10, alto) es el grupo; el input es transparente.
    expect(grupo()).toHaveClass("rounded-field", "bg-fill-1", "data-[size=md]:h-9")
    expect(grupo()).toHaveAttribute("data-size", "md")
    expect(input).toHaveClass("bg-transparent")
    expect(grupo().textContent).toBe("$ARS")
  })

  it("el foco se dibuja en el grupo, con el anillo interior de iCloud", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Dominio" />
        <InputGroupAddon>.com</InputGroupAddon>
      </InputGroup>
    )
    expect(grupo()).toHaveClass("has-[input:focus]:focus-border")
    expect(screen.getByRole("textbox")).toHaveClass("outline-none")
  })

  it("un click en un addon de texto o ícono enfoca el campo", async () => {
    render(
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon data-testid="lupa" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Buscar facturas" />
      </InputGroup>
    )
    await userEvent.click(screen.getByTestId("lupa"))
    expect(screen.getByRole("textbox")).toHaveFocus()
  })

  it("un botón adentro: su propio click, sin robarle el comportamiento al campo", async () => {
    const onClick = vi.fn()
    render(
      <InputGroup>
        <InputGroupInput aria-label="Cupón" />
        <InputGroupAddon>
          <InputGroupButton onClick={onClick}>Aplicar</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    )
    const boton = screen.getByRole("button", { name: "Aplicar" })
    expect(boton).toHaveAttribute("type", "button")
    await userEvent.click(boton)
    expect(onClick).toHaveBeenCalledOnce()
    // El botón es la parada de Tab que sigue al campo.
    screen.getByRole("textbox").focus()
    await userEvent.tab()
    expect(boton).toHaveFocus()
  })

  it("tamaños: 28, 36 y 40, con el botón de adentro a escala", () => {
    const { rerender } = render(
      <InputGroup size="sm">
        <InputGroupInput aria-label="Cantidad" />
        <InputGroupAddon>
          <InputGroupButton aria-label="Borrar">×</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    )
    expect(grupo()).toHaveAttribute("data-size", "sm")
    expect(screen.getByRole("button")).toHaveClass("group-data-[size=sm]/input-group:h-5")
    rerender(
      <InputGroup size="lg">
        <InputGroupInput aria-label="Cantidad" />
      </InputGroup>
    )
    expect(grupo()).toHaveAttribute("data-size", "lg")
  })

  it("un atajo con Kbd en el addon", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Buscar" />
        <InputGroupAddon>
          <Kbd size="sm">⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    )
    expect(screen.getByText("⌘K").tagName).toBe("KBD")
  })

  it("disabled apaga el campo, los botones y la superficie", () => {
    render(
      <InputGroup disabled>
        <InputGroupInput aria-label="Importe" />
        <InputGroupAddon>
          <InputGroupButton>Aplicar</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    )
    expect(screen.getByRole("textbox")).toBeDisabled()
    expect(screen.getByRole("button")).toBeDisabled()
    expect(grupo()).toHaveAttribute("data-disabled")
  })

  it("con el dedo el botón crece con el campo (36 → 44 y 28 → 36)", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Cupón" />
        <InputGroupAddon>
          <InputGroupButton>Aplicar</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    )
    expect(screen.getByRole("button")).toHaveClass(
      "pointer-coarse:group-data-[size=md]/input-group:h-9",
      "pointer-coarse:group-data-[size=sm]/input-group:h-7"
    )
  })

  it("inválido: el borde rojo lo pone el grupo cuando el input lo declara", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-invalid aria-label="CUIT" />
      </InputGroup>
    )
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
    expect(grupo()).toHaveClass("has-[input[aria-invalid=true]]:border-red-800")
  })
})

describe("InputGroupButton loading", () => {
  it("como Button: spinner, aria-busy, no dispara el clic y conserva el ancho", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <InputGroup>
        <InputGroupInput aria-label="Cupón" />
        <InputGroupAddon>
          <InputGroupButton loading onClick={onClick} variant="plain">
            Aplicar
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    )
    const button = screen.getByRole("button", { name: "Aplicar" })
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toHaveAttribute("data-loading", "")
    expect(button).toHaveClass("relative")
    expect(button.querySelector("[data-slot=input-group-button-spinner]")).not.toBeNull()
    expect(screen.getByText("Aplicar")).toHaveClass("opacity-0")
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("sin loading, el clic pasa y no hay spinner", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <InputGroup>
        <InputGroupButton onClick={onClick}>Aplicar</InputGroupButton>
      </InputGroup>
    )
    await user.click(screen.getByRole("button", { name: "Aplicar" }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(document.querySelector("[data-slot=input-group-button-spinner]")).toBeNull()
  })
})
