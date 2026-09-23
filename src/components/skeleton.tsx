import type * as React from "react"

import { cn } from "../lib/utils.js"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-skeleton rounded-md bg-gray-100", className)} {...props} />
}

export { Skeleton }
