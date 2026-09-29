import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { PhoneInput } from "../../src/components/phone-input"
import { countryFlag } from "../../src/lib/countries"
import { LabelsProvider } from "../../src/lib/labels"
import { isValidPhone, parsePhone, PHONE_COUNTRIES, phoneCountry, toE164 } from "../../src/lib/phone"
import { hidratar } from "../hidratar"

afterEach(() => vi.restoreAllMocks())

const number = () => screen.getByRole("textbox", { name: "Teléfono" })
const country = () => screen.getByRole("combobox", { name: /^Código de país/ })

describe("lib/phone", () => {
  it("la tabla no repite países y cada largo es posible", () => {
    const codes = PHONE_COUNTRIES.map((item) => item.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const item of PHONE_COUNTRIES) {
      expect(item.min, item.code).toBeGreaterThan(0)
      expect(item.max, item.code).toBeGreaterThanOrEqual(item.min)
      expect(item.dial, item.code).toMatch(/^[1-9]\d{0,2}$/)
    }
    expect(phoneCountry("ar")).toEqual({ code: "AR", dial: "54", min: 10, max: 11 })
  })

  it("parsePhone toma el código más largo y desempata +1 con el preferido", () => {
    expect(parsePhone("+598 99 123 456")).toEqual({ country: phoneCountry("UY"), national: "99123456" })
    expect(parsePhone("+1 416 555 0100")?.country.code).toBe("US")
    expect(parsePhone("+1 416 555 0100", "CA")?.country.code).toBe("CA")
    expect(parsePhone("5491155552002")).toBeNull()
    expect(parsePhone("+999 1234")).toBeNull()
  })

  it("isValidPhone mira el largo del número de su país", () => {
    expect(isValidPhone("+5491155552002")).toBe(true)
    expect(isValidPhone("+541145552002")).toBe(true)
    expect(isValidPhone("+54114555200")).toBe(false)
    expect(isValidPhone("+59899123456")).toBe(true)
    expect(isValidPhone("+5989912345")).toBe(false)
    expect(isValidPhone("")).toBe(false)
    expect(toE164(phoneCountry("AR")!, "11 5555-2002")).toBe("+541155552002")
  })
})

describe("PhoneInput", () => {
  it("el selector compacto con bandera y código, y el número en dígitos", () => {
    render(<PhoneInput aria-label="Teléfono" />)
    expect(country()).toHaveTextContent(`${countryFlag("AR")}+54`)
    expect(country()).toHaveAccessibleName("Código de país: Argentina (+54)")
    expect(number()).toHaveAttribute("inputmode", "tel")
    expect(number().closest("[data-slot=input-group]")).toHaveAttribute("data-size", "md")
  })

  it("tipear deja solo los dígitos y avisa el E.164", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<PhoneInput aria-label="Teléfono" onValueChange={onValueChange} />)
    await user.type(number(), "11 5555-2002")
    expect(number()).toHaveValue("1155552002")
    expect(onValueChange).toHaveBeenLastCalledWith("+541155552002")
  })

  it("corta en el largo máximo del país", async () => {
    const user = userEvent.setup()
    render(<PhoneInput aria-label="Teléfono" defaultCountry="UY" />)
    await user.type(number(), "9912345678")
    expect(number()).toHaveValue("99123456")
  })

  it("cambiar de país con el teclado conserva el número", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<PhoneInput aria-label="Teléfono" defaultValue="+5491155552002" onValueChange={onValueChange} />)
    country().focus()
    await user.keyboard("{Enter}")
    const list = await screen.findByRole("listbox")
    await user.click(within(list).getByRole("option", { name: /Uruguay/ }))
    expect(onValueChange).toHaveBeenLastCalledWith("+59891155552")
    expect(country()).toHaveAccessibleName("Código de país: Uruguay (+598)")
  })

  it("pegar un número con + cambia el país", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<PhoneInput aria-label="Teléfono" onValueChange={onValueChange} />)
    await user.click(number())
    await user.paste("+56 9 1234 5678")
    expect(onValueChange).toHaveBeenLastCalledWith("+56912345678")
    expect(country()).toHaveTextContent("+56")
    expect(number()).toHaveValue("912345678")
  })

  it("viaja en un form en E.164 por el hidden con name", () => {
    render(
      <form data-testid="form">
        <PhoneInput aria-label="Teléfono" defaultValue="+5491155552002" name="phone" />
      </form>
    )
    expect(number()).toHaveValue("91155552002")
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("phone")).toBe("+5491155552002")
  })

  it("controlado con +1: el país elegido desempata", async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [phone, setPhone] = React.useState("")
      return <PhoneInput aria-label="Teléfono" defaultCountry="CA" onValueChange={setPhone} value={phone} />
    }
    render(<Controlled />)
    await user.type(number(), "4165550100")
    expect(country()).toHaveAccessibleName("Código de país: Canadá (+1)")
  })

  it("los textos salen de LabelsProvider y la prop labels le gana", () => {
    render(
      <LabelsProvider value={{ phoneInput: { country: "Country code" }, countryPicker: { locale: "en" } }}>
        <PhoneInput aria-label="Phone" />
        <PhoneInput aria-label="Teléfono" labels={{ country: "Código de país" }} locale="es-AR" />
      </LabelsProvider>
    )
    expect(screen.getByRole("combobox", { name: "Country code: Argentina (+54)" })).toBeInTheDocument()
    expect(country()).toHaveAccessibleName("Código de país: Argentina (+54)")
  })

  it("hidrata sin mismatch", async () => {
    const ui = <PhoneInput aria-label="Teléfono" defaultValue="+5491155552002" name="phone" />
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
