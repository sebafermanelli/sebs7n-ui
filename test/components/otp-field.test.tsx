import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import { Field, FieldError, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { OTPField } from "../../src/components/otp-field"

/** Las casillas visibles. El input con el valor completo es `aria-hidden`, así que no entra acá. */
const casillas = () => screen.getAllByRole("textbox")

describe("OTPField", () => {
  it("dibuja seis casillas por defecto y las que le pidas", () => {
    const { unmount } = render(<OTPField aria-label="Código" />)
    expect(casillas()).toHaveLength(6)
    unmount()

    render(<OTPField aria-label="Código" length={4} />)
    expect(casillas()).toHaveLength(4)
  })

  it("al tipear seis dígitos el valor que sale es el código entero, no seis pedazos", async () => {
    const onValueChange = vi.fn()
    render(<OTPField aria-label="Código" onValueChange={onValueChange} />)

    await userEvent.type(casillas()[0]!, "482913")

    expect(onValueChange).toHaveBeenCalledTimes(6)
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("482913")
    // Cada casilla muestra su dígito: el foco fue solo, sin que la demo lo empuje.
    expect(casillas().map((casilla) => (casilla as HTMLInputElement).value)).toEqual(["4", "8", "2", "9", "1", "3"])
  })

  it("pegar el código lo reparte entre las casillas", async () => {
    const onValueComplete = vi.fn()
    render(<OTPField aria-label="Código" onValueComplete={onValueComplete} />)

    await userEvent.click(casillas()[0]!)
    await userEvent.paste("482913")

    expect(casillas().map((casilla) => (casilla as HTMLInputElement).value)).toEqual(["4", "8", "2", "9", "1", "3"])
    expect(onValueComplete).toHaveBeenCalledWith("482913", expect.anything())
  })

  it("Backspace borra el dígito y retrocede de casilla", async () => {
    render(<OTPField aria-label="Código" />)

    await userEvent.type(casillas()[0]!, "482913")
    await userEvent.keyboard("{Backspace}{Backspace}")

    expect(casillas().map((casilla) => (casilla as HTMLInputElement).value)).toEqual(["4", "8", "2", "9", "", ""])
    // El foco quedó donde sigue escribiendo la persona, no en la casilla que borró.
    expect(document.activeElement).toBe(casillas()[3])
  })

  it("las flechas se mueven entre casillas sin tocar el valor", async () => {
    render(<OTPField aria-label="Código" />)

    await userEvent.type(casillas()[0]!, "4829")
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(document.activeElement).toBe(casillas()[2])

    await userEvent.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(casillas()[3])
    expect(casillas().map((casilla) => (casilla as HTMLInputElement).value)).toEqual(["4", "8", "2", "9", "", ""])
  })

  it("la primera casilla pide el código del SMS y el teclado numérico", () => {
    render(<OTPField aria-label="Código" />)
    const [primera, segunda] = casillas() as HTMLInputElement[]

    // `one-time-code` va en la primera casilla: es la que el sistema operativo
    // mira para ofrecer el código que acaba de llegar.
    expect(primera).toHaveAttribute("autocomplete", "one-time-code")
    expect(primera).toHaveAttribute("inputmode", "numeric")
    // En las demás sería una trampa: el autorrelleno las pisaría de a una.
    expect(segunda).toHaveAttribute("autocomplete", "off")
  })

  it("adentro de un Field queda nombrado por la etiqueta, sin cablear nada", () => {
    render(
      <Field name="codigo">
        <FieldLabel>Código de verificación</FieldLabel>
        <OTPField />
      </Field>
    )

    // El campo entero se anuncia como un grupo con nombre, no como seis campos
    // sueltos, y cada casilla hereda ese nombre.
    expect(screen.getByRole("group", { name: "Código de verificación" })).toBeInTheDocument()
    expect(screen.getAllByRole("textbox", { name: "Código de verificación" })).toHaveLength(6)
  })

  it("el submit entrega el código completo bajo el name del campo", async () => {
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="codigo">
          <FieldLabel>Código</FieldLabel>
          <OTPField />
        </Field>
        <Button type="submit">Verificar</Button>
      </Form>
    )

    await userEvent.type(casillas()[0]!, "482913")
    await userEvent.click(screen.getByRole("button", { name: "Verificar" }))

    expect(onFormSubmit).toHaveBeenCalledOnce()
    expect(onFormSubmit.mock.calls[0]?.[0]).toEqual({ codigo: "482913" })
  })

  it("un código incompleto no pasa el required: el campo entero es lo que se valida", async () => {
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="codigo">
          <FieldLabel>Código</FieldLabel>
          <OTPField required />
          <FieldError />
        </Field>
        <Button type="submit">Verificar</Button>
      </Form>
    )

    await userEvent.type(casillas()[0]!, "482")
    await userEvent.click(screen.getByRole("button", { name: "Verificar" }))

    expect(onFormSubmit).not.toHaveBeenCalled()
    // Tres dígitos de seis no es un código: el `required` y el largo los valida
    // el input escondido que lleva el valor entero, no cada casilla.
    for (const casilla of casillas()) expect(casilla).toHaveAttribute("data-invalid")
    expect(await screen.findByText(/./, { selector: "[data-slot=field-error]" })).toBeInTheDocument()
  })

  it("inválido: todas las casillas se marcan, no solo la que tiene el foco", () => {
    render(
      <Field invalid name="codigo">
        <FieldLabel>Código</FieldLabel>
        <OTPField />
      </Field>
    )

    for (const casilla of casillas()) {
      expect(casilla).toHaveAttribute("aria-invalid", "true")
      expect(casilla).toHaveClass("aria-invalid:border-red-800", "aria-invalid:focus:focus-border-error")
    }
  })

  it("deshabilitado: data-disabled y el estilo de Geist, igual que Input", () => {
    render(<OTPField aria-label="Código" disabled />)

    for (const casilla of casillas()) {
      expect(casilla).toHaveAttribute("data-disabled")
      expect(casilla).toHaveClass("data-disabled:bg-gray-100", "data-disabled:text-gray-700")
    }
  })

  it("comparte el borde, el radio y el foco de Input", () => {
    render(<OTPField aria-label="Código" />)
    expect(casillas()[0]).toHaveClass(
      "border-gray-400",
      "bg-background-100",
      "hover:border-gray-500",
      "focus:focus-border",
      "rounded-md"
    )
  })

  it.each([
    ["sm", "data-[size=sm]:size-8"],
    ["md", "data-[size=md]:size-10"],
    ["lg", "data-[size=lg]:size-12"],
  ] as const)("size %s", (size, cls) => {
    render(<OTPField aria-label="Código" size={size} />)
    const casilla = casillas()[0]!
    expect(casilla).toHaveAttribute("data-size", size)
    expect(casilla).toHaveClass(cls)
  })
})
