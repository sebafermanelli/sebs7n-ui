"use client"

import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "../lib/utils.js"
import {
  inputControlClassName,
  inputDisabledClassName,
  inputInvalidClassName,
  inputPaddingClassName,
  inputSizeClassName,
} from "../variants/input.js"

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
        inputPaddingClassName[size],
        // El `peer` es para que la etiqueta flotante de `Field` sepa si el campo está enfocado.
        "peer w-full min-w-0 placeholder:text-label-secondary focus:focus-border",
        "file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-callout file:text-label",
        className
      )}
      {...props}
    />
  )
}

export { Input, type InputProps }
