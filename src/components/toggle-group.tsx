"use client"

import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { cn, type WithClassName } from "../lib/utils.js"
import { Toggle, type ToggleProps } from "./toggle.js"

type ToggleGroupProps = WithClassName<ToggleGroupPrimitive.Props>

function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

function ToggleGroupItem(props: ToggleProps) {
  return <Toggle data-slot="toggle-group-item" {...props} />
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps }
