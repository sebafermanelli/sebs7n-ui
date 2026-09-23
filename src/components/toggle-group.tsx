"use client"

import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { cn } from "../lib/utils.js"
import { Toggle, type ToggleProps } from "./toggle.js"

type ToggleGroupProps = Omit<ToggleGroupPrimitive.Props, "className"> & { className?: string }

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
