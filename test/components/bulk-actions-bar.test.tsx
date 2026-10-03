import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BulkActionsBar } from "../../src/components/bulk-actions-bar"

describe("BulkActionsBar", () => {
  it("con cero no se dibuja", () => {
    const { container } = render(<BulkActionsBar count={0} onClear={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("es un grupo con nombre, con el contador en una región status", () => {
    render(
      <BulkActionsBar count={3} onClear={() => {}}>
        <button>Marcar cobradas</button>
      </BulkActionsBar>
    )
    const group = screen.getByRole("group", { name: "Acciones sobre la selección" })
    expect(group).toContainElement(screen.getByRole("status"))
    expect(screen.getByRole("status")).toHaveTextContent("3 seleccionados")
    expect(screen.getByRole("button", { name: "Marcar cobradas" })).toBeInTheDocument()
  })

  it("singular y plural, y el género se cambia con labels", () => {
    const { rerender } = render(<BulkActionsBar count={1} onClear={() => {}} />)
    expect(screen.getByRole("status")).toHaveTextContent("1 seleccionado")
    rerender(<BulkActionsBar count={2} labels={{ selectedOther: "{count} seleccionadas" }} onClear={() => {}} />)
    expect(screen.getByRole("status")).toHaveTextContent("2 seleccionadas")
  })

  it("Limpiar selección llama onClear, y se alcanza con el teclado", async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<BulkActionsBar count={2} onClear={onClear} />)
    await user.tab()
    await user.keyboard("{Enter}")
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: "Limpiar selección" })).toHaveFocus()
  })
})
