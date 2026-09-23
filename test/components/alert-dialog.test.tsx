import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../src/components/alert-dialog"
import { Button } from "../../src/components/button"

function Example({ onAction = () => {} }: { onAction?: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Eliminar viaje</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar el viaje?</AlertDialogTitle>
          <AlertDialogDescription>Se borran también los pasajeros cargados.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction variant="destructive" onClick={onAction}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

describe("AlertDialog", () => {
  it("abre como alertdialog con las superficies de Dialog y cancela en español", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Eliminar viaje" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveClass("shadow-modal", "rounded-xl", "p-6", "bg-background-100")
    expect(dialog.className).not.toMatch(/\bborder\b/)
    expect(screen.getByText("¿Eliminar el viaje?")).toHaveClass("text-heading-20", "text-gray-1000")
    expect(screen.getByText("Se borran también los pasajeros cargados.")).toHaveClass("text-copy-14", "text-gray-900")
    expect(document.querySelector("[data-slot=alert-dialog-overlay]")).toHaveClass("bg-backdrop")
    // Sin botón X: un alert dialog exige respuesta.
    expect(screen.queryByRole("button", { name: "Cerrar" })).toBeNull()
    const cancel = screen.getByRole("button", { name: "Cancelar" })
    expect(cancel).toHaveClass("border-gray-alpha-400", "bg-background-100")
    await userEvent.click(cancel)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("la acción usa la variante pedida y dispara onClick", async () => {
    const onAction = vi.fn()
    render(<Example onAction={onAction} />)
    await userEvent.click(screen.getByRole("button", { name: "Eliminar viaje" }))
    const action = await screen.findByRole("button", { name: "Eliminar" })
    expect(action).toHaveClass("bg-red-800")
    await userEvent.click(action)
    expect(onAction).toHaveBeenCalled()
  })

  it("el footer va a la derecha con borde superior", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Eliminar viaje" }))
    const footer = (await screen.findByRole("button", { name: "Cancelar" })).parentElement!
    expect(footer).toHaveClass("border-t", "border-gray-400", "sm:justify-end")
  })

  it("sin controlar open, AlertDialogClose envuelve la acción y cierra", async () => {
    const onAction = vi.fn()
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Archivar</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>¿Archivar?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogClose render={<AlertDialogAction />} onClick={onAction}>
              Archivar
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await userEvent.click(screen.getByRole("button", { name: "Archivar" }))
    await userEvent.click(await screen.findByRole("button", { name: "Archivar" }))
    expect(onAction).toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("Escape cierra; click en el backdrop no", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Eliminar viaje" }))
    await screen.findByRole("alertdialog")
    await userEvent.click(document.querySelector("[data-slot=alert-dialog-overlay]")!)
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(screen.getByRole("button", { name: "Eliminar viaje" })).toHaveFocus()
  })
})
