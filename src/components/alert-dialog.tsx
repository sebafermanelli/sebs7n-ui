"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn, type WithClassName } from "../lib/utils.js"
import { alertFooterClassName, alertWidthClassName, backdropClassName, modalPopupClassName } from "../variants/overlay.js"
import type { ButtonTextSize } from "../variants/button.js"
import { Button, type ButtonBaseProps } from "./button.js"

// La alerta de iCloud (2.0, R2): el mismo diálogo que Dialog —radio 11, opaco, el velo sin blur—,
// de 450 px, con 24 de aire y todo centrado: el ícono de la marca arriba, el título, el texto y dos
// botones iguales a todo el ancho. El botón por defecto es el del acento y es el seguro: en una
// alerta destructiva es «Cancelar», y la acción que destruye va en gris con el texto rojo.
// Además: role="alertdialog", no se cierra con click en el backdrop y no tiene botón X (exige una
// respuesta).

// En el servidor `useLayoutEffect` avisa y no corre.
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

/**
 * Cuántas acciones destructivas hay en la alerta. Las anota cada `AlertDialogAction variant=
 * "destructive"` al montarse, antes de pintar; con una o más, `AlertDialogCancel` pasa a ser el
 * botón por defecto (el acento) y el foco inicial.
 */
const DestructiveContext = React.createContext<{ destructive: boolean; register: () => () => void }>({
  destructive: false,
  register: () => () => {},
})

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
 * El foco inicial por defecto: el botón por defecto.
 *
 * Con una acción destructiva es «Cancelar»: Base UI enfoca el primer tabulable, y con la acción
 * escrita primero eso era «Descartar cambios» —un Return y se perdía todo—. Sin destructiva es la
 * acción, que es el acento y la que dispara Return. Sin ninguno de los dos, o con el dedo (donde
 * Base UI enfoca el popup para no abrir el teclado), queda lo de Base UI. Un `initialFocus` de la
 * app gana siempre.
 */
function useFocoInicial(ref: React.Ref<HTMLDivElement> | undefined, destructive: boolean) {
  const popup = React.useRef<HTMLDivElement | null>(null)
  const destructiveRef = React.useRef(destructive)
  destructiveRef.current = destructive
  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      popup.current = node
      if (typeof ref === "function") return ref(node)
      if (ref) ref.current = node
    },
    [ref]
  )
  const initialFocus = React.useCallback((openType: string) => {
    if (openType === "touch") return popup.current
    const buscar = (selector: string) => popup.current?.querySelector<HTMLElement>(selector) ?? null
    const cancelar = buscar('[data-slot="alert-dialog-cancel"]')
    if (destructiveRef.current) return cancelar ?? true
    return buscar("[data-alert-action]") ?? cancelar ?? true
  }, [])
  return { mergedRef, initialFocus }
}

function AlertDialogContent({ className, ref, initialFocus, ...props }: AlertDialogContentProps) {
  const [destructivas, setDestructivas] = React.useState(0)
  const register = React.useCallback(() => {
    setDestructivas((n) => n + 1)
    return () => setDestructivas((n) => n - 1)
  }, [])
  const destructive = destructivas > 0
  const contexto = React.useMemo(() => ({ destructive, register }), [destructive, register])
  const foco = useFocoInicial(ref, destructive)
  return (
    <DestructiveContext.Provider value={contexto}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Popup
          data-slot="alert-dialog-content"
          // 24 px de aire (el diálogo común lleva 20) y todo centrado, como la alerta de iCloud.
          className={cn(modalPopupClassName, alertWidthClassName, "justify-items-center p-6 text-center", className)}
          ref={foco.mergedRef}
          initialFocus={initialFocus ?? foco.initialFocus}
          {...props}
        />
      </AlertDialogPrimitive.Portal>
    </DestructiveContext.Provider>
  )
}

/**
 * El ícono de la alerta, arriba al centro, en el color de la marca: el de la app o el de lo que
 * pasa (una nube, un documento), en trazo, como en iCloud. Es decorativo —el título ya dice qué
 * pasa—, así que va con `aria-hidden`. Un `<svg>` sin tamaño propio se lleva a 36 px y una `<img>`
 * a 40.
 */
function AlertDialogIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-slot="alert-dialog-icon"
      className={cn(
        "flex w-full justify-center text-brand-900 [&>img]:size-10 [&>svg:not([class*='size-'])]:size-9",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col items-center gap-1.5 text-center", className)} {...props} />
}

/**
 * Los botones: iguales y a todo el ancho, en el orden en que se escriben («Cancelar» primero, a la
 * izquierda). Con tres o más, o en una pantalla angosta, se apilan en ese mismo orden.
 */
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn(alertFooterClassName, className)} {...props} />
}

type AlertDialogTitleProps = WithClassName<AlertDialogPrimitive.Title.Props>

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-headline text-label", className)} {...props} />
}

type AlertDialogDescriptionProps = WithClassName<AlertDialogPrimitive.Description.Props>

function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-callout leading-5 text-pretty text-label-secondary", className)}
      {...props}
    />
  )
}

type AlertDialogActionProps = Omit<ButtonBaseProps, "variant"> & {
  /**
   * `default` es el botón por defecto: el acento sólido, el que dispara Return. `destructive` es la
   * acción que destruye: gris con el texto rojo (`text-red-ink`, 4,5:1 sobre el gris en los dos
   * temas), y con ella el botón por defecto pasa a ser «Cancelar».
   *
   * **Cambió en 2.0**: hasta 1.x `default` era el negro y `destructive` el rojo sólido.
   */
  variant?: "default" | "destructive"
  /** Los botones de un AlertDialog siempre llevan texto: los tamaños de ícono no aplican acá. */
  size?: ButtonTextSize
}

// No cierra solo (como shadcn base-nova): así sirve con `loading` mientras corre la acción.
// Controlá `open` en AlertDialog y cerralo cuando termine, o envolvela en AlertDialogClose.
function AlertDialogAction({ variant = "default", className, ...props }: AlertDialogActionProps) {
  const { register } = React.useContext(DestructiveContext)
  const destructive = variant === "destructive"
  useIsoLayoutEffect(() => (destructive ? register() : undefined), [destructive, register])
  return (
    <Button
      data-alert-action={variant}
      data-slot="alert-dialog-action"
      variant={destructive ? "secondary" : "accent"}
      className={cn(destructive && "text-red-ink", className)}
      {...props}
    />
  )
}

type AlertDialogCancelProps = WithClassName<AlertDialogPrimitive.Close.Props> & {
  /** Mismo motivo que en `AlertDialogAction`: acá siempre hay texto. */
  size?: ButtonTextSize
}

/**
 * Cierra sin hacer nada. Con una acción destructiva al lado es el botón por defecto —el acento— y
 * el foco inicial: la opción segura es la que se ve primero. Si no, es el gris.
 */
function AlertDialogCancel({ className, size, children = "Cancelar", ...props }: AlertDialogCancelProps) {
  const { destructive } = React.useContext(DestructiveContext)
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button variant={destructive ? "accent" : "secondary"} size={size} className={className} />}
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
  type AlertDialogOverlayProps,
  type AlertDialogTitleProps,
}
