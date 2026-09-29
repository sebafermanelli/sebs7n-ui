import * as React from "react"

import { categoryFill } from "../internal/category-color.js"
import { renderElement, type RenderElement } from "../lib/render.js"
import { cn } from "../lib/utils.js"
import type { BadgeColor } from "../variants/badge.js"

/**
 * La lista de filas de iCloud (catálogo §2.4 y §2.19): la de Mail, Contactos o el desglose de
 * Almacenamiento. Ícono de 32 (o avatar), título en 17, detalle en 14 gris debajo —o en una columna
 * del medio con `inline`—, un valor a la derecha, un punto de color de 8 y el chevron de las filas
 * que navegan. Separadores interiores que arrancan donde empieza el texto y fila elegida en el acento
 * mientras la lista tiene el foco (gris sin foco), como la de Drive.
 *
 * `List` es la lista (`<ul>`), `ListSection` un grupo con su cabecera de 19/600 y el total a la
 * derecha, y `ListRow` cada fila (`<li>`). Sin estado: va en un Server Component.
 */
type ListProps = React.ComponentProps<"ul">

// `tabIndex={-1}` como la `Table`: un click en una fila que no es un botón deja el foco en la lista,
// y la elegida sigue en el acento (`group-focus-within/list`) sin entrar en el orden de Tab.
function List({ className, ...props }: ListProps) {
  return <ul data-slot="list" role="list" tabIndex={-1} className={cn("group/list flex flex-col outline-none", className)} {...props} />
}

type ListSectionProps = Omit<React.ComponentProps<"li">, "title"> & {
  /** El título del grupo («Usado por vos»), en 19/600. Es el nombre de la lista de adentro. */
  title: React.ReactNode
  /** El total a la derecha de la cabecera («23,6 GB»), en 19/600 con cifras tabulares. */
  total?: React.ReactNode
}

// El grupo: la cabecera de Almacenamiento («Usado por vos · 23,6 GB») y su propia lista, nombrada por
// el título. Es un `<li>` de la lista de afuera: la anidación es la de una lista de listas.
function ListSection({ className, title, total, children, ...props }: ListSectionProps) {
  const id = React.useId()
  return (
    <li data-slot="list-section" className={cn("flex flex-col not-first:mt-4", className)} {...props}>
      <div data-slot="list-section-header" className="flex min-h-12 items-end justify-between gap-4 px-2.5 pb-2">
        <span id={id} className="min-w-0 truncate text-title-3 text-label">
          {title}
        </span>
        {total != null && <span className="shrink-0 text-title-3 text-label tabular-nums">{total}</span>}
      </div>
      <ul role="list" aria-labelledby={id} className="flex flex-col">
        {children}
      </ul>
    </li>
  )
}

type ListRowProps = Omit<React.ComponentProps<"li">, "title" | "onClick"> & {
  /** La primera línea (17, texto principal). Sin `title`, la fila dibuja sus hijos. */
  title?: React.ReactNode
  /** El detalle (14 gris, debajo del título). Con `inline`, una columna del medio en 17. */
  description?: React.ReactNode
  /** El detalle en una columna del medio, como el desglose de Almacenamiento («Todos los archivos»). */
  inline?: boolean
  /** A la derecha: un importe, un tamaño, una hora (cifras tabulares). */
  trailing?: React.ReactNode
  /** Ícono o avatar, en una caja de 32. Decorativo: el título nombra la fila. */
  icon?: React.ReactNode
  /** Un punto de 8 del color de la categoría, al final. Decorativo: el color no puede ser el único dato. */
  dot?: BadgeColor
  /** El chevron › de una fila que navega a otra pantalla. */
  chevron?: boolean
  /**
   * La fila elegida: acento sólido mientras la lista tiene el foco, gris sin foco. En una fila
   * interactiva suma `aria-current="true"` (el ítem abierto en el panel de detalle).
   */
  selected?: boolean
  /** Hace la fila un `<button>`. Para navegar, `render={<a href="…" />}`. */
  onClick?: React.MouseEventHandler<HTMLElement>
  /** El elemento interactivo de la fila: un `<a>`, el `Link` de Next. Recibe el contenido y las clases. */
  render?: RenderElement
}

