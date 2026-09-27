// El Playground le da a copiar a alguien el CSS de su marca. Si la conversión de color o la
// elección del texto de encima están mal, lo que se lleva está mal.
import { describe, expect, it } from "vitest"
import { hexOfOklch } from "sebs7n-ui/lib/contrast"
import brands from "sebs7n-ui/tokens/brands.json"

import { cssOfOklch, oklchOfHex, textoSobre, type Oklch } from "../app/_lib/color"

describe("oklchOfHex", () => {
  it("ida y vuelta: un hexadecimal vuelve a ser el mismo hexadecimal", () => {
    for (const hex of ["#0070f3", "#e70022", "#28a948", "#ffb200", "#171717", "#ffffff", "#9f00f4"]) {
      const color = oklchOfHex(hex)!
      // Un paso de tolerancia por canal: OKLCH se redondea a tres decimales para escribirlo en CSS.
      const vuelta = hexOfOklch(color)
      for (const i of [1, 3, 5]) {
        expect(Math.abs(parseInt(vuelta.slice(i, i + 2), 16) - parseInt(hex.slice(i, i + 2), 16)), `${hex} → ${vuelta}`).toBeLessThanOrEqual(2)
      }
    }
  })

  it("acepta #rgb y sin numeral, y rechaza lo que no es un color", () => {
    expect(oklchOfHex("#fff")).toEqual(oklchOfHex("#ffffff"))
    expect(oklchOfHex("0070f3")).toEqual(oklchOfHex("#0070f3"))
    for (const malo of ["", "#0070", "#zzzzzz", "azul"]) expect(oklchOfHex(malo), malo).toBeNull()
  })

  it("un gris no tiene matiz", () => {
    expect(oklchOfHex("#808080")![1]).toBe(0)
    expect(oklchOfHex("#808080")![2]).toBe(0)
  })
})

describe("textoSobre", () => {
  it("elige lo mismo que declara el paquete para sus cuatro marcas, en los dos temas", () => {
    for (const [nombre, temas] of Object.entries(brands as Record<string, Record<string, { base: number[]; contrast: string }>>)) {
      for (const [tema, { base, contrast }] of Object.entries(temas)) {
        const elegido = textoSobre(base as unknown as Oklch)
        expect(elegido.hex, `${nombre} (${tema})`).toBe(contrast)
        expect(elegido.aa, `${nombre} (${tema})`).toBe(true)
      }
    }
  })

  it("avisa cuando ninguno de los dos llega", () => {
    // Un gris medio: 4,5:1 no lo da ni el blanco ni el negro… salvo que sí. Se busca el peor.
    const peor = [0.4, 0.45, 0.5, 0.55, 0.6, 0.65].map((l) => textoSobre([l, 0, 0])).sort((a, b) => a.ratio - b.ratio)[0]!
    expect(peor.aa).toBe(peor.ratio >= 4.5)
  })
})

describe("cssOfOklch", () => {
  it("escribe el color como lo lee el paquete", () => {
    expect(cssOfOklch([0.573, 0.214, 258])).toBe("oklch(0.573 0.214 258)")
    expect(cssOfOklch([0.5, 0.1, 35.44])).toBe("oklch(0.5 0.1 35.4)")
  })
})
