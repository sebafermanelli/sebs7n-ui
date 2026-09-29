import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Field, FieldDescription, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { SearchField } from "../../src/components/search-field"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

const box = () => screen.getByRole("searchbox")

describe("SearchField", () => {
  it("un searchbox con la lupa adentro, el placeholder «Buscar» y sin botón de borrar vacío", () => {
    render(<SearchField aria-label="Buscar facturas" />)
    expect(box()).toHaveAccessibleName("Buscar facturas")
    expect(box()).toHaveAttribute("type", "search")
    expect(box()).toHaveAttribute("placeholder", "Buscar")
    expect(box()).toHaveAttribute("enterkeyhint", "search")
    expect(document.querySelector("[data-slot=input-group] svg.lucide-search")).not.toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("al escribir avisa el texto y aparece «Borrar búsqueda»; borrar vacía y devuelve el foco", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SearchField aria-label="Buscar" onValueChange={onValueChange} />)
    await user.type(box(), "acme")
    expect(onValueChange).toHaveBeenLastCalledWith("acme")
    await user.click(screen.getByRole("button", { name: "Borrar búsqueda" }))
    expect(box()).toHaveValue("")
    expect(onValueChange).toHaveBeenLastCalledWith("")
    expect(box()).toHaveFocus()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("Escape vacía; vacío, Escape sigue de largo (cierra el diálogo de afuera)", async () => {
    const user = userEvent.setup()
    const outer = vi.fn()
    render(
      <div onKeyDown={(event) => event.key === "Escape" && outer()}>
        <SearchField aria-label="Buscar" defaultValue="acme" />
      </div>
    )
    box().focus()
    await user.keyboard("{Escape}")
    expect(box()).toHaveValue("")
    expect(outer).not.toHaveBeenCalled()
    await user.keyboard("{Escape}")
    expect(outer).toHaveBeenCalledTimes(1)
  })

  it("controlado: muestra value y avisa sin guardar", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SearchField aria-label="Buscar" onValueChange={onValueChange} value="globex" />)
    await user.type(box(), "x")
    expect(onValueChange).toHaveBeenLastCalledWith("globexx")
    expect(box()).toHaveValue("globex")
  })

  it("size: 28, 36 (default) o 40, como los campos", () => {
    render(<SearchField aria-label="Buscar" size="sm" />)
    expect(document.querySelector("[data-slot=input-group]")).toHaveAttribute("data-size", "sm")
  })

  it("en Field y Form: FieldLabel, FieldDescription y el name del campo", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="q">
          <FieldLabel>Clientes</FieldLabel>
          <SearchField />
          <FieldDescription>Por nombre o CUIT.</FieldDescription>
        </Field>
        <button type="submit">Buscar</button>
      </Form>
    )
    expect(box()).toHaveAccessibleName("Clientes")
    expect(box()).toHaveAccessibleDescription("Por nombre o CUIT.")
    await user.type(box(), "acme")
    await user.click(screen.getByRole("button", { name: "Buscar" }))
    expect(onFormSubmit.mock.calls[0]![0]).toEqual({ q: "acme" })
  })

  it("los textos salen de LabelsProvider y la prop labels gana", async () => {
    const user = userEvent.setup()
    render(
      <LabelsProvider value={{ searchField: { placeholder: "Search", clear: "Clear search" } }}>
        <SearchField aria-label="Search" labels={{ clear: "Clear" }} />
      </LabelsProvider>
    )
    expect(box()).toHaveAttribute("placeholder", "Search")
    await user.type(box(), "a")
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument()
  })

  it("hidrata sin mismatch", async () => {
    const ui = <SearchField aria-label="Buscar" defaultValue="acme" name="q" />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
  })
})
