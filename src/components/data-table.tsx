"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import type { AccessibleName } from "../internal/accessible-name.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"
import { Checkbox } from "./checkbox.js"
import { Input } from "./input.js"
import { Pagination } from "./pagination.js"
import { Skeleton } from "./skeleton.js"
import { Table, TableBody, TableCell, TableGroupHeader, TableHead, TableHeader, TableRow, type TableProps } from "./table.js"

/**
 * Una tabla de datos armada sobre `Table` (la lista de Drive, catálogo §2.5): columnas por
 * definición, orden con la cabecera, búsqueda de iCloud (§2.13), páginas o «Cargar más», selección
 * con casillas, vacío, carga con esqueletos y grupos con `TableGroupHeader`. Sin dependencias: el
 * orden y el filtro son del cliente, sobre `data`.
 *
 * Genérica: `DataTable<Factura>` tipa `columns`, `getRowId` y `groupBy` con la fila.
 */
type DataTableValue = string | number | Date | null | undefined

type DataTableColumn<T> = {
  id: string
  header: React.ReactNode
  /** El contenido de la celda. Por defecto, `value(row)` como texto. */
  cell?: (row: T) => React.ReactNode
  /** El valor de la celda para ordenar y buscar (y dibujarla si no hay `cell`). */
  value?: (row: T) => DataTableValue
  /** Un botón en la cabecera que ordena por esta columna. Pide `value`. */
  sortable?: boolean
  /** A la derecha y con cifras tabulares, en la cabecera y en las celdas. */
  numeric?: boolean
  /** La búsqueda mira esta columna. Por defecto, toda columna con `value`. */
  searchable?: boolean
  /** Clases del `<th>` y de cada `<td>`: el ancho (`w-45`), una alineación. */
  className?: string
}

type DataTableSort = { id: string; direction: "asc" | "desc" } | null

type DataTablePropsBase<T> = Omit<TableProps, "children"> & {
  data: T[]
  columns: DataTableColumn<T>[]
  /** El id estable de cada fila: la `key` y lo que guarda la selección. */
  getRowId: (row: T) => string
  /** El nombre de la fila para su casilla («Seleccionar Acme S.A.»). Por defecto, el valor de la primera columna. */
  getRowLabel?: (row: T) => string
  sort?: DataTableSort
  defaultSort?: DataTableSort
  onSortChange?: (sort: DataTableSort) => void
  /** Muestra la búsqueda arriba de la tabla. */
  filter?: boolean
  query?: string
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  /** Filas por página. Sin él, todas. */
  pageSize?: number
  /** `pages` (default): `Pagination` abajo. `more`: un botón «Cargar más» que suma una página. */
  paging?: "pages" | "more"
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  /**
   * Una casilla por fila y la de todas en la cabecera. La selección es de los ids: lo elegido sigue
   * elegido aunque la búsqueda o la página lo escondan, y la región viva dice cuántas hay. «Todas»
   * marca o desmarca solo las que se ven.
   */
  selectable?: boolean
  selected?: string[]
  defaultSelected?: string[]
  onSelectedChange?: (ids: string[]) => void
  /** Agrupa las filas (en el orden en que aparecen): cada grupo va en su `TableBody` con su título. */
  groupBy?: (row: T) => string
  /** Lo que dice la tabla sin filas. Por defecto, «Sin resultados». */
  empty?: React.ReactNode
  /** Filas de esqueleto en lugar de los datos, y `aria-busy`. */
  loading?: boolean
  /** Cuántas filas de esqueleto. Por defecto, `pageSize` o 5. */
  loadingRows?: number
  /** Lo que va a la derecha de la búsqueda: filtros, «Nueva factura». */
  toolbar?: React.ReactNode
  /** El locale del orden alfabético y de las fechas sin `cell`. Por defecto, el del navegador. */
  locale?: string
  labels?: Partial<Labels["dataTable"]>
}

