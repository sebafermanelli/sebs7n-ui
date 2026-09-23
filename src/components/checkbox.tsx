"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

import { cn, type WithClassName } from "../lib/utils.js"

type CheckboxProps = WithClassName<CheckboxPrimitive.Root.Props>

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // El borde es lo ÚNICO que dibuja una casilla vacía: sin él no hay control, hay un hueco.
        // Por eso cae bajo WCAG 1.4.11 (3:1 contra el fondo) y no bajo la licencia de "decoración".
        // `gray-500` —el tono de Geist— daba 1,66:1 en claro y 2,06:1 en oscuro. `gray-700` da
        // 3,23:1 y 6,12:1, y es el mismo #8f8f8f en los dos temas.
        "group/checkbox peer relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs border border-gray-700 bg-background-100 text-background-100 outline-none transition-control after:absolute after:-inset-2",
        // El hover oscurece en los dos temas (`gray-800` también es #7d7d7d en ambos): el gesto se
        // lee igual en claro y en oscuro, y no hay que acordarse de dos escalas.
        "hover:border-gray-800 focus-visible:focus-ring",
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
