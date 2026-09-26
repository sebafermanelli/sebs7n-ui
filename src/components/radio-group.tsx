"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn, type WithClassName } from "../lib/utils.js"

type RadioGroupProps = WithClassName<RadioGroupPrimitive.Props>

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return <RadioGroupPrimitive data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />
}

type RadioGroupItemProps = WithClassName<RadioPrimitive.Root.Props>

function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        // Mismo motivo que en `Checkbox`: el borde es el único dibujo del radio sin marcar, así que
        // le toca el 3:1 de WCAG 1.4.11. `gray-500` daba 1,66:1 en claro; `gray-700`, 3,23:1.
        "peer relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-700 bg-background-100 shadow-card outline-none transition-control after:absolute after:-inset-2",
        "hover:border-gray-800 focus-visible:focus-ring",
        "data-checked:border-gray-1000 data-checked:bg-gray-1000 data-checked:shadow-button-inverted data-checked:hover:border-button-primary-hover data-checked:hover:bg-button-primary-hover",
        "aria-invalid:border-red-800 data-invalid:border-red-800",
        "data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:shadow-none",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-1.5 rounded-full bg-background-100 data-disabled:bg-gray-700"
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem, type RadioGroupItemProps, type RadioGroupProps }
