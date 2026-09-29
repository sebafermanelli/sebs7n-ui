"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn, type WithClassName } from "../lib/utils.js"
import { segmentedThumbClassName, segmentedTrackClassName } from "../variants/segmented.js"

type TabsProps = WithClassName<TabsPrimitive.Root.Props>

function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />
}

type TabsVariant = "line" | "segmented"

// La variante vive en la lista y la necesitan las pestañas: cada una se dibuja distinto según la
// tira, y con un contexto las clases de cada variante quedan escritas una sola vez, sin
// `group-data-[variant=…]` repetido en cada línea.
const VarianteContext = React.createContext<TabsVariant>("line")

type TabsListProps = WithClassName<TabsPrimitive.List.Props> & {
  /**
   * `line` (el default desde 2.0): las pestañas de Settings de iCloud, la navegación de una
   * página. Texto 17 gris, la activa en el label con un subrayado de 1 px del ancho del texto, y
   * una línea base a todo el ancho.
   *
   * `segmented`: el control segmentado de Calendar. Una pista gris y un segmento elevado que se
   * desliza hasta la opción elegida; todos los segmentos del mismo ancho. Para cambiar de vista
   * adentro de un panel (Día/Semana/Mes), no para navegar.
   */
  variant?: TabsVariant
}

function TabsList({ className, variant = "line", children, ...props }: TabsListProps) {
  return (
    <VarianteContext.Provider value={variant}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          variant === "line"
            ? // Medido en Settings: 30 entre pestañas + los 8 de padding de cada lado = 46 de texto a
              // texto. La línea base es `fill-3`, el `rgba(120,120,128,.36)` de iCloud, como sombra
              // interior: con muchas pestañas la tira scrollea de costado (sin barra) y un borde
              // quedaría afuera de la caja que recorta, con el subrayado de la activa escondido.
              // La tira se sale 8 px de cada lado (`-mx-2`) para que el texto de la primera quede
              // alineado con el contenido y su anillo de foco no se corte.
              "relative -mx-2 flex w-[calc(100%+1rem)] items-center gap-7.5 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-fill-3)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : // Grilla de columnas iguales: los segmentos de iCloud miden todos lo mismo, y así el
              // semibold del activo no corre a los vecinos.
              // `minmax(0,1fr)`: una columna puede achicarse por debajo de su texto (el texto largo se
              // corta con «…»), así en 360 px la pista no desborda.
              cn(segmentedTrackClassName, "inline-grid grid-flow-col auto-cols-[minmax(0,1fr)]"),
          className
        )}
        {...props}
      >
        {children}
        {variant === "segmented" && (
          // Base UI mide la pestaña activa y deja su caja en estas cuatro variables. Animar
          // `left` y `width` es lo que hace que el segmento se deslice en vez de saltar.
          <TabsPrimitive.Indicator
            data-slot="tabs-indicator"
            className={cn(segmentedThumbClassName, "top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width)")}
          />
        )}
      </TabsPrimitive.List>
    </VarianteContext.Provider>
  )
}

type TabsTriggerProps = WithClassName<TabsPrimitive.Tab.Props>

// Lo que comparten: el texto no usa la marca, en hover solo cambia el color, y el `before` existe
// solo para el anillo de foco (una pestaña no es un botón: no se pinta en hover).
const TRIGGER =
  "relative isolate inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap outline-none select-none transition-control " +
  "before:absolute before:inset-x-0 before:-z-10 before:transition-control focus-visible:before:focus-ring " +
  "after:absolute data-disabled:cursor-not-allowed data-disabled:opacity-40 " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

const TRIGGER_VARIANT: Record<TabsVariant, string> = {
  // Settings: 17 (la excepción a los 14 de un control: son la navegación de la página, como en
  // iCloud), 60 de alto. El subrayado (`after`) va del ancho del texto —descuenta el padding— y
  // encima de la línea base (`-bottom-px`), así la reemplaza en ese tramo. La primera y la última
  // pierden el padding de afuera: el texto arranca alineado con la línea.
  line:
    "h-15 shrink-0 px-2 text-body text-label-secondary hover:text-label data-active:text-label " +
    "before:inset-y-3 before:rounded-control " +
    "after:inset-x-2 after:bottom-0 after:h-px after:bg-label after:opacity-0 data-active:after:opacity-100 " +
    // Revisión de R4: el subrayado aparece con una transición corta; quieto con movimiento reducido.
    "after:transition-opacity after:duration-200 motion-reduce:after:transition-none",
  // Calendar: segmento de 24 (28 con la pista), 14 en label y el activo en semibold; con el dedo 40
  // (44 con la pista). El separador (`after`) mide 1 × 16 y se esconde en el activo y en el que le
  // sigue, donde lo taparía el segmento elevado.
  segmented:
    "h-6 min-w-0 px-3 pointer-coarse:h-10 text-callout text-label data-active:font-semibold " +
    "before:inset-y-0 before:rounded-[calc(var(--radius-control)-2px)] " +
    "after:left-0 after:top-1 after:h-4 after:w-px after:bg-fill-3 pointer-coarse:after:top-3 first:after:hidden data-active:after:hidden [[data-active]+&]:after:hidden",
}

// En el segmentado, el texto suelto va en un `<span>` que se corta con «…»: el texto directo de un
// `inline-flex` no puede llevar `text-overflow`.
function recortable(children: React.ReactNode) {
  return React.Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number" ? <span className="min-w-0 truncate">{child}</span> : child
  )
}

function TabsTrigger({ className, children, ...props }: TabsTriggerProps) {
  const variant = React.useContext(VarianteContext)
  return (
    <TabsPrimitive.Tab data-slot="tabs-trigger" className={cn(TRIGGER, TRIGGER_VARIANT[variant], className)} {...props}>
      {variant === "segmented" && typeof children !== "function" ? recortable(children) : children}
    </TabsPrimitive.Tab>
  )
}

type TabsContentProps = WithClassName<TabsPrimitive.Panel.Props>

/**
 * El panel es tabulable (Base UI le pone `tabIndex=0` para que el contenido
 * scrolleable se pueda alcanzar con el teclado), así que el `outline-none`
 * necesita reemplazo: sin él, quien llega por Tab desde el tablist no ve dónde
 * quedó el foco (WCAG 2.4.7). El `rounded-control` es para que el anillo siga la
 * forma del panel y no quede un rectángulo duro sobre contenido redondeado.
 */
function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("text-callout rounded-control outline-none focus-visible:focus-ring", className)}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsContentProps,
  type TabsListProps,
  type TabsProps,
  type TabsTriggerProps,
}
