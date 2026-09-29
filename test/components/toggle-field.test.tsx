// Toggle y ToggleGroup (2.1): `size` como los botones (sm 28 · md 36 · lg 40) y, como control de un
// formulario, `name` y el registro en `Field` (FieldLabel, Form los manda y los enfoca si quedan inválidos).
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Field, FieldDescription, FieldError, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { Toggle } from "../../src/components/toggle"
import { ToggleGroup, ToggleGroupItem } from "../../src/components/toggle-group"

describe("Toggle size", () => {
  it("sm 28 por defecto (lo de 2.0), md 36 y lg 40 como Button", () => {
    render(
      <>
        <Toggle aria-label="Negrita" />
        <Toggle aria-label="Cursiva" size="md" />
        <Toggle aria-label="Subrayado" size="lg" />
      </>
    )
    // `w-fit`: en la columna de un Field no se estira a todo el ancho.
    expect(screen.getByRole("button", { name: "Negrita" })).toHaveClass("h-7", "px-2.5", "w-fit")
    expect(screen.getByRole("button", { name: "Cursiva" })).toHaveClass("h-9", "px-3")
    expect(screen.getByRole("button", { name: "Subrayado" })).toHaveClass("h-10", "px-3.5")
  })

  it("afuera de un Field no suma un id que la app no pidió", () => {
    render(<Toggle aria-label="Negrita" />)
    expect(screen.getByRole("button")).not.toHaveAttribute("id")
  })
})

describe("ToggleGroup size", () => {
  it("la pista mide 28 · 36 · 40: el ítem 24 · 32 · 36 más los 2 de cada lado", () => {
    render(
      <>
        <ToggleGroup aria-label="Vista" size="md">
          <ToggleGroupItem value="list">Lista</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup aria-label="Orden" size="lg">
          <ToggleGroupItem value="asc">Asc</ToggleGroupItem>
        </ToggleGroup>
      </>
    )
    const [md, lg] = screen.getAllByRole("group")
    expect(md).toHaveAttribute("data-size", "md")
    expect(lg).toHaveAttribute("data-size", "lg")
    expect(screen.getByRole("button", { name: "Lista" })).toHaveClass("group-data-[size=md]/toggle-group:h-8", "group-data-[size=lg]/toggle-group:h-9")
  })
})

describe("Toggle como control de formulario", () => {
  it("con name, prendido viaja en el form (value o «on»); apagado no", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <form>
        <Toggle aria-label="Solo pendientes" name="pending" />
        <Toggle aria-label="Vencidas" defaultPressed name="overdue" value="yes" />
      </form>
    )
    const data = () => new FormData(container.querySelector("form")!)
    expect(data().get("pending")).toBeNull()
    expect(data().get("overdue")).toBe("yes")
    await user.click(screen.getByRole("button", { name: "Solo pendientes" }))
    expect(data().get("pending")).toBe("on")
  })

  it("en Field: FieldLabel lo nombra, Form manda el booleano con el name del campo", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="urgent">
          <FieldLabel>Urgente</FieldLabel>
          <Toggle>Urgente</Toggle>
          <FieldDescription>Se atiende primero.</FieldDescription>
        </Field>
        <button type="submit">Guardar</button>
      </Form>
    )
    const toggle = screen.getByRole("button", { name: "Urgente" })
    expect(toggle).toHaveAccessibleDescription("Se atiende primero.")
    await user.click(toggle)
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(onFormSubmit.mock.calls[0]![0]).toEqual({ urgent: true })
  })
})

describe("ToggleGroup como control de formulario", () => {
  it("con name, cada valor prendido viaja como un campo (como un grupo de checkboxes)", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <form>
        <ToggleGroup aria-label="Estados" defaultValue={["paid"]} multiple name="status">
          <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
          <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
        </ToggleGroup>
      </form>
    )
    const data = () => new FormData(container.querySelector("form")!).getAll("status")
    expect(data()).toEqual(["paid"])
    await user.click(screen.getByRole("button", { name: "Vencidas" }))
    expect(data()).toEqual(["paid", "due"])
  })

  it("en Field con Form: validate recibe la lista, si queda inválido Form enfoca el grupo, y manda los valores", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="status" validate={(value) => ((value as string[]).length ? null : "Elegí al menos uno.")}>
          <FieldLabel>Estados</FieldLabel>
          <ToggleGroup multiple>
            <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
            <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
          </ToggleGroup>
          <FieldError />
        </Field>
        <button type="submit">Filtrar</button>
      </Form>
    )
    const group = screen.getByRole("group", { name: "Estados" })
    await user.click(screen.getByRole("button", { name: "Filtrar" }))
    expect(onFormSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Pagadas" })).toHaveFocus()
    // `aria-invalid` no vale en un role=group: el estado va en data-invalid y el error se asocia.
    expect(group).not.toHaveAttribute("aria-invalid")
    expect(group).toHaveAttribute("data-invalid")
    expect(group).toHaveAccessibleDescription("Elegí al menos uno.")
    await user.click(screen.getByRole("button", { name: "Vencidas" }))
    await user.click(screen.getByRole("button", { name: "Filtrar" }))
    expect(onFormSubmit.mock.calls[0]![0]).toEqual({ status: ["due"] })
  })
})

describe("reset nativo del form", () => {
  it("Toggle vuelve a defaultPressed y su hidden también", async () => {
    const user = userEvent.setup()
    render(
      <form data-testid="form">
        <Toggle aria-label="Vencidas" defaultPressed name="overdue" />
        <Toggle aria-label="Pagadas" name="paid" />
      </form>
    )
    const form = screen.getByTestId("form") as HTMLFormElement
    await user.click(screen.getByRole("button", { name: "Vencidas" }))
    await user.click(screen.getByRole("button", { name: "Pagadas" }))
    expect(new FormData(form).get("overdue")).toBeNull()
    act(() => form.reset())
    expect(screen.getByRole("button", { name: "Vencidas" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Pagadas" })).toHaveAttribute("aria-pressed", "false")
    expect(new FormData(form).get("overdue")).toBe("on")
    expect(new FormData(form).get("paid")).toBeNull()
  })

  it("ToggleGroup vuelve a defaultValue y sus hidden también", async () => {
    const user = userEvent.setup()
    render(
      <form data-testid="form">
        <ToggleGroup aria-label="Estados" defaultValue={["paid"]} multiple name="status">
          <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
          <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
        </ToggleGroup>
      </form>
    )
    const form = screen.getByTestId("form") as HTMLFormElement
    await user.click(screen.getByRole("button", { name: "Pagadas" }))
    await user.click(screen.getByRole("button", { name: "Vencidas" }))
    expect(new FormData(form).getAll("status")).toEqual(["due"])
    act(() => form.reset())
    expect(screen.getByRole("button", { name: "Pagadas" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Vencidas" })).toHaveAttribute("aria-pressed", "false")
    expect(new FormData(form).getAll("status")).toEqual(["paid"])
  })
})
