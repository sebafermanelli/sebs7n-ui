"use client"

import { ThemeProvider } from "next-themes"
import dynamic from "next/dynamic"
import type { ReactNode } from "react"
import { TooltipProvider } from "sebs7n-ui/tooltip"

import { GlassConfigProvider } from "./_components/glass-config"
import { SearchProvider } from "./_components/search"

// Los toasts los usan tres pantallas (catálogo de íconos, Playground, demo de Sonner), pero el
// `Toaster` tiene que estar montado antes del primer `toast()`. Global sí, en el arranque no: sin
// SSR, su chunk se pide después de hidratar y no suma al JS que la página pide al abrir. Montarlo
// solo en esas pantallas no sirve: la página de Sonner tiene dos demos y duplicaría cada toast.
const Toaster = dynamic(() => import("sebs7n-ui/sonner").then((mod) => mod.Toaster), { ssr: false })

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        {/* Lo que se arma en el Playground vale para todo el sitio: ver `glass-config.tsx`. */}
        <GlassConfigProvider>
          {/* Una sola paleta para todo el sitio: la abren el header del home y el SidebarSearch. */}
          <SearchProvider>{children}</SearchProvider>
        </GlassConfigProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
