"use client"

import * as React from "react"
import { CalendarDaysIcon, Columns3Icon, LayoutGridIcon, ListIcon, RotateCcwIcon } from "lucide-react"

import { useStoredState } from "../lib/use-stored-state.js"
import {
  hiddenColumnsCss,
  isHiddenColumns,
  isListViewMode,
  normalizeHidden,
  resolveMode,
  toggleColumn,
  type ListColumn,
  type ListViewKind,
  type ListViewMode,
} from "../lib/list-view.js"
import { Button } from "./button.js"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu.js"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js"

type ListViewLabels = {
  view: string
  table: string
  cards: string
  calendar: string
  columns: string
  reset: string
}

const listViewLabels: ListViewLabels = {
  view: "Vista",
  table: "Tabla",
  cards: "Tarjetas",
  calendar: "Calendario",
  columns: "Columnas visibles",
  reset: "Restablecer",
}

const NARROW = "(max-width: 42rem)"
const canMatch = () => typeof window !== "undefined" && typeof window.matchMedia === "function"
const subscribe = (cb: () => void) => {
  if (!canMatch()) return () => {}
  const mq = window.matchMedia(NARROW)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}
// El servidor y el primer render dicen «ancho»: el HTML no depende del dispositivo.
const useNarrow = () => React.useSyncExternalStore(subscribe, () => canMatch() && window.matchMedia(NARROW).matches, () => false)

type ListViewContextValue = {
  listKey: string
  columns: readonly ListColumn[]
  mode: ListViewMode
  defaultMode: ListViewMode
  views: readonly ListViewKind[]
  labels: ListViewLabels
  setMode: (mode: ListViewMode) => void
  hidden: string[]
  setHidden: (hidden: string[]) => void
  /** La vista que se ve ahora (con `auto` resuelto contra el ancho). */
  shown: ListViewKind
}

const ListViewContext = React.createContext<ListViewContextValue | null>(null)

/** El estado de la vista de la lista de arriba: vista, columnas ocultas y la vista que se ve. */
function useListView() {
  const ctx = React.useContext(ListViewContext)
  if (!ctx) throw new Error("ListViewControls y ListViewContent van dentro de un ListViewProvider")
  return ctx
}

type ListViewProviderProps = {
  /** Identifica la lista: la vista y las columnas se recuerdan por esta clave en `localStorage`. */
  listKey: string
  columns?: readonly ListColumn[]
  /** La vista sin elección guardada. Default `auto`: tabla donde entra y tarjetas en un contenedor angosto. */
  defaultMode?: ListViewMode
  /** Las vistas que ofrece la lista. Default tabla y tarjetas. */
  views?: readonly ListViewKind[]
  /** Los textos (vista, tabla, tarjetas, calendario, columnas, restablecer). Por ejemplo, «Lista» en vez de «Tabla». */
  labels?: Partial<ListViewLabels>
  children: React.ReactNode
}

/**
 * El estado de la vista de una lista (tabla, tarjetas o calendario, y las columnas visibles), recordado
 * por lista en `localStorage`. El servidor siempre renderiza la vista por defecto y lo guardado se
 * adopta después de montar, sin desfase de hidratación. Va alrededor de la barra y del contenido; los
 * `children` pueden ser Server Components.
 */
function ListViewProvider({ listKey, columns = [], defaultMode = "auto", views = ["table", "cards"], labels: labelsProp, children }: ListViewProviderProps) {
  const [storedMode, setMode] = useStoredState<ListViewMode>(`sebs7n:list:${listKey}:view`, defaultMode, isListViewMode)
  const [storedHidden, setStoredHidden] = useStoredState<string[]>(`sebs7n:list:${listKey}:hidden-columns`, [], isHiddenColumns)
  const hidden = React.useMemo(() => normalizeHidden(storedHidden, columns), [storedHidden, columns])
  const mode = resolveMode(storedMode, views, defaultMode)
  const narrow = useNarrow()
  const shown: ListViewKind = mode === "auto" ? (narrow ? "cards" : "table") : mode
  const labels = React.useMemo(() => ({ ...listViewLabels, ...labelsProp }), [labelsProp])
  const value = React.useMemo<ListViewContextValue>(
    () => ({ listKey, columns, mode, defaultMode, views, labels, setMode, hidden, setHidden: setStoredHidden, shown }),
    [listKey, columns, mode, defaultMode, views, labels, setMode, hidden, setStoredHidden, shown]
  )
  return (
    <ListViewContext.Provider value={value}>
      <style>{hiddenColumnsCss(listKey, hidden)}</style>
      {children}
    </ListViewContext.Provider>
  )
}

