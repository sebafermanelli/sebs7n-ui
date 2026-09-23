import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Field, FieldLabel } from "../../src/components/field"
import { Input } from "../../src/components/input"
import { Label } from "../../src/components/label"
import { Textarea } from "../../src/components/textarea"

describe("Input", () => {
  it("tiene los estados de Geist: borde gray-400, hover gray-500, foco focus-border", () => {
    render(<Input placeholder="Nombre" />)
    expect(screen.getByPlaceholderText("Nombre")).toHaveClass(
      "border-gray-400",
      "bg-background-100",
      "placeholder:text-gray-700",
      "hover:border-gray-500",
      "focus:focus-border",
      "rounded-md"
    )
  })

  it("invalid: borde rojo y halo de error en foco", () => {
    render(<Input aria-invalid placeholder="Email" />)
    const input = screen.getByPlaceholderText("Email")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveClass("aria-invalid:border-red-800", "aria-invalid:focus:focus-border-error")
  })

  it("disabled: data-disabled + estilo Vercel", () => {
    render(<Input disabled placeholder="X" />)
    const input = screen.getByPlaceholderText("X")
    expect(input).toHaveAttribute("data-disabled")
    expect(input).toHaveClass("data-disabled:bg-gray-100", "data-disabled:text-gray-700")
  })

  it.each([
    ["sm", "data-[size=sm]:h-8"],
    ["md", "data-[size=md]:h-10"],
    ["lg", "data-[size=lg]:h-12"],
  ] as const)("size %s", (size, cls) => {
    render(<Input size={size} placeholder={size} />)
    const input = screen.getByPlaceholderText(size)
    expect(input).toHaveAttribute("data-size", size)
    expect(input).toHaveClass(cls)
  })

  it("lleva la clase peer para que Label se atenúe cuando está deshabilitado", () => {
    render(<Input placeholder="Nombre" />)
    expect(screen.getByPlaceholderText("Nombre")).toHaveClass("peer")
  })
})

describe("Textarea", () => {
  it("comparte los estados del Input", () => {
    render(<Textarea placeholder="Notas" />)
    expect(screen.getByPlaceholderText("Notas")).toHaveClass(
      "border-gray-400",
      "hover:border-gray-500",
      "focus:focus-border",
      "disabled:bg-gray-100",
      "aria-invalid:border-red-800"
    )
  })

  it("lleva la clase peer para que Label se atenúe cuando está deshabilitada", () => {
    render(<Textarea placeholder="Notas" />)
    expect(screen.getByPlaceholderText("Notas")).toHaveClass("peer")
  })

  // La regresión que motivó este test: era el único control del paquete
  // construido sobre un elemento nativo en vez de Base UI, así que adentro de un
  // `Field` se quedaba sin `name` y sin etiqueta. El formulario se veía bien y
  // el mensaje que escribía el usuario no se enviaba.
  it("adentro de un Field recibe el name y queda nombrado por la etiqueta", () => {
    render(
      <Field name="mensaje">
        <FieldLabel>Mensaje</FieldLabel>
        <Textarea />
      </Field>
    )
    const textarea = screen.getByLabelText("Mensaje")
    expect(textarea.tagName).toBe("TEXTAREA")
    expect(textarea).toHaveAttribute("name", "mensaje")
  })

  it("fuera de un Field sigue siendo un textarea común", () => {
    render(<Textarea name="notas" placeholder="Notas" />)
    const textarea = screen.getByPlaceholderText("Notas")
    expect(textarea.tagName).toBe("TEXTAREA")
    expect(textarea).toHaveAttribute("name", "notas")
  })
})

describe("Label", () => {
  it("usa label-12 y marca los requeridos con * rojo oculto al lector", () => {
    render(<Label htmlFor="n" required>Nombre</Label>)
    const label = screen.getByText("Nombre")
    expect(label).toHaveClass("text-label-12", "text-gray-1000")
    const star = label.querySelector("span")
    expect(star).toHaveTextContent("*")
    expect(star).toHaveAttribute("aria-hidden", "true")
    expect(star).toHaveClass("text-red-900")
  })
})
