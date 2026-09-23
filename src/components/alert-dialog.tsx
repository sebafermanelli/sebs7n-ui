"use client"

import type * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn, type WithClassName } from "../lib/utils.js"
import type { ButtonTextSize } from "../variants/button.js"
import { Button, type ButtonBaseProps } from "./button.js"

// Mismas superficies que Dialog. Diferencias: role="alertdialog", no se cierra con click
// en el backdrop y no tiene botón X (exige una respuesta).

function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

// Cierra el diálogo. Sin controlar open: <AlertDialogClose render={<AlertDialogAction variant="destructive" />}>.
function AlertDialogClose(props: AlertDialogPrimitive.Close.Props) {
  return <AlertDialogPrimitive.Close data-slot="alert-dialog-close" {...props} />
}

type AlertDialogOverlayProps = WithClassName<AlertDialogPrimitive.Backdrop.Props>

function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-backdrop transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

type AlertDialogContentProps = WithClassName<AlertDialogPrimitive.Popup.Props>

function AlertDialogContent({ className, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-background-100 p-6 text-copy-14 text-gray-1000 shadow-modal outline-none sm:max-w-md",
          "transition-[opacity,translate] duration-150 data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+8px)] data-starting-style:opacity-0",
          className
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-1.5", className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("-mx-6 mt-2 flex flex-col-reverse gap-2 border-t border-gray-400 px-6 pt-4 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

type AlertDialogTitleProps = WithClassName<AlertDialogPrimitive.Title.Props>

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-heading-20 text-gray-1000", className)} {...props} />
}

type AlertDialogDescriptionProps = WithClassName<AlertDialogPrimitive.Description.Props>

function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-copy-14 text-pretty text-gray-900", className)}
      {...props}
    />
  )
}

type AlertDialogActionProps = Omit<ButtonBaseProps, "variant"> & {
  variant?: "default" | "destructive"
  /** Los botones de un AlertDialog siempre llevan texto: los tamaños de ícono no aplican acá. */
  size?: ButtonTextSize
}

// No cierra solo (como shadcn base-nova): así sirve con `loading` mientras corre la acción.
// Controlá `open` en AlertDialog y cerralo cuando termine, o envolvela en AlertDialogClose.
function AlertDialogAction({ variant = "default", ...props }: AlertDialogActionProps) {
  return <Button data-slot="alert-dialog-action" variant={variant} {...props} />
}

type AlertDialogCancelProps = WithClassName<AlertDialogPrimitive.Close.Props> & {
  /** Mismo motivo que en `AlertDialogAction`: acá siempre hay texto. */
  size?: ButtonTextSize
}

function AlertDialogCancel({ className, size, children = "Cancelar", ...props }: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button variant="outline" size={size} className={className} />}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Close>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogTrigger,
  type AlertDialogActionProps,
  type AlertDialogCancelProps,
  type AlertDialogContentProps,
  type AlertDialogDescriptionProps,
  type AlertDialogOverlayProps,
  type AlertDialogTitleProps,
}
