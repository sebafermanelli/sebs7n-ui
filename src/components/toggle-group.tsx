"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { cn, type WithClassName } from "../lib/utils.js"
import { segmentedGroupClassName, segmentedItemClassName, segmentedTrackClassName } from "../variants/segmented.js"
import type { ToggleProps } from "./toggle.js"

type ToggleGroupProps = WithClassName<ToggleGroupPrimitive.Props>

/**
 * Un grupo de opciones que se prenden: el segmentado de iCloud (R4). La pista gris del segmentado,
 * segmentos del mismo ancho y cada ítem prendido en el acento sólido; con `multiple` pueden ser
 * varios. No envuelve en varias filas. Para filtros sueltos
 * que envuelven en varias filas, `Toggle` de a uno (el token gris que se prende en el acento).
 */
function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return <ToggleGroupPrimitive data-slot="toggle-group" className={cn(segmentedTrackClassName, segmentedGroupClassName, className)} {...props} />
}

function ToggleGroupItem({ className, ...props }: ToggleProps) {
  return <TogglePrimitive data-slot="toggle-group-item" className={cn(segmentedItemClassName, className)} {...props} />
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps }
