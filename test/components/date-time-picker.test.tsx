import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DateTimePicker } from "../../src/components/date-time-picker"
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
    expect(time().closest("[data-slot=time-picker]")).toHaveClass("rounded-s-none", "border-s-separator")
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
