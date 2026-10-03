import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ShortcutsDialog, type ShortcutItem } from "../../src/components/shortcuts-dialog"

const shortcuts: ShortcutItem[] = [
  { keys: ["⌘", "K"], label: "Buscar" },
  { keys: ["g", "f"], label: "Ir a Facturas", sequence: true },
]

describe("ShortcutsDialog", () => {
  it("es un diálogo con título y la lista de atajos con Kbd", () => {
    render(<ShortcutsDialog onOpenChange={() => {}} open shortcuts={shortcuts} />)
    expect(screen.getByRole("dialog", { name: "Atajos de teclado" })).toBeInTheDocument()
    const list = screen.getByRole("list", { name: "Atajos" })
    const rows = within(list).getAllByRole("listitem")
    expect(rows).toHaveLength(2)
    expect(rows[0]!.querySelectorAll("kbd")).toHaveLength(2)
  })

  it("en una secuencia, el lector oye «luego» entre las teclas; en una combinación, no", () => {
    render(<ShortcutsDialog onOpenChange={() => {}} open shortcuts={shortcuts} />)
    const rows = screen.getAllByRole("listitem")
    expect(rows[1]).toHaveTextContent("Ir a Facturasgluegof")
    expect(within(rows[0]!).queryByText("luego")).toBeNull()
    expect(within(rows[1]!).getByText("luego")).toHaveClass("sr-only")
  })

  it("Escape pide cerrar", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ShortcutsDialog onOpenChange={onOpenChange} open shortcuts={shortcuts} />)
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it("no escucha el teclado por su cuenta: «?» suelto no la abre", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ShortcutsDialog onOpenChange={onOpenChange} open={false} shortcuts={shortcuts} />)
    await user.keyboard("?")
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("labels cambia el título y la bajada", () => {
    render(<ShortcutsDialog description="Funcionan en toda la app." labels={{ title: "Keyboard shortcuts" }} onOpenChange={() => {}} open shortcuts={shortcuts} />)
    expect(screen.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument()
    expect(screen.getByText("Funcionan en toda la app.")).toBeInTheDocument()
  })
})
