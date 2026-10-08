"use client"

import type * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { AdaptivePopoverRoot, type AdaptivePopoverRootProps, AdaptivePopup, AdaptiveTrigger, useInDrawer, usePopoverSheet } from "../internal/adaptive-popover.js"
import { cn, type WithClassName } from "../lib/utils.js"

// En una pantalla angosta el contenido se presenta como la hoja de abajo: el porqué está en
// `internal/adaptive-popover.tsx`.
type PopoverProps = AdaptivePopoverRootProps

function Popover(props: PopoverProps) {
  return <AdaptivePopoverRoot {...props} />
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <AdaptiveTrigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = WithClassName<PopoverPrimitive.Popup.Props> &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "collisionPadding" | "side" | "sideOffset"> & {
    /**
     * El material translúcido (`material-translucent`) en vez de la superficie opaca. Es el caso
     * del popover de acceso rápido de iCloud (la grilla de apps sobre el wallpaper): el único
     * popover translúcido que tiene. Los demás, adentro de una app, van opacos.
     */
    translucent?: boolean
  }

function PopoverContent({ className, align = "center", alignOffset = 0, side = "bottom", sideOffset = 6, translucent = false, ...props }: PopoverContentProps) {
  return (
    <AdaptivePopup
      align={align}
      alignOffset={alignOffset}
      className={cn(translucent && "material-translucent", className)}
      data-slot="popover-content"
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col gap-1", className)} {...props} />
}

type PopoverTitleProps = WithClassName<PopoverPrimitive.Title.Props>

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  // En la hoja, el título es el del Drawer: Base UI lo conecta al `aria-labelledby` de la hoja.
  const Title = useInDrawer()?.Title ?? PopoverPrimitive.Title
  return <Title data-slot="popover-title" className={cn("font-display text-headline text-label", className)} {...props} />
}

type PopoverDescriptionProps = WithClassName<PopoverPrimitive.Description.Props>

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  const Description = useInDrawer()?.Description ?? PopoverPrimitive.Description
  return <Description data-slot="popover-description" className={cn("text-callout text-label-secondary", className)} {...props} />
}

export {
  Popover,
  usePopoverSheet,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverProps,
  type PopoverDescriptionProps,
  type PopoverTitleProps,
}
