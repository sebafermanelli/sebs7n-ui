import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { DropTarget } from "../../src/components/drop-target"
import { DropZone } from "../../src/components/drop-zone"
import { LabelsProvider } from "../../src/lib/labels"

const pdf = (name = "factura-0012.pdf", size = 96_000) => new File([new Uint8Array(size)], name, { type: "application/pdf", lastModified: 1 })
const png = (name = "logo.png") => new File([new Uint8Array(1200)], name, { type: "image/png", lastModified: 1 })

const root = () => document.querySelector<HTMLElement>("[data-slot=drop-target]")!
const overlay = () => document.querySelector("[data-slot=drop-target-overlay]")
const status = () => document.querySelector("[data-slot=drop-target-status]")
const errors = () => document.querySelector("[data-slot=drop-target-errors]")
const enter = (target: Element) => fireEvent.dragEnter(target, { dataTransfer: { types: ["Files"] } })
const leave = (target: Element) => fireEvent.dragLeave(target, { dataTransfer: { types: ["Files"] } })
const drop = (target: Element, files: File[]) => fireEvent.drop(target, { dataTransfer: { files, types: ["Files"] } })

function Invoices(props: Partial<React.ComponentProps<typeof DropTarget>>) {
  return (
    <DropTarget onDrop={() => {}} {...props}>
      <section aria-label="Facturas">
        <h2>Facturas</h2>
        <button type="button">Agregar factura</button>
      </section>
    </DropTarget>
  )
}

