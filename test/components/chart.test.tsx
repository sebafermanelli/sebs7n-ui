import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  type ChartConfig,
} from "../../src/components/chart"

const config: ChartConfig = {
  ventas: { label: "Ventas" },
  costos: { label: "Costos" },
  margen: { label: "Margen", color: "var(--color-teal-700)" },
}

/** Lo que ve `ChartTooltipContent` cuando Recharts lo llama. */
const payload = [
  { dataKey: "ventas", name: "ventas", value: 1200, color: "var(--color-ventas)", payload: {} },
  { dataKey: "costos", name: "costos", value: 800, color: "var(--color-costos)", payload: {} },
] as never

describe("ChartContainer", () => {
  it("asigna la paleta por posición y respeta el color explícito", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <div />
      </ChartContainer>
    )
    const chart = container.querySelector("[data-slot=chart]") as HTMLElement
    expect(chart.style.getPropertyValue("--color-ventas")).toBe("var(--sf-chart-1)")
    expect(chart.style.getPropertyValue("--color-costos")).toBe("var(--sf-chart-2)")
    // El explícito no consume un lugar de la paleta.
    expect(chart.style.getPropertyValue("--color-margen")).toBe("var(--color-teal-700)")
  })

  it("una sexta serie no inventa un color", () => {
    const seis: ChartConfig = Object.fromEntries(["a", "b", "c", "d", "e", "f"].map((k) => [k, { label: k }]))
    const { container } = render(
      <ChartContainer config={seis}>
        <div />
      </ChartContainer>
    )
    const chart = container.querySelector("[data-slot=chart]") as HTMLElement
    expect(chart.style.getPropertyValue("--color-e")).toBe("var(--sf-chart-5)")
    expect(chart.style.getPropertyValue("--color-f")).toBe("")
  })

  it("el color sigue a la entidad, no al orden en que se filtra", () => {
    const { container } = render(
      <ChartContainer config={{ ventas: { label: "Ventas" }, costos: { label: "Costos" } }}>
        <div />
      </ChartContainer>
    )
    const chart = container.querySelector("[data-slot=chart]") as HTMLElement
    // Sacar `margen` (que tenía color propio) no mueve a nadie.
    expect(chart.style.getPropertyValue("--color-costos")).toBe("var(--sf-chart-2)")
  })
})

describe("ChartTooltipContent", () => {
  it("nombre de la config en gris, valor en tinta y tabular; el texto no lleva el color de la serie", () => {
    render(
      <ChartContainer config={config}>
        <ChartTooltipContent active label="Marzo" payload={payload} />
      </ChartContainer>
    )
    expect(screen.getByText("Marzo")).toHaveClass("text-gray-900")
    expect(screen.getByText("Ventas")).toHaveClass("text-gray-900")
    const valor = screen.getByText("1,200")
    expect(valor).toHaveClass("tabular-nums", "text-gray-1000")
    const indicador = document.querySelector("[data-slot=chart-tooltip-indicator]") as HTMLElement
    expect(indicador.style.backgroundColor).toBe("var(--color-ventas)")
    expect(indicador).toHaveAttribute("aria-hidden", "true")
  })

  it("inactivo o sin datos no pinta nada", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <>
          <ChartTooltipContent active={false} payload={payload} />
          <ChartTooltipContent active payload={[]} />
        </>
      </ChartContainer>
    )
    expect(container.querySelector("[data-slot=chart-tooltip]")).toBeNull()
  })

  it("formatter y hideLabel", () => {
    render(
      <ChartContainer config={config}>
        <ChartTooltipContent active hideLabel label="Marzo" payload={payload} formatter={(v) => `$ ${v}`} />
      </ChartContainer>
    )
    expect(screen.queryByText("Marzo")).toBeNull()
    expect(screen.getByText("$ 1200")).toBeInTheDocument()
  })
})

describe("ChartLegendContent", () => {
  it("un testigo del color y la etiqueta de la config por serie", () => {
    render(
      <ChartContainer config={config}>
        <ChartLegendContent payload={[{ value: "ventas", dataKey: "ventas", color: "var(--color-ventas)" }, { value: "costos", dataKey: "costos" }] as never} />
      </ChartContainer>
    )
    expect(screen.getByText("Ventas")).toBeInTheDocument()
    expect(screen.getByText("Costos")).toBeInTheDocument()
    const items = document.querySelectorAll("[data-slot=chart-legend-item]")
    expect(items).toHaveLength(2)
    expect((items[1]!.firstElementChild as HTMLElement).style.backgroundColor).toBe("var(--color-costos)")
  })
})
