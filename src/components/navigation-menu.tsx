"use client"

import type * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "../lib/utils.js"

/**
 * Navegación de sitio con paneles: el "mega menú" de vercel.com.
 *
 * No es un `DropdownMenu`. Un menú es una lista de **acciones** sobre la página
 * en la que estás (`role="menu"`, se recorre con las flechas y atrapa el foco);
 * esto es un grupo de **links a otras páginas** (`<nav>` + `<ul>` + `<a>`), que
 * es lo que un lector de pantalla y un crawler necesitan que sea. La regla
 * corta: si los ítems navegan, `NavigationMenu`; si ejecutan algo, `DropdownMenu`.
 *
 * Abre con hover y con teclado, y Base UI pone `aria-expanded`, `aria-controls`
 * y el `id` del panel en el trigger. Escape cierra y devuelve el foco al
 * trigger. El movimiento respeta `prefers-reduced-motion`: el reset del paquete
 * lleva toda transición a 0,01ms, y las piezas animadas suman `motion-reduce`
 * para que no quede ni el desplazamiento.
 *
 * El trigger se ve **igual que un link del nav** (14px, peso 400, `gray-900`
 * que sube a `gray-1000`) y no tiene fondo en ningún estado: en una barra de
 * navegación el único control con fondo es el CTA.
 */
function NavigationMenu({ className, ...props }: NavigationMenuPrimitive.Root.Props) {
  return <NavigationMenuPrimitive.Root data-slot="navigation-menu" className={cn("relative", className)} {...props} />
}

function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("relative flex list-none items-center gap-2", className)}
      {...props}
    />
  )
}

function NavigationMenuItem(props: NavigationMenuPrimitive.Item.Props) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" {...props} />
}

/**
 * El trigger del panel, con el cuerpo de un link de nav y un chevron que gira.
 *
 * `active` lo marca como la página en la que estás — igual que `aria-current`
 * en un link suelto — para cuando el panel agrupa páginas y estás parado en
 * una de ellas. No usa `aria-current`: el trigger no es un link, no lleva a
 * ninguna parte, y `aria-current` sobre un botón le dice al lector de pantalla
 * que este control **es** la página actual, que no es cierto.
 */
type NavigationMenuTriggerProps = Omit<NavigationMenuPrimitive.Trigger.Props, "className"> & {
  className?: string
  /** Si alguna de las páginas del panel es la que se está leyendo. */
  active?: boolean
  /** `false` saca el chevron (un trigger que ya se explica solo). */
  chevron?: boolean
}

function NavigationMenuTrigger({ className, active, chevron = true, children, ...props }: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      data-active={active ? "" : undefined}
      className={cn(
        // Mismo cuerpo que un link del nav: sin fondo en ningún estado, el
        // padding existe solo para que el área clickeable llegue a 32px y el
        // anillo de foco no apriete el texto.
        "inline-flex cursor-pointer items-center gap-1 rounded-md bg-transparent px-2 py-1.5 text-copy-14 text-gray-900 select-none",
        "outline-none transition-control hover:text-gray-1000 focus-visible:focus-ring",
        "data-popup-open:text-gray-1000 data-active:text-gray-1000",
        "data-disabled:cursor-not-allowed data-disabled:text-gray-700 data-disabled:hover:text-gray-700",
        className
      )}
      {...props}
    >
      {children}
      {chevron && (
        <NavigationMenuPrimitive.Icon
          data-slot="navigation-menu-icon"
          className="flex transition-transform duration-150 ease-out motion-reduce:transition-none data-popup-open:rotate-180"
        >
          <ChevronDownIcon aria-hidden="true" className="size-3.5" />
        </NavigationMenuPrimitive.Icon>
      )}
    </NavigationMenuPrimitive.Trigger>
  )
}

