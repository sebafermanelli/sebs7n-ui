import * as React from "react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Field, FieldDescription, FieldError, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { TagsInput } from "../../src/components/tags-input"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

const input = () => screen.getByRole("textbox")
const tags = () => [...document.querySelectorAll("[data-slot=tag-label]")].map((tag) => tag.textContent)
const status = () => document.querySelector("[data-slot=tags-input-status]")

describe("TagsInput", () => {
  it("Enter y coma agregan la etiqueta; el texto se limpia y se anuncia", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TagsInput aria-label="Etiquetas" onValueChange={onValueChange} />)
    await user.type(input(), "urgente{Enter}")
    await user.type(input(), " mayorista ,")
    expect(tags()).toEqual(["urgente", "mayorista"])
    expect(onValueChange).toHaveBeenLastCalledWith(["urgente", "mayorista"])
    expect(input()).toHaveValue("")
    expect(status()).toHaveTextContent("Agregada: mayorista")
  })

  it("Backspace con el campo vacío quita la última; con texto, borra texto", async () => {
    const user = userEvent.setup()
    render(<TagsInput aria-label="Etiquetas" defaultValue={["a", "b"]} />)
    await user.type(input(), "x{Backspace}")
    expect(tags()).toEqual(["a", "b"])
    await user.keyboard("{Backspace}")
    expect(tags()).toEqual(["a"])
    expect(status()).toHaveTextContent("Quitada: b")
  })

  it("pegar separa por comas y renglones", async () => {
    const user = userEvent.setup()
    render(<TagsInput aria-label="Correos" />)
    input().focus()
    await user.paste("ana@acme.com, beto@acme.com\ncarla@acme.com")
    expect(tags()).toEqual(["ana@acme.com", "beto@acme.com", "carla@acme.com"])
  })

  it("el × de cada una la quita y devuelve el foco al campo", async () => {
    const user = userEvent.setup()
    render(<TagsInput aria-label="Etiquetas" defaultValue={["urgente", "mayorista"]} />)
    await user.click(screen.getByRole("button", { name: "Quitar urgente" }))
    expect(tags()).toEqual(["mayorista"])
    expect(input()).toHaveFocus()
  })

  it("repetidas no entran y se avisa en línea", async () => {
    const user = userEvent.setup()
    render(<TagsInput aria-label="Etiquetas" defaultValue={["urgente"]} />)
    await user.type(input(), "urgente{Enter}")
    expect(tags()).toEqual(["urgente"])
    expect(screen.getByRole("alert")).toHaveTextContent("urgente ya está")
    expect(input()).toHaveValue("urgente")
    expect(input()).toHaveAttribute("aria-invalid", "true")
  })

  it("validate por etiqueta: el texto devuelto es el error, y la etiqueta no entra", async () => {
    const user = userEvent.setup()
    const validate = (tag: string) => (tag.includes("@") ? undefined : "no es un correo")
    render(<TagsInput aria-label="Correos" validate={validate} />)
    await user.type(input(), "ana{Enter}")
    expect(tags()).toEqual([])
    expect(screen.getByRole("alert")).toHaveTextContent("ana no es un correo")
    await user.clear(input())
    await user.type(input(), "ana@acme.com{Enter}")
    expect(tags()).toEqual(["ana@acme.com"])
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("max: al llegar no entra otra y se avisa", async () => {
    const user = userEvent.setup()
    render(<TagsInput aria-label="Etiquetas" defaultValue={["a", "b"]} max={2} />)
    await user.type(input(), "c{Enter}")
    expect(tags()).toEqual(["a", "b"])
    expect(screen.getByRole("alert")).toHaveTextContent("c no entra: el máximo es 2")
  })

  it("con name, cada etiqueta viaja como un campo del form", () => {
    const { container } = render(
      <form>
        <TagsInput aria-label="Etiquetas" defaultValue={["urgente", "mayorista"]} name="tags" />
      </form>
    )
    expect(new FormData(container.querySelector("form")!).getAll("tags")).toEqual(["urgente", "mayorista"])
  })

  it("en Field y Form: etiqueta, ayuda, validate del campo con la lista, foco si es inválido y el name del campo", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="tags" validate={(value) => ((value as string[]).length ? null : "Poné al menos una.")}>
          <FieldLabel>Etiquetas</FieldLabel>
          <TagsInput />
          <FieldDescription>Enter o coma para agregar.</FieldDescription>
          <FieldError />
        </Field>
        <button type="submit">Guardar</button>
      </Form>
    )
    expect(input()).toHaveAccessibleName("Etiquetas")
    expect(input()).toHaveAccessibleDescription(expect.stringContaining("Enter o coma para agregar."))
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(onFormSubmit).not.toHaveBeenCalled()
    expect(input()).toHaveFocus()
    await user.type(input(), "urgente{Enter}")
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(onFormSubmit.mock.calls[0]![0]).toEqual({ tags: ["urgente"] })
  })

  it("las etiquetas son una lista nombrada; la región de estado anuncia", () => {
    render(<TagsInput aria-label="Etiquetas" defaultValue={["urgente"]} />)
    const list = screen.getByRole("list", { name: "Etiquetas" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(1)
    expect(status()).toHaveAttribute("role", "status")
  })

  it("disabled: no se escribe ni se quita", () => {
    render(<TagsInput aria-label="Etiquetas" defaultValue={["urgente"]} disabled />)
    expect(input()).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Quitar urgente" })).toBeNull()
    fireEvent.keyDown(input(), { key: "Backspace" })
    expect(tags()).toEqual(["urgente"])
  })

  it("los textos salen de LabelsProvider y la prop labels gana", async () => {
    const user = userEvent.setup()
    render(
      <LabelsProvider value={{ tagsInput: { remove: "Remove", added: "Added:" } }}>
        <TagsInput aria-label="Tags" defaultValue={["a"]} labels={{ remove: "Delete" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Delete a" })).toBeInTheDocument()
    await user.type(input(), "b{Enter}")
    expect(status()).toHaveTextContent("Added: b")
  })

  it("hidrata sin mismatch", async () => {
    const ui = <TagsInput aria-label="Etiquetas" defaultValue={["urgente"]} name="tags" />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
  })

  it("repetidas sin importar mayúsculas: «Urgente» ya está si está «urgente»", async () => {
    const user = userEvent.setup()
    render(<TagsInput aria-label="Etiquetas" defaultValue={["urgente"]} />)
    await user.type(input(), "Urgente{Enter}")
    expect(tags()).toEqual(["urgente"])
    expect(screen.getByRole("alert")).toHaveTextContent("Urgente ya está")
  })

  it("controlada con repetidas: las muestra todas sin chocar las keys", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const { container } = render(
      <form>
        <TagsInput aria-label="Etiquetas" name="tags" value={["a", "a"]} />
      </form>
    )
    expect(tags()).toEqual(["a", "a"])
    expect(new FormData(container.querySelector("form")!).getAll("tags")).toEqual(["a", "a"])
    expect(error.mock.calls.flat().join(" ")).not.toMatch(/same key/)
    error.mockRestore()
  })

  it("pegar inserta en el cursor: lo tipeado antes y después se une con lo pegado", async () => {
    const user = userEvent.setup()
    render(<TagsInput aria-label="Correos" />)
    await user.type(input(), "ana@.ar")
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}")
    await user.paste("acme.com, beto@acme")
    expect(tags()).toEqual(["ana@acme.com", "beto@acme.ar"])
  })

  it("agregar lo mismo dos veces se vuelve a anunciar (limpia y escribe)", async () => {
    const user = userEvent.setup()
    const texts: string[] = []
    function Fixed() {
      // La app no guarda: la lista sigue vacía y cada Enter vuelve a agregar la misma.
      const [value] = React.useState<string[]>([])
      return <TagsInput aria-label="Etiquetas" value={value} />
    }
    render(<Fixed />)
    const observer = new MutationObserver(() => texts.push(status()!.textContent ?? ""))
    observer.observe(status()!, { childList: true, characterData: true, subtree: true })
    await user.type(input(), "a{Enter}")
    await waitFor(() => expect(status()).toHaveTextContent("Agregada: a"))
    await user.type(input(), "a{Enter}")
    await waitFor(() => expect(texts.filter((text) => text === "Agregada: a")).toHaveLength(2))
    observer.disconnect()
  })
  describe("addOnBlur", () => {
    it("al salir del campo, lo escrito se agrega", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <>
          <TagsInput addOnBlur aria-label="Etiquetas" onValueChange={onValueChange} />
          <button type="button">Otro</button>
        </>
      )
      await user.type(input(), "urgente")
      await user.tab()
      expect(tags()).toEqual(["urgente"])
      expect(onValueChange).toHaveBeenLastCalledWith(["urgente"])
      expect(input()).toHaveValue("")
    })

    it("sin addOnBlur (default), salir del campo deja el texto como está", async () => {
      const user = userEvent.setup()
      render(<TagsInput aria-label="Etiquetas" />)
      await user.type(input(), "urgente")
      await user.tab()
      expect(tags()).toEqual([])
      expect(input()).toHaveValue("urgente")
    })

    it("si no es válida, el texto queda con el error en línea", async () => {
      const user = userEvent.setup()
      const validate = (tag: string) => (tag.includes("@") ? undefined : "no es un correo")
      render(<TagsInput addOnBlur aria-label="Correos" validate={validate} />)
      await user.type(input(), "ana")
      await user.tab()
      expect(tags()).toEqual([])
      expect(input()).toHaveValue("ana")
      expect(screen.getByRole("alert")).toHaveTextContent("ana no es un correo")
    })

    it("el submit del form la agrega antes de que el handler lea los campos (sin blur)", () => {
      const read = vi.fn()
      const { container } = render(
        <form
          onSubmit={(event) => {
            event.preventDefault()
            read(new FormData(event.currentTarget).getAll("tags"))
          }}
        >
          <TagsInput addOnBlur aria-label="Etiquetas" defaultValue={["mayorista"]} name="tags" />
        </form>
      )
      fireEvent.change(input(), { target: { value: "urgente" } })
      fireEvent.submit(container.querySelector("form")!)
      expect(read).toHaveBeenCalledWith(["mayorista", "urgente"])
      expect(tags()).toEqual(["mayorista", "urgente"])
      expect(input()).toHaveValue("")
    })

    it("leer el FormData del form sin submit también la incluye (evento formdata)", async () => {
      const { container } = render(
        <form>
          <TagsInput addOnBlur aria-label="Etiquetas" name="tags" />
        </form>
      )
      const form = container.querySelector("form")!
      fireEvent.change(input(), { target: { value: "urgente" } })
      // jsdom no dispara `formdata` al construir un FormData: se simula lo que hace el navegador.
      const formData = new FormData(form)
      form.dispatchEvent(Object.assign(new Event("formdata"), { formData }))
      expect(formData.getAll("tags")).toEqual(["urgente"])
      await waitFor(() => expect(tags()).toEqual(["urgente"]))
    })

    it("en Field con validationMode onBlur, la validación ve la agregada al salir", async () => {
      const user = userEvent.setup()
      render(
        <Form>
          <Field name="tags" validationMode="onBlur" validate={(value) => ((value as string[]).length ? null : "Poné al menos una.")}>
            <FieldLabel>Etiquetas</FieldLabel>
            <TagsInput addOnBlur />
            <FieldError />
          </Field>
          <button type="button">Otro</button>
        </Form>
      )
      await user.type(input(), "urgente")
      await user.tab()
      expect(tags()).toEqual(["urgente"])
      expect(screen.queryByText("Poné al menos una.")).toBeNull()
    })

    it("en Form: onFormSubmit recibe lo escrito sin Enter", async () => {
      const onFormSubmit = vi.fn()
      render(
        <Form onFormSubmit={onFormSubmit}>
          <Field name="tags">
            <FieldLabel>Etiquetas</FieldLabel>
            <TagsInput addOnBlur />
          </Field>
          <button type="submit">Guardar</button>
        </Form>
      )
      fireEvent.change(input(), { target: { value: "urgente" } })
      fireEvent.submit(document.querySelector("form")!)
      await waitFor(() => expect(onFormSubmit).toHaveBeenCalled())
      expect(onFormSubmit.mock.calls[0]![0]).toEqual({ tags: ["urgente"] })
    })

    it("en Form: escribir y hacer clic en Guardar la envía", async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      render(
        <Form onFormSubmit={onFormSubmit}>
          <Field name="tags">
            <FieldLabel>Etiquetas</FieldLabel>
            <TagsInput addOnBlur required />
          </Field>
          <button type="submit">Guardar</button>
        </Form>
      )
      await user.type(input(), "urgente")
      await user.click(screen.getByRole("button", { name: "Guardar" }))
      await waitFor(() => expect(onFormSubmit).toHaveBeenCalled())
      expect(onFormSubmit.mock.calls[0]![0]).toEqual({ tags: ["urgente"] })
    })

    it("en el submit, si no es válida, no se envía y queda el error", () => {
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
      const validate = (tag: string) => (tag.includes("@") ? undefined : "no es un correo")
      const { container } = render(
        <form onSubmit={onSubmit}>
          <TagsInput addOnBlur aria-label="Correos" name="cc" validate={validate} />
        </form>
      )
      fireEvent.change(input(), { target: { value: "ana" } })
      fireEvent.submit(container.querySelector("form")!)
      expect(onSubmit).not.toHaveBeenCalled()
      expect(input()).toHaveValue("ana")
      expect(screen.getByRole("alert")).toHaveTextContent("ana no es un correo")
    })
  })

  describe("delimiters", () => {
    it('["Enter"]: la coma es parte del valor («38,5») y Enter agrega', async () => {
      const user = userEvent.setup()
      render(<TagsInput aria-label="Talles" delimiters={["Enter"]} />)
      await user.type(input(), "38,5{Enter}")
      expect(tags()).toEqual(["38,5"])
    })

    it("sin Enter entre los delimitadores, Enter no agrega", async () => {
      const user = userEvent.setup()
      render(<TagsInput aria-label="Etiquetas" delimiters={[" "]} />)
      await user.type(input(), "a{Enter}")
      expect(tags()).toEqual([])
      await user.type(input(), " b ")
      expect(tags()).toEqual(["a", "b"])
    })

    it('pegar con ["Enter"] separa solo por renglones', async () => {
      const user = userEvent.setup()
      render(<TagsInput aria-label="Talles" delimiters={["Enter"]} />)
      input().focus()
      await user.paste("38,5\n40;5\r\n42")
      expect(tags()).toEqual(["38,5", "40;5", "42"])
    })

    it("pegar con delimitadores propios usa esos mismos", async () => {
      const user = userEvent.setup()
      render(<TagsInput aria-label="Etiquetas" delimiters={["|"]} />)
      input().focus()
      await user.paste("a,b|c; d")
      expect(tags()).toEqual(["a,b", "c; d"])
    })
  })
})
