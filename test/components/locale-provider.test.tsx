import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LocaleProvider, useFormat } from "../../src/components/locale-provider"
import { NumberField } from "../../src/components/number-field"

function Precio({ valor }: { valor: number }) {
  return <span data-testid="p">{useFormat().currency(valor)}</span>
}

describe("LocaleProvider", () => {
  it("sin provider, es-AR y ARS", () => {
    render(<Precio valor={1240.5} />)
    expect(screen.getByTestId("p").textContent).toMatch(/^\$\s1\.240,50$/)
  })

  it("reparte el idioma y la moneda a useFormat", () => {
    render(
      <LocaleProvider currency="USD" locale="en-US">
        <Precio valor={1240.5} />
      </LocaleProvider>
    )
    expect(screen.getByTestId("p").textContent).toBe("$1,240.50")
  })

  it("fija el idioma de NumberField; la prop locale del componente gana", () => {
    render(
      <LocaleProvider locale="en-US">
        <NumberField aria-label="a" defaultValue={1234.5} />
        <NumberField aria-label="b" defaultValue={1234.5} locale="es-AR" />
      </LocaleProvider>
    )
    expect((screen.getByLabelText("a") as HTMLInputElement).value).toBe("1,234.5")
    expect((screen.getByLabelText("b") as HTMLInputElement).value).toBe("1.234,5")
  })
})
