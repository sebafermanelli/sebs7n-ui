"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

import { cn } from "../lib/utils.js"

type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, "className"> & { className?: string }

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox peer relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs border border-gray-500 bg-background-100 text-background-100 outline-none transition-control after:absolute after:-inset-2",
        "hover:border-gray-600 focus-visible:focus-ring",
        "data-checked:border-gray-1000 data-checked:bg-gray-1000 data-checked:hover:border-button-primary-hover data-checked:hover:bg-button-primary-hover",
        "data-indeterminate:border-gray-1000 data-indeterminate:bg-gray-1000",
        "aria-invalid:border-red-800 data-invalid:border-red-800",
        "data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center">
        <CheckIcon className="size-3 stroke-3 group-data-indeterminate/checkbox:hidden" />
        <MinusIcon className="hidden size-3 stroke-3 group-data-indeterminate/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, type CheckboxProps }
