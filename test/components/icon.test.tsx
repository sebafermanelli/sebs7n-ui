import { render, screen } from "@testing-library/react"
import { CheckIcon, SearchIcon } from "lucide-react"
import { describe, expect, it } from "vitest"

import { Icon } from "../../src/components/icon"

describe("Icon", () => {
  it("sin label es decoración: aria-hidden, sin rol y fuera del foco", () => {
    const { container } = render(<Icon icon={SearchIcon} />)
    const icon = container.querySelector("[data-slot=icon]")!
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(icon).toHaveAttribute("focusable", "false")
    expect(icon).not.toHaveAttribute("role")
  })

  it("con label es una imagen con nombre", () => {
    render(<Icon icon={CheckIcon} label="Pagada" />)
    const icon = screen.getByRole("img", { name: "Pagada" })
    expect(icon).toHaveAttribute("data-slot", "icon")
    expect(icon).not.toHaveAttribute("aria-hidden")
  })

  it("tamaños 16/20/24, md por defecto", () => {
    render(
      <>
        <Icon data-testid="sm" icon={SearchIcon} size="sm" />
        <Icon data-testid="md" icon={SearchIcon} />
        <Icon data-testid="lg" icon={SearchIcon} size="lg" />
      </>
    )
    expect(screen.getByTestId("sm")).toHaveClass("size-4")
    expect(screen.getByTestId("md")).toHaveClass("size-5")
    expect(screen.getByTestId("lg")).toHaveClass("size-6")
    expect(screen.getByTestId("md")).toHaveAttribute("data-size", "md")
  })

  it("el tono por defecto hereda el color del texto; los otros usan el 900 de su familia", () => {
    render(
      <>
        <Icon data-testid="current" icon={SearchIcon} />
        <Icon data-testid="danger" icon={SearchIcon} tone="danger" />
        <Icon data-testid="brand" icon={SearchIcon} tone="brand" />
      </>
    )
    expect(screen.getByTestId("current").getAttribute("class")).not.toMatch(/text-/)
    expect(screen.getByTestId("current")).toHaveAttribute("stroke", "currentColor")
    expect(screen.getByTestId("danger")).toHaveClass("text-red-900")
    expect(screen.getByTestId("brand")).toHaveClass("text-brand-900")
  })

  it("el trazo es el de lucide, igual que en el resto del paquete", () => {
    render(<Icon data-testid="i" icon={SearchIcon} />)
    expect(screen.getByTestId("i")).toHaveAttribute("stroke-width", "2")
  })

  it("el className del llamador gana sobre tamaño y tono", () => {
    render(<Icon className="size-8 text-blue-900" data-testid="i" icon={SearchIcon} tone="muted" />)
    const icon = screen.getByTestId("i")
    expect(icon).toHaveClass("size-8", "text-blue-900")
    expect(icon).not.toHaveClass("size-5")
    expect(icon).not.toHaveClass("text-gray-900")
  })
})
