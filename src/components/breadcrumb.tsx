import { ChevronRightIcon } from "lucide-react"
import * as React from "react"

import { renderElement, type RenderElement } from "../lib/render.js"
import { cn } from "../lib/utils.js"
import { linkVariants } from "../variants/link.js"

type BreadcrumbProps = React.ComponentProps<"nav">

/**
 * Dónde estoy dentro de la jerarquía del sitio. Es un `<nav>` con nombre, y
 * adentro va un `<ol>`: el orden de los ítems es información, no estilo.
 *
 * Dentro de `PageHeader` no hace falta este `<nav>` —lo pone la prop
 * `breadcrumb`—: ahí va `BreadcrumbList` suelto, o se anidan dos landmarks.
 */
function Breadcrumb({ className, "aria-label": ariaLabel = "Migas de pan", ...props }: BreadcrumbProps) {
  return <nav data-slot="breadcrumb" aria-label={ariaLabel} className={cn("min-w-0", className)} {...props} />
}

/** Marca interna del hueco que deja el colapso. */
const ELLIPSIS = Symbol("breadcrumb-ellipsis")

type BreadcrumbListProps = Omit<React.ComponentProps<"ol">, "children"> & {
  children?: React.ReactNode
  /** El separador entre ítems. Es decoración: va `aria-hidden`. */
  separator?: React.ReactNode
  /** A partir de cuántos ítems se colapsa el medio en «…». Sin valor no colapsa nunca. */
  maxItems?: number
  /** Cuántos ítems quedan antes del «…». */
  itemsBefore?: number
  /** Cuántos ítems quedan después del «…». El último es la página actual. */
  itemsAfter?: number
  /** Nombre accesible del «…». */
  ellipsisLabel?: string
}

/**
 * El `<ol>`. Pone los separadores entre los ítems —el llamador no los escribe—
 * y, con `maxItems`, colapsa el medio en un «…».
 */
function BreadcrumbList({
  className,
  children,
  separator,
  maxItems,
  itemsBefore = 1,
  itemsAfter = 2,
  ellipsisLabel = "Rutas intermedias",
  ...props
}: BreadcrumbListProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement)
  // Se colapsa solo si el «…» reemplaza dos o más ítems: por uno, no vale la pena esconderlo.
  const collapse = maxItems !== undefined && items.length > maxItems && items.length > itemsBefore + itemsAfter + 1
  const visible: (React.ReactElement | typeof ELLIPSIS)[] = collapse
    ? [...items.slice(0, itemsBefore), ELLIPSIS, ...items.slice(items.length - itemsAfter)]
    : items

  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn("flex min-w-0 flex-wrap items-center gap-1.5 text-label-13 text-gray-900", className)}
      {...props}
    >
      {visible.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
          {item === ELLIPSIS ? <BreadcrumbEllipsis label={ellipsisLabel} /> : item}
        </React.Fragment>
      ))}
    </ol>
  )
}

/** Un nivel: adentro va un `BreadcrumbLink` o, en el último, un `BreadcrumbPage`. */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex min-w-0 items-center gap-1.5", className)} {...props} />
}

type BreadcrumbLinkProps = Omit<React.ComponentProps<"a">, "className"> & {
  className?: string
  /** El elemento que se renderiza en lugar del `<a>`: `render={<Link href="/facturas" />}`. */
  render?: RenderElement
}

/**
 * El link de un nivel. Usa `linkVariants({ variant: "subtle" })`, como cualquier link suelto del
 * sistema.
 *
 * El `py-1` no es aire decorativo: el texto es `text-label-13`, de 16px de alto, y sin él el link
 * medía 16px de alto —abajo de los 24 que pide WCAG 2.5.8— y en un celular se erraba. Como el
 * `BreadcrumbItem` es un flex container, el `<a>` es un ítem de flex y el padding sí cuenta para el
 * alto; en un `<a>` inline suelto no contaría.
 */
function BreadcrumbLink({ className, render, ...props }: BreadcrumbLinkProps) {
  return renderElement(render, "a", {
    "data-slot": "breadcrumb-link",
    ...props,
    className: cn(linkVariants({ variant: "subtle" }), "truncate py-1", className),
  })
}

/**
 * El último nivel: la página en la que estás. No es un link —no se navega a
 * donde ya estás— y lleva `aria-current="page"`.
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn("truncate text-gray-1000", className)}
      {...props}
    />
  )
}

/** El separador. Lo pone `BreadcrumbList`; suelto sirve para armar la lista a mano. */
function BreadcrumbSeparator({ className, children, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center text-gray-700 [&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  )
}

type BreadcrumbEllipsisProps = Omit<React.ComponentProps<"li">, "children"> & {
  /** Nombre accesible: el «…» en sí es decoración. */
  label?: string
}

/** El «…» de los niveles colapsados. Con `maxItems` lo pone `BreadcrumbList`. */
function BreadcrumbEllipsis({ className, label = "Rutas intermedias", ...props }: BreadcrumbEllipsisProps) {
  return (
    <li
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      // Mismo criterio que el «…» del Pagination: los puntos avisan que hay
      // niveles colapsados, así que son información y no adorno. El separador
      // de al lado sí se queda en `gray-700` —un chevron más oscuro competiría
      // con los nombres de las rutas, y la jerarquía ya la da el orden—.
      className={cn("inline-flex shrink-0 items-center text-gray-900", className)}
      {...props}
    >
      <span aria-hidden="true">…</span>
      <span className="sr-only">{label}</span>
    </li>
  )
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  type BreadcrumbListProps,
  type BreadcrumbProps,
}
