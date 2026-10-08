import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// El fondo: neutro (`fill-1`, la tip card de Mail en iCloud) o el tinte del rol semántico (`*-soft`, 12 %), con el ícono en la
// tinta del rol (`*-ink`, ≥ 4,5:1). Sin franja de color a un costado (3.0): el rol lo dicen el tinte, el ícono y el texto. Los roles son
// independientes de la marca (`--color-success` & co.); `brand` queda para un aviso del producto.
const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-surface border border-transparent bg-fill-1 py-3 pe-4 ps-4 text-start text-callout has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:mt-0.5 *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        neutral: "*:[svg]:text-label-secondary",
        brand: "bg-brand-700/10 *:[svg]:text-brand-ink",
        info: "bg-info-soft *:[svg]:text-info-ink",
        success: "bg-success-soft *:[svg]:text-success-ink",
        warning: "bg-warning-soft *:[svg]:text-warning-ink",
        danger: "bg-danger-soft *:[svg]:text-danger-ink",
        /** @deprecated Desde 3.0 es `danger`. */
        error: "bg-danger-soft *:[svg]:text-danger-ink",
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
      className={cn("text-callout font-medium text-label group-has-[>svg]/alert:col-start-2", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-callout text-label-secondary [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-label", className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