/**
 * El contenido de un ítem, que se mueve al panel cuando ese ítem está activo.
 *
 * Para varias columnas, la grilla va en el `className`:
 * `className="sm:w-[34rem]"` y adentro un `<ul className="grid sm:grid-cols-2">`.
 *
 * `keepMounted` deja los links en el DOM con el menú cerrado (ocultos con
 * `hidden`), así un crawler que no ejecuta el hover los ve en el HTML del
 * server. Cuesta un poco de markup por panel; para un nav de sitio, donde el
 * menú suele ser el link principal a esas páginas, vale la pena.
 *
 * Ojo con el alcance: garantiza el HTML del server y el DOM **hasta la primera
 * apertura**. Al abrir, el contenido se muda al popup, que vive en un portal
 * sin `keepMounted`, así que al cerrar se desmonta con él. Para el caso que
 * motivó la prop —que un crawler vea los links— da igual: un crawler no abre
 * el menú. Si hiciera falta después de cerrar, el `keepMounted` que hay que
 * poner es el del portal, no el del contenido.
 */
type NavigationMenuContentProps = Omit<NavigationMenuPrimitive.Content.Props, "className"> & { className?: string }

function NavigationMenuContent({ className, ...props }: NavigationMenuContentProps) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "h-full w-[calc(100vw-2.5rem)] p-1 sm:w-max sm:min-w-64",
        // Entra y sale en la dirección desde la que venís, como en vercel.com:
        // pasar de un panel al de al lado se lee como un desplazamiento, no
        // como dos paneles distintos.
        "transition-[opacity,translate] duration-150 ease-out motion-reduce:transition-none",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        "data-starting-style:data-[activation-direction=left]:-translate-x-1/4",
        "data-starting-style:data-[activation-direction=right]:translate-x-1/4",
        "data-ending-style:data-[activation-direction=left]:translate-x-1/4",
        "data-ending-style:data-[activation-direction=right]:-translate-x-1/4",
        "motion-reduce:data-starting-style:translate-x-0 motion-reduce:data-ending-style:translate-x-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Un link del panel: título, descripción de una línea y un ícono opcional.
 *
 * Con `title` arma la **tarjeta** del mega menú (superficie, padding, hover).
 * Sin `title` pone solo lo compartido —radio, foco, `transition-control`, sin
 * subrayado— y el `className` manda: es el modo para un link de la barra, que
 * tiene el cuerpo de un link de nav y no el de una tarjeta.
 *
 * Renderiza un `<a>`. Para el `Link` del framework, `render={<NextLink … />}`:
 * la navegación del lado del cliente la tiene que hacer el router, o cada ítem
 * del menú recarga la página entera.
 */
type NavigationMenuLinkProps = Omit<NavigationMenuPrimitive.Link.Props, "className" | "title"> & {
  className?: string
  /** Título del ítem. Con él, el link se arma como tarjeta del mega menú. */
  title?: React.ReactNode
  /** Una línea, no dos: se trunca. Dice a quién le sirve la página, no qué es. */
  description?: React.ReactNode
  /** Ícono de 16px a la izquierda. Opcional. */
  icon?: React.ReactNode
}

/** Lo que comparten los dos modos: radio, foco y sin subrayado. */
const linkBaseClassName = "rounded-md no-underline outline-none transition-control focus-visible:focus-ring"

function NavigationMenuLink({ className, title, description, icon, children, ...props }: NavigationMenuLinkProps) {
  if (title === undefined) {
    return (
      <NavigationMenuPrimitive.Link
        data-slot="navigation-menu-link"
        className={cn(linkBaseClassName, className)}
        {...props}
      >
        {children}
      </NavigationMenuPrimitive.Link>
    )
  }

  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        linkBaseClassName,
        "block p-2 text-copy-14 text-gray-1000 hover:bg-gray-100 data-[active]:bg-gray-100",
        className
      )}
      {...props}
    >
      <span className="flex items-start gap-2.5">
        {icon && (
          <span
            aria-hidden="true"
            data-slot="navigation-menu-link-icon"
            className="mt-px flex shrink-0 text-gray-900 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
          >
            {icon}
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span data-slot="navigation-menu-link-title" className="text-copy-14 text-gray-1000">
            {title}
          </span>
          {description && (
            <span data-slot="navigation-menu-link-description" className="truncate text-copy-13 text-gray-900">
              {description}
            </span>
          )}
          {children}
        </span>
      </span>
    </NavigationMenuPrimitive.Link>
  )
}

