"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "../lib/utils.js"
import { floatingPopupClassName } from "../variants/overlay.js"

/**
 * El popover que en una pantalla angosta se presenta como la hoja de abajo (`Drawer`).
 *
 * ── Por qué automático y no una prop que la app tenga que acordarse de poner ──
 *
 * Es lo que hace Apple, y lo que iCloud web hereda de iOS: un popover en ancho compacto (un iPhone,
 * una ventana angosta) se adapta solo a una hoja que sube desde abajo, y un menú (`UIMenu`, el
 * pull-down, el pop-up button de un Select) **no** se adapta: sigue anclado, porque es corto y es
 * una lista de acciones. Un panel con contenido —una lista de avisos, un calendario, un selector de
 * color, un chat— anclado a un ítem en 390 px no tiene dónde entrar: el ancho de la pantalla menos
 * el disparador. El caso que lo disparó fue un panel de avisos al costado del sidebar en el Sheet
 * mobile: se salía por la derecha con el texto cortado.
 *
 * El corte es el `sm` de Tailwind (40rem, 640 px): debajo están los teléfonos en vertical y en
 * horizontal; en 768 (un iPad vertical) el popover sigue anclado, como en iPadOS. `mobile="popover"`
 * en `Popover` es la salida para un popover chico que entra en cualquier pantalla.
 *
 * ── Cómo, sin cambiar la API ──
 *
 * `Popover` sigue siendo `Popover.Root` de Base UI, pero su `open` pasa por acá. En angosto el root
 * de Base UI queda cerrado —si quedara abierto sin popup, su «click afuera» cerraría la hoja al
 * primer toque adentro— y el mismo estado abre un `Drawer.Root`. El disparador es el del popover:
 * se toma de `eventDetails.trigger` para devolverle el foco al cerrar y para nombrar la hoja cuando
 * no hay `PopoverTitle`. `aria-expanded` se corrige a mano, porque Base UI lo calcula con su root.
 */

// `max-width` y no `min-width`: el server no sabe el ancho y renderiza el popover; en el cliente
// `useSyncExternalStore` hidrata con eso y cambia después, sin error de hidratación.
const COMPACT = "(max-width: 39.99rem)"

const query = () => (typeof matchMedia === "function" ? matchMedia(COMPACT) : null)
const subscribe = (onChange: () => void) => {
  const q = query()
  q?.addEventListener("change", onChange)
  return () => q?.removeEventListener("change", onChange)
}
const isCompact = () => !!query()?.matches

type ChangeDetails = PopoverPrimitive.Root.ChangeEventDetails

type DrawerModule = typeof import("../internal/adaptive-drawer.js")

// La hoja se pide recién en una pantalla angosta, como el Sheet de `AppShell`: el Drawer de Base UI
// pesa ~15 kB y un popover en desktop no lo necesita nunca. Una sola carga para toda la página.
let drawerLoaded: DrawerModule | null = null
let drawerLoading: Promise<DrawerModule> | null = null
const loadDrawer = () => (drawerLoading ??= import("../internal/adaptive-drawer.js").then((mod) => (drawerLoaded = mod)))

export type AdaptiveValue = {
  /** Angosto y sin `mobile="popover"`: se presenta como hoja. */
  drawer: boolean
  open: boolean
  setOpen: (open: boolean, details: ChangeDetails) => void
  trigger: React.RefObject<Element | null>
  drawerModule: DrawerModule | null
}

const AdaptiveContext = React.createContext<AdaptiveValue | null>(null)

/**
 * Dentro de la hoja: `PopoverTitle` y `PopoverDescription` pasan a ser los del Drawer (los trae el
 * módulo de la hoja, así `popover` no importa el Drawer de Base UI).
 */
export const InDrawerContext = React.createContext<DrawerModule | null>(null)
export const useInDrawer = () => React.useContext(InDrawerContext)

export type AdaptivePopoverRootProps = PopoverPrimitive.Root.Props & {
  /**
   * Cómo se presenta en una pantalla angosta (< 640 px). `"drawer"` (por defecto): la hoja de abajo,
   * arrastrable, con la X y el foco adentro, como el popover de iOS en un iPhone. `"popover"`: anclado
   * igual que en desktop, para un popover chico que entra en cualquier pantalla.
   */
  mobile?: "drawer" | "popover"
}

export function AdaptivePopoverRoot({ open: openProp, defaultOpen = false, onOpenChange, mobile, ...props }: AdaptivePopoverRootProps) {
  const drawer = React.useSyncExternalStore(subscribe, isCompact, () => false) && mobile !== "popover"
  const [own, setOwn] = React.useState(defaultOpen)
  // Arranca en `null` aunque ya esté en memoria, para coincidir con el HTML del servidor.
  const [drawerModule, setDrawerModule] = React.useState<DrawerModule | null>(null)
  React.useEffect(() => {
    if (!drawer || drawerModule) return
    if (drawerLoaded) setDrawerModule(drawerLoaded)
    else void loadDrawer().then(setDrawerModule)
  }, [drawer, drawerModule])
  const trigger = React.useRef<Element | null>(null)
  const open = openProp ?? own
  const setOpen = (next: boolean, details: ChangeDetails) => {
    if (next && details.trigger) trigger.current = details.trigger
    onOpenChange?.(next, details)
    if (!details.isCanceled) setOwn(next)
  }
  return (
    <AdaptiveContext.Provider value={{ drawer, open, setOpen, trigger, drawerModule }}>
      <PopoverPrimitive.Root {...props} onOpenChange={setOpen} open={open && !drawer} />
    </AdaptiveContext.Provider>
  )
}

/**
 * `true` cuando el popover de arriba se presenta como hoja (pantalla angosta y sin `mobile="popover"`).
 * Se usa adentro de `Popover` (en el contenido o en el disparador) para adaptar el contenido: sin
 * margen propio, alto completo, etc. Fuera de un `Popover` devuelve `false`.
 */
export function usePopoverSheet(): boolean {
  return React.useContext(AdaptiveContext)?.drawer ?? false
}

/** El disparador. En angosto le corrige el estado de la hoja, que Base UI no ve. */
export function AdaptiveTrigger(props: PopoverPrimitive.Trigger.Props) {
  const ctx = React.useContext(AdaptiveContext)
  const compact = ctx?.drawer && { "aria-expanded": ctx.open, "aria-haspopup": "dialog" as const, "data-popup-open": ctx.open ? "" : undefined }
  return <PopoverPrimitive.Trigger {...props} {...compact} />
}

export type AdaptivePopupProps = PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "collisionPadding" | "side" | "sideOffset"> & {
    className?: string
    /** Clases extra de la hoja. Los selectores bajan su contenido debajo de la X en vez de correrlo. */
    drawerClassName?: string
    "data-slot"?: string
  }

export function AdaptivePopup({ className, drawerClassName, side, align, alignOffset, collisionPadding = 8, sideOffset, children, ...props }: AdaptivePopupProps) {
  const ctx = React.useContext(AdaptiveContext)
  // Sin el módulo todavía (unos ms después de montar en un teléfono), nada: la hoja aparece apenas llega.
  if (ctx?.drawer) {
    const Drawer = ctx.drawerModule?.AdaptiveDrawer
    return Drawer && (
      <Drawer {...(props as object)} className={className} drawerClassName={drawerClassName} inDrawer={InDrawerContext.Provider} onOpenChange={ctx.setOpen as never} open={ctx.open} trigger={ctx.trigger}>
        {children}
      </Drawer>
    )
  }
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup className={cn(floatingPopupClassName, className)} {...props}>
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}
