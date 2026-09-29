"use client"

import * as React from "react"
import { ChevronRightIcon, FileIcon, FolderIcon, LoaderCircleIcon } from "lucide-react"

import { cn } from "../lib/utils.js"

/**
 * Un árbol de carpetas y archivos en el lenguaje de la lista de iCloud Drive (catálogo §2.5): filas
 * de 41 con radio 10, el nombre en 17, columnas de metadatos a la derecha en 14 gris, separadores
 * interiores y la fila elegida en el acento mientras el árbol tiene el foco (gris sin foco). Drive
 * web no despliega carpetas —entra en ellas—; acá el disclosure es el triángulo del Finder, que gira.
 *
 * Teclado y ARIA del patrón `tree` de WAI-ARIA: foco itinerante, ↑↓, →/←, Home/End, Enter y
 * type-ahead. La selección es simple y sigue al foco, como en el Finder.
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
}

type TreeProps = Omit<React.ComponentProps<"div">, "children" | "defaultValue" | "onSelect"> & {
  items: TreeNode[]
  /** Columnas a la derecha del nombre, con una cabecera de 44 arriba. */
  columns?: TreeColumn[]
  /** El título de la columna del nombre, si hay `columns`. */
  nameHeader?: React.ReactNode
  /** Las carpetas abiertas. Pasarlo lo vuelve controlado. */
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (expanded: string[]) => void
  /** El ítem elegido. Pasarlo lo vuelve controlado. */
  selected?: string | null
  defaultSelected?: string | null
  onSelectedChange?: (id: string | null, node: TreeNode | null) => void
  /** Enter o doble click sobre un ítem: abrir el archivo, entrar en la carpeta. */
  onOpen?: (node: TreeNode) => void
  /** Trae los hijos de una carpeta `hasChildren`; la app actualiza `items` y resuelve la promesa. */
  onLoadChildren?: (node: TreeNode) => Promise<void>
}

