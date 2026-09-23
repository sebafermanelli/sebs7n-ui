import type * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils.js"
import { cardVariants } from "../variants/card.js"

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>

function Card({ className, variant, size = "md", interactive, selected, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-selected={selected ? "" : undefined}
      className={cn(cardVariants({ variant, size, interactive, selected }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-heading-20 text-gray-1000 group-data-[size=sm]/card:text-heading-16", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-copy-14 text-gray-900", className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-(--card-spacing)", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2 border-t border-gray-400 px-(--card-spacing) pt-(--card-spacing)", className)}
      {...props}
    />
  )
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, type CardProps }