function ListRow({
  className,
  title,
  description,
  inline = false,
  trailing,
  icon,
  dot,
  chevron = false,
  selected = false,
  onClick,
  render,
  children,
  ...props
}: ListRowProps) {
  const interactive = render != null || onClick != null
  const content = (
    <>
      {icon != null && (
        <span
          data-slot="list-row-icon"
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[5px] text-brand-900 inside-selection:text-on-selection [&>img]:size-full [&>svg]:size-5"
        >
          {icon}
        </span>
      )}
      {title != null ? (
        <span className={cn("flex min-w-0 flex-1", inline ? "items-baseline gap-4" : "flex-col gap-0.5")}>
          <span className={cn("truncate text-body text-label", inline && "min-w-0 flex-1")}>{title}</span>
          {description != null && (
            <span
              className={cn(
                "truncate text-label-secondary inside-selection:text-on-selection",
                inline ? "min-w-0 flex-1 text-body" : "text-callout"
              )}
            >
              {description}
            </span>
          )}
        </span>
      ) : null}
      {children}
      {trailing != null && <span className="shrink-0 text-body text-label tabular-nums">{trailing}</span>}
      {dot != null && (
        <span
          data-slot="list-row-dot"
          aria-hidden="true"
          className={cn("size-2 shrink-0 rounded-full inside-selection:outline-[1.5px] inside-selection:outline-on-selection inside-selection:outline-solid", categoryFill[dot])}
        />
      )}
      {chevron && (
        <svg
          data-slot="list-row-chevron"
          aria-hidden="true"
          viewBox="0 0 8 13"
          className="h-[13px] w-2 shrink-0 fill-none stroke-current stroke-[1.75] text-label-tertiary inside-selection:text-on-selection"
        >
          <path d="M1.5 1.5 6.5 6.5 1.5 11.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  )
  const inner = cn(
    "flex min-h-11 w-full min-w-0 items-center gap-3 rounded-item px-2.5 py-2 text-left outline-none",
    interactive && "cursor-pointer focus-visible:focus-ring group-data-[state=selected]/selectable:focus-visible:focus-ring-inverse"
  )
  return (
    <li
      data-slot="list-row"
      data-state={selected ? "selected" : undefined}
      data-icon={icon != null ? "" : undefined}
      className={cn(
        "group/selectable relative rounded-item text-label transition-control [--list-row-inset:10px] data-icon:[--list-row-inset:54px]",
        // El separador interior: arranca donde empieza el texto (a 10, o a 54 con ícono) y no va en la
        // primera fila ni al lado de la fila con el puntero o la elegida, como en Drive.
        "before:pointer-events-none before:absolute before:end-2.5 before:top-0 before:start-(--list-row-inset) before:h-px before:bg-separator",
        "first:before:hidden hover:before:hidden data-[state=selected]:before:hidden [li:hover+&]:before:hidden [[data-state=selected]+&]:before:hidden",
        interactive && !selected && "hover:bg-fill-1",
        "data-[state=selected]:bg-selection-inactive data-[state=selected]:group-focus-within/list:bg-selection data-[state=selected]:group-focus-within/list:text-on-selection",
        "data-[state=selected]:group-focus-within/list:[&_.text-label]:text-on-selection",
        className
      )}
      {...props}
    >
      {interactive
        ? renderElement(render, "button", {
            type: render == null ? "button" : undefined,
            onClick,
            "aria-current": selected ? "true" : undefined,
            className: inner,
            children: content,
          })
        : <div className={inner}>{content}</div>}
    </li>
  )
}

export { List, ListRow, ListSection, type ListProps, type ListRowProps, type ListSectionProps }
