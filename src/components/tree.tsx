"use client"

import * as React from "react"
import { ChevronRightIcon, FileIcon, FolderIcon, LoaderCircleIcon } from "lucide-react"

import type { AccessibleName } from "../internal/accessible-name.js"
import { defined } from "../internal/defined.js"
import { isToggleModifier, useSelection, type SelectionProps } from "../internal/selection.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

/**
 * Un árbol de carpetas y archivos en el lenguaje de la lista de iCloud Drive (catálogo §2.5): filas
 * de 41 con radio 10, el nombre en 17, columnas de metadatos a la derecha en 14 gris, separadores
 * interiores y la fila elegida en el acento mientras el árbol tiene el foco (gris sin foco). Drive
 * web no despliega carpetas —entra en ellas—; acá el disclosure es el triángulo del Finder, que gira.
 *
 * Teclado y ARIA del patrón `tree` de WAI-ARIA: foco itinerante, ↑↓, →/←, Home/End, Enter y
 * type-ahead. La selección es simple y sigue al foco, como en el Finder; con
 * `selectionMode="multiple"`, el modelo de selección múltiple de WAI-ARIA (ver `SelectionProps`).
 * Con `grid` (y `columns`) es un `treegrid`: filas con celdas que se recorren con ←/→.
 */
type TreeNode = {
  id: string
  /** El nombre: lo que se ve, lo que se lee y lo que busca el type-ahead. */
  label: string
  /** El ícono. Por defecto, una carpeta (si tiene hijos) o un archivo. Decorativo. */
  icon?: React.ReactNode
  /** Los hijos. Un array (aunque esté vacío) la hace carpeta. */
  children?: TreeNode[]
  /** Carpeta cuyos hijos todavía no llegaron: al abrirla se llama a `onLoadChildren`. */
  hasChildren?: boolean
  /** Los valores de las columnas de `Tree columns`, en el mismo orden. */
  columns?: React.ReactNode[]
  disabled?: boolean
}

type TreeColumn = {
  /** El título de la columna, en la cabecera. */
  header: React.ReactNode
  /** Ancho en px. Los de Drive: Tipo 180, Tamaño 100, Fecha 180, Compartido 120. */
  width?: number
  /** A la derecha y con cifras tabulares. */
  numeric?: boolean
  /**
   * Ancho del árbol en px por debajo del cual la columna se esconde, como Drive en una ventana
   * angosta. Por defecto, cuando no entra junto al nombre (224) y las columnas de su izquierda: se
   * van de derecha a izquierda. `0`: nunca se esconde (si no entra, el árbol se desplaza en su caja).
   */
  hideBelow?: number
}

type TreePropsBase = Omit<React.ComponentProps<"div">, "children" | "defaultValue" | "onSelect"> & {
  items: TreeNode[]
  /** El título de la columna del nombre, si hay `columns`. */
  nameHeader?: React.ReactNode
  /** Las carpetas abiertas. Pasarlo lo vuelve controlado. */
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (expanded: string[]) => void
  /** Enter o doble click sobre un ítem: abrir el archivo, entrar en la carpeta. */
  onOpen?: (node: TreeNode) => void
  /** Trae los hijos de una carpeta `hasChildren`; la app actualiza `items` y resuelve la promesa. */
  onLoadChildren?: (node: TreeNode) => Promise<void>
  /** La promesa de `onLoadChildren` falló: la carpeta vuelve a cerrarse (se puede reintentar abriéndola). */
  onLoadError?: (node: TreeNode, error: unknown) => void
  labels?: Partial<Labels["tree"]>
}

/** `grid` exige `columns`: un treegrid sin columnas es un árbol con un paso de más. */
type TreeGridMode =
  | {
      /** Columnas a la derecha del nombre, con una cabecera de 44 arriba. */
      columns?: TreeColumn[]
      grid?: false
    }
  | {
      columns: TreeColumn[]
      /**
       * Un `treegrid` de WAI-ARIA: cada fila tiene celdas (el nombre y cada columna) y la cabecera
       * se lee. → en una carpeta abierta (o en un archivo) entra a las celdas, ←/→ las recorren y ←
       * en la primera vuelve a la fila. Requiere `columns`.
       */
      grid: true
    }

