import { describe, expect, it, vi } from "vitest"

import { cropToFile, drawCrop } from "../../src/internal/crop-image"

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

// Un contexto 2D que anota cada `drawImage` y las veces que se llenó el fondo: la prueba del recorte
// con la imagen real (tamaño natural conocido) sin un canvas de verdad.
function stubContext() {
  const calls: { fill: string[]; draws: number[][] } = { fill: [], draws: [] }
  const context = {
    fillStyle: "",
    imageSmoothingQuality: "",
    clearRect() {},
    fillRect() {
      calls.fill.push(context.fillStyle)
    },
    drawImage: (...args: unknown[]) => calls.draws.push((args as number[]).slice(1)),
  }
  const canvas = { width: 0, height: 0, getContext: () => context } as unknown as HTMLCanvasElement
  return { canvas, calls }
}
const photo = (naturalWidth: number, naturalHeight: number) => ({ naturalWidth, naturalHeight }) as unknown as CanvasImageSource

describe("drawCrop con la imagen real", () => {
  it("un área dentro de la imagen se dibuja tal cual, sin recortar la fuente", () => {
    const { canvas, calls } = stubContext()
    drawCrop(canvas, photo(1600, 900), { x: 350, y: 0, width: 900, height: 900 }, 512, 512)
    expect(calls.draws).toEqual([[350, 0, 900, 900, 0, 0, 512, 512]])
  })

  it("apaisada pegada a cada borde: la fuente nunca sale de la imagen", () => {
    const { canvas, calls } = stubContext()
    drawCrop(canvas, photo(1600, 900), { x: 0, y: 0, width: 900, height: 900 }, 96, 96)
    drawCrop(canvas, photo(1600, 900), { x: 700, y: 0, width: 900, height: 900 }, 96, 96)
    for (const [sx, sy, sw, sh] of calls.draws) {
      expect(sx).toBeGreaterThanOrEqual(0)
      expect(sx! + sw!).toBeLessThanOrEqual(1600)
      expect(sy! + sh!).toBeLessThanOrEqual(900)
    }
  })

  it("«ver entera»: un área que se pasa de la imagen dibuja solo lo que hay, en su lugar, y deja el resto vacío", () => {
    const { canvas, calls } = stubContext()
    // 1600×900 en un marco cuadrado: el área es de 1600×1600 con 350 px vacíos arriba y abajo.
    drawCrop(canvas, photo(1600, 900), { x: 0, y: -350, width: 1600, height: 1600 }, 512, 512)
    expect(calls.fill).toEqual([])
    expect(calls.draws).toEqual([[0, 0, 1600, 900, 0, 112, 512, 288]])
  })

  it("«ver entera» en una vertical deja el vacío a los costados", () => {
    const { canvas, calls } = stubContext()
    drawCrop(canvas, photo(900, 1600), { x: -350, y: 0, width: 1600, height: 1600 }, 100, 100)
    expect(calls.draws).toEqual([[0, 0, 900, 1600, 21.875, 0, 56.25, 100]])
  })

  it("un JPEG llena el fondo de blanco (no tiene alfa); los demás no", () => {
    const jpeg = stubContext()
    drawCrop(jpeg.canvas, photo(100, 100), { x: -10, y: 0, width: 120, height: 100 }, 120, 100, "#fff")
    expect(jpeg.calls.fill).toEqual(["#fff"])
    const webp = stubContext()
    drawCrop(webp.canvas, photo(100, 100), { x: -10, y: 0, width: 120, height: 100 }, 120, 100)
    expect(webp.calls.fill).toEqual([])
  })

  it("un área que no toca la imagen no dibuja nada", () => {
    const { canvas, calls } = stubContext()
    drawCrop(canvas, photo(100, 100), { x: 500, y: 500, width: 50, height: 50 }, 50, 50)
    expect(calls.draws).toEqual([])
  })
})

describe("cropToFile con «ver entera»", () => {
  it("pasa el área tal cual y un PNG/WebP sale sin fondo; un JPEG, con fondo blanco", async () => {
    const { canvas } = stubCanvas(() => 10)
    const fills: string[] = []
    ;(canvas as unknown as { getContext: () => unknown }).getContext = () => ({
      clearRect() {},
      fillRect() {},
      drawImage() {},
      set fillStyle(value: string) {
        fills.push(value)
      },
    })
    await cropToFile("blob:x", { x: 0, y: -350, width: 1600, height: 1600 }, "logo.png", { type: "image/webp" })
    expect(fills).toEqual([])
    await cropToFile("blob:x", { x: 0, y: -350, width: 1600, height: 1600 }, "logo.png", { type: "image/jpeg" })
    expect(fills).toEqual(["#fff"])
  })
})
