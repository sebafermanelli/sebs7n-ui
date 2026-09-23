"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "../lib/utils.js"
import { badgeDotColor, badgeVariants, type BadgeColor } from "../variants/badge.js"

// solid solo existe en gray y brand: los 700 de Geist con texto blanco no llegan a 4.5:1.
type BadgeTone =
  | { variant?: "subtle"; color?: BadgeColor }
  | { variant: "solid"; color?: "gray" | "brand" }

type BadgeProps = Omit<useRender.ComponentProps<"span">, "color" | "className"> &
  BadgeTone & {
    className?: string
    size?: "sm" | "md"
    dot?: boolean
  }

function Badge({ className, variant = "subtle", color = "gray", size = "md", dot = false, render, children, ...props }: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, color, size }), className),
        children: (
          <>
            {dot && <span data-slot="badge-dot" aria-hidden="true" className={cn("size-1.5 rounded-full", badgeDotColor[color])} />}
            {children}
          </>
        ),
      },
      props
    ),
    state: { slot: "badge", variant, color },
  })
}

export { Badge, type BadgeProps }