/** Estado controlado o no: el patrón de todos los componentes del paquete, en uno. */
function useControllable<V>(value: V | undefined, defaultValue: V, onChange?: (value: V) => void): [V, (value: V) => void] {
  const [own, setOwn] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : own
  const set = React.useCallback(
    (next: V) => {
      if (!controlled) setOwn(next)
      onChange?.(next)
    },
    [controlled, onChange]
  )
  return [current, set]
}

/** Sin tildes ni mayúsculas: «Óptica» y «optica» son lo mismo para buscar. */
const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

const textOf = (value: DataTableValue, dates?: Intl.DateTimeFormat) =>
  value == null ? "" : value instanceof Date ? (dates ?? new Intl.DateTimeFormat()).format(value) : String(value)

function compare(a: DataTableValue, b: DataTableValue, collator: Intl.Collator) {
  // Lo vacío al final en los dos sentidos no: va al final en ascendente, que es lo esperable.
  if (a == null || a === "") return b == null || b === "" ? 0 : 1
  if (b == null || b === "") return -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === "number" && typeof b === "number") return a - b
  return collator.compare(textOf(a), textOf(b))
}

const SORT_NEXT = { none: "asc", asc: "desc", desc: "none" } as const

function DataTable<T>({
  data,
  columns,
  getRowId,
  getRowLabel,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  filter = false,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  pageSize,
  paging = "pages",
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  selectable = false,
  selected: selectedProp,
  defaultSelected = [],
  onSelectedChange,
  groupBy,
  empty,
  loading = false,
  loadingRows,
  toolbar,
  locale,
  labels: labelsProp,
  className,
  "aria-label": ariaLabel,
  ...props
}: DataTableProps<T>) {
  const allLabels = useLabels()
  const labels = { ...allLabels.dataTable, ...defined(labelsProp) }
  const [sort, setSort] = useControllable(sortProp, defaultSort, onSortChange)
  const [query, setQuery] = useControllable(queryProp, defaultQuery, onQueryChange)
  const [page, setPage] = useControllable(pageProp, defaultPage, onPageChange)
  const [selected, setSelected] = useControllable(selectedProp, defaultSelected, onSelectedChange)
  // «Cargar más» cuenta páginas cargadas: no es la `page` de la paginación y no se controla.
  const [loaded, setLoaded] = React.useState(1)
  // Con otros datos, «Cargar más» vuelve a una página (ajuste en el render, sin un effect).
  const [loadedFor, setLoadedFor] = React.useState(data)
  if (loadedFor !== data) {
    setLoadedFor(data)
    setLoaded(1)
  }

  const collator = React.useMemo(() => new Intl.Collator(locale, { numeric: true, sensitivity: "base" }), [locale])
  const dates = React.useMemo(() => new Intl.DateTimeFormat(locale), [locale])

  const rows = React.useMemo(() => {
    let out = data
    const needle = normalize(query.trim())
    if (needle) {
      const searchable = columns.filter((column) => column.value && column.searchable !== false)
      out = out.filter((row) => searchable.some((column) => normalize(textOf(column.value!(row), dates)).includes(needle)))
    }
    const column = sort && columns.find((item) => item.id === sort.id)
    if (sort && column?.value) {
      const factor = sort.direction === "asc" ? 1 : -1
      // `sort` estable (ES2019): a igual valor, se respeta el orden de `data`.
      out = [...out].sort((a, b) => factor * compare(column.value!(a), column.value!(b), collator))
    }
    return out
  }, [data, columns, query, sort, collator, dates])

  const total = rows.length
  const pageCount = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const currentPage = Math.min(Math.max(1, page), pageCount)
  const visible = !pageSize
    ? rows
    : paging === "more"
      ? rows.slice(0, loaded * pageSize)
      : rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const visibleIds = visible.map(getRowId)

  // Una página controlada que dejó de existir (menos datos, otra búsqueda) se corrige.
  React.useEffect(() => {
    if (pageSize && paging === "pages" && page !== currentPage) setPage(currentPage)
  }, [pageSize, paging, page, currentPage, setPage])

  // Cambiar la búsqueda o el orden vuelve a la primera página: la 3 de otro resultado no es nada.
  const resetPage = () => {
    if (page !== 1) setPage(1)
    setLoaded(1)
  }

  const selectedSet = new Set(selected)
  const checkedCount = visibleIds.filter((id) => selectedSet.has(id)).length
  const allChecked = visibleIds.length > 0 && checkedCount === visibleIds.length
  const someChecked = checkedCount > 0 && !allChecked

  const toggleRow = (id: string, checked: boolean) =>
    setSelected(checked ? [...selected.filter((item) => item !== id), id].sort((a, b) => order(a) - order(b)) : selected.filter((item) => item !== id))
  // La selección se devuelve en el orden de `data`, no en el de los clicks.
  const index = React.useMemo(() => new Map(data.map((row, position) => [getRowId(row), position])), [data, getRowId])
  const order = (id: string) => index.get(id) ?? Number.MAX_SAFE_INTEGER
  const toggleAll = (checked: boolean) => {
    const others = selected.filter((id) => !visibleIds.includes(id))
    setSelected(checked ? [...others, ...visibleIds].sort((a, b) => order(a) - order(b)) : others)
  }

  const colCount = columns.length + (selectable ? 1 : 0)
  const rowLabel = (row: T) => getRowLabel?.(row) ?? (textOf(columns[0]?.value?.(row), dates) || getRowId(row))

  const renderRow = (row: T) => {
    const id = getRowId(row)
    const isSelected = selectedSet.has(id)
    return (
      <TableRow key={id} data-state={isSelected ? "selected" : undefined}>
        {selectable && (
          <TableCell className="w-10 pe-0">
            <Checkbox
              aria-label={`${labels.selectRow} ${rowLabel(row)}`}
              checked={isSelected}
              onCheckedChange={(checked) => toggleRow(id, checked)}
              // Sobre la fila elegida en el acento, la casilla marcada del mismo acento no se
              // vería: pasa al color de contraste con el tilde en el acento.
              className="group-data-[state=selected]/table-row:group-focus-within/table:data-checked:bg-on-selection group-data-[state=selected]/table-row:group-focus-within/table:data-checked:text-selection"
            />
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell key={column.id} numeric={column.numeric} className={column.className}>
            {column.cell ? column.cell(row) : textOf(column.value?.(row), dates)}
          </TableCell>
        ))}
      </TableRow>
    )
  }

  let body: React.ReactNode
  if (loading) {
    body = (
      <TableBody>
        {Array.from({ length: loadingRows ?? pageSize ?? 5 }, (_, row) => (
          // Los esqueletos no se leen: la región viva dice «Cargando…».
          <TableRow key={row} aria-hidden="true">
            {Array.from({ length: colCount }, (_, cell) => (
              <TableCell key={cell}>
                <Skeleton className={cn("h-3.5 rounded-tag", cell === 0 && selectable ? "size-4" : cell === (selectable ? 1 : 0) ? "w-40" : "w-20")} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    )
  } else if (!visible.length) {
    body = (
      <TableBody>
        <TableRow>
          <TableCell colSpan={colCount} className="h-24 text-center text-callout whitespace-normal text-label-secondary first:text-callout first:text-label-secondary">
            {empty ?? labels.empty}
          </TableCell>
        </TableRow>
      </TableBody>
    )
  } else if (groupBy) {
    const groups = new Map<string, T[]>()
    for (const row of visible) {
      const key = groupBy(row)
      groups.set(key, [...(groups.get(key) ?? []), row])
    }
    // El contador es el del grupo entero (con la búsqueda), no el de la página.
    const counts = new Map<string, number>()
    for (const row of rows) counts.set(groupBy(row), (counts.get(groupBy(row)) ?? 0) + 1)
    const countOf = (key: string) => counts.get(key) ?? 0
    body = [...groups].map(([key, groupRows]) => (
      <TableBody key={key}>
        <TableGroupHeader colSpan={colCount} count={`${countOf(key)} ${countOf(key) === 1 ? labels.item : labels.items}`}>
          {key}
        </TableGroupHeader>
        {groupRows.map(renderRow)}
      </TableBody>
    ))
  } else {
    body = <TableBody>{visible.map(renderRow)}</TableBody>
  }

  const selectedText = `${selected.length} ${selected.length === 1 ? labels.selectedOne : labels.selectedMany}`
  const statusNow = loading
    ? allLabels.tree.loading
    : [filter && `${total} ${total === 1 ? labels.result : labels.results}`, selectable && selected.length > 0 && selectedText].filter(Boolean).join(", ")
  const [status, setStatus] = React.useState("")
  React.useEffect(() => {
    const timer = setTimeout(() => setStatus(statusNow), 400)
    return () => clearTimeout(timer)
  }, [statusNow])

  return (
    <div data-slot="data-table" className="flex w-full flex-col gap-2">
      {(filter || toolbar) && (
        <div data-slot="data-table-toolbar" className="flex flex-wrap items-center gap-2">
          {filter && (
            <div className="relative w-full max-w-xs">
              <SearchIcon aria-hidden="true" className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-label-secondary" />
              <Input
                aria-label={labels.search}
                className="ps-8"
                onChange={(event) => {
                  setQuery(event.target.value)
                  resetPage()
                }}
                placeholder={labels.search}
                type="search"
                value={query}
              />
            </div>
          )}
          {toolbar && <div className="ms-auto flex items-center gap-2">{toolbar}</div>}
        </div>
      )}
      {/* El total y lo elegido, para quien no ve la tabla achicarse al buscar ni la selección que
          quedó en otra página. Se anuncia al dejar de tipear. */}
      {(filter || selectable || loading) && (
        <p role="status" className="sr-only">
          {status}
        </p>
      )}
      <Table aria-busy={loading || undefined} aria-label={ariaLabel} className={className} {...props}>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10 pe-0">
                <Checkbox
                  aria-label={labels.selectAll}
                  checked={allChecked}
                  disabled={loading || !visible.length}
                  indeterminate={someChecked}
                  onCheckedChange={(checked) => toggleAll(checked)}
                />
              </TableHead>
            )}
            {columns.map((column) => {
              const direction = sort?.id === column.id ? sort.direction : null
              return (
                <TableHead
                  key={column.id}
                  aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : undefined}
                  numeric={column.numeric}
                  className={column.className}
                >
                  {column.sortable && column.value ? (
                    <button
                      type="button"
                      data-slot="data-table-sort"
                      onClick={() => {
                        const next = SORT_NEXT[direction ?? "none"]
                        setSort(next === "none" ? null : { id: column.id, direction: next })
                        resetPage()
                      }}
                      className={cn(
                        "-mx-1.5 inline-flex h-7 cursor-pointer items-center gap-1 rounded-control px-1.5 outline-none transition-control hover:bg-fill-1 hover:text-label focus-visible:focus-ring",
                        direction && "text-label",
                        column.numeric && "flex-row-reverse"
                      )}
                    >
                      {column.header}
                      {/* La flecha es decorativa: el orden lo dice `aria-sort` en la cabecera. */}
                      {direction === "desc" ? (
                        <ChevronDownIcon aria-hidden="true" className="size-3.5" />
                      ) : (
                        <ChevronUpIcon aria-hidden="true" className={cn("size-3.5", !direction && "invisible")} />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        {body}
      </Table>
      {pageSize && !loading && paging === "pages" && pageCount > 1 && (
        <Pagination className="pt-2" onPageChange={setPage} page={currentPage} pageCount={pageCount} size="sm" />
      )}
      {pageSize && !loading && paging === "more" && visible.length < total && (
        <div className="flex justify-center pt-2">
          <Button onClick={() => setLoaded(loaded + 1)} size="sm" variant="plain">
            {labels.loadMore}
          </Button>
        </div>
      )}
    </div>
  )
}


type DataTableProps<T> = DataTablePropsBase<T> & AccessibleName

export { DataTable, type DataTableColumn, type DataTableProps, type DataTableSort, type DataTableValue }
