// `rows` en `Textarea` (2.1): con `field-sizing: content` el navegador ignora `rows` y el campo arrancaba
// siempre en `min-h-20`. Ahora `rows` es el alto mínimo (y sigue creciendo con el texto). Es CSS en
// `theme.css`, sin JS: el barrel está en su tope. jsdom no aplica el CSS; el alto se mira en el navegador.
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Textarea } from "../../src/components/textarea"

const theme = readFileSync(join(import.meta.dirname, "../../src/styles/theme.css"), "utf8")

describe("Textarea rows", () => {
  it("rows llega al <textarea> y el campo sigue creciendo con el texto", () => {
    render(<Textarea aria-label="Detalle" rows={6} />)
    const field = screen.getByRole("textbox", { name: "Detalle" })
    expect(field).toHaveAttribute("rows", "6")
    expect(field).toHaveClass("field-sizing-content", "min-h-20")
  })

  it("theme.css: de 1 a 12 filas, el mínimo es filas × alto de línea + el padding y el borde", () => {
    const layer = theme.slice(theme.indexOf("/* Textarea rows */"))
    expect(layer).toMatch(/@layer utilities \{/)
    for (let rows = 1; rows <= 12; rows++) {
      expect(layer).toContain(`[data-slot="textarea"][rows="${rows}"] {\n    min-height: calc(${rows} * 1lh + 1.5rem + 2px);`)
    }
  })

  it("sin rows, lo de 2.0: min-h-20", () => {
    render(<Textarea aria-label="Detalle" />)
    expect(screen.getByRole("textbox")).not.toHaveAttribute("rows")
  })
})
