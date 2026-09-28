"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn, type WithClassName } from "../lib/utils.js"
import { alertFooterClassName, alertPopupClassName, backdropClassName } from "../variants/overlay.js"
import type { ButtonTextSize } from "../variants/button.js"
import { Button, type ButtonBaseProps } from "./button.js"

// La alerta de macOS (2.0): el mismo velo y el mismo material que Dialog, pero otro objeto.
// Compacta (300 px), con el ícono arriba y los botones iguales a lo ancho. Además:
// role="alertdialog", no se cierra con click en el backdrop y no tiene botón X (exige una
// respuesta).

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
 * Base UI enfoca el primer tabulable, y en una alerta apilada con la acción destructiva arriba
 * (`stacked`, la acción primero en el DOM) eso era «Descartar cambios»: un Return y se perdía
 * todo. macOS nunca arranca en una acción destructiva. Sin `AlertDialogCancel`, o con el dedo
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
        className={cn(alertPopupClassName, className)}
        ref={foco.mergedRef}
        initialFocus={initialFocus ?? foco.initialFocus}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  )
}

/**
 * El ícono de la alerta, arriba a la izquierda: el de advertencia o el de la app, como en macOS.
 * Es decorativo —el título ya dice qué pasa—, así que va con `aria-hidden`. Un `<svg>` sin
 * tamaño propio, o una `<img>`, se lleva a 48 px.
 */
function AlertDialogIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-slot="alert-dialog-icon"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center [&>img]:size-12 [&>svg:not([class*='size-'])]:size-12",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-1", className)} {...props} />
}

type AlertDialogFooterProps = React.ComponentProps<"div"> & {
  /**
   * Apila los botones aunque sean dos, en el orden en que se escribieron. Para etiquetas largas
   * («Descartar cambios», «Eliminar definitivamente»), que lado a lado no entran en 300 px.
   * Con tres o más botones, o en una pantalla angosta, el pie ya se apila solo.
   */
  stacked?: boolean
}

function AlertDialogFooter({ className, stacked = false, ...props }: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      data-stacked={stacked ? "" : undefined}
      className={cn(alertFooterClassName, stacked && "grid-flow-row gap-3", className)}
      {...props}
    />
  )
}

type AlertDialogTitleProps = WithClassName<AlertDialogPrimitive.Title.Props>

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-title-3 text-gray-1000", className)} {...props} />
}

type AlertDialogDescriptionProps = WithClassName<AlertDialogPrimitive.Description.Props>

function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-body text-pretty text-gray-900", className)}
      {...props}
    />
  )
}

type AlertDialogActionProps = Omit<ButtonBaseProps, "variant"> & {
  /**
   * `default` es el botón por defecto de macOS: el acento (`accent`). `destructive` es el
   * tintado (`destructive-tinted`): texto rojo sobre un tinte rojo.
   *
   * **Cambió en 2.0**: hasta 1.x `default` era el negro y `destructive` el rojo sólido.
   */
  variant?: "default" | "destructive"
  /** Los botones de un AlertDialog siempre llevan texto: los tamaños de ícono no aplican acá. */
  size?: ButtonTextSize
}

// No cierra solo (como shadcn base-nova): así sirve con `loading` mientras corre la acción.
// Controlá `open` en AlertDialog y cerralo cuando termine, o envolvela en AlertDialogClose.
//
// `default` es el botón por defecto de macOS (acento) y `destructive` el tintado de las alertas:
// en macOS la alerta ya advierte, el botón solo nombra la acción.
const ACTION_VARIANT = { default: "accent", destructive: "destructive-tinted" } as const

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
      // `secondary` es el push button gris de macOS: el de vidrio con borde (`outline`) se leía
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
  AlertDialogIcon,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogTrigger,
  type AlertDialogActionProps,
  type AlertDialogCancelProps,
  type AlertDialogContentProps,
  type AlertDialogDescriptionProps,
  type AlertDialogFooterProps,
  type AlertDialogOverlayProps,
  type AlertDialogTitleProps,
}
