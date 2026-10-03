import type * as React from "react"

import { cn } from "../lib/utils.js"

type AppShellContentProps = React.ComponentProps<"div"> & {
  /** default = max-w-7xl (1280px), wide = 1600px (tablas anchas), full = sin máximo. */
  size?: "default" | "wide" | "full"
}

const sizeClassName = { default: "max-w-7xl", wide: "max-w-[1600px]", full: "" } as const

// Contenedor estándar de una página de dashboard: hijo directo de AppShell, así todas las apps
// tienen el mismo ancho y los mismos márgenes. Sin estado: sirve en Server Components.
// Es contenedor de consulta (`@container`): lo de adentro (`@lg:`, `@3xl:`…) responde al ancho de la caja
// de contenido, sin el padding. Su propio padding consulta al `main` del AppShell (`@container/main`).
function AppShellContent({ className, size = "default", ...props }: AppShellContentProps) {
  return (
    <div
      data-slot="app-shell-content"
      data-size={size}
      className={cn("@container mx-auto flex w-full flex-col gap-6 px-4 py-6 @md/main:px-6 @md/main:py-8", sizeClassName[size], className)}
      {...props}
    />
  )
}

export { AppShellContent, type AppShellContentProps }
