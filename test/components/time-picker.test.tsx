import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TimePicker } from "../../src/components/time-picker"
import { clampTime, matchesTime, parseTime, timeSlots } from "../../src/internal/time"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

afterEach(() => vi.restoreAllMocks())

const field = () => screen.getByRole("combobox", { name: "Hora de envío" })
const options = () => within(screen.getByRole("listbox")).getAllByRole("option").map((option) => option.textContent)

describe("horas (internal/time)", () => {
  it.each([
    ["9", "09:00"],
    ["930", "09:30"],
    ["0930", "09:30"],
    ["9:5", null],
    ["09:30", "09:30"],
    ["9.30", "09:30"],
    ["23:59", "23:59"],
    ["24", null],
    ["9:60", null],
    ["nueve", null],
    ["", null],
  ] as const)("parseTime(%j) → %j", (text, time) => {
    expect(parseTime(text)).toBe(time)
  })

  it("timeSlots cuenta desde min, cada step, hasta max", () => {
    expect(timeSlots(15, "08:00", "09:00")).toEqual(["08:00", "08:15", "08:30", "08:45", "09:00"])
    expect(timeSlots(30, "08:10", "09:00")).toEqual(["08:10", "08:40"])
    expect(timeSlots(15)).toHaveLength(96)
  })

  it("clampTime y matchesTime", () => {
    expect(clampTime("07:00", "08:00", "18:00")).toBe("08:00")
    expect(clampTime("19:00", "08:00", "18:00")).toBe("18:00")
    expect(matchesTime("09:30", "9")).toBe(true)
    expect(matchesTime("09:30", "93")).toBe(true)
    expect(matchesTime("09:30", "9:3")).toBe(true)
    expect(matchesTime("01:30", "1:3")).toBe(true)
    expect(matchesTime("19:30", "9")).toBe(false)
    // «14» son las 14, no la una y cuarenta y pico.
    expect(matchesTime("01:45", "14")).toBe(false)
    expect(matchesTime("14:00", "14")).toBe(true)
  })
})

