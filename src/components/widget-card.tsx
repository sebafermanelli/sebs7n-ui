import * as React from "react"

import { renderElement, type RenderElement } from "../lib/render.js"
import { cn } from "../lib/utils.js"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card.js"

/**
 * El widget de iCloud Home (catálogo §2.7) armado de una: la franja con el ícono de la app (40), el
 * título (21/600), el subtítulo (14 gris) y la acción arriba a la derecha; el cuerpo en filas
 * (`CardRow`, en una o dos columnas) y la fila del «…» abajo. Son las partes de `Card`: cuando hace
 * falta otra forma, se arma con ellas.
 *
 * Sobre el wallpaper (`AppShell ambient`) es la `Card` translúcida: el cuerpo con blur
 * (`material-translucent-body`) y la franja encima, como Home. En cualquier otro lado es opaca.
 */
type WidgetCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** El título (21/600). Es el nombre de la región. */
  title: React.ReactNode
  /** Debajo del título, en 14 gris: «3 por cobrar», «Actualizado hace 5 min». */
  subtitle?: React.ReactNode
  /** El ícono de la app, en una caja de 40. Decorativo. */
  icon?: React.ReactNode
  /** La acción de arriba a la derecha: un `Button plain size="icon-md"` («redactar», «nuevo»). */
  action?: React.ReactNode
  /** El «…» de abajo a la izquierda: un `Button plain size="icon-sm"` o el disparador de un menú. */
  more?: React.ReactNode
  /** Abajo a la derecha: un filtro. */
  filter?: React.ReactNode
  /** `2` reparte las filas en dos columnas con una regla vertical (el widget grande). */
  columns?: 1 | 2
}

function WidgetCard({ className, title, subtitle, icon, action, more, filter, columns, children, ...props }: WidgetCardProps) {
  const id = React.useId()
  return (
    <Card role="region" aria-labelledby={id} className={className} {...props}>
      <CardHeader icon={icon}>
        <CardTitle id={id}>{title}</CardTitle>
        {subtitle != null && <CardDescription>{subtitle}</CardDescription>}
        {action != null && <CardAction>{action}</CardAction>}
      </CardHeader>
      {/* Sin fondo: el cuerpo lo pinta la Card (opaco, o translúcido sobre el wallpaper). */}
      <div data-slot="widget-card-body" className="flex flex-1 flex-col">
        <CardContent columns={columns} className="flex-1">
          {children}
        </CardContent>
        {(more != null || filter != null) && (
          <CardFooter>
            <span>{more}</span>
            {filter}
          </CardFooter>
        )}
      </div>
    </Card>
  )
}

type PromoCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** El título grande (48/700). Es el nombre de la región. */
  title: React.ReactNode
  /** El chip translúcido de abajo a la derecha: el plan, el espacio («200 GB»). */
  chip?: React.ReactNode
}

// La card de «iCloud+» de Settings: degradado de marca, radio 24, título grande arriba, los links con
// chevron abajo a la izquierda y el chip translúcido abajo a la derecha. El texto es el color de
// contraste de la marca (el par del botón `accent`: blanco con un azul, negro con un amarillo) sobre
// el acento y un tono un cuarto más oscuro, igual en los dos temas.
function PromoCard({ className, title, chip, children, ...props }: PromoCardProps) {
  const id = React.useId()
  return (
    <div
      role="region"
      aria-labelledby={id}
      data-slot="promo-card"
      className={cn(
        "relative grid min-h-64 grid-cols-[1fr_auto] grid-rows-[1fr_auto] gap-4 overflow-hidden rounded-3xl p-7 text-brand-contrast",
        "bg-[linear-gradient(135deg,var(--color-brand-700),color-mix(in_oklch,var(--color-brand-700),#000_25%))] shadow-[0_2px_4px_color-mix(in_oklch,var(--color-brand-700),transparent_80%),0_6px_16px_color-mix(in_oklch,var(--color-brand-700),transparent_70%)]",
        className
      )}
      {...props}
    >
      <div id={id} className="col-span-2 text-large-title font-bold">
        {title}
      </div>
      <div className="flex flex-col items-start gap-1 self-end">{children}</div>
      {chip != null && (
        <span className="self-end rounded-menu bg-brand-contrast/20 px-3 py-1.5 text-title-3 tabular-nums backdrop-blur-md">{chip}</span>
      )}
    </div>
  )
}

type PromoCardLinkProps = React.ComponentProps<"a"> & {
  /** El elemento del link: el `Link` de Next. Recibe el contenido y las clases. */
  render?: RenderElement
}

// «Plan ›»: 17/600 en el color de contraste con el chevron, el link de texto de iCloud sobre el degradado.
function PromoCardLink({ className, render, children, ...props }: PromoCardLinkProps) {
  return renderElement(render, "a", {
    ...props,
    "data-slot": "promo-card-link",
    className: cn(
      "-mx-1.5 inline-flex items-center gap-1 rounded-control px-1.5 py-0.5 text-headline text-current outline-none hover:bg-brand-contrast/15 focus-visible:[--sf-focus:currentColor] focus-visible:focus-ring",
      className
    ),
    children: (
      <>
        {children}
        <svg aria-hidden="true" viewBox="0 0 8 13" className="h-[13px] w-2 fill-none stroke-current stroke-2">
          <path d="M1.5 1.5 6.5 6.5 1.5 11.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </>
    ),
  })
}

export { PromoCard, PromoCardLink, WidgetCard, type PromoCardLinkProps, type PromoCardProps, type WidgetCardProps }
