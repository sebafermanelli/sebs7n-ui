"use client"

import type * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { useAvisoDeNombre } from "../internal/dialog-name-warning.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

type DialogOverlayProps = Omit<DialogPrimitive.Backdrop.Props, "className"> & { className?: string }

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-backdrop transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

type DialogContentProps = Omit<DialogPrimitive.Popup.Props, "className"> & {
  className?: string
  showCloseButton?: boolean
}

function DialogContent({ className, children, showCloseButton = true, ...props }: DialogContentProps) {
  const ref = useAvisoDeNombre<HTMLDivElement>("DialogContent", "DialogTitle", props.ref)
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        ref={ref}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-background-100 p-6 text-copy-14 text-gray-1000 shadow-modal outline-none sm:max-w-lg",
          "transition-[opacity,translate] duration-150 data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+8px)] data-starting-style:opacity-0",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            // El nombre va en `aria-label` y no en un `<span class="sr-only">`: el botón es solo el
            // ícono, y `ButtonProps` exige el nombre en el tipo justamente para que no se pueda
            // olvidar. Un texto escondido nombra igual de bien, pero no hay tipo que lo vea.
            render={<Button variant="ghost" size="icon-sm" aria-label="Cerrar" className="absolute top-4 right-4" />}
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
      className={cn("-mx-6 mt-2 flex flex-col-reverse gap-2 border-t border-gray-400 px-6 pt-4 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

type DialogTitleProps = Omit<DialogPrimitive.Title.Props, "className"> & { className?: string }

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-heading-20 text-gray-1000", className)} {...props} />
}

type DialogDescriptionProps = Omit<DialogPrimitive.Description.Props, "className"> & { className?: string }

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-copy-14 text-gray-900", className)} {...props} />
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger }
