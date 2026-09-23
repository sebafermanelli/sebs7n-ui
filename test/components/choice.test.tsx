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

  it("tiene los estados de la tabla del spec", () => {
    render(<Checkbox aria-label="x" />)
    expect(screen.getByRole("checkbox")).toHaveClass(
      "rounded-xs",
      "border-gray-700",
      "hover:border-gray-800",
      "focus-visible:focus-ring",
      "data-checked:bg-gray-1000",
      "data-checked:hover:bg-button-primary-hover",
      "data-disabled:bg-gray-100",
      "aria-invalid:border-red-800"
    )
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
})

describe("Switch", () => {
  it("prende con click; default neutro, accent con la marca", async () => {
    render(<Switch aria-label="Avisos" variant="accent" />)
    const sw = screen.getByRole("switch", { name: "Avisos" })
    expect(sw).toHaveAttribute("data-variant", "accent")
    expect(sw).toHaveClass("bg-gray-700", "data-checked:bg-gray-1000", "data-[variant=accent]:data-checked:bg-brand-700")
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
})
