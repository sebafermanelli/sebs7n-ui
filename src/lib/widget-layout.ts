"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { useStoredState } from "../lib/use-stored-state.js"

/**
 * El modelo de un panel de widgets editable (`WidgetBoard`, `sebs7n-ui/widget-board`): las funciones
 * puras que mueven, sacan, agregan y restablecen, y `useWidgetLayout`, que las junta con el modo
 * edición, el catálogo y la persistencia en `localStorage`. Todo `lib/*` se exporta y esto no
 * importa `@dnd-kit`: el arrastre vive en `internal/widget-board-editor.tsx`, que se pide recién al
 * apretar «Editar».
 */

/** Cuántas columnas ocupa en una grilla de 4: `sm` 1, `md` 2, `lg` 4 (en 2 columnas, `md` y `lg` son el ancho entero). */
type WidgetSize = "sm" | "md" | "lg"

type WidgetDef = {
  /** Estable y en inglés: es lo que se guarda. */
  id: string
  /** El nombre, en el «−», en el catálogo y en los anuncios. */
  title: string
  /** `sm` por defecto. */
  size?: WidgetSize
  /** El ícono del catálogo. Decorativo. */
  icon?: React.ReactNode
  /** Una línea del catálogo: qué muestra. */
  description?: string
  /** Una vista previa corta para el catálogo (un `Sparkline`, una cifra). Decorativa: se oculta del lector. */
  preview?: React.ReactNode
  /** La card del widget. Se llama en cada render: lee de la app sin pasar por el modelo. */
  render: () => React.ReactNode
}

/** Lo que se guarda: la versión y los ids visibles, en orden. */
type WidgetLayoutData = { version: 1; ids: string[] }

type WidgetBoardLabels = NonNullable<Labels["widgetBoard"]>

/** Los textos por defecto. Opcionales en `Labels` (ver `sortableLabels`): viven acá y no en `defaultLabels`. */
const widgetBoardLabels: WidgetBoardLabels = {
  region: "Widgets",
  edit: "Editar",
  done: "Listo",
  add: "Agregar widget",
  reset: "Restablecer",
  hint: "Arrastrá los widgets para ordenarlos, o tomá uno con Espacio y movelo con las flechas.",
  editingAnnounce: "Modo edición. Arrastrá para ordenar, o tomá un widget con Espacio y movelo con las flechas. Escape cancela.",
  doneAnnounce: "Listo. Se guardó el panel.",
  resetAnnounce: "Se restableció el panel original.",
  catalogTitle: "Agregar widget",
  catalogDescription: "Elegí qué sumar al panel.",
  catalogEmpty: "Ya están todos los widgets en pantalla.",
  addNamed: "Agregar",
  emptyTitle: "No hay widgets en pantalla",
  emptyDescription: "Agregá los que quieras ver o volvé al panel original.",
  loading: "Cargando la edición…"
}

const isWidgetLayout = (value: unknown): value is WidgetLayoutData => {
  if (typeof value !== "object" || value === null) return false
  const { version, ids } = value as Partial<WidgetLayoutData>
  return version === 1 && Array.isArray(ids) && ids.every((id) => typeof id === "string")
}

/** Los ids guardados que todavía existen, sin repetir y en su orden: un widget que ya no está se descarta en silencio. */
function cleanIds(ids: readonly string[], known: readonly string[]): string[] {
  const out: string[] = []
  for (const id of ids) if (known.includes(id) && !out.includes(id)) out.push(id)
  return out
}

/** Lo guardado como ids válidos, o `null` si no es de este formato. */
function parseLayout(raw: unknown, known: readonly string[]): string[] | null {
  return isWidgetLayout(raw) ? cleanIds(raw.ids, known) : null
}

/** Lo que se guarda para estos ids. */
function serializeLayout(ids: readonly string[]): WidgetLayoutData {
  return { version: 1, ids: [...ids] }
}

/** Mueve `id` a la posición `to` (0 es el primero; se acota a los extremos). Un id desconocido no cambia nada. */
function moveWidget(ids: readonly string[], id: string, to: number): string[] {
  const from = ids.indexOf(id)
  if (from < 0) return [...ids]
  const next = [...ids]
  next.splice(from, 1)
  next.splice(Math.max(0, Math.min(to, next.length)), 0, id)
  return next
}

/** Toma el orden que entrega el arrastre, pero solo si son los mismos ids: si no, se queda con el actual. */
function reorderWidgets(ids: readonly string[], next: readonly string[]): string[] {
  const same = next.length === ids.length && new Set(next).size === next.length && next.every((id) => ids.includes(id))
  return same ? [...next] : [...ids]
}

