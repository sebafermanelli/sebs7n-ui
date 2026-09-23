"use client"

import { Toaster, TooltipProvider } from "sebs7n-ui"
import { ThemeProvider } from "next-themes"
import type * as React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
