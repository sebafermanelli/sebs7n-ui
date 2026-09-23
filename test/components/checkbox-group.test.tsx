import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CheckboxGroup, CheckboxGroupItem } from "../../src/components/checkbox-group"
import { Field, FieldError, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"

const servicios = ["vuelo", "hotel", "traslado"]

function Servicios(props: { onValueChange?: (value: string[]) => void; defaultValue?: string[] }) {
  return (
    <Field>
      <CheckboxGroup
        aria-label="Servicios incluidos"
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
      >
        <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
        <CheckboxGroupItem value="hotel">Hotel</CheckboxGroupItem>
        <CheckboxGroupItem value="traslado">Traslado</CheckboxGroupItem>
      </CheckboxGroup>
    </Field>
  )
}

describe("CheckboxGroup", () => {
  it("el valor que sale es un array de los tildados, en el orden en que se tildaron", async () => {
    const onValueChange = vi.fn()
    render(<Servicios onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole("checkbox", { name: "Hotel" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["hotel"], expect.anything())
    await userEvent.click(screen.getByRole("checkbox", { name: "Vuelo" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["hotel", "vuelo"], expect.anything())
  })

  it("destildar saca el valor del array", async () => {
    const onValueChange = vi.fn()
    render(<Servicios defaultValue={["hotel", "vuelo"]} onValueChange={onValueChange} />)
    expect(screen.getByRole("checkbox", { name: "Hotel" })).toHaveAttribute("data-checked")
    await userEvent.click(screen.getByRole("checkbox", { name: "Hotel" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["vuelo"], expect.anything())
    expect(screen.getByRole("checkbox", { name: "Hotel" })).not.toHaveAttribute("data-checked")
  })

  it("es un role=group con un solo nombre accesible", () => {
    render(<Servicios />)
    expect(screen.getByRole("group", { name: "Servicios incluidos" })).toBeInTheDocument()
  })

  it("cada etiqueta tilda su propia casilla, sin htmlFor escrito a mano", async () => {
    render(<Servicios />)
    await userEvent.click(screen.getByText("Traslado"))
    expect(screen.getByRole("checkbox", { name: "Traslado" })).toHaveAttribute("data-checked")
    expect(screen.getByRole("checkbox", { name: "Vuelo" })).not.toHaveAttribute("data-checked")
  })

  it("la ayuda de una opción la describe solo a ella", () => {
    render(
      <Field>
        <CheckboxGroup aria-label="Servicios">
          <CheckboxGroupItem description="Incluye una valija de 23 kg." value="vuelo">
            Vuelo
          </CheckboxGroupItem>
          <CheckboxGroupItem value="hotel">Hotel</CheckboxGroupItem>
        </CheckboxGroup>
      </Field>
    )
    expect(screen.getByRole("checkbox", { name: "Vuelo" })).toHaveAccessibleDescription("Incluye una valija de 23 kg.")
    expect(screen.getByRole("checkbox", { name: "Hotel" })).not.toHaveAccessibleDescription()
  })

  it("se recorre y se tilda con el teclado", async () => {
    render(<Servicios />)
    await userEvent.tab()
    expect(screen.getByRole("checkbox", { name: "Vuelo" })).toHaveFocus()
    await userEvent.keyboard(" ")
    expect(screen.getByRole("checkbox", { name: "Vuelo" })).toHaveAttribute("data-checked")
    await userEvent.tab()
    expect(screen.getByRole("checkbox", { name: "Hotel" })).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(screen.getByRole("checkbox", { name: "Vuelo" })).toHaveFocus()
  })

  it("el padre indeterminado pasa a todos y después a ninguno", async () => {
    render(
      <Field>
        <CheckboxGroup allValues={servicios} aria-label="Servicios" defaultValue={["hotel"]}>
          <CheckboxGroupItem parent>Todos</CheckboxGroupItem>
          <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
          <CheckboxGroupItem value="hotel">Hotel</CheckboxGroupItem>
          <CheckboxGroupItem value="traslado">Traslado</CheckboxGroupItem>
        </CheckboxGroup>
      </Field>
    )
    const padre = screen.getByRole("checkbox", { name: "Todos" })
    // Con algunos tildados el padre no dice ni sí ni no: dice "mixed".
    expect(padre).toHaveAttribute("data-indeterminate")
    expect(padre).toHaveAttribute("aria-checked", "mixed")

    await userEvent.click(padre)
    for (const nombre of ["Vuelo", "Hotel", "Traslado"]) {
      expect(screen.getByRole("checkbox", { name: nombre }), nombre).toHaveAttribute("data-checked")
    }
    expect(padre).toHaveAttribute("data-checked")

    await userEvent.click(padre)
    for (const nombre of ["Vuelo", "Hotel", "Traslado"]) {
      expect(screen.getByRole("checkbox", { name: nombre }), nombre).not.toHaveAttribute("data-checked")
    }
    expect(padre).not.toHaveAttribute("data-checked")
  })

  it("el padre no aporta un valor propio al array y controla a los hijos", async () => {
    const onValueChange = vi.fn()
    render(
      <Field>
        <CheckboxGroup allValues={servicios} aria-label="Servicios" onValueChange={onValueChange}>
          <CheckboxGroupItem parent>Todos</CheckboxGroupItem>
          <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
          <CheckboxGroupItem value="hotel">Hotel</CheckboxGroupItem>
          <CheckboxGroupItem value="traslado">Traslado</CheckboxGroupItem>
        </CheckboxGroup>
      </Field>
    )
    const padre = screen.getByRole("checkbox", { name: "Todos" })
    expect(padre.getAttribute("aria-controls")?.split(" ")).toHaveLength(3)
    await userEvent.click(padre)
    expect(onValueChange).toHaveBeenLastCalledWith(servicios, expect.anything())
  })

  it("disabled en el grupo apaga todas las opciones", () => {
    render(
      <Field>
        <CheckboxGroup aria-label="Servicios" disabled>
          <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
          <CheckboxGroupItem value="hotel">Hotel</CheckboxGroupItem>
        </CheckboxGroup>
      </Field>
    )
    expect(screen.getByRole("checkbox", { name: "Vuelo" })).toHaveAttribute("data-disabled")
    expect(screen.getByRole("checkbox", { name: "Hotel" })).toHaveAttribute("data-disabled")
  })

  it("una opción deshabilitada también apaga su etiqueta", () => {
    render(
      <Field>
        <CheckboxGroup aria-label="Servicios">
          <CheckboxGroupItem disabled value="traslado">
            Traslado
          </CheckboxGroupItem>
        </CheckboxGroup>
      </Field>
    )
    expect(screen.getByRole("checkbox", { name: "Traslado" })).toHaveAttribute("data-disabled")
    expect(screen.getByText("Traslado")).toHaveAttribute("data-disabled")
  })

  it("adentro de un Field queda nombrado por la etiqueta del campo", () => {
    render(
      <Field name="servicios">
        <FieldLabel>Servicios incluidos</FieldLabel>
        <CheckboxGroup>
          <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
        </CheckboxGroup>
      </Field>
    )
    // El grupo se llama como el campo; la casilla sigue teniendo su propio nombre.
    expect(screen.getByRole("group", { name: "Servicios incluidos" })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Vuelo" })).toBeInTheDocument()
  })

  it("el error del grupo lo muestra el FieldError del campo que lo envuelve", async () => {
    render(
      <Form>
        <Field
          name="servicios"
          validate={(valor) => ((valor as string[]).length > 0 ? null : "Elegí al menos un servicio")}
        >
          <FieldLabel>Servicios incluidos</FieldLabel>
          <CheckboxGroup>
            <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
            <CheckboxGroupItem value="hotel">Hotel</CheckboxGroupItem>
          </CheckboxGroup>
          <FieldError />
        </Field>
        <button type="submit">Guardar</button>
      </Form>
    )
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    const error = await screen.findByText("Elegí al menos un servicio")
    expect(error).toHaveAttribute("data-slot", "field-error")
    // No es un cartel suelto: describe al grupo, así que se anuncia al entrar en él.
    expect(screen.getByRole("group", { name: "Servicios incluidos" })).toHaveAccessibleDescription(
      "Elegí al menos un servicio"
    )

    await userEvent.click(screen.getByRole("checkbox", { name: "Hotel" }))
    expect(screen.queryByText("Elegí al menos un servicio")).not.toBeInTheDocument()
  })

  it("el error del servidor llega por Form, con la clave del campo", () => {
    render(
      <Form errors={{ servicios: "Ese combo ya no está disponible" }}>
        <Field name="servicios">
          <FieldLabel>Servicios incluidos</FieldLabel>
          <CheckboxGroup defaultValue={["vuelo"]}>
            <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
          </CheckboxGroup>
          <FieldError />
        </Field>
      </Form>
    )
    expect(screen.getByText("Ese combo ya no está disponible")).toBeInTheDocument()
  })

  it("el className del llamador le gana a la clase base", () => {
    render(
      <Field>
        <CheckboxGroup aria-label="Servicios" className="gap-6">
          <CheckboxGroupItem value="vuelo">Vuelo</CheckboxGroupItem>
        </CheckboxGroup>
      </Field>
    )
    const group = screen.getByRole("group")
    expect(group).toHaveClass("gap-6", "flex", "flex-col")
    expect(group.className).not.toMatch(/\bgap-3\b/)
  })
})
