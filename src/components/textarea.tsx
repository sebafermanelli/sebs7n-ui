import type * as React from "react"

import { cn } from "../lib/utils.js"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "peer field-sizing-content min-h-20 w-full min-w-0 rounded-md border border-gray-400 bg-background-100 px-3 py-2.5 text-copy-14 text-gray-1000 outline-none transition-control",
        "placeholder:text-gray-700 hover:border-gray-500 focus:focus-border",
        "disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-700",
        "aria-invalid:border-red-800 aria-invalid:focus:focus-border-error",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
