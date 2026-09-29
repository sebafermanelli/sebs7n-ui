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
        "peer relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-label-tertiary bg-surface outline-none transition-control after:absolute after:-inset-2 pointer-coarse:after:-inset-3.5",
        "hover:border-label-secondary focus-visible:focus-ring",
        "data-checked:border-transparent data-checked:bg-brand-700 data-checked:hover:bg-brand-800 data-checked:focus-visible:focus-ring-inverse",
        "aria-invalid:border-red-800 data-invalid:border-red-800",
        // Apagado a .4, como todo control de iCloud: se sigue viendo si estaba marcado.
        "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        // Vacío no se apaga (ver Checkbox): conserva el contorno y el interior pasa a `fill-2`.
        "data-disabled:not-data-checked:opacity-100 data-disabled:not-data-checked:bg-fill-2 data-disabled:not-data-checked:hover:border-label-tertiary",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-1.5 rounded-full bg-brand-contrast"
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem, type RadioGroupItemProps, type RadioGroupProps }
