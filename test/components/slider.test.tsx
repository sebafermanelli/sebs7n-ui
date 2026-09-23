import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Slider } from "../../src/components/slider"

const control = () => document.querySelector("[data-slot=slider-control]")!
const track = () => document.querySelector("[data-slot=slider-track]")!
const thumbs = () => [...document.querySelectorAll("[data-slot=slider-thumb]")]

describe("Slider", () => {
  it("es un slider con valor y límites anunciados", () => {
    render(<Slider aria-label="Volumen" defaultValue={40} />)
    // El nombre tiene que caer en el <input type="range">, no solo en el grupo.
    const input = screen.getByRole("slider", { name: "Volumen" })
    expect(input).toHaveAttribute("aria-valuenow", "40")
    expect(input).toHaveAttribute("min", "0")
    expect(input).toHaveAttribute("max", "100")
    expect(screen.getByRole("group", { name: "Volumen" })).toHaveAttribute("data-slot", "slider")
  })

  it("el label visible nombra al thumb: no hace falta aria-label", () => {
    render(<Slider defaultValue={40} label="Descuento" />)
    expect(screen.getByRole("slider", { name: "Descuento" })).toBeInTheDocument()
  })

  it("teclado: flechas por `step`, Shift por `largeStep`, Inicio y Fin a los extremos", async () => {
    const onValueChange = vi.fn()
    render(<Slider aria-label="Volumen" defaultValue={40} onValueChange={onValueChange} step={5} />)
    const input = screen.getByRole("slider")
    await userEvent.tab()
    expect(input).toHaveFocus()

    await userEvent.keyboard("{ArrowRight}")
    expect(input).toHaveAttribute("aria-valuenow", "45")
    await userEvent.keyboard("{ArrowDown}")
    expect(input).toHaveAttribute("aria-valuenow", "40")
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}")
    expect(input).toHaveAttribute("aria-valuenow", "50")

    await userEvent.keyboard("{End}")
    expect(input).toHaveAttribute("aria-valuenow", "100")
    await userEvent.keyboard("{Home}")
    expect(input).toHaveAttribute("aria-valuenow", "0")
    expect(onValueChange).toHaveBeenCalled()
  })

  it("de rango: un thumb por valor, cada uno con su aria-valuenow", async () => {
    render(<Slider defaultValue={[20, 60]} label="Precio" />)
    const inputs = screen.getAllByRole("slider")
    expect(inputs).toHaveLength(2)
    expect(thumbs()).toHaveLength(2)
    expect(inputs[0]).toHaveAttribute("aria-valuenow", "20")
    expect(inputs[1]).toHaveAttribute("aria-valuenow", "60")
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}")
    expect(inputs[0]).toHaveAttribute("aria-valuenow", "21")
    expect(inputs[1]).toHaveAttribute("aria-valuenow", "60")
  })

  it("showValue muestra el valor, y en un rango los dos", () => {
    const { unmount } = render(<Slider aria-label="x" defaultValue={35} showValue />)
    expect(screen.getByText("35")).toBeInTheDocument()
    unmount()
    render(<Slider aria-label="y" defaultValue={[10, 90]} showValue />)
    expect(screen.getByText(/10/)).toBeInTheDocument()
    expect(screen.getByText(/90/)).toBeInTheDocument()
  })

  it("las marcas son decoración: aria-hidden y posicionadas por porcentaje", () => {
    render(<Slider aria-label="x" defaultValue={50} marks={[0, 50, 100]} />)
    const marks = [...document.querySelectorAll("[data-slot=slider-mark]")]
    expect(marks).toHaveLength(3)
    for (const mark of marks) expect(mark).toHaveAttribute("aria-hidden", "true")
    expect(marks[1]).toHaveStyle({ insetInlineStart: "50%" })
  })

  it("las marcas siguen a min y max, no al 0–100 fijo", () => {
    render(<Slider aria-label="x" defaultValue={10} marks={[10]} max={20} min={0} />)
    expect(document.querySelector("[data-slot=slider-mark]")).toHaveStyle({ insetInlineStart: "50%" })
  })

  it("tamaños: el área arrastrable es 32px en sm y 40px en md", () => {
    const { rerender } = render(<Slider aria-label="x" defaultValue={10} />)
    expect(document.querySelector("[data-slot=slider]")).toHaveAttribute("data-size", "md")
    expect(control()).toHaveClass("group-data-[size=sm]/slider:h-8", "group-data-[size=md]/slider:h-10")
    rerender(<Slider aria-label="x" defaultValue={10} size="sm" />)
    expect(document.querySelector("[data-slot=slider]")).toHaveAttribute("data-size", "sm")
  })

  it("el foco vive en el input de adentro, así que el anillo va en el thumb", () => {
    render(<Slider aria-label="x" defaultValue={10} />)
    const thumb = thumbs()[0]!
    expect(thumb).toHaveClass("has-[input:focus-visible]:focus-ring", "rounded-full")
    expect(thumb.querySelector("input[type=range]")).toBeInTheDocument()
  })

  it("usa los tokens del sistema", () => {
    render(<Slider aria-label="x" defaultValue={10} />)
    expect(track()).toHaveClass("bg-gray-300", "rounded-full")
    expect(document.querySelector("[data-slot=slider-indicator]")).toHaveClass("bg-gray-1000")
    expect(thumbs()[0]).toHaveClass("bg-background-100", "border-gray-alpha-400", "shadow-tooltip", "transition-control")
  })

  it("disabled: no se mueve y queda marcado", async () => {
    render(<Slider aria-label="x" defaultValue={40} disabled />)
    const input = screen.getByRole("slider")
    expect(input).toBeDisabled()
    expect(document.querySelector("[data-slot=slider]")).toHaveAttribute("data-disabled")
    input.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(input).toHaveAttribute("aria-valuenow", "40")
  })

  it("el className del llamador le gana a la clase base", () => {
    render(<Slider aria-label="x" className="w-56" controlClassName="h-6" defaultValue={10} />)
    const root = document.querySelector("[data-slot=slider]")!
    expect(root).toHaveClass("w-56")
    expect(root.className).not.toMatch(/\bw-full\b/)
    expect(control()).toHaveClass("h-6")
  })
})
