"use client"

import type * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "../lib/utils.js"

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = Omit<PopoverPrimitive.Popup.Props, "className"> &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & { className?: string }

function PopoverContent({ className, align = "center", alignOffset = 0, side = "bottom", sideOffset = 6, ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} className="isolate z-50">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "flex w-72 origin-(--transform-origin) flex-col gap-3 rounded-xl bg-background-100 p-4 text-copy-14 text-gray-1000 shadow-menu outline-none",
            // Si adentro no hay nada tabulable —un popover de solo texto—, Base UI enfoca el popup
            // mismo para que Escape y las flechas funcionen. Con `outline-none` y sin reemplazo eso
            // era foco invisible (WCAG 2.4.7): el usuario apretaba Tab y el foco desaparecía de la
            // pantalla. El anillo pisa la `shadow-menu` mientras dura, y está bien que la pise:
            // saber dónde está el foco importa más que el hairline.
            "focus-visible:focus-ring",
            "transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col gap-1", className)} {...props} />
}

type PopoverTitleProps = Omit<PopoverPrimitive.Title.Props, "className"> & { className?: string }

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return <PopoverPrimitive.Title data-slot="popover-title" className={cn("text-heading-14 text-gray-1000", className)} {...props} />
}

type PopoverDescriptionProps = Omit<PopoverPrimitive.Description.Props, "className"> & { className?: string }

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return <PopoverPrimitive.Description data-slot="popover-description" className={cn("text-copy-14 text-gray-900", className)} {...props} />
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverDescriptionProps,
  type PopoverTitleProps,
}
