"use client"

import { createContext, useContext } from "react"

// Contextos internos que comparten Sidebar, AppShell y UserMenu.
//
// Vive en `src/internal/` y no en `src/lib/` porque el mapa `exports` tiene un
// patrón `./lib/*`: mientras estuvo ahí, `import "sebs7n-ui/lib/shell-context"`
// resolvía y funcionaba, así que "no se exporta del paquete" era un comentario y
// no un hecho. `./internal/*` no está en `exports`, y eso sí lo hace cumplir Node.

export type SidebarContextValue = { collapsed: boolean }
export const SidebarContext = createContext<SidebarContextValue | null>(null)
export const useSidebarContext = () => useContext(SidebarContext)

export type AppShellContextValue = {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  /** Cierra el Sheet mobile. Con focusMain, el foco va al <main> (cierre por navegación). */
  closeMobile: (options?: { focusMain?: boolean }) => void
}
export const AppShellContext = createContext<AppShellContextValue | null>(null)

// true dentro del Sheet mobile de AppShell: el sidebar se muestra expandido y a todo el ancho.
export const SidebarInSheetContext = createContext(false)
