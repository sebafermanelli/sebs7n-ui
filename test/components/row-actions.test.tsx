import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DropdownMenuItem } from "../../src/components/dropdown-menu"
import { RowActions } from "../../src/components/row-actions"

describe("RowActions", () => {
  it("es un botón icon-sm plain con el nombre de la fila y abre el menú", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(
      <RowActions label="Acciones para FAC-1024">
        <DropdownMenuItem onClick={onOpen}>Ver detalle</DropdownMenuItem>
      </RowActions>
    )
    const boton = screen.getByRole("button", { name: "Acciones para FAC-1024" })
    expect(boton).toHaveAttribute("data-size", "icon-sm")
    expect(boton.className).toContain("size-7")
    await user.click(boton)
    await user.click(await screen.findByRole("menuitem", { name: "Ver detalle" }))
    expect(onOpen).toHaveBeenCalledTimes(1)
  }, 30000)

  it("disabled lo apaga", () => {
    render(
      <RowActions disabled label="Acciones para X">
        <DropdownMenuItem>Algo</DropdownMenuItem>
      </RowActions>
    )
    expect(screen.getByRole("button", { name: "Acciones para X" })).toBeDisabled()
  })
})
