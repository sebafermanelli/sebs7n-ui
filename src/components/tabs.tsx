"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn, type WithClassName } from "../lib/utils.js"
import { segmentedThumbClassName, segmentedTrackClassName } from "../variants/segmented.js"

type TabsProps = WithClassName<TabsPrimitive.Root.Props>

function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />
}

type TabsListProps = WithClassName<TabsPrimitive.List.Props> & {
  /**
   * `segmented`: una pista hundida en cápsula, y la pestaña activa es una pastilla que se
   * desliza de una a otra. Es la tira de pestañas de Safari, y el default desde 1.0.
   *
   * `line`: la de Geist, a todo el ancho, con una línea debajo de la activa. Para la
   * navegación de una página entera, donde una cápsula de 800px de ancho no es un control.
   */
  variant?: "segmented" | "line"
}

function TabsList({ className, variant = "segmented", children, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "group/tabs-list",
        variant === "line" ? "relative flex w-full items-center border-b border-gray-alpha-400" : segmentedTrackClassName,
        className
      )}
      {...props}
    >
      {children}
      {variant === "segmented" && (
        // Base UI mide la pestaña activa y deja su caja en estas cuatro variables. Animar
        // `left` y `width` es lo que hace que la pastilla se deslice en vez de saltar.
        <TabsPrimitive.Indicator
          data-slot="tabs-indicator"
          className={cn(segmentedThumbClassName, "top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width)")}
        />
      )}
    </TabsPrimitive.List>
  )
}

type TabsTriggerProps = WithClassName<TabsPrimitive.Tab.Props>

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative isolate inline-flex cursor-pointer items-center justify-center gap-1.5 px-3 text-callout whitespace-nowrap text-gray-900 outline-none select-none transition-control",
        // Segmentado: 28 + los 2 px de la pista de cada lado = 32, el alto de un botón `md` y el del
        // ThemeSwitcher, que es el mismo objeto. Línea: 32, el alto de los controles.
        "group-data-[variant=line]/tabs-list:h-8 group-data-[variant=segmented]/tabs-list:h-7 group-data-[variant=segmented]/tabs-list:rounded-full",
        // Con el dedo crecen de verdad y no con `touch-target`: el `::after` ya es el subrayado,
        // y van pegadas. La de línea a 44; la segmentada a 40, que con el `p-0.5` de la pista da 44.
        "pointer-coarse:group-data-[variant=line]/tabs-list:h-11 pointer-coarse:group-data-[variant=segmented]/tabs-list:h-10",
        // El `before` existe solo para el anillo de foco: una pestaña no es un botón, así que en
        // hover no se pinta ninguna pastilla. Lo único que cambia es el color del texto, y el
        // activo lo marca la línea de abajo (`after`) o la pastilla de la pista.
        "before:absolute before:inset-x-0 before:-z-10 before:transition-control",
        "group-data-[variant=line]/tabs-list:before:inset-y-1 group-data-[variant=line]/tabs-list:before:rounded-control",
        "group-data-[variant=segmented]/tabs-list:before:inset-y-0 group-data-[variant=segmented]/tabs-list:before:rounded-full",
        "hover:text-gray-1000 focus-visible:before:focus-ring",
        "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-gray-1000 after:opacity-0",
        "data-active:text-gray-1000 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        "data-disabled:cursor-not-allowed data-disabled:text-gray-700",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
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
