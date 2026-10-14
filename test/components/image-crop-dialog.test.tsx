import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Ver `cropper-stub.tsx`: el recorte se simula; la geometría exacta se prueba en `crop-geometry.test.ts`
// y el arrastre, la rueda y el pellizco, en un navegador real.
vi.mock("react-easy-crop", async () => ({ default: (await import("./cropper-stub")).default }))
const cropToFile = vi.hoisted(() => vi.fn())
const loadImage = vi.hoisted(() => vi.fn())
vi.mock("../../src/internal/crop-image", async (original) => ({
  ...(await original<typeof import("../../src/internal/crop-image")>()),
  cropToFile,
  loadImage,
  drawCrop: vi.fn(() => true),
}))

import { ImageCropDialog, type ImageCropDialogProps } from "../../src/components/image-crop-dialog"
import { stub } from "./cropper-stub"

const file = () => new File([new Uint8Array(20)], "foto.png", { type: "image/png" })
const cropper = () => screen.findByTestId("cropper")
const open = (props: Partial<ImageCropDialogProps> = {}) => render(<ImageCropDialog file={file()} onCancel={() => {}} onSave={() => {}} {...props} />)

beforeEach(() => {
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:x")
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
  loadImage.mockReset()
  loadImage.mockResolvedValue(document.createElement("img"))
  cropToFile.mockReset()
  cropToFile.mockResolvedValue(new File([new Uint8Array(10)], "foto.webp", { type: "image/webp" }))
  stub.media = { width: 400, height: 225, naturalWidth: 1600, naturalHeight: 900 }
  stub.frame = { width: 225, height: 225 }
})
afterEach(() => vi.restoreAllMocks())

