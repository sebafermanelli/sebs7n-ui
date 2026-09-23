import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// Fondo neutro: la variante solo cambia la franja izquierda (700) y el ícono (900, para llegar a 3:1).
const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-xl border border-gray-400 bg-background-100 px-4 py-3 text-left text-copy-14 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:mt-0.5 *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        neutral: "*:[svg]:text-gray-900",
        brand: "shadow-[inset_3px_0_0_var(--color-brand-700)] *:[svg]:text-brand-900",
        success: "shadow-[inset_3px_0_0_var(--color-green-700)] *:[svg]:text-green-900",
        warning: "shadow-[inset_3px_0_0_var(--color-amber-700)] *:[svg]:text-amber-900",
        error: "shadow-[inset_3px_0_0_var(--color-red-700)] *:[svg]:text-red-900",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
)

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("text-label-14 font-medium text-gray-1000 group-has-[>svg]/alert:col-start-2", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-copy-14 text-gray-900 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-gray-1000", className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
