"use client"

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn, type WithClassName } from "../lib/utils.js"

/**
 * Una caja con scroll y una barra propia, discreta: aparece al pasar el mouse o
 * al scrollear y se va sola. Para una lista larga dentro de un panel, un log,
 * una tabla ancha — no para la página entera, que tiene que seguir usando el
 * scroll del navegador.
 *
 * **No reemplaza el scroll nativo.** Adentro hay un `div` con `overflow`
 * normal: la rueda, el trackpad, el arrastre táctil, Página arriba/abajo y el
 * scroll por teclado funcionan como siempre. Lo único que cambia es que la
 * barra del sistema se oculta y se dibuja la del paquete, que en un celular no
 * se muestra nunca porque ahí la barra nativa ya es un overlay que desaparece.
 *
 * Base UI le pone `tabIndex={0}` al viewport cuando hay desborde, así que se
 * llega con Tab y se scrollea con las flechas. Por eso el foco es visible.
 */
type ScrollAreaProps = WithClassName<ScrollAreaPrimitive.Root.Props> & {
  /** Qué barras se dibujan. `both` agrega también la esquina entre las dos. */
  orientation?: "vertical" | "horizontal" | "both"
  /** Clases del viewport (el elemento que scrollea y recibe el foco). */
  viewportClassName?: string
  /** Clases del contenido, dentro del viewport. Ahí va el padding. */
  contentClassName?: string
}

function ScrollArea({ className, children, contentClassName, orientation = "vertical", viewportClassName, ...props }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative overflow-hidden", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn("size-full overscroll-contain rounded-[inherit] outline-none focus-visible:focus-ring", viewportClassName)}
      >
        <ScrollAreaPrimitive.Content data-slot="scroll-area-content" className={cn(contentClassName)}>
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>

      {orientation !== "horizontal" && <ScrollAreaScrollbar orientation="vertical" />}
      {orientation !== "vertical" && <ScrollAreaScrollbar orientation="horizontal" />}
      {orientation === "both" && <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />}
    </ScrollAreaPrimitive.Root>
  )
}

type ScrollAreaScrollbarProps = WithClassName<ScrollAreaPrimitive.Scrollbar.Props>

/** La barra. `ScrollArea` ya pone la que corresponda: esto es para armar una caja a mano. */
function ScrollAreaScrollbar({ className, ...props }: ScrollAreaScrollbarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      className={cn(
        "flex touch-none p-0.5 opacity-0 transition-opacity duration-150 ease-out select-none motion-reduce:transition-none",
        // Invisible y sin capturar el puntero hasta que haga falta.
        "pointer-events-none data-hovering:pointer-events-auto data-hovering:opacity-100",
        "data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0",
        "data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:flex-col data-[orientation=horizontal]:h-2.5",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="flex-1 rounded-full bg-gray-alpha-500 transition-control hover:bg-gray-alpha-600"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollAreaScrollbar, type ScrollAreaProps, type ScrollAreaScrollbarProps }