function removeWidget(ids: readonly string[], id: string): string[] {
  return ids.filter((item) => item !== id)
}

/** Suma `id` al final, si existe y no está ya. */
function addWidget(ids: readonly string[], id: string, known: readonly string[]): string[] {
  return known.includes(id) && !ids.includes(id) ? [...ids, id] : [...ids]
}

/** El panel original: todos los widgets, en el orden en que se declararon. */
function defaultWidgetIds(widgets: readonly Pick<WidgetDef, "id">[]): string[] {
  return widgets.map((widget) => widget.id)
}

type UseWidgetLayoutOptions = {
  /** La clave de `localStorage`. Una por pantalla (y por proyecto o cuenta si el panel cambia con eso). */
  storageKey: string
  /** Todos los widgets, en el orden original. Un id que ya no existe se descarta de lo guardado. */
  widgets: readonly WidgetDef[]
  labels?: Partial<WidgetBoardLabels>
}

/**
 * El estado de un `WidgetBoard`: qué widgets se ven y en qué orden (guardado), el modo edición, el
 * catálogo y el aviso para el lector. Arranca con el panel original y adopta lo guardado después de
 * montar (el HTML del servidor muestra el original; ver `useStoredState`).
 */
function useWidgetLayout({ storageKey, widgets, labels: labelsProp }: UseWidgetLayoutOptions) {
  const labels = { ...widgetBoardLabels, ...useLabels().widgetBoard, ...defined(labelsProp) }
  const known = defaultWidgetIds(widgets)
  const knownKey = known.join("\n")
  const [stored, save] = useStoredState<WidgetLayoutData>(storageKey, serializeLayout(known), isWidgetLayout)
  const ids = React.useMemo(() => cleanIds(stored.ids, known), [stored, knownKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const visible = ids.flatMap((id) => widgets.filter((widget) => widget.id === id))
  const hidden = widgets.filter((widget) => !ids.includes(widget.id))
  const isDefault = ids.length === known.length && ids.every((id, index) => id === known[index])

  const [editing, setEditingState] = React.useState(false)
  // Verdadero desde la primera vez que se edita: ahí se pide el módulo del arrastre y se queda montado.
  const [armed, setArmed] = React.useState(false)
  const [catalogOpen, setCatalogOpen] = React.useState(false)
  const [message, setMessage] = React.useState("")

  const setEditing = React.useCallback(
    (next: boolean) => {
      setEditingState(next)
      if (next) setArmed(true)
      else setCatalogOpen(false)
      // Entrar se anuncia acá; salir lo anuncia el arrastre (`sortable.done`) si está montado, y si no, esto.
      setMessage(next ? labels.editingAnnounce : "")
    },
    [labels.editingAnnounce]
  )

  const set = (next: string[]) => save(serializeLayout(next))
  return {
    /** Los widgets en pantalla, en orden. */
    visible,
    /** Los que se sacaron: el catálogo. */
    hidden,
    /** `true` si es el panel original (nada para restablecer). */
    isDefault,
    editing,
    setEditing,
    /** Se pidió el módulo de edición: de acá en más el tablero lo usa. */
    armed,
    catalogOpen,
    setCatalogOpen,
    /** Abre el catálogo, entrando en edición si hace falta (el «Agregar widget» del estado vacío). */
    openCatalog: () => {
      setEditing(true)
      setCatalogOpen(true)
    },
    /** Lo que se anuncia (región `status`). */
    message,
    announce: setMessage,
    labels,
    reorder: (next: readonly string[]) => set(reorderWidgets(ids, next)),
    remove: (id: string) => set(removeWidget(ids, id)),
    add: (id: string) => set(addWidget(ids, id, known)),
    reset: () => {
      set(known)
      setMessage(labels.resetAnnounce)
    }
  }
}

type WidgetLayout = ReturnType<typeof useWidgetLayout>

export {
  addWidget,
  cleanIds,
  defaultWidgetIds,
  isWidgetLayout,
  moveWidget,
  parseLayout,
  removeWidget,
  reorderWidgets,
  serializeLayout,
  useWidgetLayout,
  widgetBoardLabels,
  type UseWidgetLayoutOptions,
  type WidgetBoardLabels,
  type WidgetDef,
  type WidgetLayout,
  type WidgetLayoutData,
  type WidgetSize
}
