import { vi } from "vitest"

/**
 * jsdom no hace layout: todo `getBoundingClientRect` da 0 y el teclado de dnd-kit no encuentra a
 * dónde mover. Esto le da a cada ítem ordenable su caja según su posición entre sus hermanos, en
 * una grilla de `columns` columnas (1 = lista), y a lo de adentro la caja de su ítem.
 */
export function mockSortableRects(columns = 1, width = 200, height = 44) {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const item = this.closest<HTMLElement>("[data-slot=sortable-list-item], [data-slot=sortable-grid-item]")
    if (!item?.parentElement) return new DOMRect(0, 0, width * columns, 1000)
    const index = [...item.parentElement.children].indexOf(item)
    return new DOMRect((index % columns) * width, Math.floor(index / columns) * height, width, height)
  })
}
