import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CommandPalette, type CommandPaletteGroup } from "../../src/components/command-palette"

const groups = (onSelect = vi.fn()): CommandPaletteGroup[] => [
  {
    heading: "Secciones",
    items: [
      { value: "home", label: "Inicio", onSelect },
      { value: "invoices", label: "Facturas", description: "Cobros y envíos", keywords: ["cobranza"], onSelect },
    ],
  },
  { heading: "Vacío", items: [] },
]

describe("CommandPalette", () => {
  it("dibuja los grupos y los ítems; un grupo sin ítems no se dibuja", () => {
    render(<CommandPalette groups={groups()} onOpenChange={() => {}} open placeholder="Buscar en la app" />)
    expect(screen.getByRole("dialog", { name: "Buscar" })).toBeInTheDocument()
    expect(screen.getByText("Secciones")).toBeInTheDocument()
    expect(screen.queryByText("Vacío")).toBeNull()
    expect(screen.getAllByRole("option")).toHaveLength(2)
    expect(screen.getByText("Cobros y envíos")).toBeInTheDocument()
  })

  it("filtra por título y por keywords", async () => {
    const user = userEvent.setup()
    render(<CommandPalette groups={groups()} onOpenChange={() => {}} open />)
    await user.type(screen.getByRole("combobox"), "cobranza")
    expect(screen.getAllByRole("option")).toHaveLength(1)
    expect(screen.getByRole("option", { name: /Facturas/ })).toBeInTheDocument()
  })

  it("elegir llama onSelect con el value y cierra; con closeOnSelect={false} no cierra", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    const { rerender } = render(<CommandPalette groups={groups(onSelect)} onOpenChange={onOpenChange} open />)
    await user.click(screen.getByRole("option", { name: /Facturas/ }))
    expect(onSelect).toHaveBeenCalledWith("invoices")
    expect(onOpenChange).toHaveBeenCalledWith(false)
    onOpenChange.mockClear()
    rerender(<CommandPalette closeOnSelect={false} groups={groups(onSelect)} onOpenChange={onOpenChange} open />)
    await user.click(screen.getByRole("option", { name: /Inicio/ }))
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("Enter ejecuta el elegido (el primero desde la primera tecla)", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CommandPalette groups={groups(onSelect)} onOpenChange={() => {}} open />)
    await user.type(screen.getByRole("combobox"), "fact{Enter}")
    expect(onSelect).toHaveBeenCalledWith("invoices")
  })

  it("no escucha ⌘K: la app lo registra", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<CommandPalette groups={groups()} onOpenChange={onOpenChange} open={false} />)
    await user.keyboard("{Meta>}k{/Meta}")
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("loadGroups: trae los grupos recién al abrir, una sola vez, y mientras tanto dice «Cargando…»", async () => {
    let resolve!: (value: CommandPaletteGroup[]) => void
    const loadGroups = vi.fn(() => new Promise<CommandPaletteGroup[]>((r) => (resolve = r)))
    const { rerender } = render(<CommandPalette loadGroups={loadGroups} onOpenChange={() => {}} open={false} />)
    expect(loadGroups).not.toHaveBeenCalled()
    rerender(<CommandPalette loadGroups={loadGroups} onOpenChange={() => {}} open />)
    expect(await screen.findByRole("status", { name: "" })).toHaveTextContent("Cargando…")
    resolve([{ heading: "Clientes", items: [{ value: "acme", label: "Acme S.A.", onSelect: () => {} }] }])
    expect(await screen.findByRole("option", { name: /Acme/ })).toBeInTheDocument()
    rerender(<CommandPalette loadGroups={loadGroups} onOpenChange={() => {}} open={false} />)
    rerender(<CommandPalette loadGroups={loadGroups} onOpenChange={() => {}} open />)
    expect(loadGroups).toHaveBeenCalledTimes(1)
  })

  it("si loadGroups falla avisa con un alert y reintenta al volver a abrir", async () => {
    const loadGroups = vi.fn().mockRejectedValueOnce(new Error("sin red")).mockResolvedValueOnce([{ items: [{ value: "x", label: "Equipo", onSelect: () => {} }] }])
    const { rerender } = render(<CommandPalette loadGroups={loadGroups} onOpenChange={() => {}} open />)
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo cargar la búsqueda")
    rerender(<CommandPalette loadGroups={loadGroups} onOpenChange={() => {}} open={false} />)
    rerender(<CommandPalette loadGroups={loadGroups} onOpenChange={() => {}} open />)
    await waitFor(() => expect(screen.getByRole("option", { name: /Equipo/ })).toBeInTheDocument())
    expect(loadGroups).toHaveBeenCalledTimes(2)
  })
})
