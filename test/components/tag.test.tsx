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

  // «Quitar» + el dato solo funciona donde el verbo va adelante. En alemán es «Chile
  // entfernen», y con un prefijo no hay forma. Mismo criterio que `labels.page` de
  // `Pagination`, que ya aceptaba función.
  it("removeLabel también puede ser la plantilla entera, para los idiomas con el verbo atrás", () => {
    const entfernen = (name: string) => `${name} entfernen`
    const { rerender } = render(
      <Tag onRemove={() => {}} removeLabel={entfernen}>
        Chile
      </Tag>
    )
    expect(screen.getByRole("button", { name: "Chile entfernen" })).toBeInTheDocument()
    // Sin nombre que poner, la plantilla no deja el espacio de adelante colgando.
    rerender(
      <Tag onRemove={() => {}} removeLabel={entfernen}>
        <span>sin texto</span>
      </Tag>
    )
    expect(screen.getByRole("button", { name: "entfernen" })).toBeInTheDocument()
  })

  it("comparte forma y paleta con el Badge: sólido, sin borde, radio de etiqueta", () => {
    render(
      <>
        <Tag color="blue">Tag</Tag>
        <Badge color="blue">Badge</Badge>
      </>
    )
    const tag = screen.getByText("Tag").closest("[data-slot=tag]")!
    for (const el of [tag, screen.getByText("Badge")]) {
      expect(el).toHaveClass("bg-blue-800", "text-white", "rounded-tag", "h-6")
      expect(el.className).not.toMatch(/(^|\s)border(\s|$|-)|sheen|shadow-|--sf-tint/)
    }
  })

  // El hover del botón de quitar va del lado contrario a la tinta (oscurece bajo la X blanca,
  // aclara bajo la negra): con el gris alfa del sistema, en oscuro aclaraba bajo la X blanca.
  it("el hover del botón de quitar usa el velo de su color, no el gris del sistema", () => {
    render(
      <>
        <Tag color="red" onRemove={() => {}}>
          Urgente
        </Tag>
        <Tag color="amber" onRemove={() => {}}>
          Pendiente
        </Tag>
      </>
    )
    expect(screen.getByText("Urgente").closest("[data-slot=tag]")).toHaveClass("[--sf-tag-press:rgb(0_0_0/0.25)]")
    expect(screen.getByText("Pendiente").closest("[data-slot=tag]")).toHaveClass("[--sf-tag-press:rgb(255_255_255/0.3)]")
    const quitar = screen.getByRole("button", { name: "Quitar Urgente" })
    expect(quitar).toHaveClass("hover:bg-(--sf-tag-press)")
    expect(quitar.className).not.toMatch(/gray-alpha/)
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

  // WCAG 2.5.8 pide 24×24 de área, no de dibujo. El círculo se queda en 16px
  // —agrandarlo rompe la relación de espacios del tag— y el área la pone un
  // `::after`, igual que en Checkbox y Radio.
  it("el botón de quitar llega a 24px de área sin agrandar el dibujo", () => {
    render(<Tag onRemove={() => {}}>React</Tag>)
    expect(screen.getByRole("button")).toHaveClass("relative", "size-4", "after:absolute", "after:-inset-1")
  })

  it("el className del llamador gana sobre la variante", () => {
    render(<Tag className="h-8 rounded-md">React</Tag>)
    const tag = screen.getByText("React").closest("[data-slot=tag]")!
    expect(tag).toHaveClass("h-8", "rounded-md")
    expect(tag).not.toHaveClass("h-6", "rounded-tag")
    expect(tagVariants({ className: "bg-gray-300" }).split(/\s+/)).not.toContain("bg-gray-700")
  })
})
