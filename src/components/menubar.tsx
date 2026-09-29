"use client"

import type * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react"

import { MenuCheck } from "../internal/menu-check.js"
import { cn, type WithClassName } from "../lib/utils.js"
import {
  menuGutterClassName,
  menuIndicatorClassName,
  menuInsetClassName,
  menuItemClassName,
  menuItemDestructiveClassName,
  menuItemExternalClassName,
  menuItemExternalIconClassName,
  menuItemSecondaryClassName,
  menuLabelClassName,
  menuPopupClassName,
  menuSeparatorClassName,
  type MenuInsetProps,
} from "../variants/menu.js"

/**
 * La barra de menús de una aplicación: Archivo, Editar, Ver.
 *
 * Es un `DropdownMenu` por cada título, coordinados: las flechas ← → pasan de
 * un título al siguiente, y con uno abierto basta **pasar el mouse** por otro
 * para que el foco salte y se abra ese. Eso es lo que la vuelve una barra y no
 * cinco menús puestos al lado: el conjunto es una sola parada de tabulación.
 *
 * **Casi ninguna web necesita esto.** Un menubar aparece cuando la app tiene
 * decenas de comandos y ninguna otra superficie donde meterlos: un editor, una
 * planilla, una herramienta de diseño. Si lo que hay adentro son secciones del
 * sitio, lo que se quiere es `NavigationMenu`; si es un solo grupo de acciones,
 * un `DropdownMenu` suelto. Un menubar en una web común le pide al usuario que
 * abra tres menús para encontrar lo que un botón mostraba de entrada.
 *
 * Sin fondo ni borde propios: la barra vive dentro del header de la app y hereda
 * su superficie, igual que el `NavigationMenu` dentro de un nav.
 */
type MenubarProps = WithClassName<MenubarPrimitive.Props>

function Menubar({ className, ...props }: MenubarProps) {
  return <MenubarPrimitive data-slot="menubar" className={cn("flex items-center gap-0.5", className)} {...props} />
}

/** Un título de la barra con su menú. Va directo adentro de `Menubar`. */
function MenubarMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root {...props} />
}

type MenubarTriggerProps = WithClassName<MenuPrimitive.Trigger.Props>

/**
 * El título clickeable.
 *
 * iCloud no tiene barra de menús: el título se ve como un botón de su toolbar (28 de alto, radio 8,
 * 14/400) sin fondo en reposo. El fondo lo gana el menú abierto (`data-popup-open`, el `fill-2` del
 * resaltado), no el reposo: si todos los títulos tuvieran fondo, la barra se leería como cinco
 * botones y no como un menú. Con el dedo sube a 44.
 */
function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return (
    <MenuPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "inline-flex h-7 pointer-coarse:h-11 cursor-pointer items-center gap-1 rounded-control bg-transparent px-2.5 text-callout text-label outline-none select-none",
        "transition-control hover:bg-fill-1 focus-visible:focus-ring",
        "data-popup-open:bg-fill-2 data-popup-open:hover:bg-fill-2",
        "data-disabled:cursor-not-allowed data-disabled:opacity-30 data-disabled:hover:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

type MenubarContentProps = WithClassName<MenuPrimitive.Popup.Props> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">

function MenubarContent({ className, align = "start", alignOffset = 0, side = "bottom", sideOffset = 6, ...props }: MenubarContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} className="isolate z-50 outline-none">
        <MenuPrimitive.Popup data-slot="menubar-content" className={cn(menuPopupClassName, className)} {...props} />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function MenubarGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="menubar-group" {...props} />
}

type MenubarLabelProps = WithClassName<MenuPrimitive.GroupLabel.Props> & MenuInsetProps

function MenubarLabel({ className, inset, ...props }: MenubarLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menubar-label"
      data-inset={inset ? "" : undefined}
      className={cn(menuLabelClassName, menuInsetClassName, className)}
      {...props}
    />
  )
}

type MenubarItemProps = WithClassName<MenuPrimitive.Item.Props> &
  MenuInsetProps & {
    /**
     * `destructive`: texto e ícono en rojo (`menuItemDestructiveClassName`), como el «Delete
     * Selected» de iCloud. Para la acción que borra; va al final, después de un separador, y si
     * no se puede deshacer la confirma un `AlertDialog`. Sale también como `data-variant`.
     */
    variant?: "default" | "destructive"
    /**
     * Lleva a otro sitio: el texto en el acento y ↗ al final, como el «Manage Apple Account ↗» de
     * iCloud. Es una prop y no se deduce de `target="_blank"`: el `<a>` llega por `render` y el ítem
     * no lo ve. Si abre otra pestaña, decilo en el texto o en un `aria-label`: la flecha es decorativa.
     */
    external?: boolean
  }

