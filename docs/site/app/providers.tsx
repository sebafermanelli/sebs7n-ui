"use client"

import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { Toaster } from "sebs7n-ui/sonner"
import { TooltipProvider } from "sebs7n-ui/tooltip"

import { GlassConfigProvider } from "./_components/glass-config"
import { SearchProvider } from "./_components/search"

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
