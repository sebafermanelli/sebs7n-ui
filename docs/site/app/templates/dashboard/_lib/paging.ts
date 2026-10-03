/** Cuántas páginas hacen falta (al menos una: una lista vacía también es la página 1). */
export const pageCountOf = (total: number, pageSize: number) => Math.max(1, Math.ceil(total / pageSize))

/** La página `page` (desde 1) de `items`; una página fuera de rango se lleva al borde. */
export function pageOf<T>(items: T[], page: number, pageSize: number): T[] {
  const safe = Math.min(Math.max(1, page), pageCountOf(items.length, pageSize))
  return items.slice((safe - 1) * pageSize, safe * pageSize)
}