type Visible = { node: TreeNode; level: number; setSize: number; posInSet: number; parent: string | null }

// El nombre guarda 224 antes de ceder una columna: 64 de sangría, triángulo e ícono + 160 de texto.
const NAME_MIN = 224

/**
 * Las columnas que no entran se esconden con container queries: cada una deja su pista en 0 (así la
 * cabecera y las filas, que comparten la grilla, siguen alineadas) y sus celdas en `display: none`
 * (fuera del lector y del teclado). Es CSS y no un ResizeObserver para que el primer pintado, el del
 * servidor, ya salga bien en un teléfono.
 */
function hideRules(id: string, columns: TreeColumn[]) {
  let needed = NAME_MIN
  return columns
    .map((column, index) => {
      needed += column.width ?? 120
      const below = column.hideBelow ?? needed
      if (below <= 0) return ""
      const scope = `[data-tree="${id}"]`
      return `@container (width < ${below}px){${scope}{--tree-column-${index}:0px}${scope} [data-column="${index}"]{display:none}}`
    })
    .join("")
}

// Las celdas visibles de una fila del treegrid, por su índice en la fila (0 es el nombre).
function shownCells(row: HTMLElement | undefined) {
  return [...(row?.querySelectorAll<HTMLElement>('[role="gridcell"]') ?? [])].flatMap((element, index) =>
    getComputedStyle(element).display === "none" ? [] : [index]
  )
}

const isFolder = (node: TreeNode) => node.children != null || node.hasChildren === true
const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

function flatten(items: TreeNode[], expanded: Set<string>, level = 1, parent: string | null = null, out: Visible[] = []) {
  items.forEach((node, index) => {
    out.push({ node, level, setSize: items.length, posInSet: index + 1, parent })
    if (node.children && expanded.has(node.id)) flatten(node.children, expanded, level + 1, node.id, out)
  })
  return out
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [own, setOwn] = React.useState(defaultValue)
  const current = value !== undefined ? value : own
  const set = (next: T) => {
    if (value === undefined) setOwn(next)
    onChange?.(next)
  }
  return [current, set] as const
}

