import { render, screen, waitFor } from "@testing-library/react"
import { useRef } from "react"
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
    expect(dialog).toHaveClass("shadow-modal", "rounded-panel", "p-5", "gap-4", "bg-surface")
    expect(dialog.className).not.toMatch(/\bborder\b/)
    expect(screen.getByText("¿Eliminar el viaje?")).toHaveClass("text-title-3", "text-label")
    expect(screen.getByText("Se borran también los pasajeros cargados.")).toHaveClass("text-callout", "text-label-secondary")
    expect(document.querySelector("[data-slot=alert-dialog-overlay]")).toHaveClass("bg-backdrop")
    // Sin botón X: un alert dialog exige respuesta.
    expect(screen.queryByRole("button", { name: "Cerrar" })).toBeNull()
    const cancel = screen.getByRole("button", { name: "Cancelar" })
    // El botón gris de iCloud, no uno con borde.
    expect(cancel).toHaveClass("bg-fill-2")
    expect(cancel).not.toHaveClass("border-separator-strong")
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

  it("el footer alinea los botones a la derecha, sin borde superior", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Eliminar viaje" }))
    const footer = (await screen.findByRole("button", { name: "Cancelar" })).parentElement!
    expect(footer).toHaveAttribute("data-slot", "alert-dialog-footer")
    expect(footer).toHaveClass("sm:justify-end")
    expect(footer).not.toHaveClass("border-t")
    expect(footer.className).not.toMatch(/-mx-6/)
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

describe("confirmación de iCloud (2.0, R2)", () => {
  function Alerta({ extra = false }: { extra?: boolean }) {
    return (
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar la factura 0012?</AlertDialogTitle>
            <AlertDialogDescription>Se borra del listado y del resumen del mes.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            {extra && <AlertDialogAction>Archivar</AlertDialogAction>}
            <AlertDialogAction variant="destructive">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  it("es el diálogo de iCloud: radio 11, 20 de padding, opaco, 400 px como máximo", async () => {
    render(<Alerta />)
    const alerta = await screen.findByRole("alertdialog")
    expect(alerta).toHaveClass("rounded-panel", "p-5", "bg-surface", "shadow-modal", "max-w-[min(400px,calc(100%-2rem))]")
    expect(alerta.className).not.toMatch(/300px|backdrop-blur/)
  })

  it("título title-3 y cuerpo callout, alineados a la izquierda", async () => {
    render(<Alerta />)
    const header = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-header"]')!
    expect(header).not.toHaveClass("text-center", "items-center")
    expect(screen.getByRole("heading", { name: "¿Eliminar la factura 0012?" })).toHaveClass("text-title-3")
  })

  it("los botones van a la derecha, con su ancho y en el orden del DOM", async () => {
    render(<Alerta extra />)
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie).toHaveClass("flex", "sm:flex-row", "sm:justify-end")
    expect(pie.className).not.toMatch(/grid|auto-cols-fr|w-full|reverse|order-/)
    expect([...pie.children].map((b) => b.textContent)).toEqual(["Cancelar", "Archivar", "Eliminar"])
  })

  it("no hay ícono de alerta: iCloud no lo pone", async () => {
    const modulo = await import("../../src/components/alert-dialog")
    expect("AlertDialogIcon" in modulo).toBe(false)
  })

  it("Cancelar es el gris de iCloud y la acción destructiva, el rojo sólido", async () => {
    render(<Alerta />)
    expect(await screen.findByRole("button", { name: "Cancelar" })).toHaveClass("bg-fill-2")
    const eliminar = screen.getByRole("button", { name: "Eliminar" })
    expect(eliminar).toHaveClass("bg-red-800")
    expect(eliminar.className).not.toMatch(/tint|red-ink/)
  })

  it("la acción por defecto es del acento", async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>¿Emitir la factura?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction>Emitir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    expect(await screen.findByRole("button", { name: "Emitir" })).toHaveClass("bg-brand-700")
  })

  it("AlertDialogClose con render de la acción destructiva conserva el rojo", async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>¿Eliminar?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogClose render={<AlertDialogAction variant="destructive" />}>Eliminar</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    const eliminar = await screen.findByRole("button", { name: "Eliminar" })
    expect(eliminar).toHaveClass("bg-red-800")
    await userEvent.click(eliminar)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })
})

// Lo que documenta meta.mjs para una alerta que no destruye nada: el foco inicial en la acción,
// así Return la dispara. Por defecto sigue arrancando en «Cancelar».
describe("foco inicial (revisión fase 2)", () => {
  function Emitir({ enAccion }: { enAccion: boolean }) {
    const emitir = useRef<HTMLButtonElement>(null)
    return (
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Abrir</AlertDialogTrigger>
        <AlertDialogContent initialFocus={enAccion ? emitir : undefined}>
          <AlertDialogTitle>¿Emitir la factura?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogClose ref={emitir} render={<AlertDialogAction />}>
              Emitir
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  it("por defecto arranca en Cancelar", async () => {
    render(<Emitir enAccion={false} />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus())
  })

  it("con initialFocus en la acción, Return la dispara y cierra", async () => {
    render(<Emitir enAccion />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Emitir" })).toHaveFocus())
    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })
})

// Bug visto en el navegador: con la acción destructiva primero en el DOM, Base UI enfocaba el
// primer tabulable —«Descartar cambios»— y un Return descartaba. Nunca se arranca en una acción
// destructiva: si hay `AlertDialogCancel`, el foco inicial es ese.
describe("el foco inicial nunca cae en la acción destructiva", () => {
  function Alerta({ destructivaPrimero }: { destructivaPrimero: boolean }) {
    const accion = (
      <AlertDialogClose key="a" render={<AlertDialogAction variant="destructive" />}>
        Descartar cambios
      </AlertDialogClose>
    )
    const cancelar = <AlertDialogCancel key="c">Seguir editando</AlertDialogCancel>
    return (
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Abrir</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>¿Salir sin guardar?</AlertDialogTitle>
          <AlertDialogFooter>{destructivaPrimero ? [accion, cancelar] : [cancelar, accion]}</AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  it("con la destructiva primero, el foco arranca en Cancelar", async () => {
    render(<Alerta destructivaPrimero />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Seguir editando" })).toHaveFocus())
    expect(screen.getByRole("button", { name: "Descartar cambios" })).not.toHaveFocus()
  })

  it("con Cancelar primero, sigue arrancando en Cancelar", async () => {
    render(<Alerta destructivaPrimero={false} />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Seguir editando" })).toHaveFocus())
  })

  it("sin AlertDialogCancel, queda el comportamiento de Base UI (primer tabulable)", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Abrir</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Se guardó la factura</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogClose render={<AlertDialogAction />}>Entendido</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Entendido" })).toHaveFocus())
  })

  it("el ref del llamador sigue llegando al popup", async () => {
    let nodo: HTMLDivElement | null = null
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent ref={(n: HTMLDivElement | null) => { nodo = n }}>
          <AlertDialogTitle>¿Salir?</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    )
    await screen.findByRole("alertdialog")
    expect(nodo).toBe(screen.getByRole("alertdialog"))
  })
})
