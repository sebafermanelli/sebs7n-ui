import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// jsdom no tiene canvas ni imágenes que carguen: el recorte se simula con un componente mínimo
// y `cropToFile` devuelve un archivo fijo. Lo que se prueba acá es el comportamiento del paquete.
vi.mock("react-easy-crop", () => ({
  default: (props: { onCropComplete?: (a: unknown, b: unknown) => void; cropperProps?: Record<string, string>; zoom: number; cropShape: string }) => {
    React.useEffect(() => props.onCropComplete?.({}, { x: 0, y: 0, width: 100, height: 100 }), [])
    return <div data-testid="cropper" data-shape={props.cropShape} data-zoom={props.zoom} tabIndex={0} aria-label={props.cropperProps?.["aria-label"]} />
  },
}))
const cropToFile = vi.hoisted(() => vi.fn())
vi.mock("../../src/internal/crop-image", async (original) => ({
  ...(await original<typeof import("../../src/internal/crop-image")>()),
  cropToFile,
  loadImage: () => Promise.resolve(document.createElement("img")),
  drawCrop: () => true,
}))

import { AvatarUpload } from "../../src/components/avatar-upload"

const png = (size = 1200, name = "foto.png", type = "image/png") => new File([new Uint8Array(size)], name, { type })
const input = () => document.querySelector<HTMLInputElement>("input[type=file]")!
const trigger = () => screen.getByRole("button", { name: "Cambiar foto de perfil" })

beforeEach(() => {
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:x")
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
  cropToFile.mockReset()
  cropToFile.mockResolvedValue(new File([new Uint8Array(10)], "foto.webp", { type: "image/webp" }))
})
afterEach(() => vi.restoreAllMocks())

