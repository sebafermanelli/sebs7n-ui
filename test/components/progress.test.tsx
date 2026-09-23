import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Progress } from "../../src/components/progress"

const track = () => document.querySelector("[data-slot=progress-track]")!
const indicator = () => document.querySelector("[data-slot=progress-indicator]")!

describe("Progress", () => {
  it("es un progressbar con el valor y los límites anunciados", () => {
    render(<Progress aria-label="Subiendo el archivo" value={62} />)
    const bar = screen.getByRole("progressbar", { name: "Subiendo el archivo" })
    expect(bar).toHaveAttribute("aria-valuenow", "62")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
    expect(bar).toHaveAttribute("data-progressing")
  })

  it("el label visible es el nombre accesible: no hace falta aria-label", () => {
    render(<Progress label="Importando clientes" value={30} />)
    expect(screen.getByRole("progressbar", { name: "Importando clientes" })).toBeInTheDocument()
  })

  it("value={null} es indeterminada: sin aria-valuenow y con la franja que recorre", () => {
    render(<Progress aria-label="Buscando" value={null} />)
    const bar = screen.getByRole("progressbar", { name: "Buscando" })
    expect(bar).not.toHaveAttribute("aria-valuenow")
    expect(bar).toHaveAttribute("data-indeterminate")
    expect(indicator()).toHaveClass("data-indeterminate:w-2/5", "data-indeterminate:animate-progress-indeterminate")
    // Con movimiento reducido no queda una franja congelada a mitad de camino.
    expect(indicator()).toHaveClass("motion-reduce:data-indeterminate:animate-none", "motion-reduce:data-indeterminate:w-full")
  })

  it("al llegar al máximo marca data-complete", () => {
    render(<Progress aria-label="Listo" value={100} />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-complete")
  })

  it("showValue muestra el porcentaje; indeterminada no muestra número", () => {
    const { rerender } = render(<Progress label="Export" showValue value={40} />)
    expect(screen.getByText("40%")).toBeInTheDocument()
    rerender(<Progress label="Export" showValue value={null} />)
    expect(screen.queryByText("40%")).not.toBeInTheDocument()
  })

  it("tamaños sm (4px) y md (6px) en la pista", () => {
    const { rerender } = render(<Progress aria-label="x" value={10} />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-size", "md")
    expect(track()).toHaveClass("group-data-[size=sm]/progress:h-1", "group-data-[size=md]/progress:h-1.5")
    rerender(<Progress aria-label="x" size="sm" value={10} />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-size", "sm")
  })

  it("usa los tokens del sistema y anima el ancho con transición propia", () => {
    render(<Progress aria-label="x" value={10} />)
    expect(track()).toHaveClass("bg-gray-300", "rounded-full", "overflow-hidden")
    expect(indicator()).toHaveClass("bg-gray-1000", "transition-[width]", "motion-reduce:transition-none")
  })

  it("el className del llamador le gana a la clase base", () => {
    render(<Progress aria-label="x" className="w-40" trackClassName="rounded-sm" value={10} />)
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveClass("w-40")
    expect(bar.className).not.toMatch(/\bw-full\b/)
    expect(track()).toHaveClass("rounded-sm")
    expect(track().className).not.toMatch(/\brounded-full\b/)
  })
})
