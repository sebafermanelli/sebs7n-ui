import type * as React from "react"

import { cn } from "../lib/utils.js"

type LabelProps = React.ComponentProps<"label"> & { required?: boolean }

function Label({ className, required = false, children, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "inline-flex items-center gap-1 text-label-12 text-gray-1000 select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:text-gray-700",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-red-900">
          *
        </span>
      )}
    </label>
  )
}

export { Label, type LabelProps }
