"use client"

import type * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "../lib/utils.js"
import { menuItemClassName, menuPopupClassName } from "../variants/menu.js"

/**
 * El menú del botón derecho: las mismas acciones, ancladas al puntero.
 *
 * Es el **mismo** primitivo que `DropdownMenu` —`ContextMenu.Item` y
 * `Menu.Item` son el mismo componente de Base UI, con otro nombre— así que
 * comparte la pastilla, el radio, el `shadow-menu` y los estados de foco vía
 * `variants/menu.ts`. Lo único que cambia es quién lo abre y contra qué se
 * posiciona: no hay trigger visible, el ancla es el punto del puntero.
 *
 * **Nunca puede ser el único camino a una acción.** Un click derecho no existe
 * en un touch sin long-press, no se descubre mirando la pantalla y no está en
 * el orden de tabulación. Lo que esté acá tiene que estar también en un botón,
 * en un `DropdownMenu` visible o en un atajo documentado; el menú contextual es
 * el atajo de quien ya sabe que está, no la puerta de entrada.
 */
function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

/**
 * Dispara el menú desde el teclado sintetizando el evento que Base UI escucha.
 *
 * Base UI abre con `contextmenu`, que el navegador ya emite con la tecla de
 * menú contextual y con Shift+F10 — pero solo sobre el elemento enfocado, y el
 * trigger de Base UI es un `<div>` sin `tabIndex`: nunca llega el foco, así que
 * en la práctica el menú es inalcanzable sin mouse. Por eso el wrapper hace dos
 * cosas: lo vuelve enfocable y, cuando llega la tecla, emite el `contextmenu`
 * él mismo anclado al rectángulo del elemento.
 *
 * El `preventDefault()` sobre el `keydown` cancela el `contextmenu` nativo del
 * navegador, que si no llegaría después: en varios navegadores ese evento viene
 * con `clientX/clientY` en 0 y el menú saltaría a la esquina de la ventana.
 */
function openFromKeyboard(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  element.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      // Adentro del elemento, no en su borde: el menú queda sobre lo que se
      // seleccionó, igual que cuando el click derecho cae en el medio.
      clientX: Math.round(rect.left + 8),
      clientY: Math.round(rect.top + 8),
    })
  )
}

type ContextMenuTriggerProps = Omit<ContextMenuPrimitive.Trigger.Props, "className"> & {
  className?: string
  /**
   * `false` saca la parada de tabulación y con ella la apertura por teclado.
   * Solo cuando el área ya contiene un control enfocable que abre el mismo menú.
   */
  focusable?: boolean
}

function ContextMenuTrigger({ className, focusable = true, onKeyDown, tabIndex, ...props }: ContextMenuTriggerProps) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      tabIndex={tabIndex ?? (focusable ? 0 : undefined)}
      // `aria-haspopup` es global en ARIA 1.1+: vale sobre el `<div>` genérico
      // que renderiza el trigger. `aria-keyshortcuts` dice con qué abrirlo, que
      // es justamente lo que no se puede adivinar de un área sin botón.
      aria-haspopup={focusable ? "menu" : undefined}
      aria-keyshortcuts={focusable ? "Shift+F10" : undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key !== "ContextMenu" && !(event.key === "F10" && event.shiftKey)) return
        event.preventDefault()
        openFromKeyboard(event.currentTarget)
      }}
      className={cn("rounded-md outline-none focus-visible:focus-ring", className)}
      {...props}
    />
  )
}

type ContextMenuContentProps = Omit<ContextMenuPrimitive.Popup.Props, "className"> &
  Pick<ContextMenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & { className?: string }

/**
 * El panel, ya dentro del portal.
 *
 * Sin valores por defecto de posición a propósito: el posicionador del menú
 * contextual calcula los suyos contra el puntero (`sideOffset: -5`,
 * `alignOffset: 2`), y fijar `side="bottom"` como hace `DropdownMenu` los
 * pisaría y dejaría el menú corrido de donde cayó el click.
 */
