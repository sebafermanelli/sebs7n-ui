import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "../../src/components/button"
import { Checkbox } from "../../src/components/checkbox"
import { Form } from "../../src/components/form"
import { Input } from "../../src/components/input"
import { Select, SelectTrigger, SelectValue } from "../../src/components/select"
import { ControlSizeProvider } from "../../src/lib/control-size"

describe("Form size", () => {
  it("los controles de adentro heredan el size del Form; el que declara el suyo gana", () => {
    render(
      <Form size="lg">
        <Input aria-label="Cliente" />
        <Input aria-label="CUIT" size="sm" />
        <Select>
          <SelectTrigger aria-label="Moneda">
            <SelectValue />
          </SelectTrigger>
        </Select>
        <Checkbox aria-label="Enviar por email" />
        <Button type="submit">Emitir factura</Button>
      </Form>
    )
    expect(screen.getByLabelText("Cliente")).toHaveAttribute("data-size", "lg")
    expect(screen.getByLabelText("CUIT")).toHaveAttribute("data-size", "sm")
    expect(screen.getByRole("combobox", { name: "Moneda" })).toHaveAttribute("data-size", "lg")
    expect(screen.getByRole("checkbox", { name: "Enviar por email" })).toHaveAttribute("data-size", "lg")
    expect(screen.getByRole("button", { name: "Emitir factura" })).toHaveAttribute("data-size", "lg")
  })

  it("sin size el Form no impone nada: cada control usa su default", () => {
    render(
      <Form>
        <Input aria-label="Cliente" />
        <Checkbox aria-label="Enviar" />
        <Button>Guardar</Button>
      </Form>
    )
    expect(screen.getByLabelText("Cliente")).toHaveAttribute("data-size", "md")
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-size", "md")
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "md")
  })

  it("ControlSizeProvider público: el mismo contexto fuera de un Form", () => {
    render(
      <ControlSizeProvider size="lg">
        <Input aria-label="Monto" />
      </ControlSizeProvider>
    )
    expect(screen.getByLabelText("Monto")).toHaveAttribute("data-size", "lg")
  })
})
