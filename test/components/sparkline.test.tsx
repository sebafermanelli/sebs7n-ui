import { render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Sparkline } from "../../src/components/sparkline"

const svg = () => document.querySelector("svg")!

describe("Sparkline", () => {
  it("es decorativa: aria-hidden", () => {
    render(<Sparkline values={[1, 3, 2]} />)
    expect(svg()).toHaveAttribute("aria-hidden", "true")
  })

  it("dibuja la curva y el área; area={false} deja solo la línea", () => {
    const { rerender } = render(<Sparkline values={[1, 3, 2]} />)
    expect(svg().querySelectorAll("polyline")).toHaveLength(2)
    rerender(<Sparkline area={false} values={[1, 3, 2]} />)
    expect(svg().querySelectorAll("polyline")).toHaveLength(1)
  })

  it("los puntos van de 0 a 100 de ancho, con el máximo arriba", () => {
    render(<Sparkline area={false} values={[0, 10]} />)
    expect(svg().querySelector("polyline")).toHaveAttribute("points", "0.0,28.0 100.0,2.0")
  })

  it("con menos de dos valores, o con valores no finitos, no dibuja nada (y no divide por cero)", () => {
    const { rerender } = render(<Sparkline values={[]} />)
    expect(svg()).toBeNull()
    rerender(<Sparkline values={[5]} />)
    expect(svg()).toBeNull()
    rerender(<Sparkline values={[Number.NaN, 4, Number.POSITIVE_INFINITY]} />)
    expect(svg()).toBeNull()
  })

  it("una serie plana no rompe", () => {
    render(<Sparkline values={[4, 4, 4]} />)
    expect(svg().querySelector("polyline")!.getAttribute("points")).not.toContain("NaN")
  })

  it("el className se fusiona con el color por defecto", () => {
    render(<Sparkline className="h-10 text-red-ink" values={[1, 2]} />)
    expect(svg()).toHaveClass("h-10", "text-red-ink", "w-full")
    expect(svg()).not.toHaveClass("text-brand-900")
  })

  it("renderiza en el servidor y no es un Client Component", async () => {
    expect(renderToString(<Sparkline values={[1, 2, 3]} />)).toContain("polyline")
    const { readFileSync } = await import("node:fs")
    expect(readFileSync(`${import.meta.dirname}/../../src/components/sparkline.tsx`, "utf8")).not.toMatch(/^"use client"/)
  })
})
