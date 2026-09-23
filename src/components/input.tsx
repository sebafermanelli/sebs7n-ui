"use client"

import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "../lib/utils.js"

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
        "peer w-full min-w-0 rounded-md border border-gray-400 bg-background-100 px-3 text-copy-14 text-gray-1000 outline-none transition-control",
        "data-[size=sm]:h-8 data-[size=md]:h-10 data-[size=lg]:h-12 data-[size=lg]:text-copy-16",
        "placeholder:text-gray-900 hover:border-gray-500 focus:focus-border",
        "file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-button-14 file:text-gray-1000",
        "data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700",
        "aria-invalid:border-red-800 aria-invalid:focus:focus-border-error data-invalid:border-red-800 data-invalid:focus:focus-border-error",
        className
      )}
      {...props}
    />
  )
}

export { Input, type InputProps }
