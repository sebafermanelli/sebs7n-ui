"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn, type WithClassName } from "../lib/utils.js"
import { tooltipSurfaceClassName } from "../variants/overlay.js"

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

// Vidrio denso (`material-popover`) desde 2.0, como en macOS. Hasta 1.x era invertido
// (gray-1000) porque tiene que leerse igual sobre una foto que sobre una tabla; el vidrio denso
// ya lo garantiza: texto principal a 4,5:1 contra cualquier fondo (`test/glass-contrast.test.ts`).
// Lo que no garantiza es el borde: en claro el vidrio denso es casi blanco y sobre una página
// blanca el Tooltip no se separaba de nada. Lleva un filo de 1 px (`border-gray-alpha-400`, el de los campos).
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
            "relative w-fit max-w-xs origin-(--transform-origin)",
            tooltipSurfaceClassName,
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