describe("ImageCropDialog: ayuda y teclado", () => {
  it("con una imagen apaisada muestra la ayuda para arrastrar y la une al área de recorte", async () => {
    open()
    const area = await cropper()
    const hint = document.querySelector("[data-slot=image-crop-hint]")!
    expect(hint).toHaveTextContent("Arrastrá la imagen para elegir qué parte se ve")
    await waitFor(() => expect(hint).not.toHaveClass("invisible"))
    expect(hint).not.toHaveAttribute("aria-hidden")
    expect(area).toHaveAttribute("role", "group")
    expect(area).toHaveAccessibleName("Área de recorte")
    // Descripción accesible: la ayuda y las teclas.
    expect(area).toHaveAccessibleDescription(/Arrastrá la imagen.*flechas movés la imagen.*Mayús/)
  })

  it("con una vertical también (sobra alto, no ancho)", async () => {
    stub.media = { width: 140, height: 250, naturalWidth: 900, naturalHeight: 1600 }
    stub.frame = { width: 140, height: 140 }
    open()
    await cropper()
    await waitFor(() => expect(document.querySelector("[data-slot=image-crop-hint]")).not.toHaveClass("invisible"))
  })

  it("si la imagen ya entra justa (cuadrada) no hay eje y la ayuda no se ve ni se lee, pero el diálogo no salta", async () => {
    stub.media = { width: 225, height: 225, naturalWidth: 900, naturalHeight: 900 }
    open()
    await cropper()
    const hint = document.querySelector("[data-slot=image-crop-hint]")!
    expect(hint).toHaveClass("invisible")
    expect(hint).toHaveAttribute("aria-hidden", "true")
  })

  it("los textos se cambian con labels", async () => {
    open({ labels: { hint: "Movela para elegir", keyboardHint: "Flechas.", area: "Encuadre" } })
    const area = await cropper()
    expect(screen.getByText("Movela para elegir")).toBeInTheDocument()
    expect(area).toHaveAccessibleName("Encuadre")
    expect(area).toHaveAccessibleDescription("Movela para elegir Flechas.")
  })

  it("las flechas mueven la imagen de a 10 px, con Mayús de a 50, y frenan en el borde sin dejar huecos", async () => {
    open()
    const area = await cropper()
    area.focus()
    expect(area).toHaveAttribute("data-crop", "0,0")
    await userEvent.keyboard("{ArrowLeft}")
    expect(area).toHaveAttribute("data-crop", "-10,0")
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}")
    expect(area).toHaveAttribute("data-crop", "-60,0")
    // El recorrido es la mitad de lo que sobra: (400 − 225) / 2 = 87,5.
    await userEvent.keyboard("{Shift>}{ArrowLeft}{ArrowLeft}{/Shift}")
    expect(area).toHaveAttribute("data-crop", "-87.5,0")
    await userEvent.keyboard("{ArrowRight}")
    expect(area).toHaveAttribute("data-crop", "-77.5,0")
    // En vertical no sobra nada: no se mueve.
    await userEvent.keyboard("{ArrowUp}{ArrowDown}")
    expect(area).toHaveAttribute("data-crop", "-77.5,0")
  })

  it("+ y − cambian el zoom entre el mínimo y el máximo", async () => {
    open()
    const area = await cropper()
    area.focus()
    await userEvent.keyboard("{-}")
    expect(Number(area.dataset.zoom)).toBe(1)
    await userEvent.keyboard("{+}{+}")
    expect(Number(area.dataset.zoom)).toBeCloseTo(1.2, 6)
    for (let i = 0; i < 40; i++) await userEvent.keyboard("{+}")
    expect(Number(area.dataset.zoom)).toBe(4)
  })

  it("después de mover con el teclado anuncia qué parte se ve, una sola vez por ráfaga", async () => {
    open()
    const area = await cropper()
    area.focus()
    const live = () => screen.getAllByRole("status").map((node) => node.textContent).filter(Boolean)
    expect(live()).toEqual([])
    await userEvent.keyboard("{Shift>}{ArrowRight}{ArrowRight}{/Shift}")
    await waitFor(() => expect(live()).toEqual(["Se ve del 0 % al 56 % del ancho de la imagen."]))
    await userEvent.keyboard("{Shift>}{ArrowLeft}{ArrowLeft}{ArrowLeft}{/Shift}")
    await waitFor(() => expect(live()).toEqual(["Se ve del 38 % al 94 % del ancho de la imagen."]))
  })

  it("con zoom anuncia los dos ejes", async () => {
    open()
    const area = await cropper()
    area.focus()
    await userEvent.keyboard("{+}{+}{+}{+}{+}")
    await waitFor(() => expect(screen.getAllByRole("status").map((node) => node.textContent).join("")).toMatch(/ancho.*alto/))
  })
})

describe("ImageCropDialog: estados", () => {
  it("mientras lee la imagen muestra la carga, marca el área como ocupada y no deja guardar", async () => {
    let resolve!: (image: HTMLImageElement) => void
    loadImage.mockReturnValue(new Promise<HTMLImageElement>((done) => (resolve = done)))
    open()
    const guardar = screen.getByRole("button", { name: "Guardar" })
    expect(guardar).toBeDisabled()
    expect(screen.getByRole("status", { name: "Cargando la imagen…" })).toBeInTheDocument()
    expect(document.querySelector("[data-slot=image-crop-area]")).toHaveAttribute("aria-busy", "true")
    expect(screen.queryByTestId("cropper")).not.toBeInTheDocument()
    await act(async () => resolve(document.createElement("img")))
    await cropper()
    await waitFor(() => expect(guardar).toBeEnabled())
    expect(document.querySelector("[data-slot=image-crop-loading]")).not.toBeInTheDocument()
  })

  it("con una imagen ilegible muestra el error y deja «Guardar» deshabilitado, sin recorte ni zoom", async () => {
    loadImage.mockRejectedValue(new Error("image-load"))
    open()
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos leer esa imagen. Probá con otra.")
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled()
    expect(screen.queryByTestId("cropper")).not.toBeInTheDocument()
    expect(screen.getByRole("slider", { name: "Zoom" })).toBeDisabled()
    // Cancelar sigue andando.
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeEnabled()
  })

  it("si guardar falla, el error aparece pero «Guardar» queda habilitado para reintentar", async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new Error("Sin conexión.")).mockResolvedValueOnce(undefined)
    open({ onSave })
    await cropper()
    const guardar = screen.getByRole("button", { name: "Guardar" })
    await waitFor(() => expect(guardar).toBeEnabled())
    await userEvent.click(guardar)
    expect(await screen.findByText("Sin conexión.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled()
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2))
  })
})

