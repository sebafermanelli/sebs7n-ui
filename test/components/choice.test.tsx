import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Checkbox } from "../../src/components/checkbox"
import { RadioGroup, RadioGroupItem } from "../../src/components/radio-group"
import { Switch } from "../../src/components/switch"

describe("Checkbox", () => {
  it("se tilda con click y expone data-checked", async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Acepto" onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole("checkbox", { name: "Acepto" })
    await userEvent.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
    expect(box).toHaveAttribute("data-checked")
  })

  // iCloud (Calendar): 16 px, esquinas de 4, el relleno del color con el tilde blanco. Marcada no
  // lleva borde: el relleno ya es el contorno. Deshabilitada a .4, como los botones.
  it("tiene los estados de la tabla del spec", () => {
    render(<Checkbox aria-label="x" />)
    const box = screen.getByRole("checkbox")
    expect(box).toHaveClass(
      "size-4",
      "rounded-sm",
      "border-label-tertiary",
      "hover:border-label-secondary",
      "focus-visible:focus-ring",
      "bg-surface",
      "data-checked:border-transparent",
      "data-checked:bg-brand-700",
      "data-checked:hover:bg-brand-800",
      "data-disabled:opacity-40",
      "aria-invalid:border-red-800"
    )
    expect(box.className).not.toMatch(/data-disabled:(bg|border|text)-/)
  })

  // El check circular de Reminders (§2.14): 22 px, borde fino gris, se llena del color al completar.
  it("shape circle es el check de Reminders", () => {
    render(<Checkbox aria-label="Comprar pan" shape="circle" />)
    const box = screen.getByRole("checkbox", { name: "Comprar pan" })
    expect(box).toHaveAttribute("data-shape", "circle")
    expect(box).toHaveClass("size-5.5", "rounded-full", "border-[1.5px]")
    expect(box).not.toHaveClass("size-4", "rounded-sm")
  })

  it("indeterminate se marca con data-indeterminate", () => {
    render(<Checkbox aria-label="x" indeterminate />)
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-indeterminate")
  })
})

describe("RadioGroup", () => {
  it("selecciona un solo ítem", async () => {
    render(
      <RadioGroup defaultValue="a" aria-label="Plan">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>
    )
    await userEvent.click(screen.getByRole("radio", { name: "B" }))
    expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute("data-checked")
    expect(screen.getByRole("radio", { name: "A" })).not.toHaveAttribute("data-checked")
  })

  it("marcado sin borde, deshabilitado a .4", () => {
    render(
      <RadioGroup defaultValue="a" aria-label="Plan">
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>
    )
    const radio = screen.getByRole("radio", { name: "A" })
    expect(radio).toHaveClass("size-4", "rounded-full", "data-checked:border-transparent", "data-checked:bg-brand-700", "data-disabled:opacity-40")
    expect(radio.className).not.toMatch(/data-disabled:(border)-/)
  })
})

// Revisión de R4 (M1): vacía y apagada a .4, la casilla quedaba en ~1,4:1 contra la página y casi
// no se encontraba. Vacía no se apaga: conserva su contorno (label-tertiary, 3,69:1) y el interior
// pasa al gris de fill-2, que dice «apagada». Marcada sigue a .4, como iCloud.
describe("Checkbox y Radio vacíos y deshabilitados", () => {
  it("la casilla vacía conserva el contorno y se rellena de gris", () => {
    render(<Checkbox aria-label="x" disabled />)
    const box = screen.getByRole("checkbox")
    expect(box).toHaveClass(
      "data-disabled:opacity-40",
      "data-disabled:not-data-checked:not-data-indeterminate:opacity-100",
      "data-disabled:not-data-checked:not-data-indeterminate:bg-fill-2",
      "border-label-tertiary"
    )
  })

  it("el radio vacío también", () => {
    render(
      <RadioGroup aria-label="Plan" disabled>
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>
    )
    expect(screen.getByRole("radio", { name: "A" })).toHaveClass(
      "data-disabled:not-data-checked:opacity-100",
      "data-disabled:not-data-checked:bg-fill-2"
    )
  })
})

describe("Switch", () => {
  it("prende con click y con la marca; neutral es la salida al gris", async () => {
    render(<Switch aria-label="Avisos" variant="accent" />)
    const sw = screen.getByRole("switch", { name: "Avisos" })
    expect(sw).toHaveAttribute("data-variant", "accent")
    expect(sw).toHaveClass("bg-gray-700", "data-checked:bg-brand-700", "data-[variant=neutral]:data-checked:bg-label")
    await userEvent.click(sw)
    expect(sw).toHaveAttribute("data-checked")
  })

  it("tamaños md (20×36) y sm (16×28)", () => {
    render(<Switch aria-label="s" size="sm" />)
    expect(screen.getByRole("switch")).toHaveAttribute("data-size", "sm")
  })

  it("estado invalid también por data-invalid, como Checkbox y Radio", () => {
    render(<Switch aria-label="Avisos" />)
    expect(screen.getByRole("switch")).toHaveClass("aria-invalid:ring-red-800", "data-invalid:ring-red-800")
  })

  // iCloud no tiene Switch: se deriva. Apagado, como todo control del sistema, a .4.
  it("deshabilitado a .4", () => {
    render(<Switch aria-label="Avisos" disabled />)
    const sw = screen.getByRole("switch")
    expect(sw).toHaveClass("data-disabled:opacity-40")
    expect(sw.className).not.toMatch(/data-disabled:bg-/)
  })
})
