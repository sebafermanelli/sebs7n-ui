/**
 * Lógica pura de la vista de una lista: qué vista se ve (tabla, tarjetas, calendario) y qué columnas
 * están ocultas. Es solo presentación: filtro, orden y paginación son de la app.
 */

/** `auto`: sin elección; tabla donde entra y tarjetas en un contenedor angosto. */
type ListViewMode = "auto" | "table" | "cards" | "calendar"

/** Las vistas que una lista ofrece. */
type ListViewKind = "table" | "cards" | "calendar"

type ListColumn = {
  id: string
  label: string
  /** Una columna obligatoria no se puede ocultar (la que nombra la fila). */
  required?: boolean
}

const isListViewMode = (value: unknown): value is ListViewMode => value === "auto" || value === "table" || value === "cards" || value === "calendar"

const isHiddenColumns = (value: unknown): value is string[] => Array.isArray(value) && value.every((v) => typeof v === "string")

/** La vista que vale: la guardada si la lista la ofrece, y si no la de por defecto. */
function resolveMode(mode: ListViewMode, views: readonly ListViewKind[], fallback: ListViewMode): ListViewMode {
  if (mode === "auto") return views.includes("cards") ? "auto" : fallback
  return views.includes(mode) ? mode : fallback
}

/** Las ocultas que valen: solo columnas que existen y no son obligatorias. Siempre queda alguna visible. */
function normalizeHidden(hidden: readonly string[], columns: readonly ListColumn[]): string[] {
  const hideable = new Set(columns.filter((c) => !c.required).map((c) => c.id))
  return columns.map((c) => c.id).filter((id) => hideable.has(id) && hidden.includes(id))
}

/** Prende o apaga una columna. Las obligatorias no cambian. */
function toggleColumn(hidden: readonly string[], columns: readonly ListColumn[], id: string, visible: boolean): string[] {
  return normalizeHidden(visible ? hidden.filter((h) => h !== id) : [...hidden, id], columns)
}

/** Las reglas CSS que esconden las columnas ocultas de la lista `listKey` (celdas y cabeceras con `data-col`). */
function hiddenColumnsCss(listKey: string, hidden: readonly string[]): string {
  const safe = (s: string) => s.replace(/[^a-z0-9_-]/gi, "")
  return hidden.map((id) => `[data-list-view="${safe(listKey)}"] [data-col="${safe(id)}"]{display:none}`).join("")
}

export { hiddenColumnsCss, isHiddenColumns, isListViewMode, normalizeHidden, resolveMode, toggleColumn, type ListColumn, type ListViewKind, type ListViewMode }
