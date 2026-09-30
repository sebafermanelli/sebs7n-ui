"use client"

import type * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"

import { cn } from "../lib/utils.js"
import { DrawerBody, DrawerContent } from "../components/drawer.js"

// La mitad de `adaptive-popover` que solo existe en una pantalla angosta: se carga con `import()`.
// No importa nada de `adaptive-popover` (el contexto le llega por props): así no hay un ciclo entre
// los dos, que el CLI de shadcn tendría que resolver al copiar el registry.

type AdaptiveDrawerProps = DrawerPrimitive.Popup.Props & {
  className?: string
  drawerClassName?: string
  "data-slot"?: string
  open: boolean
  onOpenChange: DrawerPrimitive.Root.Props["onOpenChange"]
  trigger: React.RefObject<Element | null>
  /** El `Provider` de `InDrawerContext`: recibe las partes de este módulo. */
  inDrawer: React.Provider<never>
}

export const Title = DrawerPrimitive.Title
export const Description = DrawerPrimitive.Description

export function AdaptiveDrawer({ className, drawerClassName, children, open, onOpenChange, trigger: triggerRef, inDrawer: InDrawer, ...props }: AdaptiveDrawerProps) {
  const trigger = triggerRef.current
  return (
    <DrawerPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DrawerContent
        {...(props as object)}
        // El nombre: el `PopoverTitle` si hay (Base UI lo pone en `aria-labelledby`, que le gana a
        // `aria-label`), si no el `aria-label` del popup y, si tampoco, el del disparador.
        aria-label={props["aria-label"] ?? (trigger?.getAttribute("aria-label") || trigger?.textContent) ?? undefined}
        data-slot="drawer-content"
        finalFocus={triggerRef as React.RefObject<HTMLElement | null>}
      >
        <InDrawer value={{ Title, Description, AdaptiveDrawer } as never}>
          {/* El ancho del popover no viaja (`w-80` en 390 px es justo lo que se salía): la hoja
              ocupa la pantalla. El primer bloque deja lugar a la X de arriba a la derecha. */}
          <DrawerBody data-slot={props["data-slot"]} className={cn("flex flex-col gap-2 pb-5 [&>:first-child]:pe-10", className, "w-full max-w-none", drawerClassName)}>
            {children}
          </DrawerBody>
        </InDrawer>
      </DrawerContent>
    </DrawerPrimitive.Root>
  )
}
