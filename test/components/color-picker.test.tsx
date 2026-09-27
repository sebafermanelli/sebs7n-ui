import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ColorPicker } from "../../src/components/color-picker"
import { hexOfOklch, type Oklch } from "../../src/lib/contrast"
import { LabelsProvider } from "../../src/lib/labels"

const AZUL: Oklch = [0.573, 0.214, 258]
const TERRACOTA: Oklch = [0.55, 0.16, 35]
const TEAL: Oklch = [0.515, 0.099, 183]

const abrir = async (nombre = "Color") => {
  await userEvent.click(screen.getByRole("button", { name: nombre }))
  return screen.findByRole("dialog", { name: "Selector de color" })
}
const seccion = (slot: string) => document.querySelector<HTMLElement>(`[data-slot=color-picker-${slot}]`)

describe("ColorPicker", () => {
  it("es un campo en cápsula con la muestra y el hexadecimal", () => {
    render(<ColorPicker aria-label="Color" defaultValue={AZUL} />)
    const campo = screen.getByRole("button", { name: "Color" })
    expect(campo).toHaveTextContent(hexOfOklch(AZUL))
    expect(campo).toHaveClass("rounded-field", "glass-control", "data-[size=md]:h-10", "focus-visible:focus-border")
    expect(campo.querySelector("[data-slot=color-picker-swatch]")).toHaveStyle({ backgroundColor: hexOfOklch(AZUL) })
  })

  it("abre un panel de vidrio con tres pestañas", async () => {
    render(<ColorPicker aria-label="Color" />)
    const panel = await abrir()
    expect(panel).toHaveClass("glass", "rounded-surface", "shadow-menu")
    expect(within(panel).getAllByRole("tab").map((t) => t.textContent)).toEqual(["Paleta", "Espectro", "Valores"])
  })

  it("elegir una muestra avisa el color y la marca", async () => {
    const onValueChange = vi.fn()
    render(<ColorPicker aria-label="Color" onValueChange={onValueChange} />)
    await abrir()
    const muestras = within(seccion("swatches")!).getAllByRole("button")
    expect(muestras).toHaveLength(50)
    await userEvent.click(muestras[3]!)
    const elegido = onValueChange.mock.calls[0]![0] as Oklch
    expect(hexOfOklch(elegido).toUpperCase()).toBe(muestras[3]!.getAttribute("aria-label"))
    expect(muestras[3]).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Color" })).toHaveTextContent(hexOfOklch(elegido))
  })

  it("con name, el color viaja en el formulario como hexadecimal", () => {
    const { container } = render(
      <form>
        <ColorPicker aria-label="Color" defaultValue={TERRACOTA} name="color" />
      </form>
    )
    expect(new FormData(container.querySelector("form")!).get("color")).toBe(hexOfOklch(TERRACOTA))
  })

  it("deshabilitado no abre", async () => {
    render(<ColorPicker aria-label="Color" disabled />)
    await userEvent.click(screen.getByRole("button", { name: "Color" }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("no trae colores de ninguna marca: la paleta es neutral", async () => {
    render(<ColorPicker aria-label="Color" />)
    await abrir()
    expect(document.querySelectorAll("[data-slot^=color-picker-] [role=group]")).toHaveLength(1)
  })
})

describe("ColorPicker: recientes", () => {
  it("sin lista, la sección no aparece", async () => {
    render(<ColorPicker aria-label="Color" />)
    await abrir()
    expect(seccion("recent")).toBeNull()
    expect(screen.queryByText("Recientes")).toBeNull()
  })

  it("con la lista vacía tampoco: un título sin nada abajo no dice nada", async () => {
    render(<ColorPicker aria-label="Color" recent={[]} />)
    await abrir()
    expect(seccion("recent")).toBeNull()
  })

  it("muestra los recientes arriba de la paleta, en el orden que llegan", async () => {
    render(<ColorPicker aria-label="Color" recent={[TERRACOTA, TEAL]} />)
    await abrir()
    const recientes = seccion("recent")!
    expect(within(recientes).getByText("Recientes")).toBeInTheDocument()
    expect(within(recientes).getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      hexOfOklch(TERRACOTA).toUpperCase(),
      hexOfOklch(TEAL).toUpperCase(),
    ])
    // Arriba de la grilla, no debajo.
    expect(recientes.compareDocumentPosition(seccion("swatches")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("elegir un reciente es elegir ese color", async () => {
    const onValueChange = vi.fn()
    render(<ColorPicker aria-label="Color" onValueChange={onValueChange} recent={[TERRACOTA, TEAL]} />)
    await abrir()
    await userEvent.click(within(seccion("recent")!).getAllByRole("button")[1]!)
    expect(onValueChange).toHaveBeenCalledWith(TEAL)
  })

  it("marca el reciente que coincide con el color actual", async () => {
    render(<ColorPicker aria-label="Color" recent={[TERRACOTA, TEAL]} value={TEAL} />)
    await abrir()
    const [primero, segundo] = within(seccion("recent")!).getAllByRole("button")
    expect(primero).toHaveAttribute("aria-pressed", "false")
    expect(segundo).toHaveAttribute("aria-pressed", "true")
  })

  it("muestra diez como mucho, y un color repetido no rompe la lista", async () => {
    const muchos = Array.from({ length: 14 }, (_, i) => [0.5, 0.15, i * 20] as Oklch)
    const { unmount } = render(<ColorPicker aria-label="Color" recent={muchos} />)
    await abrir()
    expect(within(seccion("recent")!).getAllByRole("button")).toHaveLength(10)
    unmount()
    render(<ColorPicker aria-label="Color" recent={[TEAL, TEAL, TERRACOTA]} />)
    await abrir()
    expect(within(seccion("recent")!).getAllByRole("button")).toHaveLength(3)
  })

  it("no guarda nada: la lista es la que le pasan, aunque se elija otro color", async () => {
    render(<ColorPicker aria-label="Color" recent={[TERRACOTA]} />)
    await abrir()
    await userEvent.click(within(seccion("swatches")!).getAllByRole("button")[0]!)
    expect(within(seccion("recent")!).getAllByRole("button")).toHaveLength(1)
  })

  it("onOpenChange avisa el cierre, que es cuando la app guarda el color", async () => {
    const onOpenChange = vi.fn()
    render(<ColorPicker aria-label="Color" onOpenChange={onOpenChange} />)
    await abrir()
    expect(onOpenChange.mock.calls[0]![0]).toBe(true)
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(onOpenChange.mock.calls.at(-1)![0]).toBe(false))
  })
})

describe("ColorPicker: valores y espectro", () => {
  it("un hexadecimal pegado cambia el color; uno a medio tipear no pisa lo tipeado", async () => {
    const onValueChange = vi.fn()
    render(<ColorPicker aria-label="Color" onValueChange={onValueChange} />)
    await abrir()
    await userEvent.click(screen.getByRole("tab", { name: "Valores" }))
    const campo = screen.getByRole("textbox", { name: "Hexadecimal" })
    await userEvent.clear(campo)
    expect(campo).toHaveValue("")
    // `#e7` todavía no es un color. (`#e70` sí: es un hexadecimal de tres dígitos.)
    await userEvent.type(campo, "#e7")
    expect(campo).toHaveValue("#e7")
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.type(campo, "0022")
    expect(campo).toHaveValue("#e70022")
    expect(hexOfOklch(onValueChange.mock.calls.at(-1)![0])).toBe("#e70022")
  })

  it("el espectro se maneja con las flechas", async () => {
    const onValueChange = vi.fn()
    render(<ColorPicker aria-label="Color" defaultValue={[0.6, 0.1, 200]} onValueChange={onValueChange} />)
    await abrir()
    await userEvent.click(screen.getByRole("tab", { name: "Espectro" }))
    const area = screen.getByRole("slider", { name: "Croma y luminosidad" })
    area.focus()
    fireEvent.keyDown(area, { key: "ArrowRight" })
    expect(onValueChange).toHaveBeenLastCalledWith([0.6, 0.11, 200])
    fireEvent.keyDown(area, { key: "ArrowUp" })
    expect(onValueChange).toHaveBeenLastCalledWith([0.61, 0.11, 200])
    fireEvent.keyDown(area, { key: "ArrowLeft", shiftKey: true })
    expect(onValueChange).toHaveBeenLastCalledWith([0.61, 0.06, 200])
  })

  it("la tira de matices es un range de verdad", async () => {
    const onValueChange = vi.fn()
    render(<ColorPicker aria-label="Color" defaultValue={[0.6, 0.1, 200]} onValueChange={onValueChange} />)
    await abrir()
    await userEvent.click(screen.getByRole("tab", { name: "Espectro" }))
    fireEvent.change(screen.getByRole("slider", { name: "Matiz" }), { target: { value: "90" } })
    expect(onValueChange).toHaveBeenLastCalledWith([0.6, 0.1, 90])
  })

  it("footer recibe el color actual", async () => {
    render(<ColorPicker aria-label="Color" defaultValue={TEAL} footer={(color) => <p>Elegiste {hexOfOklch(color)}</p>} />)
    await abrir()
    expect(screen.getByText(`Elegiste ${hexOfOklch(TEAL)}`)).toBeInTheDocument()
    expect(document.querySelector("[data-slot=color-picker-footer]")).toHaveClass("border-t")
  })

  it("los textos salen del LabelsProvider, y la prop le gana", async () => {
    render(
      <LabelsProvider value={{ colorPicker: { palette: "Palette", recent: "Recent", popup: "Color picker" } }}>
        <ColorPicker aria-label="Color" labels={{ recent: "Últimos" }} recent={[TEAL]} />
      </LabelsProvider>
    )
    await userEvent.click(screen.getByRole("button", { name: "Color" }))
    await screen.findByRole("dialog", { name: "Color picker" })
    expect(screen.getByRole("tab", { name: "Palette" })).toBeInTheDocument()
    expect(screen.getByText("Últimos")).toBeInTheDocument()
  })
})
