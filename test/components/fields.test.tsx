import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Field, FieldLabel } from "../../src/components/field"
import { Input } from "../../src/components/input"
import { Label } from "../../src/components/label"
import { Textarea } from "../../src/components/textarea"

describe("Input", () => {
  it("tiene los estados del sistema: borde alfa, hover más marcado, foco focus-border", () => {
    render(<Input placeholder="Nombre" />)
    expect(screen.getByPlaceholderText("Nombre")).toHaveClass(
      "border-transparent",
      "bg-fill-1",
      "placeholder:text-label-secondary",
      "focus:focus-border",
      "rounded-field",
      "px-3"
    )
  })

  it("el padding es una clase plana por tamaño: un pl-* del llamador le gana", () => {
    render(
      <>
        <Input placeholder="chico" size="sm" />
        <Input className="pl-9" placeholder="con lupa" size="sm" />
      </>
    )
    expect(screen.getByPlaceholderText("chico")).toHaveClass("px-2.5")
    const conLupa = screen.getByPlaceholderText("con lupa")
    expect(conLupa).toHaveClass("pl-9")
    // Ni una variante por tamaño que le gane por especificidad.
    expect(conLupa.className).not.toMatch(/data-\[size=(sm|lg)\]:p[xl]-/)
  })

  it("Textarea no es una cápsula: su radio se frena en 16px", () => {
    render(<Textarea placeholder="Notas" />)
    const notas = screen.getByPlaceholderText("Notas")
    expect(notas).toHaveClass("rounded-[min(var(--radius-field),--spacing(4))]")
    // tailwind-merge tiene que haber sacado el de la base: con los dos, gana el que Tailwind
    // haya emitido último.
    expect(notas).not.toHaveClass("rounded-field")
  })

  it("invalid: borde rojo y halo de error en foco", () => {
    render(<Input aria-invalid placeholder="Email" />)
    const input = screen.getByPlaceholderText("Email")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveClass("aria-invalid:border-red-800", "aria-invalid:focus:focus-border-error")
  })

  // R4: apagado a .4, como todo control de iCloud: el campo se sigue viendo como el mismo campo.
  it("disabled: data-disabled y opacidad .4", () => {
    render(<Input disabled placeholder="X" />)
    const input = screen.getByPlaceholderText("X")
    expect(input).toHaveAttribute("data-disabled")
    expect(input).toHaveClass("data-disabled:opacity-40")
    expect(input.className).not.toMatch(/data-disabled:(bg|text|border)-/)
  })

  it.each([
    ["sm", "data-[size=sm]:h-7"],
    ["md", "data-[size=md]:h-9"],
    ["lg", "data-[size=lg]:h-10"],
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
      "border-transparent",
      "focus:focus-border",
      "disabled:opacity-40",
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

  // `Field.Control` tipa sus props contra un <input>, así que la primera versión
  // de este arreglo dejó de aceptar `rows` y rompió el build de una app.
  it("acepta las props propias del textarea y las lleva al DOM", () => {
    render(<Textarea cols={40} placeholder="Notas" rows={5} />)
    const textarea = screen.getByPlaceholderText("Notas")
    expect(textarea).toHaveAttribute("rows", "5")
    expect(textarea).toHaveAttribute("cols", "40")
  })

  it("fuera de un Field sigue siendo un textarea común", () => {
    render(<Textarea name="notas" placeholder="Notas" />)
    const textarea = screen.getByPlaceholderText("Notas")
    expect(textarea.tagName).toBe("TEXTAREA")
    expect(textarea).toHaveAttribute("name", "notas")
  })
})

describe("Label", () => {
  it("usa el rol callout y marca los requeridos con * rojo oculto al lector", () => {
    render(<Label htmlFor="n" required>Nombre</Label>)
    const label = screen.getByText("Nombre")
    expect(label).toHaveClass("text-callout", "text-label")
    const star = label.querySelector("span")
    expect(star).toHaveTextContent("*")
    expect(star).toHaveAttribute("aria-hidden", "true")
    expect(star).toHaveClass("text-danger-ink")
  })
})
