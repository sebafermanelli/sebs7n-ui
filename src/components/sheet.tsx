"use client"

import type * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { useAvisoDeNombre } from "../internal/dialog-name-warning.js"
import { useLabels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { Button } from "./button.js"

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

type SheetContentProps = WithClassName<SheetPrimitive.Popup.Props> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  /**
   * El texto del botón X. Con un `LabelsProvider` arriba se traduce de una vez para toda la app;
   * esta prop es la excepción de una pantalla puntual. Hasta 0.4.0 este texto no se podía cambiar
   * de ninguna forma: era el único «Cerrar» del paquete sin salida.
   */
  labels?: { close?: string }
}

// Solo se redondean las esquinas que no tocan el borde de la pantalla.
function SheetContent({ className, children, side = "right", showCloseButton = true, labels, ...props }: SheetContentProps) {
  const ref = useAvisoDeNombre<HTMLDivElement>("SheetContent", "SheetTitle", props.ref)
  const l = useLabels().sheet
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-backdrop transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        ref={ref}
        className={cn(
          // Sin esquinas redondeadas: la hoja va de punta a punta contra el borde de la pantalla, y un
        // radio contra ese borde se ve como un error de recorte.
        "fixed z-50 flex flex-col gap-4 bg-background-100 text-copy-14 text-gray-1000 shadow-modal outline-none transition-[translate] duration-200 ease-out",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:w-3/4 data-[side=right]:sm:max-w-sm data-[side=right]:data-ending-style:translate-x-full data-[side=right]:data-starting-style:translate-x-full",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:w-3/4 data-[side=left]:sm:max-w-sm data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:data-ending-style:-translate-y-full data-[side=top]:data-starting-style:-translate-y-full",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-starting-style:translate-y-full",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            // Mismo motivo que en Dialog: el nombre en `aria-label`, que es lo que el tipo exige.
            render={<Button variant="ghost" size="icon-sm" aria-label={labels?.close ?? l.close} className="absolute top-4 right-4" />}
          >
            <XIcon />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-6 pr-12", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 border-t border-gray-400 p-6", className)} {...props} />
}

type SheetTitleProps = WithClassName<SheetPrimitive.Title.Props>

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-heading-20 text-gray-1000", className)} {...props} />
}

type SheetDescriptionProps = WithClassName<SheetPrimitive.Description.Props>

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-copy-14 text-gray-900", className)} {...props} />
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type SheetContentProps,
  type SheetDescriptionProps,
  type SheetTitleProps,
}
