"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"

import { cn, type WithClassName } from "../lib/utils.js"
import { toggleVariants } from "../variants/toggle.js"

type ToggleProps = WithClassName<TogglePrimitive.Props>

function Toggle({ className, ...props }: ToggleProps) {
  return <TogglePrimitive data-slot="toggle" className={cn(toggleVariants(), className)} {...props} />
}

export { Toggle, type ToggleProps }
