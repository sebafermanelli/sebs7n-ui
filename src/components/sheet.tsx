"use client"

import type * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { useAvisoDeNombre } from "../internal/dialog-name-warning.js"
import { useLabels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { backdropClassName, floatingSheetGapClassName, overlayCloseClassName } from "../variants/overlay.js"
import { Button } from "./button.js"

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root {...props} />
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

function SheetContent({ className, children, side = "right", showCloseButton = true, labels, ...props }: SheetContentProps) {
  const ref = useAvisoDeNombre<HTMLDivElement>("SheetContent", "SheetTitle", props.ref)
  const l = useLabels().sheet
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className={backdropClassName}
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        ref={ref}
        className={cn(
          // Flotante (2.0): despegada 8 px de cada borde que toca y con las cuatro esquinas del
          // radio del panel, el mismo de la píldora del Sidebar. Hasta 1.x iba de punta a punta y
          // cuadrada. Al cerrar se desplaza su tamaño más el margen, para salir entera.
          "fixed z-50 flex flex-col gap-4 rounded-panel material-modal text-callout text-gray-1000 shadow-modal outline-none transition-[translate] duration-200 ease-out",
          floatingSheetGapClassName,
          "data-[side=right]:top-(--sheet-gap-t) data-[side=right]:bottom-(--sheet-gap-b) data-[side=right]:right-(--sheet-gap-r) data-[side=right]:w-3/4 data-[side=right]:sm:max-w-sm data-[side=right]:data-ending-style:translate-x-[calc(100%+var(--sheet-gap-r))] data-[side=right]:data-starting-style:translate-x-[calc(100%+var(--sheet-gap-r))]",
          "data-[side=left]:top-(--sheet-gap-t) data-[side=left]:bottom-(--sheet-gap-b) data-[side=left]:left-(--sheet-gap-l) data-[side=left]:w-3/4 data-[side=left]:sm:max-w-sm data-[side=left]:data-ending-style:-translate-x-[calc(100%+var(--sheet-gap-l))] data-[side=left]:data-starting-style:-translate-x-[calc(100%+var(--sheet-gap-l))]",
          "data-[side=top]:top-(--sheet-gap-t) data-[side=top]:left-(--sheet-gap-l) data-[side=top]:right-(--sheet-gap-r) data-[side=top]:data-ending-style:-translate-y-[calc(100%+var(--sheet-gap-t))] data-[side=top]:data-starting-style:-translate-y-[calc(100%+var(--sheet-gap-t))]",
          "data-[side=bottom]:bottom-(--sheet-gap-b) data-[side=bottom]:left-(--sheet-gap-l) data-[side=bottom]:right-(--sheet-gap-r) data-[side=bottom]:data-ending-style:translate-y-[calc(100%+var(--sheet-gap-b))] data-[side=bottom]:data-starting-style:translate-y-[calc(100%+var(--sheet-gap-b))]",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close-button"
            // Mismo motivo que en Dialog: el nombre en `aria-label`, que es lo que el tipo exige.
            render={<Button variant="ghost" size="icon-sm" aria-label={labels?.close ?? l.close} className={overlayCloseClassName} />}
          >
            <XIcon />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  )
}

// Mismo padding (20 px), título y pie que la hoja de Dialog (2.0): el pie va sin línea arriba,
// como en macOS, y con 12 px entre botones para que, apilados, las áreas de 44 no se pisen.
// `pr-12` deja lugar a la X, que queda en la línea del título.
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1 p-5 pr-12", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-3 p-5", className)} {...props} />
}

type SheetTitleProps = WithClassName<SheetPrimitive.Title.Props>

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-title-3 text-gray-1000", className)} {...props} />
}

type SheetDescriptionProps = WithClassName<SheetPrimitive.Description.Props>

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-callout text-gray-900", className)} {...props} />
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