describe("AvatarUpload", () => {
  it("el disparador es un botón con el nombre accesible y la cámara es decoración", () => {
    render(<AvatarUpload label="Cambiar foto de perfil" onUpload={() => {}} />)
    expect(trigger()).toBeInTheDocument()
    expect(document.querySelector("[data-slot=avatar-upload-overlay]")).toHaveAttribute("aria-hidden", "true")
  })

  it("sin imagen, el clic abre directo el selector de archivos", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {})
    render(<AvatarUpload label="Cambiar foto de perfil" onUpload={() => {}} onRemove={() => {}} />)
    await userEvent.click(trigger())
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })

  it("con imagen, el clic abre un menú con Subir y Quitar", async () => {
    const onRemove = vi.fn()
    render(<AvatarUpload label="Cambiar foto de perfil" src="/a.png" onUpload={() => {}} onRemove={onRemove} />)
    await userEvent.click(trigger())
    expect(await screen.findByRole("menu")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Subir foto" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("menuitem", { name: "Quitar foto" }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it("el menú se abre con el teclado y Escape lo cierra devolviendo el foco", async () => {
    render(<AvatarUpload label="Cambiar foto de perfil" src="/a.png" onUpload={() => {}} onRemove={() => {}} />)
    trigger().focus()
    await userEvent.keyboard("{Enter}")
    expect(screen.getByRole("menu")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    expect(trigger()).toHaveFocus()
  })

  it("sin onRemove el menú no ofrece Quitar", async () => {
    render(<AvatarUpload label="Cambiar logo del estudio" src="/a.png" onUpload={() => {}} labels={{ upload: "Subir logo" }} />)
    await userEvent.click(screen.getByRole("button", { name: "Cambiar logo del estudio" }))
    expect(await screen.findByRole("menuitem", { name: "Subir logo" })).toBeInTheDocument()
    expect(screen.queryByRole("menuitem", { name: /Quitar/ })).not.toBeInTheDocument()
  })

  it("rechaza un tipo no permitido y un archivo demasiado pesado, sin abrir el recorte", () => {
    render(<AvatarUpload label="Cambiar foto de perfil" onUpload={() => {}} maxBytes={1000} />)
    fireEvent.change(input(), { target: { files: [png(10, "a.gif", "image/gif")] } })
    expect(screen.getByRole("alert")).toHaveTextContent("PNG, JPG o WebP")
    fireEvent.change(input(), { target: { files: [png(5000)] } })
    expect(screen.getByRole("alert")).toHaveTextContent("pesa más de")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("elegir un archivo abre el recorte con foco atrapado, zoom y vista previa; Cancelar no sube", async () => {
    const onUpload = vi.fn()
    render(<AvatarUpload label="Cambiar foto de perfil" onUpload={onUpload} />)
    fireEvent.change(input(), { target: { files: [png()] } })
    const dialog = await screen.findByRole("dialog")
    expect(dialog).toHaveAccessibleName("Elegí la parte visible")
    expect(screen.getByTestId("cropper")).toHaveAttribute("data-shape", "round")
    expect(screen.getByRole("slider", { name: "Zoom" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Vista previa" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(onUpload).not.toHaveBeenCalled()
  })

  it("Escape cierra el recorte", async () => {
    render(<AvatarUpload label="Cambiar foto de perfil" onUpload={() => {}} />)
    fireEvent.change(input(), { target: { files: [png()] } })
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("Guardar sube el recorte, muestra el estado ocupado y cierra", async () => {
    let done!: () => void
    const onUpload = vi.fn((_file: File) => new Promise<void>((resolve) => (done = resolve)))
    render(<AvatarUpload label="Cambiar foto de perfil" onUpload={onUpload} />)
    fireEvent.change(input(), { target: { files: [png()] } })
    await screen.findByRole("dialog")
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1))
    expect(onUpload.mock.calls[0]![0]).toMatchObject({ name: "foto.webp", type: "image/webp" })
    expect(screen.getByRole("button", { name: "Guardando…" })).toHaveAttribute("aria-busy", "true")
    done()
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("si onUpload falla, el recorte queda abierto con el mensaje y se puede reintentar", async () => {
    const onUpload = vi.fn().mockRejectedValueOnce(new Error("El servidor rechazó la imagen.")).mockResolvedValueOnce(undefined)
    render(<AvatarUpload label="Cambiar foto de perfil" onUpload={onUpload} />)
    fireEvent.change(input(), { target: { files: [png()] } })
    await screen.findByRole("dialog")
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    expect(await screen.findByText("El servidor rechazó la imagen.")).toBeInTheDocument()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("pasa el tope de bytes al recorte para que el archivo que sale entre", async () => {
    render(<AvatarUpload label="Cambiar foto de perfil" onUpload={() => {}} maxBytes={50_000} />)
    fireEvent.change(input(), { target: { files: [png()] } })
    await screen.findByRole("dialog")
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(cropToFile).toHaveBeenCalled())
    expect(cropToFile.mock.calls[0]![3]).toMatchObject({ maxBytes: 50_000 })
  })

  it("loading deja el botón ocupado y sin abrir nada; disabled lo apaga", async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {})
    const { rerender } = render(<AvatarUpload label="Cambiar foto de perfil" onUpload={() => {}} loading />)
    expect(trigger()).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Guardando…")
    await userEvent.click(trigger())
    expect(click).not.toHaveBeenCalled()
    rerender(<AvatarUpload label="Cambiar foto de perfil" onUpload={() => {}} disabled />)
    expect(trigger()).toBeDisabled()
  })

  it("quitar muestra el error de la app si falla", async () => {
    render(<AvatarUpload label="Cambiar foto de perfil" src="/a.png" onUpload={() => {}} onRemove={() => Promise.reject(new Error("Sin conexión."))} />)
    await userEvent.click(trigger())
    await userEvent.click(await screen.findByRole("menuitem", { name: "Quitar foto" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión.")
    expect(trigger()).toHaveAccessibleDescription("Sin conexión.")
  })

  it("el logo usa recorte cuadrado redondeado (rect)", async () => {
    render(<AvatarUpload label="Cambiar foto de perfil" shape="rounded" onUpload={() => {}} />)
    fireEvent.change(input(), { target: { files: [png()] } })
    await screen.findByRole("dialog")
    expect(screen.getByTestId("cropper")).toHaveAttribute("data-shape", "rect")
  })
})
