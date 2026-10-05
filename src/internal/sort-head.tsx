import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "../lib/utils.js"

type SortDirection = "asc" | "desc"

/** El ciclo de un encabezado ordenable: sin orden → ascendente → descendente → sin orden. */
const nextSortDirection = (current: SortDirection | null | undefined): SortDirection | null => (current === "asc" ? "desc" : current === "desc" ? null : "asc")

/** `aria-sort` de un `<th>` según su dirección. */
const ariaSort = (direction: SortDirection | null | undefined) => (direction === "asc" ? "ascending" : direction === "desc" ? "descending" : undefined)

/**
 * El aspecto del botón o link de un encabezado ordenable. Lo comparten `DataTable` y `SortableTableHead`:
 * un solo lugar, así no se desfasan.
 */
const sortHeadClassName = (direction: SortDirection | null | undefined, numeric?: boolean) =>
  cn(
    "-mx-1.5 inline-flex h-7 cursor-pointer items-center gap-1 rounded-control px-1.5 outline-none transition-control hover:bg-fill-1 hover:text-label focus-visible:focus-ring",
    direction && "text-label",
    numeric && "flex-row-reverse"
  )

/** La flecha: decorativa, el orden lo dice `aria-sort` en la cabecera. Reserva su lugar sin orden (no salta el ancho). */
function SortIndicator({ direction }: { direction: SortDirection | null | undefined }) {
  return direction === "desc" ? (
    <ChevronDownIcon aria-hidden="true" className="size-3.5" />
  ) : (
    <ChevronUpIcon aria-hidden="true" className={cn("size-3.5", !direction && "invisible")} />
  )
}

export { ariaSort, nextSortDirection, SortIndicator, sortHeadClassName, type SortDirection }