type Visible = { node: TreeNode; level: number; setSize: number; posInSet: number; parent: string | null }

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
  nameHeader,
  expanded: expandedProp,
  defaultExpanded = [],
  onExpandedChange,
  selected: selectedProp,
  defaultSelected = null,
  onSelectedChange,
  onOpen,
  onLoadChildren,
  ...props
}: TreeProps) {
  const [expandedList, setExpandedList] = useControllable(expandedProp, defaultExpanded, onExpandedChange)
  const [selected, setSelectedOwn] = useControllable<string | null>(selectedProp, defaultSelected)
  const [focused, setFocused] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<ReadonlySet<string>>(new Set())
  const expanded = React.useMemo(() => new Set(expandedList), [expandedList])
  const visible = React.useMemo(() => flatten(items, expanded), [items, expanded])
  const rows = React.useRef(new Map<string, HTMLDivElement>())
  const typed = React.useRef({ text: "", at: 0 })

  // El que está en el orden de Tab: el enfocado si se ve, si no el elegido, si no el primero.
  const tabStop =
    (focused != null && visible.some((row) => row.node.id === focused) && focused) ||
    (selected != null && visible.some((row) => row.node.id === selected) && selected) ||
    visible[0]?.node.id

  const select = (node: TreeNode) => {
    setSelectedOwn(node.id)
    onSelectedChange?.(node.id, node)
  }

  const moveTo = (node: TreeNode | undefined) => {
    if (!node) return
    setFocused(node.id)
    if (!node.disabled) select(node)
    rows.current.get(node.id)?.focus()
  }

  const setOpen = (node: TreeNode, open: boolean) => {
    if (open === expanded.has(node.id)) return
    setExpandedList(open ? [...expandedList, node.id] : expandedList.filter((id) => id !== node.id))
    if (open && node.children == null && node.hasChildren && onLoadChildren) {
      setLoading((prev) => new Set(prev).add(node.id))
      void onLoadChildren(node).finally(() =>
        setLoading((prev) => {
          const next = new Set(prev)
          next.delete(node.id)
          return next
        })
      )
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = visible.findIndex((row) => row.node.id === tabStop)
    const row = visible[index]
    if (!row) return
    const { node } = row
    const open = expanded.has(node.id)
    let handled = true
    switch (event.key) {
      case "ArrowDown":
        moveTo(visible[index + 1]?.node)
        break
      case "ArrowUp":
        moveTo(visible[index - 1]?.node)
        break
      case "Home":
        moveTo(visible[0]?.node)
        break
      case "End":
        moveTo(visible[visible.length - 1]?.node)
        break
      case "ArrowRight":
        if (!isFolder(node)) break
        if (!open) setOpen(node, true)
        else if (node.children?.length) moveTo(visible[index + 1]?.node)
        break
      case "ArrowLeft":
        if (isFolder(node) && open) setOpen(node, false)
        else moveTo(visible.find((candidate) => candidate.node.id === row.parent)?.node)
        break
      case "Enter":
        if (!node.disabled) onOpen?.(node)
        break
      case " ":
        if (!node.disabled) select(node)
        break
      default:
        handled = false
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          // Type-ahead: lo tipeado en el último medio segundo, desde el ítem que sigue.
          const now = Date.now()
          const text = (now - typed.current.at > 500 ? "" : typed.current.text) + normalize(event.key)
          typed.current = { text, at: now }
          const ordered = [...visible.slice(index + (text.length === 1 ? 1 : 0)), ...visible.slice(0, index + 1)]
          moveTo(ordered.find((candidate) => normalize(candidate.node.label).startsWith(text))?.node)
          handled = true
        }
    }
    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const colsWidth = (column: TreeColumn) => (column.width != null ? { width: column.width } : undefined)

  return (
    <div data-slot="tree-container" className={cn("group/list flex w-full min-w-0 flex-col overflow-x-auto", className)}>
      {columns && columns.length > 0 && (
        // Visual: los valores se leen dentro de cada ítem. Una grilla navegable por celda es `treegrid`.
        <div
          data-slot="tree-header"
          aria-hidden="true"
          className="flex h-11 shrink-0 items-center text-callout whitespace-nowrap text-label-secondary shadow-[inset_0_-1px_0_var(--color-separator)]"
        >
          <span className="min-w-40 flex-1 ps-[60px] pe-3">{nameHeader}</span>
          {columns.map((column, index) => (
            <span key={index} className={cn("shrink-0 px-3", column.numeric && "text-right")} style={colsWidth(column)}>
              {column.header}
            </span>
          ))}
        </div>
      )}
      <div data-slot="tree" role="tree" onKeyDown={onKeyDown} className="flex flex-col outline-none" {...props}>
        {visible.map(({ node, level, setSize, posInSet }) => {
          const folder = isFolder(node)
          const open = expanded.has(node.id)
          const busy = loading.has(node.id)
          const isSelected = selected === node.id
          return (
            <div
              key={node.id}
              ref={(element) => {
                if (element) rows.current.set(node.id, element)
                else rows.current.delete(node.id)
              }}
              role="treeitem"
              aria-level={level}
              aria-setsize={setSize}
              aria-posinset={posInSet}
              aria-expanded={folder ? open : undefined}
              aria-selected={isSelected}
              aria-disabled={node.disabled || undefined}
              aria-busy={busy || undefined}
              tabIndex={node.id === tabStop ? 0 : -1}
              data-state={isSelected ? "selected" : undefined}
              style={{ "--tree-depth": level - 1 } as React.CSSProperties}
              onFocus={() => setFocused(node.id)}
              onClick={() => {
                if (node.disabled) return
                setFocused(node.id)
                select(node)
              }}
              onDoubleClick={() => !node.disabled && onOpen?.(node)}
              className={cn(
                "group/selectable relative flex h-[41px] shrink-0 cursor-default items-center rounded-item text-callout text-label-secondary outline-none select-none",
                // El separador interior, desde el nombre; no va arriba de la primera, ni al lado de la
                // fila con el puntero o la elegida, como en Drive.
                "before:pointer-events-none before:absolute before:end-0 before:top-0 before:start-[calc(60px+var(--tree-depth)*20px)] before:h-px before:bg-separator",
                "first:before:hidden hover:before:hidden data-[state=selected]:before:hidden [[role=treeitem]:hover+&]:before:hidden [[data-state=selected]+&]:before:hidden",
                "not-data-[state=selected]:hover:bg-fill-1 data-[state=selected]:bg-selection-inactive",
                "data-[state=selected]:group-focus-within/list:bg-selection data-[state=selected]:group-focus-within/list:text-on-selection",
                "focus-visible:focus-ring data-[state=selected]:focus-visible:focus-ring-inverse aria-disabled:opacity-40"
              )}
            >
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
                    className={cn("size-3.5 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-90")}
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
              <span className="min-w-40 flex-1 truncate pe-3 text-body text-label group-data-[state=selected]/selectable:group-focus-within/list:text-on-selection">
                {node.label}
              </span>
              {columns?.map((column, index) => (
                <span
                  key={index}
                  className={cn(
                    "shrink-0 truncate px-3 whitespace-nowrap inside-selection:text-on-selection",
                    column.numeric && "text-right tabular-nums"
                  )}
                  style={colsWidth(column)}
                >
                  {node.columns?.[index]}
                </span>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { Tree, type TreeColumn, type TreeNode, type TreeProps }
