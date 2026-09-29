// `internal/field-control`: el enganche de los controles propios con `Field` y `Form`. Un control
// mínimo (un botón que suma 1) prueba cada comportamiento por separado, para que cada test rompa si
// se saca la línea que lo sostiene.
import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Field, FieldError, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { ToggleGroup, ToggleGroupItem } from "../../src/components/toggle-group"
import { useFieldControl } from "../../src/internal/field-control"

function Counter({ initial = 0, disabled }: { initial?: number; disabled?: boolean }) {
  const [value, setValue] = React.useState(initial)
  const button = React.useRef<HTMLButtonElement>(null)
  const field = useFieldControl({ value, filled: value > 0, disabled, controlRef: button })
  return (
    <button
      ref={button}
      type="button"
      id={field.id}
      disabled={field.disabled}
      aria-invalid={field.invalid || undefined}
      onClick={() => setValue((v) => v + 1)}
      onFocus={field.onFocus}
      onBlur={field.onBlur}
    >
      Sumar {value}
    </button>
  )
}

const atLeastTwo = (value: unknown) => ((value as number) >= 2 ? null : "Al menos 2.")

function root() {
  return document.querySelector<HTMLElement>("[data-slot=field]")!
}

describe("useFieldControl", () => {
  it("valida al cambiar con validationMode onChange", async () => {
    const user = userEvent.setup()
    render(
      <Field name="items" validate={atLeastTwo} validationMode="onChange">
        <FieldLabel>Ítems</FieldLabel>
        <Counter />
        <FieldError />
      </Field>
    )
    await user.click(screen.getByRole("button"))
    expect(await screen.findByText("Al menos 2.")).toBeInTheDocument()
    await user.click(screen.getByRole("button"))
    await waitFor(() => expect(screen.queryByText("Al menos 2.")).not.toBeInTheDocument())
  })

  it("valida al salir con validationMode onBlur, con el valor del momento", async () => {
    const user = userEvent.setup()
    render(
      <Field name="items" validate={atLeastTwo} validationMode="onBlur">
        <FieldLabel>Ítems</FieldLabel>
        <Counter />
        <FieldError />
      </Field>
    )
    await user.click(screen.getByRole("button"))
    expect(screen.queryByText("Al menos 2.")).not.toBeInTheDocument()
    await user.tab()
    expect(await screen.findByText("Al menos 2.")).toBeInTheDocument()
  })

  it("marca data-filled en el Field según filled", async () => {
    const user = userEvent.setup()
    render(
      <Field name="items">
        <Counter />
      </Field>
    )
    expect(root()).not.toHaveAttribute("data-filled")
    await user.click(screen.getByRole("button"))
    expect(root()).toHaveAttribute("data-filled")
  })

  it("marca data-touched al salir y data-dirty al cambiar (no al montar)", async () => {
    const user = userEvent.setup()
    render(
      <Field name="items">
        <Counter />
      </Field>
    )
    expect(root()).not.toHaveAttribute("data-touched")
    expect(root()).not.toHaveAttribute("data-dirty")
    await user.click(screen.getByRole("button"))
    expect(root()).toHaveAttribute("data-dirty")
    expect(root()).toHaveAttribute("data-focused")
    await user.tab()
    expect(root()).toHaveAttribute("data-touched")
    expect(root()).not.toHaveAttribute("data-focused")
  })

  it("al cambiar borra el error del servidor que vino en errors del Form", async () => {
    const user = userEvent.setup()
    render(
      <Form errors={{ items: "Ya existe." }}>
        <Field name="items">
          <Counter />
          <FieldError />
        </Field>
      </Form>
    )
    expect(screen.getByText("Ya existe.")).toBeInTheDocument()
    await user.click(screen.getByRole("button"))
    await waitFor(() => expect(screen.queryByText("Ya existe.")).not.toBeInTheDocument())
  })

  it("se registra en el Form: habilitado viaja, deshabilitado no", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="items">
          <Counter initial={3} />
        </Field>
        <Field name="locked">
          <Counter initial={5} disabled />
        </Field>
        <Field disabled name="off">
          <Counter initial={7} />
        </Field>
        <button type="submit">Guardar</button>
      </Form>
    )
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(onFormSubmit.mock.calls[0]![0]).toEqual({ items: 3 })
  })
})

// Recorre `values` de a uno con cada clic: el primero es el inicial del campo.
function Stepper({ values }: { values: unknown[] }) {
  const [index, setIndex] = React.useState(0)
  const button = React.useRef<HTMLButtonElement>(null)
  const field = useFieldControl({ value: values[index], filled: true, controlRef: button })
  return (
    <button ref={button} type="button" id={field.id} onClick={() => setIndex((i) => i + 1)}>
      Siguiente
    </button>
  )
}

const file = (name: string, lastModified = 1) => new File(["abc"], name, { lastModified })

describe("useFieldControl: sucio compara por estructura, no por referencia", () => {
  it.each([
    ["listas", ["a", "b"], ["a", "b"], ["a"]],
    ["fechas", new Date(2026, 8, 27), new Date(2026, 8, 27), new Date(2026, 8, 28)],
    ["rangos", { from: "2026-09-10", to: "2026-09-14" }, { from: "2026-09-10", to: "2026-09-14" }, { from: "2026-09-10", to: null }],
    ["archivos por nombre, tamaño y fecha", [file("factura.pdf")], [file("factura.pdf")], [file("factura.pdf", 2)]],
  ])("%s: una copia igual no ensucia, una distinta sí", async (_, initial, copy, other) => {
    const user = userEvent.setup()
    render(
      <Field name="value">
        <Stepper values={[initial, copy, other, copy]} />
      </Field>
    )
    const next = screen.getByRole("button")
    await user.click(next)
    expect(root()).not.toHaveAttribute("data-dirty")
    await user.click(next)
    expect(root()).toHaveAttribute("data-dirty")
    await user.click(next)
    expect(root()).not.toHaveAttribute("data-dirty")
  })

  it("ToggleGroup: prender y apagar el mismo ítem lo deja limpio", async () => {
    const user = userEvent.setup()
    render(
      <Field name="status">
        <FieldLabel>Estados</FieldLabel>
        <ToggleGroup defaultValue={["paid"]} multiple>
          <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
          <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
        </ToggleGroup>
      </Field>
    )
    await user.click(screen.getByRole("button", { name: "Vencidas" }))
    expect(root()).toHaveAttribute("data-dirty")
    await user.click(screen.getByRole("button", { name: "Vencidas" }))
    expect(root()).not.toHaveAttribute("data-dirty")
  })
})
