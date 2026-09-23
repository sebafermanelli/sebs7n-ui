// @vitest-environment node
import { describe, expect, it } from "vitest"

import { paginationRange, type PaginationSlot } from "../src/lib/pagination"

/** `[1, 2, "…", 10]` — más fácil de leer que el array de objetos. */
const shape = (slots: PaginationSlot[]) => slots.map((slot) => (slot.type === "page" ? slot.page : "…"))

const pages = (slots: PaginationSlot[]) => slots.filter((slot) => slot.type === "page").map((slot) => slot.page)

describe("paginationRange", () => {
  it("bordes: cero, una y dos páginas", () => {
    expect(paginationRange({ page: 1, pageCount: 0 })).toEqual([])
    expect(paginationRange({ page: 3, pageCount: -5 })).toEqual([])
    expect(shape(paginationRange({ page: 1, pageCount: 1 }))).toEqual([1])
    expect(shape(paginationRange({ page: 2, pageCount: 2 }))).toEqual([1, 2])
  })

  it("sin «…» mientras las páginas entren: 7 casilleros con los valores por defecto", () => {
    expect(shape(paginationRange({ page: 4, pageCount: 7 }))).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("actual al principio: «…» solo del lado derecho", () => {
    expect(shape(paginationRange({ page: 1, pageCount: 10 }))).toEqual([1, 2, 3, 4, 5, "…", 10])
    expect(shape(paginationRange({ page: 4, pageCount: 10 }))).toEqual([1, 2, 3, 4, 5, "…", 10])
  })

  it("actual en el medio: «…» de los dos lados", () => {
    expect(shape(paginationRange({ page: 5, pageCount: 10 }))).toEqual([1, "…", 4, 5, 6, "…", 10])
    expect(shape(paginationRange({ page: 50, pageCount: 100 }))).toEqual([1, "…", 49, 50, 51, "…", 100])
  })

  it("actual al final: «…» solo del lado izquierdo", () => {
    expect(shape(paginationRange({ page: 10, pageCount: 10 }))).toEqual([1, "…", 6, 7, 8, 9, 10])
    expect(shape(paginationRange({ page: 7, pageCount: 10 }))).toEqual([1, "…", 6, 7, 8, 9, 10])
  })

  it("los «…» saben de qué lado están", () => {
    const slots = paginationRange({ page: 50, pageCount: 100 })
    expect(slots.filter((slot) => slot.type === "ellipsis")).toEqual([
      { type: "ellipsis", side: "start" },
      { type: "ellipsis", side: "end" },
    ])
  })

  it("el ancho no salta: con muchas páginas siempre hay la misma cantidad de casilleros", () => {
    const casos: [number, number][] = [
      [1, 1],
      [2, 1],
      [0, 1],
      [1, 2],
    ]
    for (const [siblings, boundaries] of casos) {
      const esperado = boundaries * 2 + siblings * 2 + 3
      for (let page = 1; page <= 100; page++) {
        const slots = paginationRange({ page, pageCount: 100, siblings, boundaries })
        expect(slots, `page ${page} · siblings ${siblings} · boundaries ${boundaries}`).toHaveLength(esperado)
      }
    }
  })

  it("un «…» nunca tapa una sola página", () => {
    for (let pageCount = 1; pageCount <= 40; pageCount++) {
      for (let page = 1; page <= pageCount; page++) {
        const slots = paginationRange({ page, pageCount })
        slots.forEach((slot, index) => {
          if (slot.type !== "ellipsis") return
          const antes = slots[index - 1]
          const despues = slots[index + 1]
          expect(antes?.type === "page" && despues?.type === "page").toBe(true)
          if (antes?.type === "page" && despues?.type === "page") {
            expect(despues.page - antes.page, `${pageCount} páginas, actual ${page}`).toBeGreaterThan(2)
          }
        })
      }
    }
  })

  it("siempre trae la primera, la última y la actual, en orden y sin repetir", () => {
    for (const pageCount of [1, 2, 3, 8, 9, 25, 137]) {
      for (let page = 1; page <= pageCount; page++) {
        const numeros = pages(paginationRange({ page, pageCount }))
        expect(numeros, `${pageCount}/${page}`).toContain(page)
        expect(numeros[0]).toBe(1)
        expect(numeros.at(-1)).toBe(pageCount)
        expect(new Set(numeros).size).toBe(numeros.length)
        expect([...numeros].sort((a, b) => a - b)).toEqual(numeros)
      }
    }
  })

  it("recorta la página actual al rango en vez de romperse", () => {
    expect(shape(paginationRange({ page: 0, pageCount: 10 }))).toEqual(shape(paginationRange({ page: 1, pageCount: 10 })))
    expect(shape(paginationRange({ page: 99, pageCount: 10 }))).toEqual(shape(paginationRange({ page: 10, pageCount: 10 })))
  })

  it("siblings y boundaries cambian el ancho de la ventana y de las puntas", () => {
    expect(shape(paginationRange({ page: 10, pageCount: 20, siblings: 2 }))).toEqual([1, "…", 8, 9, 10, 11, 12, "…", 20])
    expect(shape(paginationRange({ page: 10, pageCount: 20, siblings: 0 }))).toEqual([1, "…", 10, "…", 20])
    expect(shape(paginationRange({ page: 10, pageCount: 20, boundaries: 2 }))).toEqual([1, 2, "…", 9, 10, 11, "…", 19, 20])
  })
})
