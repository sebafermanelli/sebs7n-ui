import { act, createEvent, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import * as React from "react"

import { DropZone, type DropZoneHandle } from "../../src/components/drop-zone"
import { Field, FieldDescription, FieldError, FieldLabel } from "../../src/components/field"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

const pdf = (name = "factura-0012.pdf", size = 96_000) => new File([new Uint8Array(size)], name, { type: "application/pdf", lastModified: 1 })
const png = (name = "logo.png") => new File([new Uint8Array(1200)], name, { type: "image/png", lastModified: 1 })

const area = () => document.querySelector<HTMLButtonElement>("[data-slot=drop-zone-area]")!
const input = () => document.querySelector<HTMLInputElement>("input[type=file]")!
const status = () => document.querySelector("[data-slot=drop-zone-status]")
const rows = () => screen.queryAllByRole("listitem")
const drop = (target: Element | Window, files: File[]) => fireEvent.drop(target, { dataTransfer: { files, types: ["Files"] } })

beforeEach(() => {
  vi.spyOn(URL, "createObjectURL").mockImplementation((file) => `blob:${(file as File).name}`)
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("DropZone", () => {
  it("el recuadro gris de radio 11 con borde lleno; Enter y Espacio abren el selector", async () => {
    const user = userEvent.setup()
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {})
    render(<DropZone aria-label="Adjuntos" />)
    const button = screen.getByRole("button", { name: "Adjuntos" })
    expect(button).toHaveClass("rounded-surface", "border", "border-separator-strong", "bg-fill-1")
    expect(button).toHaveTextContent("Arrastrá archivos acá o hacé clic para elegirlos")
    expect(input()).toHaveAttribute("aria-hidden", "true")
    expect(input()).toHaveAttribute("tabindex", "-1")
    await user.tab()
    expect(button).toHaveFocus()
    await user.keyboard("{Enter}")
    await user.keyboard(" ")
    expect(click).toHaveBeenCalledTimes(2)
  })

  it("elegir archivos los lista con nombre y tamaño, y lo anuncia", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    render(<DropZone aria-label="Adjuntos" multiple onFilesChange={onFilesChange} />)
    const file = pdf()
    await user.upload(input(), file)
    expect(onFilesChange).toHaveBeenLastCalledWith([file])
    expect(rows()).toHaveLength(1)
    expect(rows()[0]).toHaveTextContent("factura-0012.pdf")
    // En base 1024 (2.1): 96 000 B son 93,75 KiB.
    expect(rows()[0]).toHaveTextContent("93,8 kB")
    expect(status()).toHaveTextContent("Archivos agregados: factura-0012.pdf")
  })

  it("una imagen lleva su miniatura, y el object URL se revoca al quitarla", async () => {
    const user = userEvent.setup()
    render(<DropZone aria-label="Adjuntos" multiple />)
    await user.upload(input(), png())
    const thumbnail = document.querySelector("[data-slot=drop-zone-thumbnail]")
    expect(thumbnail).toHaveAttribute("src", "blob:logo.png")
    expect(thumbnail).toHaveAttribute("alt", "")
    await user.click(screen.getByRole("button", { name: "Quitar logo.png" }))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:logo.png")
    expect(rows()).toHaveLength(0)
    expect(area()).toHaveFocus()
    expect(status()).toHaveTextContent("Archivo quitado: logo.png")
  })

  it("tipo, tamaño y cantidad: errores en línea con role=alert, y los válidos entran", async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<DropZone accept=".pdf,image/*" aria-label="Adjuntos" maxFiles={2} maxSize={100_000} multiple />)
    await user.upload(input(), [pdf("a.pdf"), new File(["x"], "planilla.exe", { type: "application/x-msdownload" }), pdf("grande.pdf", 250_000), png("b.png"), pdf("c.pdf")])
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("planilla.exe no es de un tipo permitido")
    expect(alert).toHaveTextContent("grande.pdf pesa más de 97,7 kB")
    expect(alert).toHaveTextContent("c.pdf no entra: el máximo es 2")
    expect(rows().map((row) => row.querySelector(".text-body")?.textContent)).toEqual(["a.pdf", "b.png"])
    expect(area()).toHaveAttribute("aria-invalid", "true")
    expect(area().getAttribute("aria-describedby")).toBe(alert.id)
  })

  it("los tamaños van en base 1024, coherentes con maxSize en bytes: 20 MiB dice «20 MB»", async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<DropZone aria-label="Adjuntos" maxSize={20 * 1024 * 1024} />)
    await user.upload(input(), pdf("grande.pdf", 21 * 1024 * 1024))
    expect(screen.getByRole("alert")).toHaveTextContent("grande.pdf pesa más de 20 MB")
  })

  it("formatSize reemplaza el texto de los tamaños, en la lista y en el error", async () => {
    const user = userEvent.setup({ applyAccept: false })
    const formatSize = (bytes: number) => `${Math.round(bytes / 1000)} KB`
    render(<DropZone aria-label="Adjuntos" formatSize={formatSize} maxSize={100_000} multiple />)
    await user.upload(input(), [pdf("a.pdf", 96_000), pdf("b.pdf", 200_000)])
    expect(rows()[0]).toHaveTextContent("96 KB")
    expect(screen.getByRole("alert")).toHaveTextContent("b.pdf pesa más de 100 KB")
  })

  it("validate: el texto devuelto es el error en línea de ese archivo, que no entra ni se anuncia", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    const validate = (file: File) => (file.name.startsWith("falso") ? "no es un PDF de verdad" : undefined)
    render(<DropZone accept=".pdf" aria-label="Facturas" multiple onFilesChange={onFilesChange} validate={validate} />)
    const ok = pdf("factura-0012.pdf")
    await user.upload(input(), [ok, pdf("falso.pdf")])
    expect(onFilesChange).toHaveBeenLastCalledWith([ok])
    expect(screen.getByRole("alert")).toHaveTextContent("falso.pdf no es un PDF de verdad")
    expect(status()).toHaveTextContent("Archivos agregados: factura-0012.pdf")
    expect(status()).not.toHaveTextContent("falso.pdf")
    expect(area()).toHaveAttribute("aria-invalid", "true")
  })

  it("validate asíncrono (leer los bytes): espera y recién ahí agrega", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    const validate = async (file: File) => ((await file.slice(0, 5).text()) === "%PDF-" ? undefined : "no empieza con %PDF-")
    render(<DropZone accept=".pdf" aria-label="Factura" onFilesChange={onFilesChange} validate={validate} />)
    await user.upload(input(), new File(["hola"], "roto.pdf", { type: "application/pdf" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("roto.pdf no empieza con %PDF-")
    expect(onFilesChange).not.toHaveBeenCalled()
    const bueno = new File(["%PDF-1.7"], "bueno.pdf", { type: "application/pdf" })
    await user.upload(input(), bueno)
    await waitFor(() => expect(onFilesChange).toHaveBeenLastCalledWith([bueno]))
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("un archivo rechazado por validate no ocupa lugar de maxFiles", async () => {
    const user = userEvent.setup()
    const validate = (file: File) => (file.name === "falso.pdf" ? "no es un PDF de verdad" : undefined)
    render(<DropZone aria-label="Facturas" maxFiles={1} multiple validate={validate} />)
    await user.upload(input(), [pdf("falso.pdf"), pdf("bueno.pdf")])
    expect(rows().map((row) => row.querySelector(".text-body")?.textContent)).toEqual(["bueno.pdf"])
    expect(screen.getByRole("alert")).not.toHaveTextContent("no entra")
  })

  it("sin multiple, uno nuevo reemplaza al anterior", async () => {
    const user = userEvent.setup()
    render(<DropZone aria-label="Comprobante" />)
    await user.upload(input(), pdf("uno.pdf"))
    await user.upload(input(), pdf("dos.pdf"))
    expect(rows()).toHaveLength(1)
    expect(rows()[0]).toHaveTextContent("dos.pdf")
  })

  it("arrastrar sobre el recuadro lo pinta con el acento y soltar agrega", () => {
    render(<DropZone aria-label="Adjuntos" multiple />)
    fireEvent.dragEnter(area(), { dataTransfer: { types: ["Files"] } })
    expect(area()).toHaveAttribute("data-dragging")
    expect(area()).toHaveClass("data-dragging:bg-highlight", "data-dragging:ring-brand-700")
    expect(area()).toHaveTextContent("Soltá para agregarlos")
    drop(area(), [pdf()])
    expect(area()).not.toHaveAttribute("data-dragging")
    expect(rows()).toHaveLength(1)
  })

  it("scope=window: arrastrar sobre la ventana muestra la zona de ventana completa y soltar en cualquier lado agrega", () => {
    render(<DropZone aria-label="Adjuntos" scope="window" />)
    fireEvent.dragEnter(window, { dataTransfer: { types: ["Files"] } })
    const overlay = document.querySelector("[data-slot=drop-zone-overlay]")
    expect(overlay?.parentElement).toBe(document.body)
    expect(overlay).toHaveClass("fixed", "ring-2", "ring-brand-700", "bg-highlight")
    expect(area()).toHaveAttribute("data-dragging")
    drop(window, [pdf()])
    expect(document.querySelector("[data-slot=drop-zone-overlay]")).toBeNull()
    expect(rows()).toHaveLength(1)
  })

  it("un arrastre de texto (no de archivos) no la prende", () => {
    render(<DropZone aria-label="Adjuntos" scope="window" />)
    fireEvent.dragEnter(window, { dataTransfer: { types: ["text/plain"] } })
    expect(document.querySelector("[data-slot=drop-zone-overlay]")).toBeNull()
  })

  it("el progreso y el error de cada archivo los pasa la app", async () => {
    const user = userEvent.setup()
    render(
      <DropZone
        aria-label="Adjuntos"
        fileError={(file) => (file.name === "b.pdf" ? "No se pudo subir" : undefined)}
        fileProgress={(file) => (file.name === "a.pdf" ? 40 : undefined)}
        multiple
      />
    )
    await user.upload(input(), [pdf("a.pdf"), pdf("b.pdf")])
    const bar = within(rows()[0]!).getByRole("progressbar", { name: "a.pdf" })
    expect(bar).toHaveAttribute("aria-valuenow", "40")
    expect(within(rows()[1]!).queryByRole("progressbar")).toBeNull()
    expect(rows()[1]).toHaveTextContent("No se pudo subir")
  })

  it("con name, el input del form tiene los mismos archivos que la lista", () => {
    const set = vi.fn()
    vi.stubGlobal(
      "DataTransfer",
      class {
        private list: File[] = []
        items = { add: (file: File) => void this.list.push(file) }
        get files() {
          return this.list
        }
      }
    )
    vi.spyOn(HTMLInputElement.prototype, "files", "set").mockImplementation(set)
    render(
      <form>
        <DropZone aria-label="Adjuntos" multiple name="attachments" />
      </form>
    )
    expect(input()).toHaveAttribute("name", "attachments")
    expect(input()).toHaveAttribute("multiple")
    drop(area(), [pdf("a.pdf"), pdf("b.pdf")])
    expect(set.mock.lastCall?.[0].map((file: File) => file.name)).toEqual(["a.pdf", "b.pdf"])
    fireEvent.click(screen.getByRole("button", { name: "Quitar a.pdf" }))
    expect(set.mock.lastCall?.[0].map((file: File) => file.name)).toEqual(["b.pdf"])
  })

  it("con name, si el diálogo trae solo archivos rechazados, el input vuelve a la lista (no manda el inválido)", () => {
    const set = vi.fn()
    vi.stubGlobal(
      "DataTransfer",
      class {
        private list: File[] = []
        items = { add: (file: File) => void this.list.push(file) }
        get files() {
          return this.list
        }
      }
    )
    vi.spyOn(HTMLInputElement.prototype, "files", "set").mockImplementation(set)
    render(
      <form>
        <DropZone accept=".pdf" aria-label="Adjuntos" multiple name="attachments" />
      </form>
    )
    drop(area(), [pdf("a.pdf")])
    set.mockClear()
    // El diálogo deja en el input lo que se eligió: un .exe que no pasa `accept`.
    const exe = new File(["x"], "planilla.exe", { type: "application/x-msdownload" })
    Object.defineProperty(input(), "files", { configurable: true, get: () => [exe], set })
    fireEvent.change(input())
    expect(screen.getByRole("alert")).toHaveTextContent("planilla.exe no es de un tipo permitido")
    expect(set.mock.lastCall?.[0].map((file: File) => file.name)).toEqual(["a.pdf"])
  })

  it("sin multiple, soltar varios toma el primero y avisa que sobran", () => {
    render(<DropZone aria-label="Comprobante" />)
    drop(area(), [pdf("uno.pdf"), pdf("dos.pdf")])
    expect(rows()).toHaveLength(1)
    expect(rows()[0]).toHaveTextContent("uno.pdf")
    expect(screen.getByRole("alert")).toHaveTextContent("dos.pdf no entra: el máximo es 1")
  })

  it("accept=\"*/*\" acepta cualquier archivo", () => {
    render(<DropZone accept="*/*" aria-label="Adjuntos" multiple />)
    drop(area(), [new File(["x"], "datos.zip", { type: "application/zip" }), new File(["x"], "sin-tipo", { type: "" })])
    expect(rows()).toHaveLength(2)
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("dos errores iguales se muestran los dos (sin claves repetidas)", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    render(<DropZone accept=".pdf" aria-label="Adjuntos" multiple />)
    const exe = () => new File(["x"], "planilla.exe", { type: "application/x-msdownload", lastModified: 1 })
    drop(area(), [exe(), exe()])
    expect(screen.getByRole("alert").querySelectorAll("p")).toHaveLength(2)
    expect(errors.mock.calls.filter(([message]) => /same key/i.test(String(message)))).toEqual([])
  })

  it("el recuadro sigue prendido al cruzar sus hijos: cuenta entradas y salidas", () => {
    render(<DropZone aria-label="Adjuntos" multiple />)
    const icon = area().querySelector("svg")!
    fireEvent.dragEnter(area(), { dataTransfer: { types: ["Files"] } })
    fireEvent.dragEnter(icon, { dataTransfer: { types: ["Files"] } })
    fireEvent.dragLeave(area(), { dataTransfer: { types: ["Files"] } })
    expect(area()).toHaveAttribute("data-dragging")
    fireEvent.dragLeave(icon, { dataTransfer: { types: ["Files"] } })
    expect(area()).not.toHaveAttribute("data-dragging")
  })

  it("scope=window: si se deshabilita a mitad del arrastre, la zona de ventana se apaga", () => {
    const { rerender } = render(<DropZone aria-label="Adjuntos" scope="window" />)
    fireEvent.dragEnter(window, { dataTransfer: { types: ["Files"] } })
    expect(document.querySelector("[data-slot=drop-zone-overlay]")).not.toBeNull()
    rerender(<DropZone aria-label="Adjuntos" disabled scope="window" />)
    expect(document.querySelector("[data-slot=drop-zone-overlay]")).toBeNull()
    rerender(<DropZone aria-label="Adjuntos" scope="window" />)
    expect(document.querySelector("[data-slot=drop-zone-overlay]")).toBeNull()
  })

  it("deshabilitada con scope=window, la ventana sigue sin abrir el archivo: preventDefault y dropEffect none", () => {
    const onFilesChange = vi.fn()
    const { unmount } = render(<DropZone aria-label="Factura" disabled onFilesChange={onFilesChange} scope="window" />)
    const transfer = { types: ["Files"], dropEffect: "copy", files: [pdf()] }
    const over = createEvent.dragOver(window, { dataTransfer: transfer })
    fireEvent(window, over)
    expect(over.defaultPrevented).toBe(true)
    expect(transfer.dropEffect).toBe("none")
    const dropped = createEvent.drop(window, { dataTransfer: transfer })
    fireEvent(window, dropped)
    expect(dropped.defaultPrevented).toBe(true)
    expect(onFilesChange).not.toHaveBeenCalled()
    expect(document.querySelector("[data-slot=drop-zone-overlay]")).toBeNull()
    // Desmontada, la ventana vuelve a ser del navegador.
    unmount()
    const later = createEvent.dragOver(window, { dataTransfer: { types: ["Files"] } })
    fireEvent(window, later)
    expect(later.defaultPrevented).toBe(false)
  })

  it("deshabilitada con scope=area no toca la ventana", () => {
    render(<DropZone aria-label="Factura" disabled />)
    const over = createEvent.dragOver(window, { dataTransfer: { types: ["Files"] } })
    fireEvent(window, over)
    expect(over.defaultPrevented).toBe(false)
  })

  it("scope=window: al desmontar saca sus listeners de la ventana", () => {
    const add = vi.spyOn(window, "addEventListener")
    const remove = vi.spyOn(window, "removeEventListener")
    const { unmount } = render(<DropZone aria-label="Adjuntos" scope="window" />)
    const added = add.mock.calls.filter(([type]) => ["dragenter", "dragover", "dragleave", "drop"].includes(type))
    expect(added).toHaveLength(4)
    unmount()
    for (const [type, listener] of added) expect(remove).toHaveBeenCalledWith(type, listener)
  })

  it("ref: open() abre el selector y focus() enfoca el recuadro; deshabilitada, open() no hace nada", () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {})
    const ref = React.createRef<DropZoneHandle>()
    const { rerender } = render(<DropZone aria-label="Factura" ref={ref} />)
    act(() => ref.current!.focus())
    expect(area()).toHaveFocus()
    act(() => ref.current!.open())
    expect(click).toHaveBeenCalledTimes(1)
    rerender(<DropZone aria-label="Factura" disabled ref={ref} />)
    act(() => ref.current!.open())
    expect(click).toHaveBeenCalledTimes(1)
  })

  it("compact: con archivos, el recuadro pasa a una fila chica «Elegir otro», el mismo botón y con su nombre", async () => {
    const user = userEvent.setup()
    render(<DropZone aria-label="Factura" compact />)
    const button = area()
    expect(button).toHaveClass("min-h-32")
    expect(button).not.toHaveAttribute("data-compact")
    await user.upload(input(), pdf())
    expect(area()).toBe(button)
    expect(button).toHaveAttribute("data-compact", "")
    expect(button).toHaveTextContent("Elegir otro")
    expect(button).not.toHaveClass("min-h-32")
    expect(button).toHaveClass("min-h-9", "rounded-field")
    expect(button).toHaveAccessibleName("Factura")
  })

  it("compact con multiple dice «Agregar más», y el texto sale de labels", async () => {
    const user = userEvent.setup()
    render(<DropZone aria-label="Facturas" compact labels={{ addMore: "Sumar facturas" }} multiple />)
    await user.upload(input(), pdf())
    expect(area()).toHaveTextContent("Sumar facturas")
  })

  it("dentro de Field toma la etiqueta, la ayuda y el error del campo", () => {
    render(
      <Field invalid>
        <FieldLabel>Comprobante</FieldLabel>
        <DropZone />
        <FieldDescription>PDF, hasta 5 MB.</FieldDescription>
        <FieldError match>Falta el comprobante.</FieldError>
      </Field>
    )
    const button = area()
    expect(button).toHaveAccessibleName("Comprobante")
    expect(button).toHaveAccessibleDescription(expect.stringContaining("PDF, hasta 5 MB."))
    expect(button).toHaveAccessibleDescription(expect.stringContaining("Falta el comprobante."))
    expect(button).toHaveAttribute("aria-invalid", "true")
  })

  it("dentro de Field, sus errores propios se suman a la descripción del campo", async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(
      <Field>
        <FieldLabel>Comprobante</FieldLabel>
        <DropZone accept=".pdf" />
        <FieldDescription>Solo PDF.</FieldDescription>
      </Field>
    )
    await user.upload(input(), png())
    expect(area()).toHaveAccessibleDescription(expect.stringContaining("Solo PDF."))
    expect(area()).toHaveAccessibleDescription(expect.stringContaining("logo.png no es de un tipo permitido"))
  })

  it("Field disabled apaga el recuadro", () => {
    render(
      <Field disabled>
        <FieldLabel>Comprobante</FieldLabel>
        <DropZone />
      </Field>
    )
    expect(area()).toBeDisabled()
  })

  it("el reset del form vacía la lista", async () => {
    const user = userEvent.setup()
    render(
      <form>
        <DropZone aria-label="Adjuntos" multiple name="attachments" />
        <button type="reset">Limpiar</button>
      </form>
    )
    await user.upload(input(), pdf())
    await user.click(screen.getByRole("button", { name: "Limpiar" }))
    expect(rows()).toHaveLength(0)
  })

  it("controlado: muestra files y avisa, sin guardar nada propio", async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    const file = pdf()
    render(<DropZone aria-label="Adjuntos" files={[file]} multiple onFilesChange={onFilesChange} />)
    await user.click(screen.getByRole("button", { name: "Quitar factura-0012.pdf" }))
    expect(onFilesChange).toHaveBeenCalledWith([])
    expect(rows()).toHaveLength(1)
  })

  it("disabled: no abre, no acepta arrastres", () => {
    render(<DropZone aria-label="Adjuntos" disabled />)
    expect(area()).toBeDisabled()
    drop(area(), [pdf()])
    expect(rows()).toHaveLength(0)
  })

  it("los textos salen de LabelsProvider y la prop labels le gana", async () => {
    const user = userEvent.setup()
    render(
      <LabelsProvider value={{ dropZone: { prompt: "Drop files here", remove: "Remove", locale: "en" } }}>
        <DropZone aria-label="Adjuntos" labels={{ remove: "Sacar" }} multiple />
      </LabelsProvider>
    )
    expect(area()).toHaveTextContent("Drop files here")
    await user.upload(input(), pdf("a.pdf", 1_250_000))
    expect(screen.getByRole("button", { name: "Sacar a.pdf" })).toBeInTheDocument()
    expect(rows()[0]).toHaveTextContent("1.2 MB")
  })

  it("hidrata sin mismatch", async () => {
    const ui = <DropZone aria-label="Adjuntos" multiple name="attachments" />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
  })
})
