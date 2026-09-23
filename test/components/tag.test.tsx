import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Badge } from "../../src/components/badge"
import { Tag } from "../../src/components/tag"
import { tagVariants } from "../../src/variants/tag"

describe("Tag", () => {
  it("sin onRemove no hay botón: eso es lo que lo separa de un Badge", () => {
    render(<Tag>React</Tag>)
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.getByText("React")).toBeInTheDocument()
  })

  it("el botón de quitar se nombra con el texto del tag", async () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>Chile</Tag>)
    const boton = screen.getByRole("button", { name: "Quitar Chile" })
    await userEvent.click(boton)
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it("se quita con el teclado: Tab hasta el botón y Enter", async () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>Chile</Tag>)
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Quitar Chile" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onRemove).toHaveBeenCalledOnce()
    await userEvent.keyboard(" ")
    expect(onRemove).toHaveBeenCalledTimes(2)
  })

  it("con children que no es texto, textValue da el nombre; si no, queda el prefijo", () => {
    const { rerender } = render(
      <Tag onRemove={() => {}} textValue="Chile">
        <span>🇨🇱</span> Chile
      </Tag>
    )
    expect(screen.getByRole("button", { name: "Quitar Chile" })).toBeInTheDocument()
    rerender(
      <Tag onRemove={() => {}} removeLabel="Sacar">
        <span>sin texto</span>
      </Tag>
    )
    expect(screen.getByRole("button", { name: "Sacar" })).toBeInTheDocument()
  })

  it("comparte forma y paleta con el Badge subtle: una sola etiqueta en el sistema", () => {
    render(
      <>
        <Tag color="blue">Tag</Tag>
        <Badge color="blue">Badge</Badge>
      </>
    )
    const tag = screen.getByText("Tag").closest("[data-slot=tag]")!
    expect(tag).toHaveClass("bg-blue-100", "text-blue-900", "border-blue-400", "rounded-full", "h-6")
    expect(screen.getByText("Badge")).toHaveClass("bg-blue-100", "text-blue-900", "border-blue-400", "rounded-full", "h-6")
  })

  it("no recorta el anillo de foco del botón de quitar", () => {
    render(<Tag onRemove={() => {}}>React</Tag>)
    const tag = screen.getByText("React").closest("[data-slot=tag]")!
    expect(tag).toHaveClass("overflow-visible")
    expect(tag).not.toHaveClass("overflow-hidden")
    expect(screen.getByRole("button")).toHaveClass("focus-visible:focus-ring", "transition-control", "rounded-full")
  })

  // El botón mide 4px menos que el tag en los dos tamaños: ese es el aire que le
  // queda arriba y abajo, y tiene que coincidir con el `pr` del cuerpo (2px en
  // `sm`, 4px en `md`) o el círculo del hover se lee descentrado.
  it("tamaños: 20px y 24px, con su botón proporcional", () => {
    const { rerender } = render(
      <Tag onRemove={() => {}} size="sm">
        React
      </Tag>
    )
    expect(screen.getByText("React").closest("[data-slot=tag]")).toHaveClass("h-5", "pr-0.5")
    expect(screen.getByRole("button")).toHaveClass("size-4")
    rerender(<Tag onRemove={() => {}}>React</Tag>)
    expect(screen.getByText("React").closest("[data-slot=tag]")).toHaveClass("h-6", "pr-1")
    expect(screen.getByRole("button")).toHaveClass("size-4")
  })

  it("el className del llamador gana sobre la variante", () => {
    render(<Tag className="h-8 rounded-md">React</Tag>)
    const tag = screen.getByText("React").closest("[data-slot=tag]")!
    expect(tag).toHaveClass("h-8", "rounded-md")
    expect(tag).not.toHaveClass("h-6", "rounded-full")
    expect(tagVariants({ className: "bg-gray-300" }).split(/\s+/)).not.toContain("bg-gray-100")
  })
})