/**
 * Posicionador del panel, ya dentro del portal.
 *
 * El `before` invisible tapa el hueco de `sideOffset` entre el trigger y el
 * panel: sin él, bajar el mouse del trigger al panel lo cierra a mitad de
 * camino.
 */
type NavigationMenuPositionerProps = NavigationMenuPrimitive.Positioner.Props &
  Pick<NavigationMenuPrimitive.Portal.Props, "container">

function NavigationMenuPositioner({
  className,
  container,
  align = "start",
  side = "bottom",
  sideOffset = 8,
  collisionPadding = 16,
  ...props
}: NavigationMenuPositionerProps) {
  return (
    <NavigationMenuPrimitive.Portal container={container}>
      <NavigationMenuPrimitive.Positioner
        data-slot="navigation-menu-positioner"
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        collisionAvoidance={{ side: "none" }}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)",
          "transition-[top,left,right,bottom] duration-200 ease-out motion-reduce:transition-none data-instant:transition-none",
          "before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']",
          className
        )}
        {...props}
      />
    </NavigationMenuPrimitive.Portal>
  )
}

/** La superficie del panel: los tokens del menú del sistema. */
type NavigationMenuPopupProps = Omit<NavigationMenuPrimitive.Popup.Props, "className"> & { className?: string }

function NavigationMenuPopup({ className, ...props }: NavigationMenuPopupProps) {
  return (
    <NavigationMenuPrimitive.Popup
      data-slot="navigation-menu-popup"
      className={cn(
        // `shadow-menu` ya trae el hairline de 1px del sistema: un `border`
        // encima lo dibujaría dos veces (misma regla que Popover y DropdownMenu).
        "relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden",
        // El `focus-visible:focus-ring` es por el mismo motivo que en Popover y HoverCard: si el
        // panel no tiene links adentro, Base UI lo enfoca a él y con `outline-none` no se veía nada.
        "rounded-xl bg-background-100 p-1 text-gray-1000 shadow-menu outline-none focus-visible:focus-ring",
        "transition-[opacity,transform,width,height] duration-200 ease-out motion-reduce:transition-none",
        "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
        "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
        "motion-reduce:data-starting-style:scale-100 motion-reduce:data-ending-style:scale-100",
        className
      )}
      {...props}
    />
  )
}

/**
 * El panel entero: portal, posicionador, superficie y viewport en una pieza.
 *
 * Va **una sola vez**, como último hijo de `NavigationMenu`, hermano de la
 * lista: el panel es uno y el contenido del ítem activo se mueve adentro. Es la
 * pieza que se usa el 99% de las veces; `NavigationMenuPositioner` y
 * `NavigationMenuPopup` quedan sueltas para armarlo a mano (una flecha, otro
 * contenedor, un portal a un nodo propio).
 */
type NavigationMenuViewportProps = Omit<NavigationMenuPrimitive.Viewport.Props, "className"> & {
  className?: string
  /** Clases de la superficie (ancho máximo, padding). */
  popupClassName?: string
  /** Clases y props de posición del posicionador. */
  positionerClassName?: string
  align?: NavigationMenuPrimitive.Positioner.Props["align"]
  side?: NavigationMenuPrimitive.Positioner.Props["side"]
  sideOffset?: NavigationMenuPrimitive.Positioner.Props["sideOffset"]
  container?: NavigationMenuPrimitive.Portal.Props["container"]
}

function NavigationMenuViewport({
  className,
  popupClassName,
  positionerClassName,
  align,
  side,
  sideOffset,
  container,
  ...props
}: NavigationMenuViewportProps) {
  return (
    <NavigationMenuPositioner
      align={align}
      side={side}
      sideOffset={sideOffset}
      container={container}
      className={positionerClassName}
    >
      <NavigationMenuPopup className={popupClassName}>
        <NavigationMenuPrimitive.Viewport
          data-slot="navigation-menu-viewport"
          className={cn("relative h-full w-full overflow-hidden", className)}
          {...props}
        />
      </NavigationMenuPopup>
    </NavigationMenuPositioner>
  )
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  type NavigationMenuContentProps,
  type NavigationMenuLinkProps,
  type NavigationMenuPopupProps,
  type NavigationMenuPositionerProps,
  type NavigationMenuTriggerProps,
  type NavigationMenuViewportProps,
}
