"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn, type WithClassName } from "../lib/utils.js"

function TooltipProvider({ delay = 300, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root {...props} />
}

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

type TooltipContentProps = WithClassName<TooltipPrimitive.Popup.Props> &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">

// Invertido: fondo gray-1000, texto background-100. Es de lo poco que no es vidrio, y es a
// propósito: es una línea de texto chica que aparece encima de cualquier cosa, y tiene que
// leerse igual sobre una foto que sobre una tabla.
//
// Sin flecha desde 1.0. La cercanía al control ya dice de quién habla —son 6px—, y la flecha
// era un rombo de 8px que en una cápsula redondeada quedaba colgando de la curva.
function TooltipContent({ className, side = "top", sideOffset = 6, align = "center", alignOffset = 0, children, ...props }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} className="isolate z-50">
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "relative w-fit max-w-xs origin-(--transform-origin) rounded-control bg-gray-1000 px-2 py-1 text-body text-background-100 shadow-tooltip",
            "transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type TooltipContentProps }
