import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "../../src/components/field"
import { Fieldset, FieldsetLegend } from "../../src/components/fieldset"
import { Form } from "../../src/components/form"
import { Input } from "../../src/components/input"

describe("Field", () => {
  it("nombra al control con la etiqueta sin que nadie escriba un id", () => {
    render(
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input />
      </Field>
    )
    // Esto es todo el punto del componente: sin htmlFor, sin useId, y el
    // control igual tiene nombre accesible.
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("la ayuda queda como descripción del control, no como texto suelto", () => {
    render(
      <Field name="cuit">
        <FieldLabel>CUIT</FieldLabel>
        <Input />
        <FieldDescription>Sin guiones</FieldDescription>
      </Field>
    )
    expect(screen.getByLabelText("CUIT")).toHaveAccessibleDescription("Sin guiones")
  })

  it("el asterisco de required es decorativo: no se lee dos veces", () => {
    render(
      <Field name="razon">
        <FieldLabel required>Razón social</FieldLabel>
        <Input required />
      </Field>
    )
    // El asterisco está dentro de la etiqueta pero es `aria-hidden`, así que el
    // nombre accesible es la etiqueta sola: un lector de pantalla no lee
    // "Razón social asterisco". Que el campo es obligatorio lo anuncia el
    // `required` del control.
    const input = screen.getByRole("textbox")
    expect(input).toHaveAccessibleName("Razón social")
    expect(input).toBeRequired()
  })

  it("no muestra el error mientras el campo está bien", () => {
    render(
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input />
        <FieldError />
      </Field>
    )
    expect(screen.queryByText(/./, { selector: "[data-slot=field-error]" })).toBeNull()
  })

  it("valida con la función del campo y muestra el mensaje al salir del input", async () => {
    render(
      <Field name="email" validate={(valor) => (String(valor).includes("@") ? null : "Revisá el email")} validationMode="onBlur">
        <FieldLabel>Email</FieldLabel>
        <Input />
        <FieldError />
      </Field>
    )

    const input = screen.getByLabelText("Email")
    await userEvent.type(input, "no-es-un-email")
    await userEvent.tab()

    expect(await screen.findByText("Revisá el email")).toBeInTheDocument()
    expect(input).toHaveAttribute("aria-invalid", "true")
    // El error también describe al control: un lector de pantalla lo anuncia al
    // volver al campo, sin tener que buscarlo por la pantalla.
    expect(input).toHaveAccessibleDescription("Revisá el email")
  })

  it("cuando hay más de un error los muestra como lista, no como una frase pegada", async () => {
    render(
      <Field
        name="password"
        validate={() => ["Mínimo 8 caracteres", "Le falta un número"]}
        validationMode="onBlur"
      >
        <FieldLabel>Contraseña</FieldLabel>
        <Input />
        <FieldError />
      </Field>
    )

    await userEvent.type(screen.getByLabelText("Contraseña"), "corta")
    await userEvent.tab()

    const error = await screen.findByText("Mínimo 8 caracteres")
    expect(error.tagName).toBe("LI")
    expect(screen.getByText("Le falta un número").tagName).toBe("LI")
  })
})

describe("Fieldset", () => {
  it("agrupa los campos bajo un nombre accesible", () => {
    render(
      <Fieldset>
        <FieldsetLegend>Domicilio fiscal</FieldsetLegend>
        <Field name="calle">
          <FieldLabel>Calle</FieldLabel>
          <Input />
        </Field>
      </Fieldset>
    )
    expect(screen.getByRole("group", { name: "Domicilio fiscal" })).toBeInTheDocument()
  })

  it("apaga de una todos los campos de adentro", () => {
    render(
      <Fieldset disabled>
        <FieldsetLegend>Domicilio fiscal</FieldsetLegend>
        <Field name="calle">
          <FieldLabel>Calle</FieldLabel>
          <Input />
        </Field>
      </Fieldset>
    )
    expect(screen.getByLabelText("Calle")).toBeDisabled()
  })
})

describe("Form", () => {
  it("entrega los valores juntados por name, sin FormData a mano", async () => {
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input />
        </Field>
        <Button type="submit">Enviar</Button>
      </Form>
    )

    await userEvent.type(screen.getByLabelText("Email"), "hola@acme.com")
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }))

    expect(onFormSubmit).toHaveBeenCalledOnce()
    expect(onFormSubmit.mock.calls[0]?.[0]).toEqual({ email: "hola@acme.com" })
  })

  it("muestra en el campo el error que solo conoce el servidor", async () => {
    function Alta() {
      const [errors, setErrors] = useState({})
      return (
        <Form errors={errors} onFormSubmit={() => setErrors({ email: "Ese email ya está usado" })}>
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input />
            <FieldError />
          </Field>
          <Button type="submit">Crear cuenta</Button>
        </Form>
      )
    }
    render(<Alta />)

    await userEvent.type(screen.getByLabelText("Email"), "tomado@acme.com")
    await userEvent.click(screen.getByRole("button", { name: "Crear cuenta" }))

    expect(await screen.findByText("Ese email ya está usado")).toBeInTheDocument()
  })

  it("no llama al submit si un campo no pasa su propia validación", async () => {
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input required />
          <FieldError />
        </Field>
        <Button type="submit">Enviar</Button>
      </Form>
    )

    await userEvent.click(screen.getByRole("button", { name: "Enviar" }))

    expect(onFormSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
  })
})