function Tree({
  className,
  items,
  columns,
  grid = false,
  nameHeader,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  selectionMode,
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  onOpen,
  onLoadChildren,
  onLoadError,
  onKeyDown: onKeyDownProp,
  labels: labelsProp,
  ...props
}: TreeProps) {
  const labels = { ...useLabels().tree, ...defined(labelsProp) }
  const [expandedList, setExpandedList] = useControllable(expandedProp, defaultExpanded, onExpandedChange)
  // La lista de ahora, para lo que termina después (una carga que falla cierra su carpeta).
  const expandedRef = React.useRef(expandedList)
  expandedRef.current = expandedList
  const [focused, setFocused] = React.useState<string | null>(null)
  // En el treegrid, la celda con foco de la fila enfocada (`null`: la fila entera).
  const [cell, setCell] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState<ReadonlySet<string>>(new Set())
  const expanded = React.useMemo(() => new Set(expandedList), [expandedList])
  const visible = React.useMemo(() => flatten(items, expanded), [items, expanded])
  const visibleNodes = React.useMemo(() => visible.map((row) => row.node), [visible])
  const rows = React.useRef(new Map<string, HTMLDivElement>())
  const typed = React.useRef({ text: "", at: 0 })
  const hasColumns = columns != null && columns.length > 0
  const isGrid = grid && hasColumns
  const treeId = React.useId()

  // Todos los nodos, con su padre: para encontrar un ítem aunque su carpeta esté cerrada.
  const all = React.useMemo(() => {
    const map = new Map<string, { node: TreeNode; parent: string | null }>()
    const walk = (nodes: TreeNode[], parent: string | null) =>
      nodes.forEach((node) => {
        map.set(node.id, { node, parent })
        if (node.children) walk(node.children, node.id)
      })
    walk(items, null)
    return map
  }, [items])

  const selection = useSelection<TreeNode>(
    { selectionMode, selected: selectedProp, defaultSelected, onSelectedChange } as SelectionProps<TreeNode>,
    (id) => all.get(id)?.node
  )

  // El que está en el orden de Tab: el enfocado si se ve, si no el elegido, si no el primero.
  const tabStop =
    (focused != null && visible.some((row) => row.node.id === focused) && focused) ||
    visible.find((row) => selection.isSelected(row.node.id))?.node.id ||
    visible[0]?.node.id
  // La celda vale solo para la fila que tiene el foco.
  const activeCell = isGrid && tabStop === focused ? cell : null

  const select = (node: TreeNode) => selection.only(node)

  const focusRow = (id: string, cellIndex: number | null) => {
    const row = rows.current.get(id)
    const target = cellIndex == null ? row : row?.querySelectorAll<HTMLElement>('[role="gridcell"]')[cellIndex]
    target?.focus()
  }

  // La celda visible siguiente o anterior a `from` en la fila: las columnas escondidas no cuentan.
  const stepCell = (id: string, from: number, step: 1 | -1) => {
    const shown = shownCells(rows.current.get(id))
    return step === 1 ? shown.find((index) => index > from) : [...shown].reverse().find((index) => index < from)
  }

  // En `single` la selección sigue al foco. En `multiple` las flechas solas mueven el foco (y el
  // ancla), y con ⇧ extienden el rango desde el ancla. En el treegrid, `cellIndex` es la celda.
  const moveTo = (node: TreeNode | undefined, extend = false, cellIndex: number | null = null) => {
    if (!node) return
    const from = tabStop ?? node.id
    setFocused(node.id)
    setCell(cellIndex)
    if (!node.disabled) {
      if (!selection.multiple) select(node)
      else if (extend) selection.extend(node, visibleNodes, from)
      else selection.anchorAt(node.id)
    }
    focusRow(node.id, cellIndex)
  }

  // Las carpetas perezosas que ya se pidieron desde la última vez que el usuario las abrió.
  const attempted = React.useRef(new Set<string>())

  const setOpen = (node: TreeNode, open: boolean) => {
    if (open === expanded.has(node.id)) return
    // Abrir o cerrar a mano es lo único que habilita pedir de nuevo.
    attempted.current.delete(node.id)
    setExpandedList(open ? [...expandedList, node.id] : expandedList.filter((id) => id !== node.id))
  }

  // Una carpeta perezosa abierta (al abrirla, o abierta de entrada) pide sus hijos una sola vez a la
  // vez. Si la carga falla, se cierra y se avisa: abrirla de nuevo reintenta. El effect nunca
  // reintenta solo: si la carga termina sin hijos, o falla con `expanded` controlado que no se
  // cierra, pedir en cada render era un bucle (miles de llamadas por segundo).
  const pending = React.useRef(new Set<string>())
  React.useEffect(() => {
    if (!onLoadChildren) return
    for (const id of expandedList) {
      const node = all.get(id)?.node
      if (!node || node.children != null || !node.hasChildren || pending.current.has(id) || attempted.current.has(id)) continue
      attempted.current.add(id)
      pending.current.add(id)
      setLoading(new Set(pending.current))
      onLoadChildren(node)
        .catch((error: unknown) => {
          setExpandedList(expandedRef.current.filter((open) => open !== id))
          onLoadError?.(node, error)
        })
        .finally(() => {
          pending.current.delete(id)
          setLoading(new Set(pending.current))
        })
    }
  })

  // Si el ítem con foco deja de verse (su carpeta se cerró desde afuera), el foco sube a la carpeta
  // visible más cercana en vez de perderse en el <body>.
  React.useEffect(() => {
    if (focused == null || visible.some((row) => row.node.id === focused)) return
    const active = document.activeElement
    if (active && active !== document.body) return
    let parent = all.get(focused)?.parent ?? null
    while (parent != null && !visible.some((row) => row.node.id === parent)) parent = all.get(parent)?.parent ?? null
    if (parent == null) return
    setFocused(parent)
    setCell(null)
    rows.current.get(parent)?.focus()
  })

  // Si un elegido ya no está en `items`, sale de la selección y se avisa.
  React.useEffect(() => {
    selection.prune((id) => all.has(id))
  })

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // El de la app va primero y puede cancelar el nuestro con `preventDefault()`; antes el suyo, que
    // llegaba por `...props` después, reemplazaba la navegación entera.
    onKeyDownProp?.(event)
    if (event.defaultPrevented) return
    const index = visible.findIndex((row) => row.node.id === tabStop)
    const row = visible[index]
    if (!row) return
    const { node } = row
    const open = expanded.has(node.id)
    const extend = event.shiftKey
    let handled = true
    if (selection.multiple && isToggleModifier(event) && event.key.toLowerCase() === "a") {
      selection.all(visibleNodes)
    } else if (activeCell != null) {
      // Treegrid, con el foco en una celda: ←/→ recorren la fila, ↑/↓ la misma celda en otra fila.
      switch (event.key) {
        case "ArrowRight": {
          const next = stepCell(node.id, activeCell, 1)
          if (next != null) moveTo(node, false, next)
          break
        }
        case "ArrowLeft":
          moveTo(node, false, stepCell(node.id, activeCell, -1) ?? null)
          break
        case "ArrowDown":
          moveTo(visible[index + 1]?.node, extend, activeCell)
          break
        case "ArrowUp":
          moveTo(visible[index - 1]?.node, extend, activeCell)
          break
        case "Home":
          if (event.ctrlKey) moveTo(visible[0]?.node, extend, activeCell)
          else moveTo(node, false, 0)
          break
        case "End":
          if (event.ctrlKey) moveTo(visible[visible.length - 1]?.node, extend, activeCell)
          else moveTo(node, false, shownCells(rows.current.get(node.id)).at(-1) ?? 0)
          break
        case "Enter":
          if (!node.disabled) onOpen?.(node)
          break
        case " ":
          if (!node.disabled) selection.toggle(node, visibleNodes)
          break
        default:
          handled = false
      }
    } else {
      switch (event.key) {
        case "ArrowDown":
          moveTo(visible[index + 1]?.node, extend)
          break
        case "ArrowUp":
          moveTo(visible[index - 1]?.node, extend)
          break
        case "Home":
          moveTo(visible[0]?.node, extend)
          break
        case "End":
          moveTo(visible[visible.length - 1]?.node, extend)
          break
        case "ArrowRight":
          if (isFolder(node) && !open) setOpen(node, true)
          // Treegrid: en una carpeta abierta o en un archivo, → entra a las celdas.
          else if (isGrid) moveTo(node, false, 0)
          else if (isFolder(node) && node.children?.length) moveTo(visible[index + 1]?.node)
          break
        case "ArrowLeft":
          if (isFolder(node) && open) setOpen(node, false)
          else moveTo(visible.find((candidate) => candidate.node.id === row.parent)?.node)
          break
        case "Enter":
          if (!node.disabled) onOpen?.(node)
          break
        case " ":
          if (!node.disabled) selection.toggle(node, visibleNodes)
          break
        default:
          handled = false
      }
    }
    if (!handled && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Type-ahead: lo tipeado en el último medio segundo, desde el ítem que sigue.
      const now = Date.now()
      let text = (now - typed.current.at > 500 ? "" : typed.current.text) + normalize(event.key)
      typed.current = { text, at: now }
      // La misma letra repetida («aa») recorre los que empiezan con ella, como en el Finder.
      if (text.length > 1 && [...text].every((char) => char === text[0])) text = text[0]!
      const ordered = [...visible.slice(index + (text.length === 1 ? 1 : 0)), ...visible.slice(0, index + 1)]
      moveTo(ordered.find((candidate) => normalize(candidate.node.label).startsWith(text))?.node)
      handled = true
    }
    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const onRowClick = (event: React.MouseEvent, node: TreeNode) => {
    if (node.disabled) return
    const from = tabStop ?? node.id
    setFocused(node.id)
    // Treegrid: el nombre es la fila (como en la APG, un click en la fila la enfoca), así ↓ sigue
    // por filas después de elegir con el mouse. Un click en un valor deja el foco en esa celda.
    if (isGrid && !(event.target as Element).closest('[data-slot=tree-cell]:not(:first-child)')) {
      setCell(null)
      rows.current.get(node.id)?.focus()
    }
    if (selection.multiple && event.shiftKey) selection.extend(node, visibleNodes, from)
    else if (selection.multiple && isToggleModifier(event)) selection.toggle(node, visibleNodes)
    else select(node)
  }

  // Una sola grilla para la cabecera y las filas (subgrid): la columna N mide lo mismo en todas, a
  // cualquier ancho. El nombre toma el resto y se trunca; una columna sin `width` mide su contenido.
  const template = hasColumns
    ? ["minmax(10rem, 1fr)", ...columns.map((column, index) => `var(--tree-column-${index}, ${column.width != null ? `${column.width}px` : "auto"})`)].join(" ")
    : undefined
  const columnStyle = (index: number): React.CSSProperties => ({ gridColumn: index + 2 })
  const subgrid = "col-span-full grid grid-cols-subgrid"

  const header = hasColumns && (
    // Sin `grid` es visual: los valores se leen dentro de cada ítem. En el treegrid es su fila de
    // cabeceras, y el lector la usa para decir la columna de cada celda.
    <div
      data-slot="tree-header"
      role={isGrid ? "row" : undefined}
      aria-hidden={isGrid ? undefined : "true"}
      className={cn(subgrid, "h-11 items-center text-callout whitespace-nowrap text-label-secondary shadow-[inset_0_-1px_0_var(--color-separator)]")}
    >
      <span role={isGrid ? "columnheader" : undefined} className="min-w-0 truncate ps-16 pe-3">
        {nameHeader}
      </span>
      {columns.map((column, index) => (
        <span
          key={index}
          role={isGrid ? "columnheader" : undefined}
          data-column={index}
          className={cn("min-w-0 truncate px-3", column.numeric && "text-end")}
          style={columnStyle(index)}
        >
          {column.header}
        </span>
      ))}
    </div>
  )

  const cellClassName = "rounded-item outline-none focus-visible:focus-ring in-data-[state=selected]:focus-visible:focus-ring-inverse"

  const tree = (
    <div
      data-slot="tree"
      role={isGrid ? "treegrid" : "tree"}
      aria-multiselectable={selection.multiple || undefined}
      onKeyDown={onKeyDown}
      className={cn("outline-none", hasColumns ? subgrid : "flex flex-col")}
      {...props}
    >
      {isGrid && header}
      {visible.map(({ node, level, setSize, posInSet }) => {
        const folder = isFolder(node)
        const open = expanded.has(node.id)
        const busy = loading.has(node.id)
        const isSelected = selection.isSelected(node.id)
        const isTabStop = node.id === tabStop
        const cellTab = (index: number) => (isTabStop && activeCell === index ? 0 : -1)
        const name = (
          <>
            <span aria-hidden="true" className="w-[calc(8px+var(--tree-depth)*20px)] shrink-0" />
            <span
              data-slot="tree-chevron"
              aria-hidden="true"
              onClick={(event) => {
                if (!folder || node.disabled) return
                event.stopPropagation()
                setFocused(node.id)
                setOpen(node, !open)
              }}
              className="flex size-5 shrink-0 items-center justify-center text-label-secondary inside-selection:text-on-selection"
            >
              {busy ? (
                <LoaderCircleIcon className="size-3.5 animate-spin motion-reduce:animate-none" />
              ) : folder ? (
                <ChevronRightIcon
                  className={cn("size-3.5 transition-transform duration-200 ease-out-expo motion-reduce:transition-none", open && "rotate-90")}
                  strokeWidth={2.5}
                />
              ) : null}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "ms-1 me-2 flex size-6 shrink-0 items-center justify-center [&>svg]:size-5 inside-selection:text-on-selection",
                folder ? "text-brand-900" : "text-label-secondary"
              )}
            >
              {node.icon ?? (folder ? <FolderIcon /> : <FileIcon />)}
            </span>
            <span
              title={node.label}
              className="min-w-0 flex-1 truncate pe-3 text-body text-label group-data-[state=selected]/selectable:group-focus-within/list:text-on-selection"
            >
              {node.label}
              {busy && <span className="sr-only">, {labels.loading}</span>}
            </span>
          </>
        )
        return (
          <div
            key={node.id}
            ref={(element) => {
              if (element) rows.current.set(node.id, element)
              else rows.current.delete(node.id)
            }}
            role={isGrid ? "row" : "treeitem"}
            aria-level={level}
            aria-setsize={setSize}
            aria-posinset={posInSet}
            aria-expanded={folder ? open : undefined}
            aria-selected={isSelected}
            aria-disabled={node.disabled || undefined}
            aria-busy={busy || undefined}
            tabIndex={isTabStop && activeCell == null ? 0 : -1}
            data-state={isSelected ? "selected" : undefined}
            style={{ "--tree-depth": level - 1 } as React.CSSProperties}
            onFocus={(event) => {
              // En el treegrid, el foco de una celda sube hasta acá: esa la anota la celda.
              if (event.target !== event.currentTarget) return
              setFocused(node.id)
              setCell(null)
            }}
            onClick={(event) => onRowClick(event, node)}
            onDoubleClick={() => !node.disabled && onOpen?.(node)}
            className={cn(
              "group/selectable relative h-[41px] shrink-0 cursor-default items-center rounded-item text-callout text-label-secondary outline-none select-none",
              // El separador interior, desde el nombre; no va arriba de la primera, ni al lado de la
              // fila con el puntero o la elegida, como en Drive.
              "before:pointer-events-none before:absolute before:end-0 before:top-0 before:start-[calc(64px+var(--tree-depth)*20px)] before:h-px before:bg-separator",
              "first:before:hidden hover:before:hidden data-[state=selected]:before:hidden [[role=treeitem]:hover+&]:before:hidden [[role=row]:hover+&]:before:hidden [[data-state=selected]+&]:before:hidden",
              "not-data-[state=selected]:hover:bg-fill-1 data-[state=selected]:bg-selection-inactive",
              "data-[state=selected]:group-focus-within/list:bg-selection data-[state=selected]:group-focus-within/list:text-on-selection",
              // Varias elegidas seguidas son un solo bloque, como en el Finder: sin radio donde se tocan.
              "data-[state=selected]:[[data-state=selected]+&]:rounded-t-none data-[state=selected]:has-[+[data-state=selected]]:rounded-b-none",
              "focus-visible:focus-ring data-[state=selected]:focus-visible:focus-ring-inverse aria-disabled:opacity-40",
              hasColumns ? subgrid : "flex"
            )}
          >
            {isGrid ? (
              <>
                <div
                  role="gridcell"
                  data-slot="tree-cell"
                  tabIndex={cellTab(0)}
                  onFocus={() => {
                    setFocused(node.id)
                    setCell(0)
                  }}
                  className={cn("flex h-full min-w-0 items-center", cellClassName)}
                >
                  {name}
                </div>
                {columns.map((column, index) => (
                  <div
                    key={index}
                    role="gridcell"
                    data-slot="tree-cell"
                    data-column={index}
                    tabIndex={cellTab(index + 1)}
                    onFocus={() => {
                      setFocused(node.id)
                      setCell(index + 1)
                    }}
                    className={cn(
                      "flex h-full min-w-0 items-center truncate px-3 whitespace-nowrap inside-selection:text-on-selection",
                      column.numeric && "justify-end text-end tabular-nums",
                      cellClassName
                    )}
                    style={columnStyle(index)}
                  >
                    {node.columns?.[index]}
                  </div>
                ))}
              </>
            ) : (
              <>
                {hasColumns ? <span className="flex h-full min-w-0 items-center">{name}</span> : name}
                {columns?.map((column, index) => (
                  <span
                    key={index}
                    data-column={index}
                    className={cn(
                      "min-w-0 truncate px-3 whitespace-nowrap inside-selection:text-on-selection",
                      column.numeric && "text-end tabular-nums"
                    )}
                    style={columnStyle(index)}
                  >
                    {node.columns?.[index]}
                  </span>
                ))}
              </>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div
      data-slot="tree-container"
      className={cn("group/list flex w-full min-w-0 flex-col", hasColumns && "@container overflow-x-auto", className)}
    >
      {hasColumns ? (
        <>
          <style>{hideRules(treeId, columns)}</style>
          <div data-slot="tree-grid" data-tree={treeId} className="grid min-w-0" style={{ gridTemplateColumns: template }}>
            {!isGrid && header}
            {tree}
          </div>
        </>
      ) : (
        tree
      )}
    </div>
  )
}

type TreeProps = TreePropsBase & TreeGridMode & SelectionProps<TreeNode> & AccessibleName

export { Tree, type TreeColumn, type TreeNode, type TreeProps }
