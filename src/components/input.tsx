"use client"

import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "../lib/utils.js"
import { inputControlClassName, inputDisabledClassName, inputInvalidClassName, inputSizeClassName } from "../variants/input.js"

type InputProps = Omit<InputPrimitive.Props, "className" | "size"> & {
  className?: string
  size?: "sm" | "md" | "lg"
}

function Input({ className, size = "md", ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      data-size={size}
      className={cn(
        inputControlClassName,
        inputSizeClassName,
        inputDisabledClassName,
        inputInvalidClassName,
        // El `peer` es para que la etiqueta flotante de `Field` sepa si el campo está enfocado.
        "peer w-full min-w-0 px-3 placeholder:text-gray-900 focus:focus-border",
        "file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-button-14 file:text-gray-1000",
        className
      )}
      {...props}
    />
  )
}

export { Input, type InputProps }
