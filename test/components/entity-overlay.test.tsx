import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { EmptyFiltersAction } from "../../src/components/empty-filters-action"
import { EntityOverlay, useEntityOverlay } from "../../src/components/entity-overlay"
import { SaveBar } from "../../src/components/save-bar"

function Form() {
  const overlay = useEntityOverlay()
  return (
    <form onSubmit={(e) => { e.preventDefault(); overlay?.markSaved(); overlay?.close() }}>
      <input aria-label="Cliente" />
      <button type="submit">Guardar</button>
    </form>
  )
}

function Host({ variant = "dialog" as "dialog" | "sheet", onClose = () => {} }) {
  const [open, setOpen] = React.useState(true)
  return (
    <EntityOverlay onClose={() => { setOpen(false); onClose() }} open={open} title="Nueva factura" variant={variant}>
      <Form />
    </EntityOverlay>
  )
}

describe("EntityOverlay", () => {
  it.each(["dialog", "sheet"] as const)("%s: sin cambios, cerrar no pregunta", async (variant) => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Host onClose={onClose} variant={variant} />)
    expect(await screen.findByRole("dialog", { name: "Nueva factura" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1), { timeout: 20000 })
  }, 30000)

  it("con algo escrito, cerrar pide confirmación; «Seguir editando» no cierra y «Descartar» sí", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Host onClose={onClose} />)
    await user.type(await screen.findByLabelText("Cliente"), "Acme")
    await user.keyboard("{Escape}")
    expect(await screen.findByRole("alertdialog")).toHaveTextContent("¿Descartar los cambios?")
    await user.click(screen.getByRole("button", { name: "Seguir editando" }))
    expect(onClose).not.toHaveBeenCalled()
    await user.keyboard("{Escape}")
    await user.click(await screen.findByRole("button", { name: "Descartar" }))
    expect(onClose).toHaveBeenCalledTimes(1)
  }, 30000)

  it("guardar cierra sin preguntar (useEntityOverlay)", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Host onClose={onClose} />)
    await user.type(await screen.findByLabelText("Cliente"), "Acme")
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("alertdialog")).toBeNull()
  }, 30000)
})

describe("SaveBar", () => {
  it("sin cambios: «Todo guardado» y Descartar apagado; con cambios: aviso, Descartar y Guardar", async () => {
    const user = userEvent.setup()
    const onDiscard = vi.fn()
    const { rerender } = render(<SaveBar dirty={false} onDiscard={onDiscard} />)
    expect(screen.getByRole("status")).toHaveTextContent("Todo guardado")
    expect(screen.getByRole("button", { name: "Descartar" })).toBeDisabled()
    rerender(<SaveBar dirty onDiscard={onDiscard} />)
    expect(screen.getByRole("status")).toHaveTextContent("Cambios sin guardar")
    await user.click(screen.getByRole("button", { name: "Descartar" }))
    expect(onDiscard).toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute("type", "submit")
  })

  it("guardando apaga Descartar y marca Guardar como ocupado; onSave lo vuelve botón", () => {
    render(<SaveBar dirty onSave={() => {}} pending />)
    expect(screen.getByRole("button", { name: "Descartar" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute("type", "button")
  })

  it("los textos se traducen", () => {
    render(<SaveBar dirty labels={{ unsaved: "Unsaved changes", save: "Save", discard: "Discard" }} />)
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })
})

describe("EmptyFiltersAction", () => {
  it("sin filtros puestos no dibuja nada; con filtros, «Limpiar filtros» avisa", async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    const { container, rerender } = render(<EmptyFiltersAction active={false} onClear={onClear} />)
    expect(container).toBeEmptyDOMElement()
    rerender(<EmptyFiltersAction onClear={onClear} />)
    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it("con render es un link a la misma ruta sin filtros", () => {
    render(<EmptyFiltersAction render={<a href="/facturas" />} />)
    expect(screen.getByRole("link", { name: "Limpiar filtros" })).toHaveAttribute("href", "/facturas")
  })
})
