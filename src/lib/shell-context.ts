"use client"

import { createContext, useContext } from "react"

// Contextos internos que comparten Sidebar, AppShell y UserMenu (no se exportan del paquete).

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