describe("DropTarget", () => {
  it("envuelve contenido que sigue siendo interactivo: no es un botón ni entra al Tab", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <DropTarget onDrop={() => {}}>
        <button onClick={onClick} type="button">
          Agregar factura
        </button>
      </DropTarget>
    )
    expect(root()).not.toHaveAttribute("role")
    expect(root()).not.toHaveAttribute("tabindex")
    await user.tab()
    expect(screen.getByRole("button", { name: "Agregar factura" })).toHaveFocus()
    await user.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalled()
  })

  it("al arrastrar un archivo encima se pinta el anillo con «Soltá…», y se apaga al salir", () => {
    render(<Invoices />)
    expect(overlay()).toBeNull()
    const heading = screen.getByRole("heading")
    enter(root())
    // `dragenter`/`dragleave` llegan de a pares por cada hijo: un contador, no un booleano.
    enter(heading)
    leave(root())
    expect(root()).toHaveAttribute("data-dragging")
    expect(overlay()).toHaveAttribute("aria-hidden", "true")
    expect(overlay()).toHaveClass("ring-2", "ring-brand-700", "bg-highlight", "pointer-events-none")
    expect(overlay()).toHaveTextContent("Soltá para agregarlos")
    leave(heading)
    expect(root()).not.toHaveAttribute("data-dragging")
    expect(overlay()).toBeNull()
  })

  it("un arrastre que no trae archivos (texto, un link) no lo prende", () => {
    render(<Invoices />)
    fireEvent.dragEnter(root(), { dataTransfer: { types: ["text/plain"] } })
    expect(overlay()).toBeNull()
  })

  it("soltar llama a onDrop con el archivo y lo anuncia", () => {
    const onDrop = vi.fn()
    render(<Invoices onDrop={onDrop} />)
    enter(root())
    drop(root(), [pdf()])
    expect(onDrop).toHaveBeenCalledWith([expect.objectContaining({ name: "factura-0012.pdf" })])
    expect(status()).toHaveAttribute("role", "status")
    return waitFor(() => expect(status()).toHaveTextContent("Archivos agregados: factura-0012.pdf")).then(() =>
      expect(overlay()).toBeNull()
    )
  })

  it("soltar el mismo archivo dos veces lo vuelve a anunciar: vacía la región y la vuelve a llenar", async () => {
    render(<Invoices />)
    drop(root(), [pdf()])
    await waitFor(() => expect(status()).toHaveTextContent("Archivos agregados: factura-0012.pdf"))
    drop(root(), [pdf()])
    // El mismo texto no cambia el DOM y el lector no lo repite: primero se vacía.
    expect(status()).toHaveTextContent("")
    expect(status()!.textContent).toBe("")
    await waitFor(() => expect(status()).toHaveTextContent("Archivos agregados: factura-0012.pdf"))
  })

  it("los errores se van con el próximo arrastre", () => {
    render(<Invoices accept=".pdf" />)
    drop(root(), [png()])
    expect(errors()).not.toBeNull()
    enter(root())
    expect(errors()).toBeNull()
  })

  it("una validate asíncrona que termina después de desmontar no llama a onDrop", async () => {
    const onDrop = vi.fn()
    let resolve!: (message: string | undefined) => void
    const { unmount } = render(<Invoices onDrop={onDrop} validate={() => new Promise((done) => (resolve = done))} />)
    drop(root(), [pdf()])
    unmount()
    await act(async () => resolve(undefined))
    expect(onDrop).not.toHaveBeenCalled()
  })

  it("accept y maxSize: lo que no pasa no llega a onDrop y el error va en línea", () => {
    const onDrop = vi.fn()
    render(<Invoices accept=".pdf" maxSize={50_000} onDrop={onDrop} />)
    drop(root(), [png()])
    expect(onDrop).not.toHaveBeenCalled()
    expect(errors()).toHaveAttribute("role", "alert")
    expect(errors()).toHaveTextContent("logo.png no es de un tipo permitido")
    drop(root(), [pdf()])
    expect(onDrop).not.toHaveBeenCalled()
    expect(errors()).toHaveTextContent("factura-0012.pdf pesa más de 48,8 kB")
    // Uno bueno borra los errores de antes.
    drop(root(), [pdf("chica.pdf", 1000)])
    expect(onDrop).toHaveBeenCalledTimes(1)
    expect(errors()).toBeNull()
  })

  it("sin multiple llega uno solo y los demás se avisan; con multiple, todos", () => {
    const onDrop = vi.fn()
    const { rerender } = render(<Invoices onDrop={onDrop} />)
    drop(root(), [pdf("a.pdf"), pdf("b.pdf")])
    expect(onDrop).toHaveBeenLastCalledWith([expect.objectContaining({ name: "a.pdf" })])
    expect(errors()).toHaveTextContent("b.pdf no entra: el máximo es 1")
    rerender(<Invoices multiple onDrop={onDrop} />)
    drop(root(), [pdf("a.pdf"), pdf("b.pdf")])
    expect(onDrop.mock.lastCall![0]).toHaveLength(2)
  })

  it("validate asíncrona: aria-busy mientras tanto; el mensaje va en línea", async () => {
    const onDrop = vi.fn()
    let resolve!: (message: string | undefined) => void
    render(<Invoices onDrop={onDrop} validate={() => new Promise((done) => (resolve = done))} />)
    drop(root(), [pdf()])
    expect(root()).toHaveAttribute("aria-busy", "true")
    await act(async () => resolve("no es un PDF"))
    await waitFor(() => expect(root()).not.toHaveAttribute("aria-busy"))
    expect(onDrop).not.toHaveBeenCalled()
    expect(errors()).toHaveTextContent("factura-0012.pdf no es un PDF")
  })

  it("sin multiple, gana el último soltado aunque el anterior termine de validar después", async () => {
    const onDrop = vi.fn()
    const pending: ((message: string | undefined) => void)[] = []
    render(<Invoices onDrop={onDrop} validate={() => new Promise((done) => pending.push(done))} />)
    drop(root(), [pdf("vieja.pdf")])
    drop(root(), [pdf("nueva.pdf")])
    await act(async () => pending[1]!(undefined))
    await act(async () => pending[0]!(undefined))
    expect(onDrop).toHaveBeenCalledTimes(1)
    expect(onDrop).toHaveBeenCalledWith([expect.objectContaining({ name: "nueva.pdf" })])
  })

  it("disabled: no se prende ni recibe", () => {
    const onDrop = vi.fn()
    render(<Invoices disabled onDrop={onDrop} />)
    enter(root())
    expect(overlay()).toBeNull()
    drop(root(), [pdf()])
    expect(onDrop).not.toHaveBeenCalled()
  })

  it("anidadas: recibe solo la de adentro y la de afuera no queda prendida", () => {
    const outer = vi.fn()
    const inner = vi.fn()
    render(
      <DropTarget data-testid="outer" onDrop={outer}>
        <DropTarget data-testid="inner" onDrop={inner}>
          <p>Factura</p>
        </DropTarget>
      </DropTarget>
    )
    enter(screen.getByTestId("inner"))
    expect(screen.getByTestId("outer")).toHaveAttribute("data-dragging")
    drop(screen.getByTestId("inner"), [pdf()])
    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).not.toHaveBeenCalled()
    expect(screen.getByTestId("inner")).not.toHaveAttribute("data-dragging")
    expect(screen.getByTestId("outer")).not.toHaveAttribute("data-dragging")
    expect(overlay()).toBeNull()
  })

  it("con un DropZone scope=window en la página: el soltar es de la DropTarget y la ventana se apaga", () => {
    const onDrop = vi.fn()
    const onFilesChange = vi.fn()
    render(
      <>
        <DropZone aria-label="Adjuntos" scope="window" onFilesChange={onFilesChange} />
        <Invoices onDrop={onDrop} />
      </>
    )
    enter(root())
    expect(document.querySelector("[data-slot=drop-zone-overlay]")).not.toBeNull()
    drop(root(), [pdf()])
    expect(onDrop).toHaveBeenCalledTimes(1)
    expect(onFilesChange).not.toHaveBeenCalled()
    expect(document.querySelector("[data-slot=drop-zone-overlay]")).toBeNull()
  })

  it("un DropZone adentro: el soltar es del DropZone, no de la DropTarget", () => {
    const onDrop = vi.fn()
    const onFilesChange = vi.fn()
    render(
      <DropTarget onDrop={onDrop}>
        <DropZone aria-label="Adjuntos" onFilesChange={onFilesChange} />
      </DropTarget>
    )
    const area = document.querySelector("[data-slot=drop-zone-area]")!
    enter(area)
    drop(area, [pdf()])
    expect(onFilesChange).toHaveBeenCalledTimes(1)
    expect(onDrop).not.toHaveBeenCalled()
    expect(root()).not.toHaveAttribute("data-dragging")
  })

  it("un <input type=file> nativo adentro recibe su archivo: la DropTarget no le cancela el soltar", () => {
    const onDrop = vi.fn()
    render(
      <DropTarget onDrop={onDrop}>
        <input aria-label="Comprobante" type="file" />
      </DropTarget>
    )
    const input = screen.getByLabelText("Comprobante")
    enter(input)
    // `fireEvent` devuelve `false` si alguien hizo `preventDefault`.
    expect(fireEvent.dragOver(input, { dataTransfer: { types: ["Files"] } })).toBe(true)
    expect(drop(input, [pdf()])).toBe(true)
    expect(onDrop).not.toHaveBeenCalled()
    expect(root()).not.toHaveAttribute("data-dragging")
  })

  it("un arrastre que termina afuera (dragend) o se suelta en otro lado apaga el anillo", () => {
    render(<Invoices />)
    enter(root())
    fireEvent.dragEnd(document, { dataTransfer: { types: ["Files"] } })
    expect(root()).not.toHaveAttribute("data-dragging")
    enter(root())
    drop(document.body, [pdf()])
    expect(root()).not.toHaveAttribute("data-dragging")
  })

  it("los textos salen de los de DropZone (LabelsProvider) y la prop labels le gana", () => {
    render(
      <LabelsProvider value={{ dropZone: { drop: "Drop to attach" } }}>
        <Invoices labels={{ added: "Attached:" }} />
      </LabelsProvider>
    )
    enter(root())
    expect(overlay()).toHaveTextContent("Drop to attach")
    drop(root(), [pdf()])
    return waitFor(() => expect(status()).toHaveTextContent("Attached: factura-0012.pdf"))
  })

  it("renderiza en el servidor", () => {
    expect(renderToString(<Invoices />)).toContain("Agregar factura")
  })
})
