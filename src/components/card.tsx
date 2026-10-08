import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { renderElement, type RenderElement } from "../lib/render.js"
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
type CardProps = React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    /**
     * El elemento que se renderiza en lugar del `<div>`: una card que es un link entero,
     * `<Card interactive render={<Link href="/planes" />}>`. Sin estado: sigue sirviendo en un Server Component.
     */
    render?: RenderElement
    /**
     * Cuántas columnas ocupa dentro de un `CardGrid` (cards asimétricas: una ancha y dos angostas). Solo
     * cuenta si la grilla tiene esas columnas; por debajo, la card ocupa las que haya. `CardGrid` suma
     * los `span` para elegir sus columnas. Default 1.
     */
    span?: 1 | 2 | 3 | 4
  }

function Card({ className, variant, size = "md", interactive, selected, render, span = 1, ...props }: CardProps) {
  return renderElement(render, "div", {
    "data-slot": "card",
    "data-variant": variant ?? "default",
    "data-size": size,
    "data-selected": selected ? "" : undefined,
    "data-span": span > 1 ? span : undefined,
    className: cn(cardVariants({ variant, size, interactive, selected }), className),
    ...props,
  })
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
// El color lo pone la card en `--card-strip` (`variants/card.ts`): `surface-bar`; sobre el
// wallpaper, `translucent-strip` encima del cuerpo translúcido, sin blur propio; en la hundida
// (`subtle`), nada. Fuera de una Card, `surface-bar`.
function CardHeader({ className, icon, children, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      data-icon={icon != null ? "" : undefined}
      className={cn(
        // `last:grow`: si la cabecera cierra la card y una grilla estira la card, la franja la llena; si no,
        // abajo quedaba una banda del cuerpo, más oscura sobre el wallpaper.
        "group/card-header grid min-h-20 auto-rows-min content-center items-center gap-x-4 gap-y-0.5 px-(--card-spacing) py-3.5 last:grow",
        "bg-(--card-strip,var(--color-surface-bar)) group-data-[size=sm]/card:min-h-0 group-data-[size=sm]/card:py-3",
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
      className={cn("min-w-0 font-display text-title-2 text-label group-data-icon/card-header:col-start-2 group-data-[size=sm]/card:text-title-3", className)}
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
        // El pie lleva 4 px más que los otros lados: con el interlineado del texto la última línea parece pegada al borde
        // aunque los cuatro paddings midan lo mismo.
        "relative p-(--card-spacing) pb-[calc(var(--card-spacing)+0.25rem)] has-data-[slot=card-row]:p-2.5",
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

type CardGridProps = React.ComponentProps<"div"> & {
  /**
   * El máximo de columnas, según el ancho de la grilla y no el de la ventana: 2 desde 32 rem, 3 desde 48 rem y 4 desde 56 rem; por debajo de 32 rem, una.
   * La cantidad real sale de los hijos: con menos cards que `columns`, o si sobraría una huérfana, usa menos columnas.
   */
  columns?: 2 | 3 | 4
}

// Las clases escritas enteras: Tailwind no ve una armada con `${}`. Con 3 o 4 columnas, el paso
// intermedio de 2 solo existe si la cantidad es par (con una impar dejaría una huérfana).
const cardGridClasses = {
  1: "",
  2: "@lg:grid-cols-2",
  3: { even: "@lg:grid-cols-2 @3xl:grid-cols-3", odd: "@3xl:grid-cols-3" },
  4: { even: "@lg:grid-cols-2 @4xl:grid-cols-4", odd: "@4xl:grid-cols-4" },
} as const

/**
 * Cuántas columnas usa una grilla de `count` cards con un máximo de `max`: la que deja la última
 * fila más llena (completa si se puede), y a igualdad la mayor. 2 cards en una grilla de 3 → 2, no
 * 3 con un hueco; 4 cards en una de 3 → 2 + 2 y no 3 + 1.
 */
function cardGridColumnCount(count: number, max: 2 | 3 | 4): 1 | 2 | 3 | 4 {
  if (count < 2) return 1
  let best: 2 | 3 | 4 = 2
  let bestFill = -1
  for (const c of [2, 3, 4] as const) {
    if (c > max || c > count) break
    const fill = count % c === 0 ? c : count % c
    if (fill >= bestFill) {
      best = c
      bestFill = fill
    }
  }
  return best
}

/**
 * Una fila de cards que se leen juntas (planes, beneficios, testimonios). Cada `Card` comparte las
 * filas de la grilla (subgrid): la cabecera más alta fija la de todas, y lo mismo el cuerpo y el
 * pie. Una cabecera más baja que la de al lado, o un pie que no cae a la misma altura, es el error
 * que esto evita. Las cards van como hijas directas, con `CardHeader`, `CardContent` y `CardFooter`.
 *
 * Responde al ancho de **su contenedor** (container queries), no al de la ventana: se declara
 * `@container` en una caja propia, así un panel lateral abierto la achica igual que un teléfono, y
 * funciona igual fuera de un `AppShell`. `data-slot="card-grid"` y `className` van a la grilla interna.
 */
function CardGrid({ className, columns = 3, children, ...props }: CardGridProps) {
  // Las columnas salen de la cantidad de hijos, sin huérfanas ni huecos; `columns` es el máximo.
  // Una card con `span` cuenta por las columnas que ocupa (cards asimétricas).
  const count = React.Children.toArray(children).reduce<number>((sum, child) => sum + (React.isValidElement<{ span?: number }>(child) ? (child.props.span ?? 1) : 1), 0)
  const cols = cardGridColumnCount(count, columns)
  const entry = cardGridClasses[cols]
  const colClass = typeof entry === "string" ? entry : count % 2 === 0 ? entry.even : entry.odd
  return (
    <div data-slot="card-grid-container" className="@container w-full">
    <div
      data-slot="card-grid"
      className={cn(
        // Sin gap vertical: separaría también las filas internas de cada card (una card sin pie
        // quedaba con aire vacío abajo). Entre filas de cards, el margen de cada una, compensado al final.
        "-mb-4 grid grid-cols-1 gap-x-4 gap-y-0 [&>[data-slot=card]]:mb-4",
        colClass,
        "[&>[data-slot=card]]:row-span-3 [&>[data-slot=card]]:grid [&>[data-slot=card]]:grid-rows-subgrid [&>[data-slot=card]]:gap-0",
        // La franja crece hasta la más alta de la fila: el texto arranca arriba, no centrado.
        "[&>[data-slot=card]>[data-slot=card-header]]:content-start",
        className
      )}
      {...props}
    >
      {children}
    </div>
    </div>
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardGrid,
  CardHeader,
  CardRow,
  CardTitle,
  type CardContentProps,
  type CardGridProps,
  type CardHeaderProps,
  type CardProps,
  type CardRowProps,
}
