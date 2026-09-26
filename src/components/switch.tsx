"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn, type WithClassName } from "../lib/utils.js"

type SwitchProps = WithClassName<SwitchPrimitive.Root.Props> & {
  size?: "sm" | "md"
  variant?: "default" | "accent"
}

function Switch({ className, size = "md", variant = "default", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/switch peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none transition-control after:absolute after:-inset-2",
        "data-[size=md]:h-5 data-[size=md]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7",
        // La pista apagada tiene que distinguirse del fondo (WCAG 1.4.11) Y del pulgar blanco que
        // lleva adentro: el lado donde está el pulgar es lo que dice si está prendido o apagado.
        // `gray-400` fallaba en los dos frentes (1,20:1 contra la superficie en claro y 1,20:1
        // contra el pulgar: la pista y el pulgar eran el mismo blanco). `gray-700` (#8f8f8f en los
        // dos temas) es el punto medio que pasa por los dos lados: 3,23:1 contra el blanco en
        // claro, 6,12:1 contra el negro en oscuro, y 3,23:1 contra el pulgar en los dos.
        "bg-gray-700 shadow-track hover:bg-gray-800 focus-visible:focus-ring",
        "data-checked:bg-gray-1000 data-checked:hover:bg-button-primary-hover",
        "data-[variant=accent]:data-checked:bg-brand-700 data-[variant=accent]:data-checked:hover:bg-brand-800",
        "aria-invalid:ring-1 aria-invalid:ring-red-800 data-invalid:ring-1 data-invalid:ring-red-800",
        "data-disabled:cursor-not-allowed data-disabled:bg-gray-100 data-disabled:shadow-none data-disabled:hover:bg-gray-100",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-tooltip transition-transform duration-150",
          "group-data-[size=md]/switch:size-4 group-data-[size=sm]/switch:size-3",
          "data-checked:bg-background-100 group-data-[variant=accent]/switch:data-checked:bg-brand-contrast",
          "group-data-[size=md]/switch:data-checked:translate-x-4 group-data-[size=sm]/switch:data-checked:translate-x-3",
          "data-disabled:bg-gray-400 data-disabled:shadow-none"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, type SwitchProps }
