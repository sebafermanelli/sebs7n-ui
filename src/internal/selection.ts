import * as React from "react"

/**
 * La selección de `Tree` y `FileGrid`. Una unión discriminada por `selectionMode`: con `single` (el
 * default, la API de siempre) `selected` es `string | null`; con `multiple`, `string[]`. Así una app
 * que no pasa `selectionMode` no ve ningún cambio de tipos.
 */
export type SelectionProps<T> =
  | {
      /**
       * `single` (default): un elegido que sigue al foco, como el Finder. `multiple`: ⌘/Ctrl+click
       * suma o saca, ⇧+click elige el rango, ⌘/Ctrl+A todo, Espacio suma o saca el enfocado y
       * ⇧+flechas extienden; las flechas solas mueven el foco sin tocar la selección.
       */
      selectionMode?: "single"
      /** El id elegido. Pasarlo lo vuelve controlado. */
      selected?: string | null
      defaultSelected?: string | null
      onSelectedChange?: (id: string | null, item: T | null) => void
    }
  | {
      selectionMode: "multiple"
      /** Los ids elegidos, en el orden en que se ven. Pasarlo lo vuelve controlado. */
      selected?: string[]
      defaultSelected?: string[]
      onSelectedChange?: (ids: string[], items: T[]) => void
    }

type Selectable = { id: string; disabled?: boolean }

const toList = (value: string | readonly string[] | null | undefined): string[] =>
  value == null ? [] : typeof value === "string" ? [value] : [...value]

/**
 * El estado de la selección, siempre como lista de ids (en `single`, de cero o uno). `find` da el
 * ítem de un id para `onSelectedChange`; las operaciones que recorren reciben el orden visible
 * (`order`), que en el árbol cambia al abrir y cerrar carpetas.
 */
export function useSelection<T extends Selectable>(props: SelectionProps<T>, find: (id: string) => T | undefined) {
  const multiple = props.selectionMode === "multiple"
  const [own, setOwn] = React.useState<string[]>(() => toList(props.defaultSelected))
  const controlled = props.selected !== undefined
  const ids = controlled ? toList(props.selected) : own
  const set = new Set(ids)
  // Desde dónde se extiende un rango (⇧): el último click o la última tecla que movió sin ⇧.
  const anchor = React.useRef<string | null>(ids[0] ?? null)

  const commit = (next: string[]) => {
    if (!controlled) setOwn(next)
    if (props.selectionMode === "multiple") props.onSelectedChange?.(next, next.map(find).filter((item): item is T => item != null))
    else props.onSelectedChange?.(next[0] ?? null, (next[0] != null && find(next[0])) || null)
  }

  const enabledIds = (order: readonly T[]) => order.filter((item) => !item.disabled).map((item) => item.id)

  /** Solo este (el click, y en `single` también el foco). */
  const only = (item: T) => {
    anchor.current = item.id
    commit([item.id])
  }

  /** Suma o saca este (⌘/Ctrl+click, Espacio). En `single`, lo elige. */
  const toggle = (item: T, order: readonly T[]) => {
    if (!multiple) return only(item)
    anchor.current = item.id
    const next = set.has(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]
    // En el orden en que se ven, no en el de los clicks.
    const position = new Map(order.map((candidate, index) => [candidate.id, index]))
    commit(next.sort((a, b) => (position.get(a) ?? Infinity) - (position.get(b) ?? Infinity)))
  }

  /** El rango del ancla a este, reemplazando lo elegido (⇧+click, ⇧+flechas). `from`: el ancla si no hay. */
  const extend = (item: T, order: readonly T[], from: string) => {
    if (anchor.current == null || !order.some((candidate) => candidate.id === anchor.current)) anchor.current = from
    const start = order.findIndex((candidate) => candidate.id === anchor.current)
    const end = order.findIndex((candidate) => candidate.id === item.id)
    if (start < 0 || end < 0) return only(item)
    commit(enabledIds(order.slice(Math.min(start, end), Math.max(start, end) + 1)))
  }

  /** ⌘/Ctrl+A: todos los habilitados; si ya estaban todos, ninguno. */
  const all = (order: readonly T[]) => {
    const every = enabledIds(order)
    commit(every.length > 0 && every.every((id) => set.has(id)) ? [] : every)
  }

  /** Saca los que ya no existen (el árbol, cuando cambian los `items`). */
  const prune = (exists: (id: string) => boolean) => {
    const kept = ids.filter(exists)
    if (kept.length !== ids.length) commit(kept)
  }

  /** Mueve el ancla sin elegir (las flechas solas en `multiple`). */
  const anchorAt = (id: string) => {
    anchor.current = id
  }

  return { multiple, ids, isSelected: (id: string) => set.has(id), only, toggle, extend, all, prune, anchorAt }
}

/** ⌘ en Mac, Ctrl en el resto: el modificador de sumar a la selección. */
export const isToggleModifier = (event: { metaKey: boolean; ctrlKey: boolean }) => event.metaKey || event.ctrlKey