describe("TimePicker", () => {
  it("es un combobox nombrado con la lista cada 15 minutos entre min y max", async () => {
    const user = userEvent.setup()
    render(<TimePicker aria-label="Hora de envío" max="09:00" min="08:00" />)
    expect(field()).toHaveAttribute("placeholder", "hh:mm")
    await user.click(field())
    expect(options()).toEqual(["08:00", "08:15", "08:30", "08:45", "09:00"])
  })

  it("↓ abre la lista, recorre y Enter elige; la elegida lleva aria-selected", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker aria-label="Hora de envío" max="09:00" min="08:00" onValueChange={onValueChange} />)
    await user.tab()
    await user.keyboard("{ArrowDown}")
    await screen.findByRole("listbox")
    await user.keyboard("{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("08:15")
    expect(field()).toHaveValue("08:15")
    await user.keyboard("{ArrowDown}")
    expect(await screen.findByRole("option", { name: "08:15" })).toHaveAttribute("aria-selected", "true")
  })

  it("al abrir, la lista arranca en la hora elegida y no en las 00:00", async () => {
    const user = userEvent.setup()
    // jsdom no tiene layout: cada opción mide 30 px y va una abajo de la otra, en el orden del día.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const text = this.getAttribute("role") === "option" ? (this.textContent ?? "") : ""
      const top = /^\d\d:\d\d/.test(text) ? (Number(text.slice(0, 2)) * 4 + Number(text.slice(3, 5)) / 15) * 30 : 0
      return { top, bottom: top + 30, left: 0, right: 0, width: 0, height: 30, x: 0, y: top, toJSON: () => ({}) } as DOMRect
    })
    render(<TimePicker aria-label="Hora de envío" defaultValue="09:30" />)
    await user.click(field())
    const list = await screen.findByRole("listbox")
    // 09:30 es la opción 38: queda arriba de todo en la lista (sin alto, no hay mitad que centrar).
    expect(list.scrollTop).toBe(38 * 30)
  })

  it("tipear filtra la lista y al salir se escribe como HH:MM", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker aria-label="Hora de envío" onValueChange={onValueChange} step={30} />)
    await user.type(field(), "9")
    expect(options()).toEqual(["09:00", "09:30"])
    await user.clear(field())
    await user.type(field(), "945")
    await user.tab()
    expect(field()).toHaveValue("09:45")
    expect(onValueChange).toHaveBeenLastCalledWith("09:45")
  })

  it("Enter sin opción resaltada toma lo tipeado", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker aria-label="Hora de envío" onValueChange={onValueChange} />)
    await user.type(field(), "937{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("09:37")
  })

  it("fuera de min/max se lleva al borde", async () => {
    const user = userEvent.setup()
    render(<TimePicker aria-label="Hora de envío" max="18:00" min="08:00" />)
    await user.type(field(), "7")
    await user.tab()
    expect(field()).toHaveValue("08:00")
  })

  it("lo que no es una hora vuelve a la anterior y se anuncia", async () => {
    const user = userEvent.setup()
    render(<TimePicker aria-label="Hora de envío" defaultValue="10:00" />)
    await user.clear(field())
    await user.type(field(), "25")
    await user.tab()
    expect(field()).toHaveValue("10:00")
    expect(screen.getByRole("status")).toHaveTextContent("Hora no válida")
  })

  it("vaciar el campo es null", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker aria-label="Hora de envío" defaultValue="10:00" onValueChange={onValueChange} />)
    await user.clear(field())
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it("viaja en un form por el hidden con name, también con Enter", async () => {
    const user = userEvent.setup()
    let sent: FormData | undefined
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sent = new FormData(event.currentTarget)
        }}
      >
        <TimePicker aria-label="Hora de envío" name="hora" />
        <button type="submit">Programar</button>
      </form>
    )
    await user.type(field(), "1437{Enter}")
    expect(sent?.get("hora")).toBe("14:37")
  })

  it("el reset del form vuelve al defaultValue, también el hidden", async () => {
    const user = userEvent.setup()
    render(
      <form data-testid="form">
        <TimePicker aria-label="Hora de envío" defaultValue="09:30" name="hora" />
      </form>
    )
    const form = screen.getByTestId("form") as HTMLFormElement
    await user.clear(field())
    await user.type(field(), "14")
    await user.tab()
    expect(new FormData(form).get("hora")).toBe("14:00")
    act(() => form.reset())
    expect(field()).toHaveValue("09:30")
    expect(new FormData(form).get("hora")).toBe("09:30")
  })

  it("controlado: un value nuevo reemplaza lo tipeado", async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [time, setTime] = React.useState<string | null>("09:00")
      return (
        <>
          <TimePicker aria-label="Hora de envío" onValueChange={setTime} value={time} />
          <button onClick={() => setTime("18:30")} type="button">
            Tarde
          </button>
        </>
      )
    }
    render(<Controlled />)
    expect(field()).toHaveValue("09:00")
    await user.click(screen.getByRole("button", { name: "Tarde" }))
    expect(field()).toHaveValue("18:30")
  })

  it("los textos salen de LabelsProvider y la prop labels le gana", async () => {
    const user = userEvent.setup()
    render(
      <LabelsProvider value={{ timePicker: { placeholder: "hh:mm", invalid: "Invalid time" } }}>
        <TimePicker aria-label="Hora de envío" />
        <TimePicker aria-label="Cierre" labels={{ placeholder: "--:--" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("combobox", { name: "Cierre" })).toHaveAttribute("placeholder", "--:--")
    await user.type(field(), "x")
    await user.tab()
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("Invalid time")
  })

  it("hidrata sin mismatch", async () => {
    const ui = <TimePicker aria-label="Hora de envío" defaultValue="09:30" name="hora" />
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
