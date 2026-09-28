"use client"

import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { cn, type WithClassName } from "../lib/utils.js"
import { Toggle, type ToggleProps } from "./toggle.js"

type ToggleGroupProps = WithClassName<ToggleGroupPrimitive.Props>

function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      // En táctil 20 px entre filtros (y entre filas, porque envuelve): un filtro mide 24 de alto y
      // su área de 44 se metía en la fila de abajo con 8 px.
      className={cn("flex flex-wrap items-center gap-2 pointer-coarse:gap-5", className)}
      {...props}
    />
  )
}

function ToggleGroupItem(props: ToggleProps) {
  return <Toggle data-slot="toggle-group-item" {...props} />
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps }
