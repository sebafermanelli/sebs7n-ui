"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "../lib/utils.js"

type RadioGroupProps = Omit<RadioGroupPrimitive.Props, "className"> & { className?: string }

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return <RadioGroupPrimitive data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />
}

type RadioGroupItemProps = Omit<RadioPrimitive.Root.Props, "className"> & { className?: string }

function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "peer relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-500 bg-background-100 outline-none transition-control after:absolute after:-inset-2",
        "hover:border-gray-600 focus-visible:focus-ring",
        "data-checked:border-gray-1000 data-checked:bg-gray-1000 data-checked:hover:border-button-primary-hover data-checked:hover:bg-button-primary-hover",
        "aria-invalid:border-red-800 data-invalid:border-red-800",
        "data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100",
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
