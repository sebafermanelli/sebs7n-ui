import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Field, FieldDescription, FieldError, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { Rating } from "../../src/components/rating"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

const stars = () => screen.getAllByRole("radio")

describe("Rating de solo lectura", () => {
  it("es una imagen con el valor en palabras, y admite fracciones", () => {
    render(<Rating readOnly value={4.5} />)
    const rating = screen.getByRole("img", { name: "4,5 de 5 estrellas" })
    expect(rating).toHaveAttribute("data-slot", "rating")
    expect(screen.queryAllByRole("radio")).toHaveLength(0)
    // La quinta estrella va llena a la mitad.
    expect(rating.querySelectorAll("[data-slot=rating-star]")[4]).toHaveStyle({ "--sf-rating-fill": "50%" })
  })

  it("max cambia la escala", () => {
    render(<Rating max={10} readOnly value={7} />)
    expect(screen.getByRole("img", { name: "7 de 10 estrellas" })).toBeInTheDocument()
    expect(document.querySelectorAll("[data-slot=rating-star]")).toHaveLength(10)
  })
})

describe("Rating como campo", () => {
  it("un radiogroup nombrado con una estrella radio por valor", () => {
    render(<Rating aria-label="Atención" defaultValue={3} />)
    expect(screen.getByRole("radiogroup", { name: "Atención" })).toBeInTheDocument()
    expect(stars()).toHaveLength(5)
    expect(stars().map((star) => star.getAttribute("aria-label"))).toEqual(["1 estrella", "2 estrellas", "3 estrellas", "4 estrellas", "5 estrellas"])
    expect(stars()[2]).toBeChecked()
  })

  it("Tab entra en la elegida; flechas, Inicio y Fin eligen; un solo tabindex=0", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating aria-label="Atención" defaultValue={3} onValueChange={onValueChange} />)
    await user.tab()
    expect(stars()[2]).toHaveFocus()
    expect(stars().filter((star) => star.tabIndex === 0)).toHaveLength(1)
    await user.keyboard("{ArrowRight}")
    expect(stars()[3]).toHaveFocus()
    expect(onValueChange).toHaveBeenLastCalledWith(4)
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(onValueChange).toHaveBeenLastCalledWith(2)
    await user.keyboard("{End}")
    expect(onValueChange).toHaveBeenLastCalledWith(5)
    await user.keyboard("{Home}")
    expect(onValueChange).toHaveBeenLastCalledWith(1)
  })

  it("sin valor, Tab entra en la primera y Espacio la elige", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating aria-label="Atención" onValueChange={onValueChange} />)
    await user.tab()
    expect(stars()[0]).toHaveFocus()
    expect(stars()[0]).not.toBeChecked()
    await user.keyboard(" ")
    expect(onValueChange).toHaveBeenLastCalledWith(1)
  })

  it("clic elige", async () => {
    const user = userEvent.setup()
    render(<Rating aria-label="Atención" />)
    await user.click(stars()[3]!)
    expect(stars()[3]).toBeChecked()
  })

  it("size: 16, 20 (default) o 24 por estrella, y el área de toque de 24", () => {
    render(<Rating aria-label="Atención" size="lg" />)
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-size", "lg")
    expect(stars()[0]).toHaveClass("min-h-6", "min-w-6")
  })

  it("con name viaja en el form (vacío sin valor)", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <form>
        <Rating aria-label="Atención" name="score" />
      </form>
    )
    const data = () => new FormData(container.querySelector("form")!).get("score")
    expect(data()).toBe("")
    await user.click(stars()[4]!)
    expect(data()).toBe("5")
  })

  it("en Field y Form: FieldLabel nombra el grupo, required sin valor no envía y enfoca, y manda el número", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="score">
          <FieldLabel>Atención</FieldLabel>
          <Rating required />
          <FieldDescription>Del 1 al 5.</FieldDescription>
          <FieldError />
        </Field>
        <button type="submit">Enviar</button>
      </Form>
    )
    const group = screen.getByRole("radiogroup", { name: "Atención" })
    expect(group).toHaveAccessibleDescription("Del 1 al 5.")
    expect(group).toHaveAttribute("aria-required", "true")
    await user.click(screen.getByRole("button", { name: "Enviar" }))
    expect(onFormSubmit).not.toHaveBeenCalled()
    expect(stars()[0]).toHaveFocus()
    await user.click(stars()[3]!)
    await user.click(screen.getByRole("button", { name: "Enviar" }))
    expect(onFormSubmit.mock.calls[0]![0]).toEqual({ score: 4 })
  })

  it("disabled: no se enfoca ni cambia", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Rating aria-label="Atención" disabled onValueChange={onValueChange} />)
    await user.tab()
    expect(document.body).toHaveFocus()
    await user.click(stars()[2]!)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("los textos salen de LabelsProvider y la prop labels gana", () => {
    render(
      <LabelsProvider value={{ rating: { star: "star", stars: "stars", of: "of", locale: "en" } }}>
        <Rating labels={{ stars: "points" }} readOnly value={3.5} />
      </LabelsProvider>
    )
    expect(screen.getByRole("img", { name: "3.5 of 5 points" })).toBeInTheDocument()
  })

  it("hidrata sin mismatch", async () => {
    const ui = <Rating aria-label="Atención" defaultValue={2} name="score" />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
  })
})
