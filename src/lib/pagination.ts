/**
 * Qué páginas mostrar en un paginador.
 *
 * Es una función pura y está en `lib/` a propósito: la decisión —cuántos
 * números, dónde van los «…»— es la parte que se puede equivocar en silencio, y
 * acá se testea sin renderizar nada. El componente `Pagination` solo la dibuja.
 *
 * Dos propiedades que se sostienen en todos los casos, y que están en los tests:
 *
 * 1. **El ancho no salta.** Con `pageCount` grande, la cantidad de casilleros es
 *    siempre `boundaries * 2 + siblings * 2 + 3`: cuando un «…» desaparece —al
 *    principio o al final— lo reemplaza un número. Un paginador que cambia de
 *    ancho al pasar de página mueve los botones abajo del cursor.
 * 2. **Un «…» nunca tapa una sola página.** Si el hueco es de una, se muestra el
 *    número: esconder una página detrás de tres puntos es peor que mostrarla.
 */

/** Un casillero del paginador: un número de página o un hueco. */
export type PaginationSlot = { type: "page"; page: number } | { type: "ellipsis"; side: "start" | "end" }

export type PaginationRangeOptions = {
  /** La página actual, en base 1. Se recorta al rango válido. */
  page: number
  /** Cuántas páginas hay en total. */
  pageCount: number
  /** Cuántas páginas a cada lado de la actual. */
  siblings?: number
  /** Cuántas páginas fijas en cada punta. */
  boundaries?: number
}

const range = (from: number, to: number): PaginationSlot[] =>
  Array.from({ length: Math.max(to - from + 1, 0) }, (_, index) => ({ type: "page", page: from + index }))

export function paginationRange({
  page,
  pageCount,
  siblings = 1,
  boundaries = 1,
}: PaginationRangeOptions): PaginationSlot[] {
  const total = Math.floor(pageCount)
  if (!Number.isFinite(total) || total < 1) return []

  const current = Math.min(Math.max(Math.floor(page) || 1, 1), total)
  const sides = Math.max(Math.floor(siblings), 0)
  const ends = Math.max(Math.floor(boundaries), 1)

  // Casilleros de la forma completa: puntas + «…» + ventana + «…» + puntas.
  const slots = ends * 2 + sides * 2 + 3
  if (total <= slots) return range(1, total)

  // Un «…» solo si tapa dos páginas o más.
  const showStart = current - sides > ends + 2
  const showEnd = current + sides < total - ends - 1
  // Cuando falta un «…», su casillero lo ocupa un número: el ancho no cambia.
  const block = ends + sides * 2 + 2

  if (!showStart && showEnd) {
    return [...range(1, block), { type: "ellipsis", side: "end" }, ...range(total - ends + 1, total)]
  }
  if (showStart && !showEnd) {
    return [...range(1, ends), { type: "ellipsis", side: "start" }, ...range(total - block + 1, total)]
  }
  return [
    ...range(1, ends),
    { type: "ellipsis", side: "start" },
    ...range(current - sides, current + sides),
    { type: "ellipsis", side: "end" },
    ...range(total - ends + 1, total),
  ]
}
