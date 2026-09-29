import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Stepper, type StepperStep } from "../../src/components/stepper"
import { LabelsProvider } from "../../src/lib/labels"

const PASOS: StepperStep[] = [
  { title: "Cliente", description: "Acme S.A." },
  { title: "Ítems", description: "3 servicios" },
  { title: "Impuestos" },
  { title: "Confirmar" },
]

const circulo = (paso: HTMLElement) => paso.querySelector("[data-slot=stepper-indicator]") as HTMLElement

describe("Stepper", () => {
  it("es una lista ordenada con nombre: el lector cuenta los pasos", () => {
    render(<Stepper current={1} steps={PASOS} />)
    const lista = screen.getByRole("list", { name: "Pasos" })
    expect(lista.tagName).toBe("OL")
    expect(within(lista).getAllByRole("listitem")).toHaveLength(4)
  })

  it("antes del actual, completos; el actual con aria-current=step; después, pendientes", () => {
    render(<Stepper aria-label="Nueva factura" current={1} steps={PASOS} />)
    const pasos = within(screen.getByRole("list", { name: "Nueva factura" })).getAllByRole("listitem")
    expect(pasos.map((paso) => paso.dataset.status)).toEqual(["complete", "current", "upcoming", "upcoming"])
    expect(pasos[1]).toHaveAttribute("aria-current", "step")
    expect(pasos[0]).not.toHaveAttribute("aria-current")
    // El estado se dice en texto, no solo con el color o el tilde.
    expect(pasos[0]).toHaveTextContent("Cliente, completado")
    expect(pasos[2]).toHaveTextContent("Impuestos, pendiente")
  })

  it("completo: acento sólido con el tilde; actual: aro de acento con el número; pendiente: gris", () => {
    render(<Stepper current={1} steps={PASOS} />)
    const [completo, actual, pendiente] = screen.getAllByRole("listitem")
    expect(circulo(completo!)).toHaveClass("bg-brand-700", "text-brand-contrast")
    expect(circulo(completo!).querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    expect(circulo(actual!)).toHaveClass("border-brand-700", "text-brand-ink")
    expect(circulo(actual!)).toHaveTextContent("2")
    expect(circulo(pendiente!)).toHaveClass("bg-fill-2", "text-label-secondary")
    expect(circulo(pendiente!)).toHaveTextContent("3")
    // El número y el tilde son decorativos: la posición la dice la lista.
    expect(circulo(pendiente!)).toHaveAttribute("aria-hidden", "true")
  })

  it("status explícito: error en rojo, y lo dice", () => {
    render(<Stepper current={2} steps={PASOS.map((paso, index) => (index === 1 ? { ...paso, status: "error" } : paso))} />)
    const error = screen.getAllByRole("listitem")[1]!
    expect(error.dataset.status).toBe("error")
    expect(circulo(error)).toHaveClass("bg-red-800", "text-white")
    expect(error).toHaveTextContent("Ítems, con error")
  })

  it("el conector va en el acento después de un paso completo y gris si no", () => {
    render(<Stepper current={1} steps={PASOS} />)
    const conectores = document.querySelectorAll("[data-slot=stepper-connector]")
    // Uno menos que los pasos: el último no tiene a quién unirse.
    expect(conectores).toHaveLength(3)
    expect(conectores[0]).toHaveClass("bg-brand-700")
    expect(conectores[1]).toHaveClass("bg-separator")
    expect(conectores[0]).toHaveAttribute("aria-hidden", "true")
  })

  it("íconos propios en lugar del número", () => {
    render(<Stepper current={0} steps={[{ title: "Cliente", icon: <svg data-testid="icono" /> }, { title: "Ítems" }]} />)
    expect(circulo(screen.getAllByRole("listitem")[0]!)).toContainElement(screen.getByTestId("icono"))
  })

  it("onStepClick: los completos son botones para volver; el actual y los pendientes no", async () => {
    const onStepClick = vi.fn()
    render(<Stepper current={2} onStepClick={onStepClick} steps={PASOS} />)
    const botones = screen.getAllByRole("button")
    expect(botones).toHaveLength(2)
    await userEvent.click(screen.getByRole("button", { name: /Ítems/ }))
    expect(onStepClick).toHaveBeenCalledWith(1)
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Cliente/ }))
    await userEvent.keyboard("{Enter}")
    expect(onStepClick).toHaveBeenLastCalledWith(0)
  })

  it("vertical: los pasos en columna y el conector vertical", () => {
    render(<Stepper current={0} orientation="vertical" steps={PASOS} />)
    const lista = screen.getByRole("list")
    expect(lista).toHaveAttribute("data-orientation", "vertical")
    expect(lista).toHaveClass("flex-col")
    expect(document.querySelector("[data-slot=stepper-connector]")).toHaveClass("w-px")
  })

  it("los textos se traducen con el LabelsProvider", () => {
    render(
      <LabelsProvider value={{ stepper: { label: "Steps", complete: "completed" } }}>
        <Stepper current={1} steps={PASOS} />
      </LabelsProvider>
    )
    expect(screen.getByRole("list", { name: "Steps" })).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Cliente, completed")
  })
})
