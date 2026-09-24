import type * as React from "react"

import { PageHeaderBreadcrumb } from "../internal/page-header-breadcrumb.js"
import { cn } from "../lib/utils.js"

type PageHeaderProps = Omit<React.ComponentProps<"header">, "children"> & {
  /**
   * Solo en páginas de detalle (Viajes › #A1B2). Va un `BreadcrumbList` **suelto**, sin
   * envolverlo en `Breadcrumb`: el `<nav>` lo pone `PageHeader`, y dos landmarks anidados
   * le dan al lector de pantalla dos entradas para la misma lista. En desarrollo avisa por
   * consola si el nodo trae un `<nav>` adentro.
   */
  breadcrumb?: React.ReactNode
  /**
   * Nombre del `<nav>` del breadcrumb, para el caso puntual de una pantalla. El texto por
   * defecto sale del `LabelsProvider` (`pageHeader.breadcrumb`), así que una app traducida
   * no necesita pasarlo en cada página.
   */
  breadcrumbLabel?: string
  children?: React.ReactNode
}

// Sin márgenes propios: el espaciado lo pone el layout con gap.
// Grilla de 2 columnas desde sm: título y descripción apilados en la columna 1 (también sin acciones),
// acciones en la columna 2 de la primera fila;
// cualquier otro hijo (filtros, tabs) ocupa una fila entera debajo. En mobile todo se apila.
//
// Sigue sin `"use client"`: el `<nav>` de las migas —lo único que necesita leer el
// `LabelsProvider`— vive en `internal/page-header-breadcrumb`, que sí es de cliente. Un Server
// Component puede renderizar uno de cliente; lo que no puede es llamar un hook.
function PageHeader({ className, breadcrumb, breadcrumbLabel, children, ...props }: PageHeaderProps) {
  return (
    <header data-slot="page-header" className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
      {breadcrumb && <PageHeaderBreadcrumb label={breadcrumbLabel}>{breadcrumb}</PageHeaderBreadcrumb>}
      <div
        data-slot="page-header-body"
        className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] [&>:not([data-slot^=page-header-])]:col-span-full"
      >
        {children}
      </div>
    </header>
  )
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn("min-w-0 text-heading-32 text-balance sm:col-start-1 break-words text-gray-1000", className)}
      {...props}
    />
  )
}

function PageHeaderDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-header-description"
      className={cn("min-w-0 text-copy-14 text-pretty text-gray-900 sm:col-start-1", className)}
      {...props}
    />
  )
}

function PageHeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn("flex flex-wrap items-center gap-2 sm:col-start-2 sm:row-start-1 sm:self-center sm:justify-end", className)}
      {...props}
    />
  )
}

export { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle, type PageHeaderProps }
