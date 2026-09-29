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