function ContextMenuContent({ className, align, alignOffset, side, sideOffset, ...props }: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 outline-none"
      >
        <ContextMenuPrimitive.Popup data-slot="context-menu-content" className={cn(menuPopupClassName, className)} {...props} />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuGroup(props: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
}

type InsetProps = { inset?: boolean }

type ContextMenuLabelProps = Omit<ContextMenuPrimitive.GroupLabel.Props, "className"> & InsetProps & { className?: string }

function ContextMenuLabel({ className, inset, ...props }: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      data-inset={inset ? "" : undefined}
      className={cn("px-2 py-1.5 text-label-12 text-gray-900 data-inset:pl-8", className)}
      {...props}
    />
  )
}

type ContextMenuItemProps = Omit<ContextMenuPrimitive.Item.Props, "className"> &
  InsetProps & { className?: string; variant?: "default" | "destructive" }

function ContextMenuItem({ className, inset, variant = "default", ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset ? "" : undefined}
      data-variant={variant}
      className={cn(
        menuItemClassName,
        "data-inset:pl-8 data-[variant=destructive]:text-red-900 data-[variant=destructive]:data-highlighted:bg-red-100",
        className
      )}
      {...props}
    />
  )
}

type ContextMenuCheckboxItemProps = Omit<ContextMenuPrimitive.CheckboxItem.Props, "className"> & { className?: string }

function ContextMenuCheckboxItem({ className, children, ...props }: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem data-slot="context-menu-checkbox-item" className={cn(menuItemClassName, "pr-8", className)} {...props}>
      {children}
      <ContextMenuPrimitive.CheckboxItemIndicator className="absolute right-2 flex items-center">
        <CheckIcon />
      </ContextMenuPrimitive.CheckboxItemIndicator>
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioGroup(props: ContextMenuPrimitive.RadioGroup.Props) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

type ContextMenuRadioItemProps = Omit<ContextMenuPrimitive.RadioItem.Props, "className"> & { className?: string }

function ContextMenuRadioItem({ className, children, ...props }: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem data-slot="context-menu-radio-item" className={cn(menuItemClassName, "pr-8", className)} {...props}>
      {children}
      <ContextMenuPrimitive.RadioItemIndicator className="absolute right-2 flex items-center">
        <CheckIcon />
      </ContextMenuPrimitive.RadioItemIndicator>
    </ContextMenuPrimitive.RadioItem>
  )
}

type ContextMenuSeparatorProps = Omit<ContextMenuPrimitive.Separator.Props, "className"> & { className?: string }

function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return <ContextMenuPrimitive.Separator data-slot="context-menu-separator" className={cn("-mx-1 my-1 h-px bg-gray-400", className)} {...props} />
}

/**
 * El atajo a la derecha del ítem. Decorativo: el `keydown` lo registra la app.
 *
 * Acá pesa más que en un `DropdownMenu`: es el cartel que enseña el otro camino
 * a la misma acción, el que va a usar quien no puede abrir este menú.
 */
function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="context-menu-shortcut" className={cn("ml-auto text-label-12-mono text-gray-700", className)} {...props} />
}

function ContextMenuSub(props: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
}

type ContextMenuSubTriggerProps = Omit<ContextMenuPrimitive.SubmenuTrigger.Props, "className"> & InsetProps & { className?: string }

function ContextMenuSubTrigger({ className, inset, children, ...props }: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(menuItemClassName, "data-inset:pl-8 data-popup-open:bg-gray-200", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto text-gray-900" />
    </ContextMenuPrimitive.SubmenuTrigger>
  )
}

/**
 * El submenú sí se ancla al ítem que lo abre, no al puntero: de ahí los offsets
 * negativos, que lo traen sobre el borde del panel padre en vez de dejar un
 * hueco que cierra el menú al cruzarlo con el mouse.
 *
 * El `side` queda sin fijar: Base UI usa `inline-end` para submenús, que en un
 * documento en árabe o hebreo abre para el otro lado. Escribir `right` acá
 * rompería eso.
 */
function ContextMenuSubContent({ align = "start", alignOffset = -4, sideOffset = -4, ...props }: ContextMenuContentProps) {
  return <ContextMenuContent data-slot="context-menu-sub-content" align={align} alignOffset={alignOffset} sideOffset={sideOffset} {...props} />
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
}
