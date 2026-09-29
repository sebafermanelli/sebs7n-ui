import type * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.js"
import { cardVariants } from "../variants/card.js"

/**
 * El widget de iCloud (catálogo §2.7): una franja de cabecera (`CardHeader`, con ícono de app,
 * título y subtítulo opcionales y una acción arriba a la derecha), un cuerpo (`CardContent`, libre
 * o en filas `CardRow` con separadores interiores, en una o dos columnas) y, si hace falta, la fila
 * del «…» abajo (`CardFooter`), sin línea ni franja.
 *
 * El uso simple de 1.x sigue andando: `Card` > `CardHeader` (`CardTitle`, `CardDescription`,
 * `CardAction`) > `CardContent` > `CardFooter`.
 */
type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>

function Card({ className, variant, size = "md", interactive, selected, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant ?? "default"}
      data-size={size}
      data-selected={selected ? "" : undefined}
      className={cn(cardVariants({ variant, size, interactive, selected }), className)}
      {...props}
    />
  )
}

type CardHeaderProps = React.ComponentProps<"div"> & {
  /**
   * El ícono de la app, a la izquierda del título: una caja de 40 (el ícono de 40 de los widgets
   * de iCloud). Es decorativo: el título ya nombra la card.
   */
  icon?: React.ReactNode
}

// La franja: 80 de alto en `md` (la de iCloud), `surface-bar` sobre el cuerpo `surface`: más gris
// en claro, más clara en oscuro. Grilla de hasta tres columnas —ícono, textos, acción— y dos filas
// —título y subtítulo—, centrada en alto.
function CardHeader({ className, icon, children, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      data-icon={icon != null ? "" : undefined}
      className={cn(
        "group/card-header grid min-h-20 auto-rows-min content-center items-center gap-x-4 gap-y-0.5 bg-surface-bar px-(--card-spacing) py-3.5 group-data-[size=sm]/card:min-h-0 group-data-[size=sm]/card:py-3",
        // La franja es del widget: adentro de una card hundida (`subtle`) la cabecera va sin fondo.
        "group-data-[variant=subtle]/card:bg-transparent",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto] data-icon:grid-cols-[auto_1fr] data-icon:has-data-[slot=card-action]:grid-cols-[auto_1fr_auto]",
        className
      )}
      {...props}
    >
      {icon != null && (
        <span
          data-slot="card-icon"
          aria-hidden="true"
          className="row-span-2 row-start-1 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-control [&>svg]:size-full [&>img]:size-full"
        >
          {icon}
        </span>
      )}
      {children}
    </div>
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("min-w-0 text-title-2 text-label group-data-icon/card-header:col-start-2 group-data-[size=sm]/card:text-title-3", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("min-w-0 text-callout text-label-secondary group-data-icon/card-header:col-start-2", className)}
      {...props}
    />
  )
}

// La acción de la franja, arriba a la derecha (el «redactar» de un widget de iCloud): un botón de
// ícono en el acento. `col-end-[-1]` la manda a la última columna haya o no ícono.
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-end-[-1] row-span-2 row-start-1 -me-2 -mt-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

type CardContentProps = React.ComponentProps<"div"> & {
  /**
   * `2`: el cuerpo de un widget grande de iCloud, dos columnas separadas por una regla vertical. Las
   * `CardRow` se reparten de izquierda a derecha, fila por fila.
   */
  columns?: 1 | 2
}

// El cuerpo. Libre, con el padding de la card; con filas (`CardRow`) el padding baja a 10 porque
// cada fila trae el suyo, y así el texto de las filas queda alineado con el ícono de la franja.
function CardContent({ className, columns = 1, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      data-columns={columns}
      className={cn(
        "relative p-(--card-spacing) has-data-[slot=card-row]:p-2.5",
        "data-[columns=2]:grid data-[columns=2]:grid-cols-2 data-[columns=2]:gap-x-10",
        "data-[columns=2]:before:absolute data-[columns=2]:before:inset-y-(--card-spacing) data-[columns=2]:before:left-1/2 data-[columns=2]:before:w-px data-[columns=2]:before:bg-fill-3",
        "data-[columns=2]:[&>[data-slot=card-row]:nth-child(2)]:before:hidden",
        className
      )}
      {...props}
    />
  )
}

type CardRowProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Primera línea (14, texto principal). Sin `title` ni `description`, la fila dibuja sus hijos. */
  title?: React.ReactNode
  /** Segunda línea (12, secundario). */
  description?: React.ReactNode
  /** A la derecha de la primera línea: una hora, un ícono (12, secundario). */
  trailing?: React.ReactNode
}

// Una fila del cuerpo de un widget: 60 de alto, radio 8, `0 10px`, y el separador interior de 1 px
// (a 10 de cada lado) arriba de todas menos la primera.
function CardRow({ className, title, description, trailing, children, ...props }: CardRowProps) {
  const estructurada = title != null || description != null
  return (
    <div
      data-slot="card-row"
      className={cn(
        "relative flex min-h-15 min-w-0 flex-col justify-center gap-0.5 rounded-control px-2.5 py-2 text-callout text-label",
        "before:absolute before:inset-x-2.5 before:top-0 before:h-px before:bg-separator first:before:hidden",
        className
      )}
      {...props}
    >
      {estructurada ? (
        <>
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="min-w-0 flex-1 truncate text-callout text-label">{title}</span>
            {trailing != null && <span className="shrink-0 text-footnote text-label-secondary tabular-nums">{trailing}</span>}
          </div>
          {description != null && <span className="truncate text-footnote text-label-secondary">{description}</span>}
        </>
      ) : (
        children
      )}
    </div>
  )
}

// La fila de abajo de un widget: el «…» que abre el resto (a la izquierda) y un filtro a la derecha,
// si hay. Sin línea ni franja, y con poco aire: un botón de ícono de 28.
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex min-h-10 items-center justify-between gap-2 px-(--card-spacing) pb-2", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardRow,
  CardTitle,
  type CardContentProps,
  type CardHeaderProps,
  type CardProps,
  type CardRowProps,
}