function MenubarItem({ className, inset, variant = "default", external, children, ...props }: MenubarItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset ? "" : undefined}
      data-variant={variant}
      data-external={external ? "" : undefined}
      className={cn(
        menuItemClassName,
        external && menuItemExternalClassName,
        variant === "destructive" && menuItemDestructiveClassName,
        menuInsetClassName,
        className
      )}
      {...props}
    >
      {children}
      {external && <ArrowUpRightIcon aria-hidden="true" data-slot="menubar-external-icon" className={menuItemExternalIconClassName} />}
    </MenuPrimitive.Item>
  )
}

/**
 * El tilde va a la **derecha**, en el círculo de acento de iCloud, igual que en `DropdownMenu` y
 * `ContextMenu`. El atajo (`MenubarShortcut`) queda antes, pegado a la columna del tilde, y conserva
 * su lugar en un ítem sin marcar.
 */
type MenubarCheckboxItemProps = WithClassName<MenuPrimitive.CheckboxItem.Props>

function MenubarCheckboxItem({ className, children, ...props }: MenubarCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem data-slot="menubar-checkbox-item" className={cn(menuItemClassName, className, menuGutterClassName)} {...props}>
      <MenuPrimitive.CheckboxItemIndicator data-slot="menubar-item-indicator" className={menuIndicatorClassName}>
        <MenuCheck />
      </MenuPrimitive.CheckboxItemIndicator>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function MenubarRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}

type MenubarRadioItemProps = WithClassName<MenuPrimitive.RadioItem.Props>

function MenubarRadioItem({ className, children, ...props }: MenubarRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem data-slot="menubar-radio-item" className={cn(menuItemClassName, className, menuGutterClassName)} {...props}>
      <MenuPrimitive.RadioItemIndicator data-slot="menubar-item-indicator" className={menuIndicatorClassName}>
        <MenuCheck />
      </MenuPrimitive.RadioItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

type MenubarSeparatorProps = WithClassName<MenuPrimitive.Separator.Props>

function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
  return <MenuPrimitive.Separator data-slot="menubar-separator" className={cn(menuSeparatorClassName, className)} {...props} />
}

/**
 * El atajo a la derecha del ítem, decorativo: el `keydown` lo registra la app.
 *
 * En un menubar es la mitad del trabajo del componente: el menú se abre una vez
 * para descubrir el comando y después se usa el atajo para siempre.
 */
// El atajo es contenido, no decoración: un lector tiene que decir que existe. Pero pegado al
// label se lee «Guardar⌘S» de corrido, porque el nombre accesible concatena los textos sin
// separador. La coma sr-only más el espacio lo vuelven «Guardar, ⌘S». Misma técnica que
// `SidebarItemBadge`, por el mismo motivo.
function MenubarShortcut({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="menubar-shortcut" className={cn("ml-auto pl-4 text-callout", menuItemSecondaryClassName, className)} {...props}>
      <span className="sr-only">,</span>{" "}
      {children}
    </span>
  )
}

function MenubarSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot {...props} />
}

type MenubarSubTriggerProps = WithClassName<MenuPrimitive.SubmenuTrigger.Props> & MenuInsetProps

function MenubarSubTrigger({ className, inset, children, ...props }: MenubarSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(menuItemClassName, menuInsetClassName, "data-popup-open:bg-fill-2", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon data-slot="menubar-sub-icon" className="ml-auto text-label-secondary" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

/**
 * El submenú abre al costado, no abajo: `MenubarContent` fija `side="bottom"`
 * para los menús de la barra y acá hay que pisarlo. `inline-end` en vez de
 * `right` porque es el default de Base UI para submenús y se da vuelta solo en
 * un documento en árabe o hebreo.
 */
function MenubarSubContent({ align = "start", alignOffset = -4, side = "inline-end", sideOffset = 2, ...props }: MenubarContentProps) {
  return <MenubarContent data-slot="menubar-sub-content" align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} {...props} />
}

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  type MenubarCheckboxItemProps,
  type MenubarContentProps,
  type MenubarItemProps,
  type MenubarLabelProps,
  type MenubarProps,
  type MenubarRadioItemProps,
  type MenubarSeparatorProps,
  type MenubarSubTriggerProps,
  type MenubarTriggerProps,
}
