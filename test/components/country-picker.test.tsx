import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CountryPicker } from "../../src/components/country-picker"
import { COUNTRY_CODES, countryFlag, countryName, isCountryCode } from "../../src/lib/countries"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

afterEach(() => vi.restoreAllMocks())

const field = () => screen.getByRole("combobox", { name: "País" })
const options = () => within(screen.getByRole("listbox")).getAllByRole("option").map((option) => option.textContent)

describe("lib/countries", () => {
  it("los 249 códigos de ISO 3166-1 alfa-2, sin repetir ni retirados", () => {
    expect(COUNTRY_CODES).toHaveLength(249)
    expect(new Set(COUNTRY_CODES).size).toBe(249)
    expect(COUNTRY_CODES).toContain("AR")
    for (const retired of ["UK", "EU", "XK", "AN", "ZZ"]) expect(COUNTRY_CODES).not.toContain(retired)
    expect(isCountryCode("ar")).toBe(true)
    expect(isCountryCode("UK")).toBe(false)
  })

  it("la bandera se arma con el código y el nombre sale de Intl en el idioma pedido", () => {
    expect(countryFlag("AR")).toBe("\u{1F1E6}\u{1F1F7}")
    expect(countryFlag("uy")).toBe("\u{1F1FA}\u{1F1FE}")
    expect(countryName("BR", "es-AR")).toBe("Brasil")
    expect(countryName("BR", "en")).toBe("Brazil")
  })
})

describe("CountryPicker", () => {
  it("un combobox con los países por nombre en el idioma de labels, con su bandera", async () => {
    const user = userEvent.setup()
    render(<CountryPicker aria-label="País" />)
    expect(field()).toHaveAttribute("placeholder", "Elegí un país")
    await user.click(field())
    const list = await screen.findByRole("listbox")
    const peru = within(list).getByRole("option", { name: "Perú" })
    expect(peru.querySelector("[data-slot=country-flag]")).toHaveAttribute("aria-hidden", "true")
    expect(peru.querySelector("[data-slot=country-flag]")).toHaveTextContent(countryFlag("PE"))
    expect(within(list).getAllByRole("option")).toHaveLength(249)
  })

  it("filtra sin tildes, la primera coincidencia queda resaltada y Enter la elige", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<CountryPicker aria-label="País" onValueChange={onValueChange} />)
    await user.type(field(), "peru")
    expect(options()).toEqual([`${countryFlag("PE")}Perú`])
    await user.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("PE")
    expect(field()).toHaveValue("Perú")
  })

  it("↓ y ↑ recorren la lista", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<CountryPicker aria-label="País" countries={["UY", "AR", "CL"]} onValueChange={onValueChange} />)
    await user.click(field())
    // Ordenados por nombre: Argentina, Chile, Uruguay.
    expect(options()).toEqual([`${countryFlag("AR")}Argentina`, `${countryFlag("CL")}Chile`, `${countryFlag("UY")}Uruguay`])
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("CL")
  })

  it("sin resultados lo dice en la región viva del combobox", async () => {
    const user = userEvent.setup()
    render(<CountryPicker aria-label="País" />)
    await user.type(field(), "zzz")
    expect(await screen.findByText("Sin resultados")).toBeInTheDocument()
  })

  it("viaja en un form con el código", () => {
    render(
      <form data-testid="form">
        <CountryPicker aria-label="País" defaultValue="AR" name="country" />
      </form>
    )
    expect(field()).toHaveValue("Argentina")
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("country")).toBe("AR")
  })

  it("el idioma sale de LabelsProvider; la prop locale y labels le ganan", () => {
    render(
      <LabelsProvider value={{ countryPicker: { locale: "en", placeholder: "Choose a country" } }}>
        <CountryPicker aria-label="Country" defaultValue="BR" />
        <CountryPicker aria-label="País" defaultValue="BR" labels={{ placeholder: "País de emisión" }} locale="es-AR" />
      </LabelsProvider>
    )
    expect(screen.getByRole("combobox", { name: "Country" })).toHaveValue("Brazil")
    expect(screen.getByRole("combobox", { name: "Country" })).toHaveAttribute("placeholder", "Choose a country")
    expect(field()).toHaveValue("Brasil")
    expect(field()).toHaveAttribute("placeholder", "País de emisión")
  })

  it("hidrata sin mismatch", async () => {
    const ui = <CountryPicker aria-label="País" defaultValue="AR" name="country" />
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
