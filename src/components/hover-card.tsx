"use client"

import type * as React from "react"
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"

import { cn, type WithClassName } from "../lib/utils.js"

/**
 * La tarjeta que aparece al pasar el mouse por un link: la ficha de una
 * persona, el resumen de un cliente, la previsualización de una página. Abre
 * con un retardo para no dispararse al pasar de largo, y cierra con otro para
 * poder llegar hasta ella con el mouse.
 *
 * **Solo hover y foco, nunca contenido crítico.** En un celular no existe: no
 * hay hover, y el trigger es un link que navega con un toque. Todo lo que esté
 * acá adentro tiene que estar también del otro lado del link. Si el contenido
 * es la información —y no un adelanto de ella—, va en la página; si es una
 * línea que aclara un control, `Tooltip`; si hay algo con lo que interactuar,
 * `Popover`, que abre con un click y se puede cerrar con Escape en cualquier
 * dispositivo.
 *
 * El trigger es un `<a>`: se le pasa `href` derecho, no `render={<Button />}`.
 */
function HoverCard(props: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root {...props} />
}

type HoverCardTriggerProps = WithClassName<PreviewCardPrimitive.Trigger.Props>

function HoverCardTrigger({ className, closeDelay = 300, delay = 600, ...props }: HoverCardTriggerProps) {
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      className={cn(className)}
      closeDelay={closeDelay}
      delay={delay}
      {...props}
    />
  )
}

type HoverCardContentProps = WithClassName<PreviewCardPrimitive.Popup.Props> &
  Pick<PreviewCardPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">

function HoverCardContent({
  align = "center",
  alignOffset = 0,
  className,
  side = "bottom",
  sideOffset = 8,
  ...props
}: HoverCardContentProps) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "flex w-72 origin-(--transform-origin) flex-col gap-3 rounded-xl bg-background-100 p-4 text-copy-14 text-gray-1000 shadow-menu outline-none",
            // Mismo motivo que en Popover: sin elementos tabulables adentro, Base UI enfoca el
            // popup y con `outline-none` no se veía nada (WCAG 2.4.7).
            "focus-visible:focus-ring",
            "transition-opacity duration-150 motion-reduce:transition-none data-ending-style:opacity-0 data-starting-style:opacity-0",
            className
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

function HoverCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="hover-card-header" className={cn("flex items-center gap-3", className)} {...props} />
}

export { HoverCard, HoverCardContent, HoverCardHeader, HoverCardTrigger, type HoverCardContentProps, type HoverCardTriggerProps }
