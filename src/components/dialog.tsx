"use client"

import type * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { useAvisoDeNombre } from "../internal/dialog-name-warning.js"
import { useLabels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { backdropClassName, modalFooterClassName, modalPopupClassName, overlayCloseClassName } from "../variants/overlay.js"
import { Button } from "./button.js"

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} />
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

type DialogOverlayProps = WithClassName<DialogPrimitive.Backdrop.Props>

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(backdropClassName, className)}
      {...props}
    />
  )
}

type DialogContentProps = WithClassName<DialogPrimitive.Popup.Props> & {
  showCloseButton?: boolean
  /**
   * El texto del botón X. Con un `LabelsProvider` arriba se traduce de una vez para toda la app;
   * esta prop es la excepción de una pantalla puntual. Hasta 0.4.0 este texto no se podía cambiar
   * de ninguna forma: era el único «Cerrar» del paquete sin salida.
   */
  labels?: { close?: string }
}

function DialogContent({ className, children, showCloseButton = true, labels, ...props }: DialogContentProps) {
  const ref = useAvisoDeNombre<HTMLDivElement>("DialogContent", "DialogTitle", props.ref)
  const l = useLabels().dialog
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        ref={ref}
        className={cn(modalPopupClassName, "sm:max-w-lg", className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close-button"
            // El nombre va en `aria-label` y no en un `<span class="sr-only">`: el botón es solo el
            // ícono, y `ButtonProps` exige el nombre en el tipo justamente para que no se pueda
            // olvidar. Un texto escondido nombra igual de bien, pero no hay tipo que lo vea.
            render={<Button variant="ghost" size="icon-sm" aria-label={labels?.close ?? l.close} className={overlayCloseClassName} />}
          >
            <XIcon />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(modalFooterClassName, className)}
      {...props}
    />
  )
}

type DialogTitleProps = WithClassName<DialogPrimitive.Title.Props>

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-heading-20 text-gray-1000", className)} {...props} />
}

type DialogDescriptionProps = WithClassName<DialogPrimitive.Description.Props>

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-copy-14 text-gray-900", className)} {...props} />
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogOverlayProps,
  type DialogTitleProps,
}
