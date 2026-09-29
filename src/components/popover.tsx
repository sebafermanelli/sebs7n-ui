"use client"

import type * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn, type WithClassName } from "../lib/utils.js"
import { floatingPopupClassName } from "../variants/overlay.js"

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root {...props} />
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = WithClassName<PopoverPrimitive.Popup.Props> &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    /**
     * El material translúcido (`material-translucent`) en vez de la superficie opaca. Es el caso
     * del popover de acceso rápido de iCloud (la grilla de apps sobre el wallpaper): el único
     * popover translúcido que tiene. Los demás, adentro de una app, van opacos.
     */
    translucent?: boolean
  }

function PopoverContent({ className, align = "center", alignOffset = 0, side = "bottom", sideOffset = 6, translucent = false, ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} className="isolate z-50">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(floatingPopupClassName, translucent && "material-translucent", className)}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col gap-1", className)} {...props} />
}

type PopoverTitleProps = WithClassName<PopoverPrimitive.Title.Props>

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return <PopoverPrimitive.Title data-slot="popover-title" className={cn("text-headline text-label", className)} {...props} />
}

type PopoverDescriptionProps = WithClassName<PopoverPrimitive.Description.Props>

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return <PopoverPrimitive.Description data-slot="popover-description" className={cn("text-callout text-label-secondary", className)} {...props} />
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
