import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { DropTarget } from "../../src/components/drop-target"
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
    expect(status()).toHaveTextContent("Archivos agregados: factura-0012.pdf")
    expect(overlay()).toBeNull()
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

  it("el soltar no sube a otra zona de afuera", () => {
    const outer = vi.fn()
    const inner = vi.fn()
    render(
      <DropTarget onDrop={outer}>
        <DropTarget data-testid="inner" onDrop={inner}>
          <p>Factura</p>
        </DropTarget>
      </DropTarget>
    )
    drop(screen.getByTestId("inner"), [pdf()])
    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).not.toHaveBeenCalled()
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
    expect(status()).toHaveTextContent("Attached: factura-0012.pdf")
  })

  it("renderiza en el servidor", () => {
    expect(renderToString(<Invoices />)).toContain("Agregar factura")
  })
})
