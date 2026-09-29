"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn, type WithClassName } from "../lib/utils.js"
import { alertWidthClassName, backdropClassName, modalFooterClassName, modalPopupClassName } from "../variants/overlay.js"
import type { ButtonTextSize } from "../variants/button.js"
import { Button, type ButtonBaseProps } from "./button.js"

// La confirmación de iCloud (2.0, R2): el mismo diálogo que Dialog —radio 11, opaco, 20 px de
// padding, el velo sin blur—, más angosto (400 px), con el título y el cuerpo a la izquierda y los
// botones a la derecha. Además: role="alertdialog", no se cierra con click en el backdrop y no
// tiene botón X (exige una respuesta).

function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root {...props} />
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
      className={cn(backdropClassName, className)}
      {...props}
    />
  )
}

type AlertDialogContentProps = WithClassName<AlertDialogPrimitive.Popup.Props>

/**
 * El foco inicial por defecto: «Cancelar», si la alerta lo tiene.
 *
 * Base UI enfoca el primer tabulable, y con la acción destructiva primero en el DOM eso era
 * «Descartar cambios»: un Return y se perdía todo. Nunca se arranca en una acción destructiva. Sin `AlertDialogCancel`, o con el dedo
 * (donde Base UI enfoca el popup para no abrir el teclado), queda lo de Base UI. Un
 * `initialFocus` de la app gana siempre: es el caso de la alerta que no destruye nada.
 */
function useFocoEnCancelar(ref: React.Ref<HTMLDivElement> | undefined) {
  const popup = React.useRef<HTMLDivElement | null>(null)
  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      popup.current = node
      if (typeof ref === "function") return ref(node)
      if (ref) ref.current = node
    },
    [ref]
  )
  const initialFocus = React.useCallback(
    (openType: string) =>
      openType === "touch"
        ? popup.current
        : (popup.current?.querySelector<HTMLElement>('[data-slot="alert-dialog-cancel"]') ?? true),
    []
  )
  return { mergedRef, initialFocus }
}

function AlertDialogContent({ className, ref, initialFocus, ...props }: AlertDialogContentProps) {
  const foco = useFocoEnCancelar(ref)
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(modalPopupClassName, alertWidthClassName, className)}
        ref={foco.mergedRef}
        initialFocus={initialFocus ?? foco.initialFocus}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-1", className)} {...props} />
}

/**
 * Los botones abajo a la derecha, en el orden en que se escriben: «Cancelar» primero (a la
 * izquierda) y la acción después. En mobile se apilan en ese mismo orden, sin invertir.
 */
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn(modalFooterClassName, className)} {...props} />
}

type AlertDialogTitleProps = WithClassName<AlertDialogPrimitive.Title.Props>

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-title-3 text-label", className)} {...props} />
}

type AlertDialogDescriptionProps = WithClassName<AlertDialogPrimitive.Description.Props>

function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-callout text-pretty text-label-secondary", className)}
      {...props}
    />
  )
}

type AlertDialogActionProps = Omit<ButtonBaseProps, "variant"> & {
  /**
   * `default` es el botón principal de iCloud: el acento sólido (`accent`). `destructive` es el
   * mismo botón en rojo (`destructive`).
   *
   * **Cambió en 2.0**: hasta 1.x `default` era el negro.
   */
  variant?: "default" | "destructive"
  /** Los botones de un AlertDialog siempre llevan texto: los tamaños de ícono no aplican acá. */
  size?: ButtonTextSize
}

// No cierra solo (como shadcn base-nova): así sirve con `loading` mientras corre la acción.
// Controlá `open` en AlertDialog y cerralo cuando termine, o envolvela en AlertDialogClose.
//
// `default` es el principal de iCloud (acento sólido) y `destructive` el mismo botón en rojo: el
// catálogo solo tiene el «destructivo plain» (texto rojo) para menús y listas; en un diálogo la
// acción es el botón lleno, que iCloud ya pinta del color de la app (el OK rojo de Calendar). Un
// texto rojo sin fondo al lado de un Cancelar gris pesaría menos que Cancelar.
const ACTION_VARIANT = { default: "accent", destructive: "destructive" } as const

function AlertDialogAction({ variant = "default", ...props }: AlertDialogActionProps) {
  return <Button data-slot="alert-dialog-action" variant={ACTION_VARIANT[variant]} {...props} />
}

type AlertDialogCancelProps = WithClassName<AlertDialogPrimitive.Close.Props> & {
  /** Mismo motivo que en `AlertDialogAction`: acá siempre hay texto. */
  size?: ButtonTextSize
}

function AlertDialogCancel({ className, size, children = "Cancelar", ...props }: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      // `secondary` es el botón gris: el de borde (`outline`) se leía
      // como otra jerarquía al lado de la acción.
      render={<Button variant="secondary" size={size} className={className} />}
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
