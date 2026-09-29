import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DateTimePicker } from "../../src/components/date-time-picker"
import { Field, FieldDescription, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

afterEach(() => vi.restoreAllMocks())

const day = (iso: string) => document.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)!
const group = () => screen.getByRole("group", { name: "Vencimiento" })
const time = () => within(group()).getByRole("combobox", { name: "Hora" })
const date = () => within(group()).getByRole("button", { name: /sept|Elegí una fecha/ })

describe("DateTimePicker", () => {
  it("un group nombrado con la fecha y la hora en un solo campo", () => {
    render(<DateTimePicker aria-label="Vencimiento" defaultValue={new Date(2026, 8, 29, 9, 30)} />)
    expect(date()).toHaveTextContent("29 sept 2026")
    expect(date()).toHaveClass("rounded-e-none")
    expect(time()).toHaveValue("09:30")
    expect(time().closest("[data-slot=time-picker]")).toHaveClass("rounded-s-none", "border-s-hairline")
  })

  it("la hora mide lo que la hora: no se estira con el grupo", () => {
    render(<DateTimePicker aria-label="Vencimiento" defaultValue={new Date(2026, 8, 29, 9, 30)} />)
    const part = time().closest("[data-slot=time-picker]")!
    expect(part).toHaveClass("w-fit", "shrink-0")
    expect(part).not.toHaveClass("w-28")
  })

  it("elegir el día conserva la hora", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateTimePicker aria-label="Vencimiento" defaultValue={new Date(2026, 8, 29, 9, 30)} onValueChange={onValueChange} />)
    await user.click(date())
    await user.click(day("2026-09-15"))
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 8, 15, 9, 30))
  })

  it("sin hora el día arranca a las 00:00; la hora tipeada antes del día se guarda", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateTimePicker aria-label="Vencimiento" onValueChange={onValueChange} />)
    await user.type(time(), "1830")
    await user.tab()
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(date())
    await user.click(day("2026-09-15"))
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 8, 15, 18, 30))
  })

  it("cambiar la hora con el teclado cambia el valor", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateTimePicker aria-label="Vencimiento" defaultValue={new Date(2026, 8, 29, 9, 30)} onValueChange={onValueChange} />)
    await user.clear(time())
    await user.type(time(), "14{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 8, 29, 14, 0))
  })

  it("clearable vacía fecha y hora", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateTimePicker aria-label="Vencimiento" clearable defaultValue={new Date(2026, 8, 29, 9, 30)} onValueChange={onValueChange} />)
    await user.click(date())
    await user.click(await screen.findByRole("button", { name: "Limpiar" }))
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    await waitFor(() => expect(time()).toHaveValue(""))
  })

  it("controlado: un value que pasa a null de afuera no deja la hora tipeada antes", async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = React.useState<Date | null>(null)
      return (
        <>
          <DateTimePicker aria-label="Vencimiento" onValueChange={setValue} value={value} />
          <button onClick={() => setValue(new Date(2026, 8, 29, 10, 0))} type="button">
            Mañana
          </button>
          <button onClick={() => setValue(null)} type="button">
            Borrar
          </button>
        </>
      )
    }
    render(<Controlled />)
    await user.type(time(), "1830")
    await user.tab()
    expect(time()).toHaveValue("18:30")
    await user.click(screen.getByRole("button", { name: "Mañana" }))
    expect(time()).toHaveValue("10:00")
    await user.click(screen.getByRole("button", { name: "Borrar" }))
    expect(time()).toHaveValue("")
  })

  it("con name viaja como fecha y hora local (datetime-local)", () => {
    const { container } = render(
      <form>
        <DateTimePicker aria-label="Vencimiento" defaultValue={new Date(2026, 8, 29, 9, 30)} name="vence" />
      </form>
    )
    const data = new FormData(container.querySelector("form")!)
    expect(data.get("vence")).toBe("2026-09-29T09:30")
    expect([...data.keys()]).toEqual(["vence"])
  })

  it("el reset del form vuelve al defaultValue y descarta la hora sin día", async () => {
    const user = userEvent.setup()
    render(
      <form data-testid="form">
        <DateTimePicker aria-label="Vencimiento" defaultValue={new Date(2026, 8, 29, 9, 30)} name="vence" />
        <DateTimePicker aria-label="Recordatorio" name="recordar" />
      </form>
    )
    const form = screen.getByTestId("form") as HTMLFormElement
    await user.clear(time())
    await user.type(time(), "14{Enter}")
    const other = within(screen.getByRole("group", { name: "Recordatorio" })).getByRole("combobox", { name: "Hora" })
    await user.type(other, "1830")
    await user.tab()
    expect(new FormData(form).get("vence")).toBe("2026-09-29T14:00")
    act(() => form.reset())
    expect(new FormData(form).get("vence")).toBe("2026-09-29T09:30")
    expect(time()).toHaveValue("09:30")
    expect(other).toHaveValue("")
  })

  it("el nombre de la hora sale de LabelsProvider y la prop labels le gana", () => {
    render(
      <LabelsProvider value={{ dateTimePicker: { time: "Time" } }}>
        <DateTimePicker aria-label="Due" />
        <DateTimePicker aria-label="Vencimiento" labels={{ time: "Hora de vencimiento" }} />
      </LabelsProvider>
    )
    expect(within(screen.getByRole("group", { name: "Due" })).getByRole("combobox", { name: "Time" })).toBeInTheDocument()
    expect(within(group()).getByRole("combobox", { name: "Hora de vencimiento" })).toBeInTheDocument()
  })

  it("hidrata sin mismatch", async () => {
    const ui = <DateTimePicker aria-label="Vencimiento" defaultValue={new Date(2026, 8, 29, 9, 30)} name="vence" />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
  })
})

describe("DateTimePicker en Field", () => {
  it("el grupo toma la etiqueta y la ayuda; las partes no se registran por su cuenta", () => {
    render(
      <Field>
        <FieldLabel>Envío</FieldLabel>
        <DateTimePicker defaultValue={new Date(2026, 8, 29, 9, 30)} />
        <FieldDescription>Hora local.</FieldDescription>
      </Field>
    )
    const grupo = screen.getByRole("group", { name: "Envío" })
    expect(grupo).toHaveAccessibleDescription("Hora local.")
    // El FieldLabel no apunta a una parte suelta (un htmlFor a nada o solo a la fecha).
    expect(document.querySelector("[data-slot=field-label]")).not.toHaveAttribute("for")
  })

  it("con Form manda fecha y hora con el name del Field", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    const { container } = render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="sendAt">
          <FieldLabel>Envío</FieldLabel>
          <DateTimePicker defaultValue={new Date(2026, 8, 29, 9, 30)} />
        </Field>
        <button type="submit">Guardar</button>
      </Form>
    )
    expect(new FormData(container.querySelector("form")!).getAll("sendAt")).toEqual(["2026-09-29T09:30"])
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(onFormSubmit.mock.calls[0]![0]).toEqual({ sendAt: "2026-09-29T09:30" })
  })

  it("required sin valor: Form no envía y enfoca la fecha", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="sendAt">
          <FieldLabel>Envío</FieldLabel>
          <DateTimePicker required />
        </Field>
        <button type="submit">Guardar</button>
      </Form>
    )
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(onFormSubmit).not.toHaveBeenCalled()
    expect(within(screen.getByRole("group", { name: "Envío" })).getByRole("button")).toHaveFocus()
  })
})