const VIEW_ICONS = { table: ListIcon, cards: LayoutGridIcon, calendar: CalendarDaysIcon } as const

/** Alterna entre las vistas que ofrece la lista (`ToggleGroup` de íconos con tooltip). En `actions` de una `FilterBar`, en `sm`. */
function ViewToggle() {
  const { views, labels, setMode, shown } = useListView()
  return (
    <ToggleGroup aria-label={labels.view} onValueChange={(v) => (v[0] === "table" || v[0] === "cards" || v[0] === "calendar") && setMode(v[0])} size="sm" value={[shown]}>
      {views.map((view) => {
        const Icon = VIEW_ICONS[view]
        return (
          <Tooltip key={view}>
            <TooltipTrigger render={<ToggleGroupItem aria-label={labels[view]} value={view} />}>
              <Icon />
            </TooltipTrigger>
            <TooltipContent>{labels[view]}</TooltipContent>
          </Tooltip>
        )
      })}
    </ToggleGroup>
  )
}

/** El menú para elegir qué columnas se ven. Solo aparece en la vista de tabla y si alguna columna se puede ocultar. */
function ColumnPicker() {
  const { columns, mode, defaultMode, views, labels, setMode, hidden, setHidden, shown } = useListView()
  if (!columns.some((c) => !c.required) || shown !== "table" || !views.includes("table")) return null
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<DropdownMenuTrigger render={<Button aria-label={labels.columns} size="icon-sm" type="button" variant="secondary" />} />}>
          <Columns3Icon />
        </TooltipTrigger>
        <TooltipContent>{labels.columns}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {columns.map((c) => (
          <DropdownMenuCheckboxItem checked={!hidden.includes(c.id)} disabled={c.required} key={c.id} onCheckedChange={(checked) => setHidden(toggleColumn(hidden, columns, c.id, checked))}>
            {c.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={hidden.length === 0 && mode === defaultMode}
          onClick={() => {
            setHidden([])
            setMode(defaultMode)
          }}
        >
          <RotateCcwIcon aria-hidden />
          {labels.reset}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Los dos controles juntos, para el `actions` de una `FilterBar`: `ViewToggle` y `ColumnPicker`. */
function ListViewControls() {
  return (
    <>
      <ViewToggle />
      <ColumnPicker />
    </>
  )
}

type ListViewContentProps = {
  table: React.ReactNode
  cards?: React.ReactNode
  calendar?: React.ReactNode
}

/**
 * La lista en sus formas. Con `auto` (sin elección) van la tabla y las tarjetas y el contenedor decide por
 * CSS (tabla desde 42 rem de ancho): el HTML del servidor no depende de lo guardado, así que no hay salto.
 * Con una elección explícita se monta solo la elegida. Las celdas y cabeceras de la tabla llevan
 * `data-col="<id>"` para que `ColumnPicker` pueda ocultarlas.
 */
function ListViewContent({ table, cards, calendar }: ListViewContentProps) {
  const { listKey, mode } = useListView()
  return (
    <div className="@container" data-list-view={listKey} data-slot="list-view" data-view={mode}>
      {mode === "table" && table}
      {mode === "cards" && cards}
      {mode === "calendar" && calendar}
      {mode === "auto" && (
        <>
          <div className="hidden @2xl:block">{table}</div>
          <div className="@2xl:hidden">{cards}</div>
        </>
      )}
    </div>
  )
}

export {
  ColumnPicker,
  ListViewContent,
  ListViewControls,
  ListViewProvider,
  ViewToggle,
  listViewLabels,
  useListView,
  type ListViewContentProps,
  type ListViewLabels,
  type ListViewProviderProps,
}
export type { ListColumn, ListViewKind, ListViewMode } from "../lib/list-view.js"
