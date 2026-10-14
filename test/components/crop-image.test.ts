import { describe, expect, it, vi } from "vitest"

import { cropToFile } from "../../src/internal/crop-image"

// Un canvas falso que "codifica" un blob de tamaño proporcional a la calidad y a los píxeles.
function stubCanvas(encode: (width: number, height: number, quality: number, type: string) => number) {
  const draws: number[][] = []
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null
      set src(_: string) {
        queueMicrotask(() => this.onload?.())
      }
    },
  )
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ clearRect() {}, drawImage: (...args: number[]) => draws.push(args.slice(1)) }),
    toBlob(cb: (b: Blob) => void, type: string, quality: number) {
      cb(new Blob([new Uint8Array(encode(canvas.width, canvas.height, quality, type))], { type }))
    },
  }
  vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLElement)
  return { canvas, draws }
}

describe("cropToFile", () => {
  it("recorta el área pedida, limita el lado mayor y cambia la extensión", async () => {
    const { canvas, draws } = stubCanvas(() => 10)
    const file = await cropToFile("blob:x", { x: 10, y: 20, width: 2000, height: 2000 }, "mi foto.JPG", { size: 512 })
    expect(draws[0]).toEqual([10, 20, 2000, 2000, 0, 0, 512, 512])
    expect(canvas.width).toBe(512)
    expect(file.name).toBe("mi foto.webp")
    expect(file.type).toBe("image/webp")
  })

  it("no agranda un recorte más chico que el tamaño de salida", async () => {
    const { canvas } = stubCanvas(() => 10)
    await cropToFile("blob:x", { x: 0, y: 0, width: 200, height: 200 }, "a.png")
    expect(canvas.width).toBe(200)
  })

  it("baja la calidad y después el tamaño hasta entrar en maxBytes", async () => {
    stubCanvas((w, h, q) => Math.round(w * h * q * 0.05))
    const file = await cropToFile("blob:x", { x: 0, y: 0, width: 1000, height: 1000 }, "a.png", { size: 1000, maxBytes: 20_000 })
    expect(file.size).toBeLessThanOrEqual(20_000)
  })

  it("el nombre sigue al tipo real si el navegador devuelve PNG", async () => {
    const { canvas } = stubCanvas(() => 10)
    canvas.toBlob = (cb: (b: Blob) => void) => cb(new Blob([new Uint8Array(3)], { type: "image/png" }))
    const file = await cropToFile("blob:x", { x: 0, y: 0, width: 50, height: 50 }, "a.webp")
    expect(file.name).toBe("a.png")
  })
})