describe("ImageCropDialog: lo que se guarda", () => {
  const saved = async () => {
    const guardar = await screen.findByRole("button", { name: "Guardar" })
    await waitFor(() => expect(guardar).toBeEnabled())
    await userEvent.click(guardar)
    await waitFor(() => expect(cropToFile).toHaveBeenCalled())
    return cropToFile.mock.calls[0]![1] as { x: number; y: number; width: number; height: number }
  }

  it("apaisada centrada: guarda el cuadrado del medio de la imagen original", async () => {
    open()
    await cropper()
    const area = await saved()
    expect(area).toMatchObject({ x: 350, y: 0, width: 900, height: 900 })
  })

  it("apaisada movida hasta el borde derecho: el cuadrado termina justo en el borde", async () => {
    open()
    const area = await cropper()
    area.focus()
    await userEvent.keyboard("{Shift>}{ArrowLeft}{ArrowLeft}{ArrowLeft}{/Shift}")
    const saveArea = await saved()
    expect(saveArea.x + saveArea.width).toBeCloseTo(1600, 6)
    expect(saveArea.y).toBe(0)
  })

  it("vertical movida abajo: el área llega al borde inferior", async () => {
    stub.media = { width: 140, height: 250, naturalWidth: 900, naturalHeight: 1600 }
    stub.frame = { width: 140, height: 140 }
    open()
    const area = await cropper()
    area.focus()
    await userEvent.keyboard("{Shift>}{ArrowUp}{ArrowUp}{ArrowUp}{/Shift}")
    const saveArea = await saved()
    expect(saveArea.x).toBe(0)
    expect(saveArea.width).toBeCloseTo(900, 6)
    expect(saveArea.y + saveArea.height).toBeCloseTo(1600, 6)
  })

  it("pasa a cropToFile el mismo rectángulo con el que dibuja la vista previa", async () => {
    const { drawCrop } = await import("../../src/internal/crop-image")
    open()
    const area = await cropper()
    area.focus()
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}")
    const savedArea = await saved()
    const calls = vi.mocked(drawCrop).mock.calls
    expect(calls.at(-1)![2]).toEqual(savedArea)
  })
})

describe("ImageCropDialog: la imagen cubre el contenedor (objectFit cover)", () => {
  // Una vertical de 900×1600 en un contenedor de 416×288: la imagen se dibuja de 416×739 y el marco es de 288.
  // Con zoom 1 en la app tiene que verse el cuadrado más grande (los 900 px de ancho), que en la librería es zoom 288/416.
  beforeEach(() => {
    stub.media = { width: 416, height: (416 * 1600) / 900, naturalWidth: 900, naturalHeight: 1600 }
    stub.frame = { width: 288, height: 288 }
  })

  it("el zoom 1 de la app es el que recién cubre el marco: el recorte más grande", async () => {
    open()
    const area = await cropper()
    await waitFor(() => expect(Number(area.dataset.zoom)).toBeCloseTo(288 / 416, 6))
    await userEvent.click(await screen.findByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(cropToFile).toHaveBeenCalled())
    const saved = cropToFile.mock.calls[0]![1]
    expect(saved.width).toBeCloseTo(900, 6)
    expect(saved.height).toBeCloseTo(900, 6)
    expect(saved.x).toBeCloseTo(0, 6)
    expect(saved.y).toBeCloseTo(350, 6)
  })

  it("el deslizante y el mínimo siguen en las unidades de la app (1 a 4) y el de la librería se escala", async () => {
    open()
    const area = await cropper()
    await waitFor(() => expect(Number(area.dataset.minzoom)).toBeCloseTo(288 / 416, 6))
    expect(screen.getByRole("slider", { name: "Zoom" })).toHaveAttribute("min", "1")
    expect(screen.getByRole("slider", { name: "Zoom" })).toHaveAttribute("max", "4")
  })

  it("con allowFit el mínimo es el de ver la imagen entera, en unidades de la app", async () => {
    open({ allowFit: true })
    await cropper()
    // entera: 288/739 = 0,3897 de la librería; / (288/416) = 0,5629 → 0,56.
    await waitFor(() => expect(screen.getByRole("slider", { name: "Zoom" })).toHaveAttribute("min", "0.56"))
  })
})

