import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Meter } from "../../src/components/meter"

const track = () => document.querySelector("[data-slot=meter-track]")!
const indicator = () => document.querySelector("[data-slot=meter-indicator]") as HTMLElement

describe("Meter", () => {
  it("es un meter, no un progressbar: la medida se anuncia distinto que una tarea", () => {
    render(<Meter aria-label="Espacio usado" value={62} />)
    const meter = screen.getByRole("meter", { name: "Espacio usado" })
    expect(meter).toHaveAttribute("aria-valuenow", "62")
    expect(meter).toHaveAttribute("aria-valuemin", "0")
    expect(meter).toHaveAttribute("aria-valuemax", "100")
    // Sin `format`, lo que se lee es la proporción, no el número crudo.
    expect(meter).toHaveAttribute("aria-valuetext", "62%")
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })

  it("el label visible es el nombre accesible: no hace falta aria-label", () => {
    render(<Meter label="Cupo mensual" value={30} />)
    expect(screen.getByRole("meter", { name: "Cupo mensual" })).toBeInTheDocument()
  })

  it("min y max propios: la proporción se calcula sobre el rango, no sobre 100", () => {
    render(<Meter aria-label="Legajos cargados" max={40} min={0} value={10} />)
    const meter = screen.getByRole("meter")
    expect(meter).toHaveAttribute("aria-valuenow", "10")
    expect(meter).toHaveAttribute("aria-valuemax", "40")
    expect(meter).toHaveAttribute("aria-valuetext", "25%")
    expect(indicator()).toHaveStyle({ width: "25%" })
  })

  it("un valor fuera de rango se recorta en vez de desbordar la pista", () => {
    render(<Meter aria-label="Cupo" max={100} value={140} />)
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100")
    expect(indicator()).toHaveStyle({ width: "100%" })
  })

  it("format y locale cambian lo que se lee y lo que se ve, no el valor", () => {
    const { rerender } = render(
      <Meter
        aria-label="Consumo"
        format={{ style: "decimal" }}
        locale="es-AR"
        max={500000}
        showValue
        value={125000}
      />
    )
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "125000")
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "125.000")
    expect(screen.getByText("125.000")).toBeInTheDocument()

    rerender(
      <Meter
        aria-label="Consumo"
        format={{ style: "decimal" }}
        locale="en-US"
        max={500000}
        showValue
        value={125000}
      />
    )
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "125,000")
  })

  it("getAriaValueText reemplaza el texto que lee el lector, sin tocar lo que se ve", () => {
    render(
      <Meter
        aria-label="Espacio usado"
        getAriaValueText={(formateado) => `${formateado} de 2 TB`}
        showValue
        value={48}
      />
    )
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "48% de 2 TB")
    expect(screen.getByText("48%")).toBeInTheDocument()
  })

  it("showValue muestra el valor formateado y no se lo repite al lector", () => {
    render(<Meter label="Cupo" showValue value={40} />)
    const valor = screen.getByText("40%")
    expect(valor).toHaveAttribute("data-slot", "meter-value")
    expect(valor).toHaveAttribute("aria-hidden", "true")
  })

  it("tamaños sm (4px) y md (6px) en la pista, los mismos que Progress", () => {
    const { rerender } = render(<Meter aria-label="x" value={10} />)
    expect(screen.getByRole("meter")).toHaveAttribute("data-size", "md")
    expect(track()).toHaveClass("group-data-[size=sm]/meter:h-1", "group-data-[size=md]/meter:h-1.5")
    rerender(<Meter aria-label="x" size="sm" value={10} />)
    expect(screen.getByRole("meter")).toHaveAttribute("data-size", "sm")
  })

  it("usa los tokens del sistema y anima el ancho con transición propia", () => {
    render(<Meter aria-label="x" value={10} />)
    expect(track()).toHaveClass("bg-gray-300", "rounded-full", "overflow-hidden")
    expect(indicator()).toHaveClass("bg-gray-1000", "transition-[width]", "motion-reduce:transition-none")
  })

  it("el className del llamador le gana a la clase base", () => {
    render(<Meter aria-label="x" className="w-40" trackClassName="rounded-sm" value={10} />)
    const meter = screen.getByRole("meter")
    expect(meter).toHaveClass("w-40")
    expect(meter.className).not.toMatch(/\bw-full\b/)
    expect(track()).toHaveClass("rounded-sm")
    expect(track().className).not.toMatch(/\brounded-full\b/)
  })
})
