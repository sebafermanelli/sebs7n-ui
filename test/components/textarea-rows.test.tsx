// `rows` en `Textarea` (2.1): con `field-sizing: content` el navegador ignora `rows` y el campo arrancaba
// siempre en el mínimo de 5rem. Ahora `rows` es el alto mínimo (y sigue creciendo con el texto). Es CSS en
// `theme.css`, sin JS: solo pone `--sf-textarea-min`, y un `min-h-*` de la app le gana. La cascada con el
// CSS compilado está en `docs/site/test/theme-cascade.test.ts`.
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
    expect(field).toHaveClass("field-sizing-content", "min-h-[var(--sf-textarea-min,5rem)]")
  })

  it("theme.css: de 1 a 12 filas, el mínimo es filas × alto de línea + el padding y el borde", () => {
    const layer = theme.slice(theme.indexOf("/* Textarea rows */"))
    for (let rows = 1; rows <= 12; rows++) {
      expect(layer).toContain(`:where([data-slot="textarea"][rows="${rows}"]) {\n    --sf-textarea-min: calc(${rows} * 1lh + 1.5rem + 2px);`)
    }
  })

  it("un min-h-* de la app reemplaza el mínimo (y con él, el de rows)", () => {
    render(<Textarea aria-label="Detalle" className="min-h-40" rows={6} />)
    const field = screen.getByRole("textbox")
    expect(field).toHaveClass("min-h-40")
    expect(field).not.toHaveClass("min-h-[var(--sf-textarea-min,5rem)]")
  })

  it("sin rows, lo de 2.0: 5rem", () => {
    render(<Textarea aria-label="Detalle" />)
    expect(screen.getByRole("textbox")).not.toHaveAttribute("rows")
  })
})
