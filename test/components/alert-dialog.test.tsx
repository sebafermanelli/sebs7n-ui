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
  AlertDialogIcon,
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
    expect(dialog).toHaveClass("shadow-modal", "rounded-panel", "p-6", "gap-4", "bg-surface")
    expect(dialog.className).not.toMatch(/\bborder\b/)
    expect(screen.getByText("¿Eliminar el viaje?")).toHaveClass("text-headline", "text-label")
    expect(screen.getByText("Se borran también los pasajeros cargados.")).toHaveClass("text-callout", "text-label-secondary")
    expect(document.querySelector("[data-slot=alert-dialog-overlay]")).toHaveClass("bg-backdrop")
    // Sin botón X: un alert dialog exige respuesta.
    expect(screen.queryByRole("button", { name: "Cerrar" })).toBeNull()
    const cancel = screen.getByRole("button", { name: "Cancelar" })
    // En una alerta destructiva, Cancelar es el botón por defecto: el acento sólido.
    expect(cancel).toHaveClass("bg-brand-700")
    expect(cancel).not.toHaveClass("border-separator-strong")
    await userEvent.click(cancel)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("la acción usa la variante pedida y dispara onClick", async () => {
    const onAction = vi.fn()
    render(<Example onAction={onAction} />)
    await userEvent.click(screen.getByRole("button", { name: "Eliminar viaje" }))
    const action = await screen.findByRole("button", { name: "Eliminar" })
    expect(action).toHaveClass("bg-fill-2", "text-red-ink")
    await userEvent.click(action)
    expect(onAction).toHaveBeenCalled()
  })

  it("el footer es una grilla de botones iguales, sin borde superior", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Eliminar viaje" }))
    const footer = (await screen.findByRole("button", { name: "Cancelar" })).parentElement!
    expect(footer).toHaveAttribute("data-slot", "alert-dialog-footer")
    expect(footer).toHaveClass("grid", "auto-cols-fr")
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

// La alerta real de iCloud (captura de Sebastián): ícono de la marca arriba al centro, título y
// texto centrados, y dos botones iguales a todo el ancho. El botón por defecto —el seguro— es el
// del acento: en una alerta destructiva es «Cancelar», y «Eliminar» va en gris con texto rojo.
describe("alerta de iCloud (2.0, R2)", () => {
  function Alerta({ extra = false, destructiva = true }: { extra?: boolean; destructiva?: boolean }) {
    return (
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogIcon>
            <svg data-testid="icono" />
          </AlertDialogIcon>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar la factura 0012?</AlertDialogTitle>
            <AlertDialogDescription>Se borra del listado y del resumen del mes.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            {extra && <AlertDialogAction>Archivar</AlertDialogAction>}
            <AlertDialogAction variant={destructiva ? "destructive" : "default"}>{destructiva ? "Eliminar" : "Emitir"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  it("es el diálogo de iCloud: radio 11, opaco, 24 de aire, 450 px como máximo y todo centrado", async () => {
    render(<Alerta />)
    const alerta = await screen.findByRole("alertdialog")
    expect(alerta).toHaveClass("rounded-panel", "p-6", "bg-surface", "shadow-modal", "max-w-[min(450px,calc(100%-2rem))]", "text-center", "justify-items-center")
  })

  it("el ícono va arriba al centro, en la marca, y es decorativo", async () => {
    render(<Alerta />)
    const alerta = await screen.findByRole("alertdialog")
    const icono = alerta.querySelector('[data-slot="alert-dialog-icon"]')!
    expect(icono).toHaveAttribute("aria-hidden", "true")
    expect(icono).toHaveClass("justify-center", "text-brand-900")
    expect(alerta.firstElementChild).toBe(icono)
    expect(screen.getByTestId("icono").parentElement).toBe(icono)
  })

  it("título headline y texto callout secundario, centrados", async () => {
    render(<Alerta />)
    const header = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-header"]')!
    expect(header).toHaveClass("items-center", "text-center")
    expect(screen.getByRole("heading", { name: "¿Eliminar la factura 0012?" })).toHaveClass("text-headline")
    expect(screen.getByText("Se borra del listado y del resumen del mes.")).toHaveClass("text-callout", "text-label-secondary")
  })

  it("dos botones iguales a todo el ancho; con tres se apilan, en el orden del DOM", async () => {
    const { unmount } = render(<Alerta />)
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie).toHaveClass("grid", "w-full", "auto-cols-fr", "grid-flow-col", "[&>*]:w-full")
    expect(pie.className).toMatch(/has-\[>:nth-child\(3\)\]:grid-flow-row/)
    expect(pie.className).not.toMatch(/reverse|order-|justify-end/)
    unmount()
    render(<Alerta extra />)
    const pie3 = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect([...pie3.children].map((b) => b.textContent)).toEqual(["Cancelar", "Archivar", "Eliminar"])
  })

  it("destructiva: Cancelar es el acento sólido y Eliminar el gris con texto rojo", async () => {
    render(<Alerta />)
    const cancelar = await screen.findByRole("button", { name: "Cancelar" })
    await waitFor(() => expect(cancelar).toHaveClass("bg-brand-700", "text-brand-contrast"))
    const eliminar = screen.getByRole("button", { name: "Eliminar" })
    expect(eliminar).toHaveClass("bg-fill-2", "text-red-ink")
    expect(eliminar.className).not.toMatch(/bg-red-800|bg-brand-700/)
  })

  it("sin destructiva: la acción es el acento y Cancelar el gris", async () => {
    render(<Alerta destructiva={false} />)
    expect(await screen.findByRole("button", { name: "Emitir" })).toHaveClass("bg-brand-700")
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveClass("bg-fill-2")
  })

  it("AlertDialogClose con render de la acción destructiva conserva el gris y el rojo", async () => {
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
    expect(eliminar).toHaveClass("text-red-ink")
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar" })).toHaveClass("bg-brand-700"))
    await userEvent.click(eliminar)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })
})

// Lo que documenta meta.mjs: `initialFocus` de la app gana siempre, y sin destructiva el foco
// arranca en la acción, así Return la dispara.
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

  // Sin acción destructiva, el botón por defecto es la acción (el acento): ahí arranca el foco y
  // Return la dispara. Con una destructiva, el por defecto es Cancelar (ver abajo).
  it("sin destructiva, por defecto arranca en la acción", async () => {
    render(<Emitir enAccion={false} />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Emitir" })).toHaveFocus())
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

// Revisión de R2: los casos que el foco inicial no cubría.
describe("foco inicial y botón por defecto: los casos raros", () => {
  it("destructiva sin Cancelar: el foco va al popup, no a la acción que destruye", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Abrir</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>¿Borrar todo?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogAction variant="destructive">Borrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    const alerta = await screen.findByRole("alertdialog")
    await waitFor(() => expect(alerta).toHaveFocus())
    expect(screen.getByRole("button", { name: "Borrar" })).not.toHaveFocus()
  })

  it("con una destructiva, una acción común también es gris: el único acento es Cancelar", async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>¿Salir sin guardar?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogAction>Guardar</AlertDialogAction>
            <AlertDialogAction variant="destructive">Descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await screen.findByRole("alertdialog")
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar" })).toHaveClass("bg-brand-700"))
    const guardar = screen.getByRole("button", { name: "Guardar" })
    expect(guardar).toHaveClass("bg-fill-2")
    expect(guardar.className).not.toMatch(/bg-brand-700/)
    expect(screen.getByRole("button", { name: "Descartar" })).toHaveClass("bg-fill-2", "text-red-ink")
  })

  it("sin destructiva, el foco va a la acción `default` aunque otro [data-alert-action] vaya antes", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>Abrir</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>¿Emitir?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <button data-alert-action="otra" type="button">
              Ver detalle
            </button>
            <AlertDialogAction>Emitir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Emitir" })).toHaveFocus())
  })
})

describe("textos largos en la alerta", () => {
  it('AlertDialogDescription align="start" alinea un texto largo a la izquierda', async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>¿Emitir?</AlertDialogTitle>
          <AlertDialogDescription align="start">Un texto de varios renglones.</AlertDialogDescription>
          <AlertDialogDescription>Corto.</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    )
    expect(await screen.findByText("Un texto de varios renglones.")).toHaveClass("w-full", "text-left")
    expect(screen.getByText("Corto.").className).not.toMatch(/text-left/)
  })

  it("un botón con una palabra larga no desborda la columna del pie", async () => {
    const { alertFooterClassName } = await import("../../src/variants/overlay")
    expect(alertFooterClassName.split(" ")).toEqual(expect.arrayContaining(["[&>*]:min-w-0", "[&>*]:break-words"]))
  })
})
