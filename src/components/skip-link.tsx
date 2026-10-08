"use client"

import type * as React from "react"

import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

/**
 * «Ir al contenido» fuera de un `AppShell`: el mismo link, oculto hasta que recibe el foco con Tab.
 * Ponelo como **primer hijo** del `<body>` o de la página, y dale al `<main>` el `id` al que apunta.
 *
 * ```tsx
 * <SkipLink />          // → #main
 * <main id="main">…</main>
 * ```
 *
 * El texto sale de `labels.skipToContent` («Ir al contenido»), igual que el de `AppShell`.
 */
type SkipLinkProps = Omit<React.ComponentProps<"a">, "href"> & {
  /** El ancla del contenido. Default `#main`. */
  href?: string
}

function SkipLink({ href = "#main", className, children, ...props }: SkipLinkProps) {
  const labels = useLabels()
  return (
    <a
      data-slot="skip-link"
      href={href}
      className={cn(
        "sr-only z-50 rounded-control bg-surface px-3 py-2 text-callout text-label shadow-menu focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:start-2 focus-visible:focus-ring",
        className
      )}
      {...props}
    >
      {children ?? labels.appShell.skipToContent}
    </a>
  )
}

export { SkipLink, type SkipLinkProps }
