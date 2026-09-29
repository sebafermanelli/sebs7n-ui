import * as React from "react"

import { cn } from "../lib/utils.js"

type FooterProps = React.ComponentProps<"footer">

/**
 * El pie de una página: la contraparte del `Navbar` abajo. Un `<footer>` a todo el ancho con la línea
 * entre paneles arriba, opaco en `surface-header` (el de la barra global) y, sobre el wallpaper
 * (`AppShell ambient`, `data-ambient`), `material-translucent` como las barras: el wallpaper se ve a
 * través y el texto sigue a 4,5:1. Con menos transparencia vuelve a opaco solo.
 *
 * Server Component: sin estado. El contenido va en `FooterContent`; `FooterGroup` y `FooterBottom`
 * son opcionales.
 */
function Footer({ className, ...props }: FooterProps) {
  return (
    <footer
      data-slot="footer"
      className={cn("w-full border-t border-separator-strong bg-surface-header text-label in-data-ambient:material-translucent", className)}
      {...props}
    />
  )
}

type FooterContentProps = React.ComponentProps<"div"> & {
  /** El ancho de la columna del sitio (`1448`, `"80rem"`), como `NavbarContent`: el pie sigue a todo el ancho. */
  maxWidth?: number | string
}

/** El contenido: 16 de cada lado y 40 arriba y abajo; con `maxWidth`, centrado en la columna del sitio. */
function FooterContent({ className, maxWidth, style, ...props }: FooterContentProps) {
  return (
    <div
      data-slot="footer-content"
      className={cn("flex w-full flex-col gap-10 px-4 py-10", maxWidth && "mx-auto", className)}
      style={{ maxWidth, ...style }}
      {...props}
    />
  )
}

type FooterGroupProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** El título del grupo («Producto»): nombra la lista para un lector de pantalla. */
  title: React.ReactNode
}

/**
 * Un grupo de links con su título: una columna de un mapa del sitio. Cada hijo va en un `<li>`; los
 * `<a>` (o `Link`) toman el link secundario del paquete (`label-secondary`, sube a `label` con línea
 * al pasar), sin clases propias.
 */
function FooterGroup({ title, className, children, ...props }: FooterGroupProps) {
  const id = React.useId()
  return (
    <div data-slot="footer-group" className={cn("flex flex-col gap-3", className)} {...props}>
      <h2 id={id} className="text-callout font-semibold text-label">
        {title}
      </h2>
      <ul
        aria-labelledby={id}
        className="flex flex-col gap-2 text-callout [&_a]:rounded-tag [&_a]:text-label-secondary [&_a]:outline-none [&_a]:transition-control [&_a:hover]:text-label [&_a:hover]:underline [&_a:focus-visible]:focus-ring"
      >
        {React.Children.map(children, (child) => (child == null || child === false ? null : <li>{child}</li>))}
      </ul>
    </div>
  )
}

type FooterBottomProps = React.ComponentProps<"div">

/** La última fila: una línea y el texto chico (el copyright, dónde está la empresa, el tema). */
function FooterBottom({ className, ...props }: FooterBottomProps) {
  return (
    <div
      data-slot="footer-bottom"
      className={cn("flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-separator pt-6 text-callout text-label-secondary", className)}
      {...props}
    />
  )
}

export { Footer, FooterBottom, FooterContent, FooterGroup, type FooterBottomProps, type FooterContentProps, type FooterGroupProps, type FooterProps }
