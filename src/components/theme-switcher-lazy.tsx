"use client"

import * as React from "react"

import { cn } from "../lib/utils.js"
import type { ThemeSwitcherProps } from "./theme-switcher.js"

const ThemeSwitcher = React.lazy(() => import("./theme-switcher.js").then((mod) => ({ default: mod.ThemeSwitcher })))

/**
 * `ThemeSwitcher` diferido, sin salto: ocupa el lugar exacto (100 × 28, lo que mide el control) desde el primer render, y su JS
 * se pide cuando el navegador queda libre —o antes, si el puntero o el foco llegan primero—.
 *
 * ```tsx
 * <ThemeSwitcherLazy />   // en vez de <ThemeSwitcher /> en la barra de una landing
 * ```
 *
 * El placeholder es decorativo (`aria-hidden`): el control real aparece en el mismo lugar con su
 * grupo de radios. Mismas props que `ThemeSwitcher`.
 */
function ThemeSwitcherLazy({ className, ...props }: ThemeSwitcherProps) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => window.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(() => setReady(true), 200)
    return () => window.clearTimeout(id)
  }, [])

  const size = "inline-flex h-7 w-[100px] shrink-0"
  if (!ready) {
    return (
      <span
        aria-hidden="true"
        data-slot="theme-switcher-placeholder"
        className={cn(size, "rounded-control bg-fill-1", className)}
        onFocus={() => setReady(true)}
        onPointerEnter={() => setReady(true)}
      />
    )
  }
  return (
    <React.Suspense fallback={<span aria-hidden="true" className={cn(size, "rounded-control bg-fill-1", className)} data-slot="theme-switcher-placeholder" />}>
      <ThemeSwitcher className={className} {...props} />
    </React.Suspense>
  )
}

export { ThemeSwitcherLazy }
