import type * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { paginationRange } from "../lib/pagination.js"
import { renderElement, type RenderElement } from "../lib/render.js"
import { cn } from "../lib/utils.js"
import { buttonVariants } from "../variants/button.js"

type PaginationLabels = {
  previous?: string
  next?: string
  /** Nombre accesible de cada número. Por defecto, «Página 3». */
  page?: (page: number) => string
  /** Nombre accesible del «…». */
  ellipsis?: string
}

type PaginationProps = Omit<React.ComponentProps<"nav">, "children"> & {
  /** La página actual, en base 1. */
  page: number
  /** Cuántas páginas hay en total. Con 0, no se renderiza nada. */
  pageCount: number
  /** Cuántas páginas a cada lado de la actual. */
  siblings?: number
  /** Cuántas páginas fijas en cada punta. */
  boundaries?: number
  /** `sm` 32px · `md` 40px. */
  size?: "sm" | "md"
  /** Modo botones: se llama con la página destino. */
  onPageChange?: (page: number) => void
  /**
   * Modo links: devuelve el elemento de cada página.
   * `render={(page) => <Link href={`/facturas?page=${page}`} />}`.
   */
  render?: (page: number) => RenderElement
  labels?: PaginationLabels
}

/**
 * El paginador: anterior, números con «…», siguiente.
 *
 * Dos modos. Con `render` cada página es un `<a>` de verdad —el crawler la ve,
 * se abre en una pestaña nueva, se puede copiar el link— y es el que va cuando
 * la página vive en la URL. Con `onPageChange` son `<button>`, para una lista
 * que se pagina en el cliente sin cambiar de URL.
 *
 * Qué números mostrar lo decide `paginationRange` (`sebs7n-ui/lib/pagination`),
 * que es pura y se testea aparte.
 */
function Pagination({
  className,
  page,
  pageCount,
  siblings = 1,
  boundaries = 1,
  size = "md",
  onPageChange,
  render,
  labels,
  "aria-label": ariaLabel = "Paginación",
  ...props
}: PaginationProps) {
  const slots = paginationRange({ page, pageCount, siblings, boundaries })
  if (!slots.length) return null

  const total = Math.floor(pageCount)
  const current = Math.min(Math.max(Math.floor(page) || 1, 1), total)
  const iconSize = size === "sm" ? ("icon-sm" as const) : ("icon-md" as const)
  const pageLabel = labels?.page ?? ((target: number) => `Página ${target}`)

  function control(target: number, options: { slot: string; label: string; active?: boolean; children: React.ReactNode }) {
    // Fuera de rango: anterior en la página 1, siguiente en la última.
    const off = target < 1 || target > total
    const shared = {
      "data-slot": options.slot,
      "aria-label": options.label,
      "aria-current": options.active ? ("page" as const) : undefined,
      className: cn(
        buttonVariants({ variant: options.active ? "secondary" : "ghost", size: iconSize }),
        "text-button-14 tabular-nums",
        !options.active && "text-gray-900 hover:text-gray-1000",
        off && "text-gray-700 pointer-events-none"
      ),
      children: options.children,
    }
    // Sin destino: `aria-disabled` y no `disabled`, para no perder el foco al
    // llegar al final — es la misma decisión que `Button loading`.
    if (off) return <button type="button" aria-disabled="true" {...shared} />
    if (render) return renderElement(render(target), "a", shared)
    return <button type="button" onClick={onPageChange ? () => onPageChange(target) : undefined} {...shared} />
  }

  return (
    <nav data-slot="pagination" aria-label={ariaLabel} className={cn("flex w-full justify-center", className)} {...props}>
      <ul data-slot="pagination-list" className="flex flex-wrap items-center gap-1">
        <li>
          {control(current - 1, {
            slot: "pagination-previous",
            label: labels?.previous ?? "Página anterior",
            children: <ChevronLeftIcon />,
          })}
        </li>
        {slots.map((slot) =>
          slot.type === "ellipsis" ? (
            <li
              data-slot="pagination-ellipsis"
              role="presentation"
              // `gray-900` y no `gray-700`: los puntos son `aria-hidden`, pero
              // se ven, y en claro `gray-700` sobre la página da 3,23:1. Que al
              // lado haya un `sr-only` resuelve a quien escucha, no a quien mira.
              className={cn("inline-flex items-center justify-center text-gray-900", size === "sm" ? "size-8" : "size-10")}
              key={`ellipsis-${slot.side}`}
            >
              <span aria-hidden="true">…</span>
              <span className="sr-only">{labels?.ellipsis ?? "Más páginas"}</span>
            </li>
          ) : (
            <li key={slot.page}>
              {control(slot.page, {
                slot: "pagination-page",
                label: pageLabel(slot.page),
                active: slot.page === current,
                children: slot.page,
              })}
            </li>
          )
        )}
        <li>
          {control(current + 1, {
            slot: "pagination-next",
            label: labels?.next ?? "Página siguiente",
            children: <ChevronRightIcon />,
          })}
        </li>
      </ul>
    </nav>
  )
}

export { Pagination, type PaginationLabels, type PaginationProps }
