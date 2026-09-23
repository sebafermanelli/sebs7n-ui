"use client"

import type * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn, type WithClassName } from "../lib/utils.js"
import { floatingPopupClassName } from "../variants/overlay.js"

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = WithClassName<PopoverPrimitive.Popup.Props> &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">

function PopoverContent({ className, align = "center", alignOffset = 0, side = "bottom", sideOffset = 6, ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} className="isolate z-50">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(floatingPopupClassName, className)}
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
  return <PopoverPrimitive.Title data-slot="popover-title" className={cn("text-heading-14 text-gray-1000", className)} {...props} />
}

type PopoverDescriptionProps = WithClassName<PopoverPrimitive.Description.Props>

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
