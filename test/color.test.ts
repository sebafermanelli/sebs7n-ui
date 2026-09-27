// @vitest-environment node
import { describe, expect, it } from "vitest"

import { cssOfOklch, isSameColor, oklchOfHex } from "../src/lib/color"
import { hexOfOklch } from "../src/lib/contrast"

describe("oklchOfHex", () => {
  it("ida y vuelta: un hexadecimal vuelve a ser el mismo hexadecimal", () => {
    for (const hex of ["#0070f3", "#e70022", "#28a948", "#ffb200", "#171717", "#ffffff", "#000000", "#9f00f4"]) {
      const vuelta = hexOfOklch(oklchOfHex(hex)!)
      // Un paso de tolerancia por canal: OKLCH se redondea a cuatro decimales para escribirlo en CSS.
      for (const i of [1, 3, 5]) {
        expect(Math.abs(parseInt(vuelta.slice(i, i + 2), 16) - parseInt(hex.slice(i, i + 2), 16)), `${hex} → ${vuelta}`).toBeLessThanOrEqual(1)
      }
    }
  })

  it("acepta #rgb, mayúsculas y sin numeral, y rechaza lo que no es un color", () => {
    expect(oklchOfHex("#fff")).toEqual(oklchOfHex("#ffffff"))
    expect(oklchOfHex("0070F3")).toEqual(oklchOfHex("#0070f3"))
    expect(oklchOfHex("  #0070f3 ")).toEqual(oklchOfHex("#0070f3"))
    for (const malo of ["", "#0070", "#zzzzzz", "azul", "#0070f3ff"]) expect(oklchOfHex(malo), malo).toBeNull()
  })

  it("un gris no tiene matiz", () => {
    expect(oklchOfHex("#808080")![1]).toBe(0)
    expect(oklchOfHex("#808080")![2]).toBe(0)
  })
})

describe("cssOfOklch", () => {
  it("escribe el color como lo lee el CSS", () => {
    expect(cssOfOklch([0.573, 0.214, 258])).toBe("oklch(0.573 0.214 258)")
    expect(cssOfOklch([0.5, 0.1, 35.44])).toBe("oklch(0.5 0.1 35.4)")
  })
})

describe("isSameColor", () => {
  it("compara por lo que se ve, no bit a bit", () => {
    expect(isSameColor([0.573, 0.214, 258], [0.5731, 0.2141, 258.01])).toBe(true)
    expect(isSameColor([0.573, 0.214, 258], [0.55, 0.16, 35])).toBe(false)
  })
})
