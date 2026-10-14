import { describe, expect, it } from "vitest"

import { clampOffset, fitZoom, overflowAxes, viewToArea, visibleSpan, type CropView } from "../../src/internal/crop-image"

// Lo que `react-easy-crop` entrega con el marco de 224 px sobre un contenedor de 416×288, la imagen
// «contain» y el marco del lado menor de la imagen mostrada (ver getCropSize de la librería).
const landscape: CropView = {
  media: { width: 416, height: 234, naturalWidth: 1600, naturalHeight: 900 },
  frame: { width: 234, height: 234 },
  zoom: 1,
  offset: { x: 0, y: 0 },
}
const portrait: CropView = {
  media: { width: 162, height: 288, naturalWidth: 900, naturalHeight: 1600 },
  frame: { width: 162, height: 162 },
  zoom: 1,
  offset: { x: 0, y: 0 },
}
const view = (base: CropView, change: Partial<CropView>): CropView => ({ ...base, ...change })

describe("viewToArea", () => {
  it("apaisada centrada: el cuadrado del medio, de lado igual al alto", () => {
    const area = viewToArea(landscape)
    expect(area.width).toBeCloseTo(900, 6)
    expect(area.height).toBeCloseTo(900, 6)
    expect(area.x).toBeCloseTo(350, 6)
    expect(area.y).toBeCloseTo(0, 6)
  })

  it("apaisada arrastrada hasta cada borde: el cuadrado llega al borde exacto y no pasa", () => {
    // Mover la imagen a la izquierda (offset negativo) muestra la parte derecha.
    const right = viewToArea(view(landscape, { offset: { x: -10_000, y: 0 } }))
    expect(right.x + right.width).toBeCloseTo(1600, 6)
    const left = viewToArea(view(landscape, { offset: { x: 10_000, y: 0 } }))
    expect(left.x).toBeCloseTo(0, 6)
    expect(left.y).toBeCloseTo(0, 6)
    expect(left.height).toBeCloseTo(900, 6)
  })

  it("apaisada: arrastrar en vertical no mueve nada (no sobra alto)", () => {
    expect(viewToArea(view(landscape, { offset: { x: 0, y: 500 } })).y).toBeCloseTo(0, 6)
  })

  it("vertical: se mueve en y y no en x", () => {
    const top = viewToArea(view(portrait, { offset: { x: 300, y: 10_000 } }))
    expect(top).toMatchObject({ x: 0 })
    expect(top.y).toBeCloseTo(0, 6)
    expect(top.width).toBeCloseTo(900, 6)
    const bottom = viewToArea(view(portrait, { offset: { x: 0, y: -10_000 } }))
    expect(bottom.y + bottom.height).toBeCloseTo(1600, 6)
  })

  it("con zoom 2 el área se achica a la mitad y gana recorrido en los dos ejes", () => {
    const area = viewToArea(view(landscape, { zoom: 2, offset: { x: -10_000, y: -10_000 } }))
    expect(area.width).toBeCloseTo(450, 6)
    expect(area.x + area.width).toBeCloseTo(1600, 6)
    expect(area.y + area.height).toBeCloseTo(900, 6)
  })

  it("con aspecto 4/3 el área conserva la proporción", () => {
    const wide = view(landscape, { frame: { width: 234 * (4 / 3), height: 234 } })
    const area = viewToArea(wide)
    expect(area.width / area.height).toBeCloseTo(4 / 3, 6)
  })

  it("«ver entera»: con el zoom de ajuste el área cubre la imagen completa y sobra alto, con x e y negativos", () => {
    const zoom = fitZoom(landscape.media, landscape.frame)
    const area = viewToArea(view(landscape, { zoom }))
    expect(area.x).toBeCloseTo(0, 4)
    expect(area.width).toBeCloseTo(1600, 3)
    expect(area.height).toBeCloseTo(1600, 3)
    expect(area.y).toBeCloseTo(-350, 3)
  })

  it("«ver entera» en una vertical: sobra ancho", () => {
    const area = viewToArea(view(portrait, { zoom: fitZoom(portrait.media, portrait.frame) }))
    expect(area.y).toBeCloseTo(0, 3)
    expect(area.height).toBeCloseTo(1600, 3)
    expect(area.x).toBeCloseTo(-350, 3)
  })
})

describe("clampOffset", () => {
  it("el recorrido es la mitad de lo que sobra, por eje", () => {
    expect(clampOffset({ x: 999, y: 999 }, landscape)).toEqual({ x: 91, y: 0 })
    expect(clampOffset({ x: -999, y: -999 }, portrait)).toEqual({ x: 0, y: -63 })
  })

  it("con zoom menor a 1 la imagen se acomoda dentro del marco, sin salirse", () => {
    const small = view(landscape, { zoom: 0.5 })
    expect(clampOffset({ x: 999, y: 0 }, small).x).toBeCloseTo(13, 6)
  })
})

describe("fitZoom", () => {
  it("es el cociente entre el marco y el lado largo de la imagen mostrada; nunca pasa de 1", () => {
    expect(fitZoom(landscape.media, landscape.frame)).toBeCloseTo(234 / 416, 6)
    expect(fitZoom(portrait.media, portrait.frame)).toBeCloseTo(162 / 288, 6)
    expect(fitZoom({ width: 300, height: 300 }, { width: 300, height: 300 })).toBe(1)
  })
})

describe("overflowAxes y visibleSpan", () => {
  it("la apaisada sobra en x, la vertical en y, y al ajustar no sobra nada", () => {
    const a = viewToArea(landscape)
    expect(overflowAxes(a, landscape.media)).toEqual({ x: true, y: false })
    expect(overflowAxes(viewToArea(portrait), portrait.media)).toEqual({ x: false, y: true })
    expect(overflowAxes(viewToArea(view(landscape, { zoom: fitZoom(landscape.media, landscape.frame) })), landscape.media)).toEqual({ x: false, y: false })
    expect(overflowAxes(viewToArea(view(landscape, { zoom: 2 })), landscape.media)).toEqual({ x: true, y: true })
  })

  it("el tramo visible va de 0 a 100 %", () => {
    expect(visibleSpan(viewToArea(landscape), landscape.media)).toEqual({ x: [22, 78], y: [0, 100] })
    expect(visibleSpan(viewToArea(view(landscape, { offset: { x: -999, y: 0 } })), landscape.media).x).toEqual([44, 100])
  })
})
