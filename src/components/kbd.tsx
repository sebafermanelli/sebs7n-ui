import type * as React from "react"

import { cn } from "../lib/utils.js"

// Atajo de teclado en línea (⌘K, Esc). Geist Mono, como todo lo que es código.
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-0.5 rounded-xs border border-gray-400 bg-gray-100 px-1 text-label-12-mono text-gray-900 select-none",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
