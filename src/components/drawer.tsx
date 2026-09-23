"use client"

import type * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { XIcon } from "lucide-react"

import { useAvisoDeNombre } from "../internal/dialog-name-warning.js"
import { useLabels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { Button } from "./button.js"

/**
 * La hoja que se arrastra: entra desde un borde y se cierra deslizándola hacia
 * afuera, con inercia y con puntos de anclaje intermedios.
 *
 * ── Por qué `Drawer` y `Sheet` conviven, y `Sheet` NO pasa a construirse sobre `Drawer` ──
 *
 * 1. **Son dos patrones, no dos estilos del mismo.** `Sheet` es un `Dialog`
 *    pegado a un borde: se abre, se lee, se cierra con Escape o con un click
 *    afuera. `Drawer` es una superficie que el dedo agarra y mueve: tiene
 *    `swipeDirection`, `snapPoints`, área de swipe para abrirlo desde el borde
 *    y un handle. El gesto no es un adorno del panel lateral, es el
 *    componente.
 *
 * 2. **El árbol de partes es distinto.** `Drawer.Popup` exige vivir dentro de
 *    `Drawer.Viewport` (sin viewport no hay gesto ni bloqueo de scroll táctil)
 *    y tiene `Drawer.Content`, que marca la zona donde el puntero NO arrastra
 *    para que una lista larga pueda scrollear. `Sheet` no tiene ni una ni
 *    otra. Reescribir `Sheet` sobre `Drawer` no sería cambiarle la base: sería
 *    cambiarle el DOM.
 *
 * 3. **`Sheet` ya está en producción en cuatro apps.** Meterle gesto por abajo
 *    es un breaking change silencioso: un panel de filtros de escritorio que
 *    de golpe se puede arrastrar con el trackpad, un `AppShell` mobile que se
 *    cierra con un swipe que antes scrolleaba. Nada de eso aparecería en un
 *    diff ni en un test de las apps.
 *
 * Así que la regla de uso tiene que ser tajante, y está escrita en el sitio:
 * **el dedo lo mueve → `Drawer`; solo se lee y se cierra → `Sheet`; está
 * centrado y es una decisión → `Dialog`.**
 *
 * ── Accesibilidad: arrastrar no es una opción para todo el mundo ──
 *
 * Un drawer que solo se cierra deslizando es un drawer que no se puede cerrar
 * —con teclado, con switch control, con temblor, con una sola mano ocupada—.
 * Por eso acá el gesto es *siempre* un atajo encima de dos caminos que no
 * dependen de él:
 *
 * - **Escape** cierra y devuelve el foco al disparador (lo pone Base UI).
 * - **Un botón de cierre visible** (`showCloseButton`, prendido por defecto).
 *   No se apaga "porque el handle ya se ve": el handle no recibe foco, no es
 *   un botón y no se anuncia — es una pista visual, `aria-hidden`.
 *
 * El foco queda atrapado adentro mientras está abierto (`modal` por defecto) y
 * `DrawerTitle` es obligatorio: es el nombre accesible del diálogo.
 */
type DrawerProps = DrawerPrimitive.Root.Props

/**
 * Agrupa las partes. `swipeDirection` define de qué borde entra y hacia dónde
 * se descarta: `down` (por defecto) es la hoja de abajo, la de mobile.
 */
function Drawer(props: DrawerProps) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

type DrawerTriggerProps = DrawerPrimitive.Trigger.Props

function DrawerTrigger(props: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

type DrawerCloseProps = DrawerPrimitive.Close.Props

function DrawerClose(props: DrawerCloseProps) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

type DrawerSwipeAreaProps = WithClassName<DrawerPrimitive.SwipeArea.Props>

/**
 * Franja invisible pegada al borde que abre el drawer con un swipe hacia
 * adentro. Es opcional y **nunca es la única forma de abrir**: sin un
 * `DrawerTrigger` al lado, el drawer no existe para quien usa teclado.
 */
function DrawerSwipeArea({ className, ...props }: DrawerSwipeAreaProps) {
  return (
    <DrawerPrimitive.SwipeArea
      data-slot="drawer-swipe-area"
      className={cn(
        "fixed z-40 touch-none",
        "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:bottom-0 data-[swipe-direction=up]:h-6",
        "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:top-0 data-[swipe-direction=down]:h-6",
        "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:right-0 data-[swipe-direction=left]:w-6",
        "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:left-0 data-[swipe-direction=right]:w-6",
        className
      )}
      {...props}
    />
  )
}

type DrawerHandleProps = React.ComponentProps<"div">

/**
 * La barra que se agarra. Es decoración (`aria-hidden`): el arrastre lo maneja
 * el viewport sobre todo el popup, no este div.
 *
 * El área de toque no es la barra de 6px: lo que arrastra es **todo el popup
 * menos `DrawerBody`**, así que el objetivo real es la franja del handle más
 * el header entero. La franja sola ya mide 30px de alto (12 + 6 + 12).
 */
function DrawerHandle({ className, ...props }: DrawerHandleProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="drawer-handle"
      className={cn(
        "flex shrink-0 items-center justify-center",
        // En las hojas verticales ocupa el ancho y empuja el contenido; en las
        // laterales es una columna angosta contra el borde interno.
        "group-data-[swipe-direction=down]/drawer:w-full group-data-[swipe-direction=down]/drawer:py-3",
        "group-data-[swipe-direction=up]/drawer:order-last group-data-[swipe-direction=up]/drawer:w-full group-data-[swipe-direction=up]/drawer:py-3",
        "group-data-[swipe-direction=left]/drawer:order-last group-data-[swipe-direction=left]/drawer:h-full group-data-[swipe-direction=left]/drawer:px-3",
        "group-data-[swipe-direction=right]/drawer:h-full group-data-[swipe-direction=right]/drawer:px-3",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "rounded-full bg-gray-500",
          "group-data-[swipe-direction=down]/drawer:h-1.5 group-data-[swipe-direction=down]/drawer:w-12",
          "group-data-[swipe-direction=up]/drawer:h-1.5 group-data-[swipe-direction=up]/drawer:w-12",
          "group-data-[swipe-direction=left]/drawer:h-12 group-data-[swipe-direction=left]/drawer:w-1.5",
          "group-data-[swipe-direction=right]/drawer:h-12 group-data-[swipe-direction=right]/drawer:w-1.5"
        )}
      />
    </div>
  )
}

type DrawerContentProps = WithClassName<DrawerPrimitive.Popup.Props> & {
  /** Botón de cierre arriba a la derecha. Apagarlo deja el drawer sin control visible de cierre. */
  showCloseButton?: boolean
  /** La barra de arrastre. Apagala solo si el drawer no se puede arrastrar. */
  showHandle?: boolean
  /**
   * El texto del botón X. Con un `LabelsProvider` arriba se traduce de una vez para toda la app;
   * esta prop es la excepción de una pantalla puntual. Hasta 0.4.0 este texto no se podía cambiar
   * de ninguna forma: era el único «Cerrar» del paquete sin salida.
   */
  labels?: { close?: string }
}

/**
 * Portal + fondo + viewport + popup, igual que `SheetContent` arma todo el
 * panel de una. El lado sale de `swipeDirection` del root —Base UI lo publica
 * como `data-swipe-direction` en el popup—, así que no hay una prop `side` que
 * pueda contradecirlo.
 */
function DrawerContent({ className, children, showCloseButton = true, showHandle = true, labels, ...props }: DrawerContentProps) {
  const ref = useAvisoDeNombre<HTMLDivElement>("DrawerContent", "DrawerTitle", props.ref)
  const l = useLabels().drawer
  return (
    <DrawerPrimitive.Portal>
      {/* El fondo se aclara mientras se arrastra: `--drawer-swipe-progress` va
          de 0 a 1 y lo escribe el viewport. La variante `data-starting-style`
          gana por especificidad, así que la apertura sigue siendo un fundido. */}
      <DrawerPrimitive.Backdrop
        data-slot="drawer-overlay"
        className="fixed inset-0 z-50 bg-backdrop opacity-[calc(1_-_var(--drawer-swipe-progress))] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none"
      />
      {/* El viewport es obligatorio: es quien escucha el gesto y bloquea el
          scroll táctil de atrás. Sin él Base UI avisa por consola y el drawer
          queda sin arrastre. */}
      <DrawerPrimitive.Viewport data-slot="drawer-viewport" className="fixed inset-0 z-50">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          ref={ref}
          className={cn(
            "group/drawer absolute flex bg-background-100 text-copy-14 text-gray-1000 shadow-modal outline-none",
            // Redondeado solo del lado de adentro. Contra el borde de la
            // pantalla no hay radio: ahí el radio deja ver una franja de fondo.
            "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:max-h-[calc(100%-3rem)] data-[swipe-direction=down]:flex-col data-[swipe-direction=down]:rounded-t-xl",
            "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:max-h-[calc(100%-3rem)] data-[swipe-direction=up]:flex-col data-[swipe-direction=up]:rounded-b-xl",
            "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:flex-row data-[swipe-direction=left]:rounded-r-xl data-[swipe-direction=left]:sm:max-w-sm",
            "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:flex-row data-[swipe-direction=right]:rounded-l-xl data-[swipe-direction=right]:sm:max-w-sm",
            // `transform` a mano y no `translate-*` de Tailwind: mientras se
            // arrastra, Base UI escribe un `transform` inline que tiene que
            // pisar a este. Si el movimiento viviera en la propiedad
            // `translate`, las dos se sumarían y la hoja viajaría el doble.
            // `--drawer-snap-point-offset` es el snap point activo y
            // `--drawer-swipe-movement-*` el resto que quedó al soltar.
            "data-[swipe-direction=down]:[transform:translateY(calc(var(--drawer-snap-point-offset)_+_var(--drawer-swipe-movement-y)))]",
            "data-[swipe-direction=up]:[transform:translateY(calc(var(--drawer-snap-point-offset)_+_var(--drawer-swipe-movement-y)))]",
            "data-[swipe-direction=left]:[transform:translateX(var(--drawer-swipe-movement-x))]",
            "data-[swipe-direction=right]:[transform:translateX(var(--drawer-swipe-movement-x))]",
            // Cerrado: afuera de la pantalla, del lado por el que entra.
            "data-[swipe-direction=down]:data-starting-style:[transform:translateY(100%)] data-[swipe-direction=down]:data-ending-style:[transform:translateY(100%)]",
            "data-[swipe-direction=up]:data-starting-style:[transform:translateY(-100%)] data-[swipe-direction=up]:data-ending-style:[transform:translateY(-100%)]",
            "data-[swipe-direction=left]:data-starting-style:[transform:translateX(-100%)] data-[swipe-direction=left]:data-ending-style:[transform:translateX(-100%)]",
            "data-[swipe-direction=right]:data-starting-style:[transform:translateX(100%)] data-[swipe-direction=right]:data-ending-style:[transform:translateX(100%)]",
            // `--drawer-swipe-strength` (0,1 a 1) escala la duración según la
            // velocidad con la que se soltó: un envión fuerte cierra rápido.
            // Con `prefers-reduced-motion` no hay transición: aparece y listo.
            "transition-[transform] duration-[calc(320ms_*_var(--drawer-swipe-strength))] ease-out motion-reduce:transition-none",
            className
          )}
          {...props}
        >
          {showHandle && <DrawerHandle />}
          {/* Envoltorio propio: el popup es fila o columna según el lado, y sin
              esto el header y el body serían hermanos del handle en esa fila. */}
          <div data-slot="drawer-layout" className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
          {showCloseButton && (
            <DrawerPrimitive.Close
              data-base-ui-swipe-ignore=""
              data-slot="drawer-close"
              // Mismo motivo que en Dialog: el nombre en `aria-label`, que es lo que el tipo exige.
              render={<Button variant="ghost" size="icon-sm" aria-label={labels?.close ?? l.close} className="absolute top-4 right-4" />}
            >
              <XIcon />
            </DrawerPrimitive.Close>
          )}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  )
}

type DrawerBodyProps = WithClassName<DrawerPrimitive.Content.Props>

/**
 * El contenido scrolleable. Es `Drawer.Content` de Base UI, renombrado porque
 * en este sistema `XContent` es el panel (`DialogContent`, `SheetContent`) y
 * dos significados para el mismo sufijo se usan mal una sola vez y ya.
 *
 * Lo que hace de verdad: marca la zona donde el puntero **no** arrastra. Sin
 * esto, intentar scrollear una lista larga movería la hoja entera.
 */
function DrawerBody({ className, ...props }: DrawerBodyProps) {
  return (
    <DrawerPrimitive.Content
      data-slot="drawer-body"
      className={cn("min-h-0 flex-1 overflow-auto overscroll-contain px-6", className)}
      {...props}
    />
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-1.5 px-6 pt-2 pb-4 pr-12",
        // Las hojas laterales no tienen la franja del handle arriba, así que el
        // título necesita su propio aire.
        "group-data-[swipe-direction=left]/drawer:pt-6 group-data-[swipe-direction=right]/drawer:pt-6",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-footer" className={cn("mt-auto flex flex-col gap-2 border-t border-gray-400 p-6", className)} {...props} />
}

type DrawerTitleProps = WithClassName<DrawerPrimitive.Title.Props>

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("text-heading-20 text-gray-1000", className)} {...props} />
}

type DrawerDescriptionProps = WithClassName<DrawerPrimitive.Description.Props>

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("text-copy-14 text-gray-900", className)} {...props} />
}

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerTrigger,
  type DrawerBodyProps,
  type DrawerCloseProps,
  type DrawerContentProps,
  type DrawerDescriptionProps,
  type DrawerHandleProps,
  type DrawerProps,
  type DrawerSwipeAreaProps,
  type DrawerTitleProps,
  type DrawerTriggerProps,
}
