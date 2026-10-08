import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { TextDiff } from "../../src/components/text-diff"

describe("TextDiff", () => {
  it("lo quitado en <del>, lo agregado en <ins>, cada uno con su aviso para el lector", () => {
    const { container } = render(<TextDiff from="Pago a 30 días" to="Pago a 60 días" />)
    const del = container.querySelector("del")!
    const ins = container.querySelector("ins")!
    expect(del).toHaveTextContent("Eliminado: 30")
    expect(ins).toHaveTextContent("Agregado: 60")
    expect(screen.getByText("Eliminado:")).toHaveClass("sr-only")
    expect(del).toHaveClass("line-through")
  })

  it("se renderiza en el servidor", () => {
    expect(renderToString(<TextDiff from="a" to="b" />)).toContain("<ins")
  })
})
