"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import { ControlSizeProvider } from "../internal/control-size.js"

import { useAvisoDeNombre } from "../internal/dialog-name-warning.js"
import { useLabels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { backdropClassName, closeButtonClassName, overlayCloseClassName } from "../variants/overlay.js"
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

const openSheets: Partial<Record<"left" | "right", number>> = {}

// Le avisa al Toaster que hay un panel lateral abierto (`<html data-sheet-open>`, ver `base.css`):
// se corre para no tapar el pie. Va adentro del Popup, así existe solo mientras la hoja está montada.
function SheetOpenMarker({ side }: { side: "top" | "right" | "bottom" | "left" }) {
  React.useEffect(() => {
    if (side !== "right" && side !== "left") return
    const root = document.documentElement
    const sides = () => (root.getAttribute("data-sheet-open") ?? "").split(" ").filter(Boolean)
    openSheets[side] = (openSheets[side] ?? 0) + 1
    root.setAttribute("data-sheet-open", [...new Set([...sides(), side])].join(" "))
    return () => {
      openSheets[side] = (openSheets[side] ?? 1) - 1
      if (openSheets[side]! > 0) return
      const rest = sides().filter((x) => x !== side)
      if (rest.length) root.setAttribute("data-sheet-open", rest.join(" "))
      else root.removeAttribute("data-sheet-open")
    }
  }, [side])
  return null
}

function SheetContent({ className, children, side = "right", showCloseButton = true, labels, ...props }: SheetContentProps) {
  const ref = useAvisoDeNombre<HTMLDivElement>("SheetContent", "SheetTitle", props.ref)
  const l = useLabels().sheet
  return (
    <SheetPrimitive.Portal>
      <ControlSizeProvider size={undefined}>
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className={backdropClassName}
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        ref={ref}
        className={cn(
          // Pegada al borde (2.0, R2): iCloud no tiene panel lateral, así que se deriva de sus tokens
          // —opaca, la sombra de popover y el radio del panel (11) solo en las esquinas de adentro—.
          // La flotante de las fases 1–3 se despegaba 8 px, como las hojas de iOS 26. El área segura
          // va de padding del lado de la pantalla, así el contenido no queda bajo la muesca.
          "fixed z-50 flex flex-col gap-4 bg-surface text-callout text-label shadow-modal outline-none transition-[translate] duration-200 ease-out",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:w-full data-[side=right]:sm:w-3/4 data-[side=right]:rounded-l-panel data-[side=right]:[--sf-safe-top:env(safe-area-inset-top)] data-[side=right]:[--sf-safe-right:env(safe-area-inset-right)] data-[side=right]:pt-[env(safe-area-inset-top)] data-[side=right]:pr-[env(safe-area-inset-right)] data-[side=right]:pb-[env(safe-area-inset-bottom)] data-[side=right]:sm:max-w-sm data-[side=right]:data-ending-style:translate-x-full data-[side=right]:data-starting-style:translate-x-full",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:w-3/4 data-[side=left]:rounded-r-panel data-[side=left]:[--sf-safe-top:env(safe-area-inset-top)] data-[side=left]:pt-[env(safe-area-inset-top)] data-[side=left]:pb-[env(safe-area-inset-bottom)] data-[side=left]:pl-[env(safe-area-inset-left)] data-[side=left]:sm:max-w-sm data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:rounded-b-panel data-[side=top]:[--sf-safe-top:env(safe-area-inset-top)] data-[side=top]:[--sf-safe-right:env(safe-area-inset-right)] data-[side=top]:pt-[env(safe-area-inset-top)] data-[side=top]:pl-[env(safe-area-inset-left)] data-[side=top]:pr-[env(safe-area-inset-right)] data-[side=top]:data-ending-style:-translate-y-full data-[side=top]:data-starting-style:-translate-y-full",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:rounded-t-panel data-[side=bottom]:[--sf-safe-right:env(safe-area-inset-right)] data-[side=bottom]:pb-[env(safe-area-inset-bottom)] data-[side=bottom]:pl-[env(safe-area-inset-left)] data-[side=bottom]:pr-[env(safe-area-inset-right)] data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-starting-style:translate-y-full",
          className
        )}
        {...props}
      >
        <SheetOpenMarker side={side} />
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close-button"
            // Mismo motivo que en Dialog: el nombre en `aria-label`, que es lo que el tipo exige.
            render={<Button variant="ghost" size="icon-sm" aria-label={labels?.close ?? l.close} className={cn(closeButtonClassName, overlayCloseClassName)} />}
          >
            <XIcon />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
      </ControlSizeProvider>
    </SheetPrimitive.Portal>
  )
}

// Mismo padding (20 px) y título que Dialog (2.0): el pie va sin línea arriba y con 12 px entre
// botones para que, apilados, las áreas de 44 no se pisen. El título va a la izquierda y `pr-12`
// deja lugar a la X, que queda en su línea, del otro lado.
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1 p-5 pr-12", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-3 p-5", className)} {...props} />
}

type SheetTitleProps = WithClassName<SheetPrimitive.Title.Props>

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-title-3 text-label", className)} {...props} />
}

type SheetDescriptionProps = WithClassName<SheetPrimitive.Description.Props>

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-callout text-label-secondary", className)} {...props} />
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
