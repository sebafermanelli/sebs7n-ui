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
    expect(dialog).toHaveClass("shadow-modal", "rounded-panel", "p-5", "gap-3", "material-modal")
    expect(dialog.className).not.toMatch(/\bborder\b/)
    expect(screen.getByText("¿Eliminar el viaje?")).toHaveClass("text-title-3", "text-gray-1000")
    expect(screen.getByText("Se borran también los pasajeros cargados.")).toHaveClass("text-body", "text-gray-900")
    expect(document.querySelector("[data-slot=alert-dialog-overlay]")).toHaveClass("bg-backdrop")
    // Sin botón X: un alert dialog exige respuesta.
    expect(screen.queryByRole("button", { name: "Cerrar" })).toBeNull()
    const cancel = screen.getByRole("button", { name: "Cancelar" })
    // El push button gris de macOS, no el de vidrio con borde.
    expect(cancel).toHaveClass("bg-gray-alpha-200")
    expect(cancel).not.toHaveClass("glass-control")
    await userEvent.click(cancel)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("la acción usa la variante pedida y dispara onClick", async () => {
    const onAction = vi.fn()
    render(<Example onAction={onAction} />)
    await userEvent.click(screen.getByRole("button", { name: "Eliminar viaje" }))
    const action = await screen.findByRole("button", { name: "Eliminar" })
    expect(action).toHaveClass("text-red-ink", "bg-red-700/(--sf-tint-fill)")
    expect(action).not.toHaveClass("bg-red-800")
    await userEvent.click(action)
    expect(onAction).toHaveBeenCalled()
  })

  it("el footer es una grilla de botones iguales, sin borde superior", async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole("button", { name: "Eliminar viaje" }))
    const footer = (await screen.findByRole("button", { name: "Cancelar" })).parentElement!
    expect(footer).toHaveAttribute("data-slot", "alert-dialog-footer")
    expect(footer).toHaveClass("grid", "auto-cols-fr", "grid-flow-col")
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

describe("alerta de macOS (2.0)", () => {
  function Alerta({ extra = false }: { extra?: boolean }) {
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
            <AlertDialogAction variant="destructive">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  it("es compacta: 300 px como máximo", async () => {
    render(<Alerta />)
    const alerta = await screen.findByRole("alertdialog")
    // Sin breakpoint: en una tablet (≥ 640 px) también mide 300, y en un celular el ancho menos 2rem.
    expect(alerta).toHaveClass("max-w-[min(300px,calc(100%-2rem))]")
    expect(alerta.className).not.toMatch(/sm:max-w|max-w-\[calc/)
  })

  it("el ícono va arriba, mide 48 y es decorativo", async () => {
    render(<Alerta />)
    const alerta = await screen.findByRole("alertdialog")
    const icono = alerta.querySelector('[data-slot="alert-dialog-icon"]')!
    expect(icono).toHaveAttribute("aria-hidden", "true")
    expect(icono).toHaveClass("size-12")
    expect(alerta.firstElementChild).toBe(icono)
    expect(screen.getByTestId("icono").parentElement).toBe(icono)
  })

  it("los botones van iguales a lo ancho y sin línea arriba", async () => {
    render(<Alerta />)
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie).toHaveClass("grid", "auto-cols-fr", "grid-flow-col", "[&>*]:w-full")
    expect(pie).not.toHaveClass("border-t")
  })

  it("con tres botones se apilan, y sin espacio también", async () => {
    render(<Alerta extra />)
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie.className).toMatch(/has-\[>:nth-child\(3\)\]:grid-flow-row/)
    expect(pie.className).toMatch(/max-\[360px\]:grid-flow-row/)
  })

  it("apilados, el orden de Tab es el orden en pantalla: no se invierte nada", async () => {
    render(<Alerta extra />)
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie.className).not.toMatch(/reverse|order-/)
    expect([...pie.children].map((b) => b.textContent)).toEqual(["Cancelar", "Archivar", "Eliminar"])
  })

  it("Cancelar es el gris de macOS y la acción destructiva va tintada", async () => {
    render(<Alerta />)
    expect(await screen.findByRole("button", { name: "Cancelar" })).toHaveClass("bg-gray-alpha-200")
    const eliminar = screen.getByRole("button", { name: "Eliminar" })
    expect(eliminar).toHaveClass("text-red-ink")
    expect(eliminar).not.toHaveClass("bg-red-800")
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

  it("AlertDialogClose con render de la acción destructiva conserva el tintado", async () => {
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
    await userEvent.click(eliminar)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })
})

describe("etiquetas largas (revisión fase 2)", () => {
  function Larga({ stacked }: { stacked?: boolean }) {
    return (
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>¿Salir sin guardar?</AlertDialogTitle>
          <AlertDialogFooter stacked={stacked}>
            <AlertDialogCancel />
            <AlertDialogAction variant="destructive">Descartar cambios</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Cada celda mide ~126 px en 300: «Descartar cambios» con `whitespace-nowrap` se salía del botón.
  // La red de seguridad deja que el texto baje de renglón y que el botón crezca en alto.
  it("el pie deja que el texto de los botones baje de renglón, centrado", async () => {
    render(<Larga />)
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie).toHaveClass(
      "[&>*]:whitespace-normal",
      "[&>*]:h-auto",
      "[&>*]:min-h-8",
      "[&>*]:py-1.5",
      "[&>*]:text-center"
    )
  })

  it("`stacked` apila los botones aunque sean dos", async () => {
    render(<Larga stacked />)
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie).toHaveClass("grid-flow-row")
    expect(pie).not.toHaveClass("grid-flow-col")
    expect(pie).toHaveAttribute("data-stacked")
    expect([...pie.children].map((b) => b.textContent)).toEqual(["Cancelar", "Descartar cambios"])
  })

  it("sin `stacked`, dos botones siguen lado a lado", async () => {
    render(<Larga />)
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie).toHaveClass("grid-flow-col")
    expect(pie).not.toHaveAttribute("data-stacked")
  })
})

// Con el dedo cada botón de 32 crece a 44 (`touch-target`). Apilados con 8 px de separación, las
// áreas se pisan 4 px y gana el de abajo, que suele ser el destructivo. Con 12, 32 + 12 = 44.
describe("apilados, las áreas táctiles no se pisan (revisión fase 2)", () => {
  it("con tres botones o sin espacio, el gap sube a 12", async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>¿Guardar?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie).toHaveClass("gap-2", "has-[>:nth-child(3)]:gap-3", "max-[360px]:gap-3")
  })

  it("con `stacked`, gap-3 y no gap-2", async () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>¿Guardar?</AlertDialogTitle>
          <AlertDialogFooter stacked>
            <AlertDialogCancel />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    const pie = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-footer"]')!
    expect(pie).toHaveClass("gap-3")
    expect(pie).not.toHaveClass("gap-2")
  })
})

// Lo que documenta meta.mjs para una alerta que no destruye nada: el foco inicial en la acción,
// así Return la dispara como en macOS. Por defecto sigue arrancando en «Cancelar».
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
