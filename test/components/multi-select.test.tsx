import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { MultiSelect, type MultiSelectOption } from "../../src/components/multi-select"

const MEDIOS: MultiSelectOption[] = [
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta de crédito" },
  { value: "debito", label: "Débito automático" },
  { value: "efectivo", label: "Efectivo", disabled: true },
]

const chips = () => [...document.querySelectorAll("[data-slot=combobox-chip] > span:first-child")].map((chip) => chip.textContent)

async function abrir() {
  await userEvent.click(screen.getByRole("combobox", { name: "Medios de pago" }))
  return screen.findByRole("listbox")
}

describe("MultiSelect", () => {
  it("es un combobox con nombre y los elegidos como chips", () => {
    render(<MultiSelect aria-label="Medios de pago" defaultValue={["tarjeta", "transferencia"]} options={MEDIOS} />)
    expect(screen.getByRole("combobox", { name: "Medios de pago" })).toBeInTheDocument()
    // Los chips en el orden de las opciones, no en el de los clicks.
    expect(chips()).toEqual(["Transferencia", "Tarjeta de crédito"])
    expect(screen.getByRole("button", { name: "Quitar Tarjeta de crédito" })).toBeInTheDocument()
  })

  it("la lista marca los elegidos con el círculo de acento a la derecha y aria-selected", async () => {
    render(<MultiSelect aria-label="Medios de pago" defaultValue={["tarjeta"]} options={MEDIOS} />)
    const lista = await abrir()
    const tarjeta = within(lista).getByRole("option", { name: "Tarjeta de crédito" })
    expect(tarjeta).toHaveAttribute("aria-selected", "true")
    expect(tarjeta.querySelector("[data-slot=menu-check]")).toHaveClass("rounded-full", "bg-brand-900")
    expect(within(lista).getByRole("option", { name: "Transferencia" })).toHaveAttribute("aria-selected", "false")
    expect(within(lista).getByRole("option", { name: "Efectivo" })).toHaveAttribute("aria-disabled", "true")
  })

  it("elegir y quitar con el teclado; la lista queda abierta para seguir eligiendo", async () => {
    const onValueChange = vi.fn()
    render(<MultiSelect aria-label="Medios de pago" onValueChange={onValueChange} options={MEDIOS} />)
    await abrir()
    await userEvent.keyboard("{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(["transferencia"])
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    await userEvent.keyboard("{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(["transferencia", "tarjeta"])
    await userEvent.keyboard("{Escape}{Backspace}")
    expect(onValueChange).toHaveBeenLastCalledWith(["transferencia"])
  })

  it("filtra sin tildes ni mayúsculas", async () => {
    render(<MultiSelect aria-label="Medios de pago" options={MEDIOS} />)
    await abrir()
    await userEvent.keyboard("debito")
    expect(within(screen.getByRole("listbox")).getAllByRole("option").map((option) => option.textContent)).toEqual(["Débito automático"])
  })

  it("«Seleccionar todo» marca las habilitadas que se ven, y otra vez las desmarca", async () => {
    const onValueChange = vi.fn()
    render(<MultiSelect aria-label="Medios de pago" onValueChange={onValueChange} options={MEDIOS} selectAll />)
    const lista = await abrir()
    const todo = within(lista).getByRole("option", { name: "Seleccionar todo" })
    await userEvent.click(todo)
    expect(onValueChange).toHaveBeenLastCalledWith(["transferencia", "tarjeta", "debito"])
    expect(within(screen.getByRole("listbox")).getByRole("option", { name: "Seleccionar todo" })).toHaveAttribute("aria-selected", "true")
    await userEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: "Seleccionar todo" }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it("con una búsqueda, «Seleccionar todo» suma solo las que coinciden", async () => {
    const onValueChange = vi.fn()
    render(<MultiSelect aria-label="Medios de pago" onValueChange={onValueChange} options={MEDIOS} selectAll />)
    await abrir()
    // «to»: «Tarjeta de crédito» y «Débito automático», no «Transferencia».
    await userEvent.keyboard("to")
    await userEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: "Seleccionar todo" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["tarjeta", "debito"])
  })

  it("max: al llegar, las demás se apagan y la lista lo dice", async () => {
    render(<MultiSelect aria-label="Medios de pago" defaultValue={["transferencia"]} max={1} options={MEDIOS} selectAll />)
    const lista = await abrir()
    expect(within(lista).getByRole("option", { name: "Tarjeta de crédito" })).toHaveAttribute("aria-disabled", "true")
    expect(within(lista).getByRole("option", { name: "Transferencia" })).not.toHaveAttribute("aria-disabled")
    // Con un tope menor que las opciones, «Seleccionar todo» no tiene sentido.
    expect(within(lista).queryByRole("option", { name: "Seleccionar todo" })).toBeNull()
    // En la región viva del combobox (Base UI le suma un separador invisible para que se repita).
    expect(screen.getByText(/Máximo 1/).closest("[role=status]")).not.toBeNull()
  })

  it("con todo elegido, quitar un chip quita ese y no otro", async () => {
    const onValueChange = vi.fn()
    render(<MultiSelect aria-label="Medios de pago" defaultValue={["transferencia", "tarjeta", "debito"]} onValueChange={onValueChange} options={MEDIOS} selectAll />)
    await userEvent.click(screen.getByRole("button", { name: "Quitar Tarjeta de crédito" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["transferencia", "debito"])
    expect(chips()).toEqual(["Transferencia", "Débito automático"])
    await userEvent.click(screen.getByRole("button", { name: "Quitar Transferencia" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["debito"])
  })

  it("con todo elegido, Backspace con el campo vacío quita el último", async () => {
    const onValueChange = vi.fn()
    render(<MultiSelect aria-label="Medios de pago" defaultValue={["transferencia", "tarjeta", "debito"]} onValueChange={onValueChange} options={MEDIOS} selectAll />)
    await abrir()
    await userEvent.keyboard("{Escape}{Backspace}")
    expect(onValueChange).toHaveBeenLastCalledWith(["transferencia", "tarjeta"])
  })

  it("en un form manda un valor por elegido, sin el de «Seleccionar todo»", () => {
    render(
      <form data-testid="form">
        <MultiSelect aria-label="Medios de pago" defaultValue={["transferencia", "tarjeta", "debito"]} name="medios" options={MEDIOS} selectAll />
      </form>
    )
    const datos = new FormData(screen.getByTestId("form") as HTMLFormElement)
    expect(datos.getAll("medios")).toEqual(["transferencia", "tarjeta", "debito"])
  })

  it("max: «Seleccionar todo» cuenta también los ya elegidos", async () => {
    const opciones: MultiSelectOption[] = [
      { value: "a", label: "Alfa" },
      { value: "b", label: "Beta" },
      { value: "c", label: "Gama" },
      { value: "d", label: "Delta" },
    ]
    render(<MultiSelect aria-label="Medios de pago" defaultValue={["a"]} max={2} options={opciones} selectAll />)
    await abrir()
    // «ta»: Beta y Delta coinciden (2 ≤ max), pero con Alfa ya elegida serían 3.
    await userEvent.keyboard("ta")
    expect(within(screen.getByRole("listbox")).queryByRole("option", { name: "Seleccionar todo" })).toBeNull()
  })

  it("limpiar vacía la selección", async () => {
    const onValueChange = vi.fn()
    render(<MultiSelect aria-label="Medios de pago" defaultValue={["tarjeta", "debito"]} onValueChange={onValueChange} options={MEDIOS} />)
    await userEvent.click(screen.getByRole("button", { name: "Limpiar" }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
    expect(chips()).toEqual([])
  })

  it("controlado", async () => {
    function Controlado() {
      const [value, setValue] = React.useState<string[]>(["debito"])
      return (
        <>
          <MultiSelect aria-label="Medios de pago" onValueChange={setValue} options={MEDIOS} value={value} />
          <output>{value.join(",")}</output>
        </>
      )
    }
    render(<Controlado />)
    await abrir()
    await userEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: "Transferencia" }))
    expect(document.querySelector("output")).toHaveTextContent("transferencia,debito")
  })

  it("el placeholder solo sin elegidos", () => {
    const { rerender } = render(<MultiSelect aria-label="Medios de pago" options={MEDIOS} placeholder="Elegí medios" />)
    expect(screen.getByRole("combobox")).toHaveAttribute("placeholder", "Elegí medios")
    rerender(<MultiSelect aria-label="Medios de pago" options={MEDIOS} placeholder="Elegí medios" value={["debito"]} />)
    expect(screen.getByRole("combobox")).not.toHaveAttribute("placeholder")
  })
})

describe("MultiSelect: una sola línea con «+N»", () => {
  // jsdom no mide: la fila mide 300 y cada chip 90 (lugar para 2 chips, el «+N» y el campo).
  const medir = () => {
    const ancho = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(300)
    const chip = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(90)
    return () => {
      ancho.mockRestore()
      chip.mockRestore()
    }
  }
  const todos = ["transferencia", "tarjeta", "debito", "efectivo"]

  it("los que no entran se esconden detrás de «+N» con nombre accesible «y N más»", async () => {
    const restore = medir()
    render(<MultiSelect aria-label="Medios de pago" defaultValue={todos} options={MEDIOS} />)
    await vi.waitFor(() => expect(chips()).toEqual(["Transferencia", "Tarjeta de crédito"]), { timeout: 20000 })
    const mas = screen.getByRole("button", { name: "y 2 más" })
    expect(mas).toHaveTextContent("+2")
    restore()
  }, 30000)

  it("«+N» abre la lista, donde se ven todos los elegidos", async () => {
    const restore = medir()
    const user = userEvent.setup()
    render(<MultiSelect aria-label="Medios de pago" defaultValue={todos} options={MEDIOS} />)
    await user.click(await screen.findByRole("button", { name: "y 2 más" }))
    const lista = await screen.findByRole("listbox")
    expect(within(lista).getAllByRole("option", { selected: true })).toHaveLength(4)
    restore()
  }, 30000)

  it("maxVisible tope; overflow=wrap deja todos y que el campo crezca", async () => {
    const restore = medir()
    const { rerender } = render(<MultiSelect aria-label="Medios de pago" defaultValue={todos} maxVisible={1} options={MEDIOS} />)
    await screen.findByRole("button", { name: "y 3 más" })
    expect(chips()).toEqual(["Transferencia"])
    rerender(<MultiSelect aria-label="Medios de pago" defaultValue={todos} options={MEDIOS} overflow="wrap" />)
    expect(screen.queryByRole("button", { name: /más$/ })).toBeNull()
    expect(chips()).toHaveLength(4)
    restore()
  }, 30000)

  it("tiene el alto de un Select: fijo en sm, md y lg (no crece)", () => {
    const { container, rerender } = render(<MultiSelect aria-label="x" options={MEDIOS} size="sm" />)
    const grupo = () => container.querySelector("[data-slot=combobox-chips-group]")!
    expect(grupo().className).toContain("h-7!")
    expect(grupo().className).not.toContain("h-auto!")
    rerender(<MultiSelect aria-label="x" options={MEDIOS} size="lg" />)
    expect(grupo().className).toContain("data-[size=lg]:h-10!")
    rerender(<MultiSelect aria-label="x" options={MEDIOS} overflow="wrap" />)
    expect(grupo().className).toContain("h-auto!")
  })

  it("Backspace con el campo vacío quita el último chip a la vista (el que está junto al campo)", async () => {
    const restore = medir()
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<MultiSelect aria-label="Medios de pago" defaultValue={todos} onValueChange={onValueChange} options={MEDIOS} />)
    await screen.findByRole("button", { name: "y 2 más" })
    await user.click(screen.getByRole("combobox", { name: "Medios de pago" }))
    await user.keyboard("{Backspace}")
    expect(onValueChange).toHaveBeenLastCalledWith(["transferencia", "debito", "efectivo"])
    restore()
  }, 30000)
})