describe("ImageCropDialog: allowFit («ver entera»)", () => {
  it("por defecto el zoom mínimo cubre el marco (1)", async () => {
    open()
    const area = await cropper()
    expect(area).toHaveAttribute("data-minzoom", "1")
    expect(screen.getByRole("slider", { name: "Zoom" })).toHaveAttribute("min", "1")
  })

  it("con allowFit el mínimo es el que deja ver la imagen entera y el área se pasa de la imagen", async () => {
    open({ allowFit: true })
    const area = await cropper()
    // marco 225 / ancho mostrado 400 = 0,5625 → 0,56 (siempre hacia abajo: «entera», no «casi»).
    await waitFor(() => expect(area).toHaveAttribute("data-minzoom", "0.56"))
    expect(screen.getByRole("slider", { name: "Zoom" })).toHaveAttribute("min", "0.56")
    area.focus()
    for (let i = 0; i < 6; i++) await userEvent.keyboard("{-}")
    expect(Number(area.dataset.zoom)).toBeCloseTo(0.56, 6)
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(cropToFile).toHaveBeenCalled())
    const saveArea = cropToFile.mock.calls[0]![1]
    // Se ve toda la imagen de lado a lado y sobra alto: y negativo, alto mayor al de la imagen.
    expect(saveArea.width).toBeGreaterThanOrEqual(1600 - 1e-6)
    expect(saveArea.height).toBeGreaterThan(900)
    expect(saveArea.y).toBeLessThan(0)
    // Ya no hay eje para arrastrar: la ayuda se esconde.
    expect(document.querySelector("[data-slot=image-crop-hint]")).toHaveClass("invisible")
  })

  it("se abre mostrando la imagen entera (zoom mínimo) y sin allowFit se abre cubriendo", async () => {
    open({ allowFit: true })
    const area = await cropper()
    await waitFor(() => expect(Number(area.dataset.zoom)).toBeCloseTo(0.56, 6))
    expect(screen.getByRole("slider", { name: "Zoom" })).toHaveValue("0.56")
  })

  it("no vuelve a forzar el zoom al volver a medir: lo que eligió el usuario queda", async () => {
    open({ allowFit: true })
    const area = await cropper()
    await waitFor(() => expect(Number(area.dataset.zoom)).toBeCloseTo(0.56, 6))
    area.focus()
    for (let i = 0; i < 6; i++) await userEvent.keyboard("{+}")
    expect(Number(area.dataset.zoom)).toBeCloseTo(1.16, 6)
  })

  it("una imagen cuadrada no suma recorrido: el mínimo sigue en 1", async () => {
    stub.media = { width: 225, height: 225, naturalWidth: 900, naturalHeight: 900 }
    open({ allowFit: true })
    expect(await cropper()).toHaveAttribute("data-minzoom", "1")
  })
})

describe("ImageCropDialog: foco y teclado del diálogo", () => {
  it("Escape cierra y no se rompe con la tecla + en un campo ajeno", async () => {
    const onCancel = vi.fn()
    open({ onCancel })
    await cropper()
    fireEvent.keyDown(document.body, { key: "+" })
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(onCancel).toHaveBeenCalled())
  })
})
