"use client"

import type * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react"

import { MenuCheck } from "../internal/menu-check.js"
import { lateralCollision } from "../internal/collision.js"
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

function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root {...props} />
}

function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

type DropdownMenuContentProps = WithClassName<MenuPrimitive.Popup.Props> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">

function DropdownMenuContent({ className, align = "start", alignOffset = 0, side = "bottom", sideOffset = 6, ...props }: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} className="isolate z-50 outline-none" collisionAvoidance={lateralCollision(side)} collisionPadding={8}>
        <MenuPrimitive.Popup data-slot="dropdown-menu-content" className={cn(menuPopupClassName, className)} {...props} />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

type DropdownMenuLabelProps = WithClassName<MenuPrimitive.GroupLabel.Props> & MenuInsetProps

function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset ? "" : undefined}
      className={cn(menuLabelClassName, menuInsetClassName, className)}
      {...props}
    />
  )
}

type DropdownMenuItemProps = WithClassName<MenuPrimitive.Item.Props> &
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

function DropdownMenuItem({ className, inset, variant = "default", external, children, ...props }: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
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
      {external && <ArrowUpRightIcon aria-hidden="true" data-slot="dropdown-menu-external-icon" className={menuItemExternalIconClassName} />}
    </MenuPrimitive.Item>
  )
}

type DropdownMenuCheckboxItemProps = WithClassName<MenuPrimitive.CheckboxItem.Props> & MenuInsetProps

function DropdownMenuCheckboxItem({ className, inset, children, ...props }: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem data-slot="dropdown-menu-checkbox-item" data-inset={inset ? "" : undefined} className={cn(menuItemClassName, menuInsetClassName, className, menuGutterClassName)} {...props}>
      {children}
      <MenuPrimitive.CheckboxItemIndicator data-slot="dropdown-menu-item-indicator" className={menuIndicatorClassName}>
        <MenuCheck />
      </MenuPrimitive.CheckboxItemIndicator>
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

type DropdownMenuRadioItemProps = WithClassName<MenuPrimitive.RadioItem.Props> & MenuInsetProps

function DropdownMenuRadioItem({ className, inset, children, ...props }: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" data-inset={inset ? "" : undefined} className={cn(menuItemClassName, menuInsetClassName, className, menuGutterClassName)} {...props}>
      {children}
      <MenuPrimitive.RadioItemIndicator data-slot="dropdown-menu-item-indicator" className={menuIndicatorClassName}>
        <MenuCheck />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  )
}

type DropdownMenuSeparatorProps = WithClassName<MenuPrimitive.Separator.Props>

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return <MenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn(menuSeparatorClassName, className)} {...props} />
}

// El atajo es contenido, no decoración: un lector tiene que decir que existe. Pero pegado al
// label se lee «Guardar⌘S» de corrido, porque el nombre accesible concatena los textos sin
// separador. La coma sr-only más el espacio lo vuelven «Guardar, ⌘S». Misma técnica que
// `SidebarItemBadge`, por el mismo motivo.
function DropdownMenuShortcut({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="dropdown-menu-shortcut" className={cn("ml-auto pl-4 text-callout", menuItemSecondaryClassName, className)} {...props}>
      <span className="sr-only">,</span>{" "}
      {children}
    </span>
  )
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot {...props} />
}

type DropdownMenuSubTriggerProps = WithClassName<MenuPrimitive.SubmenuTrigger.Props> & MenuInsetProps

function DropdownMenuSubTrigger({ className, inset, children, ...props }: DropdownMenuSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(menuItemClassName, menuInsetClassName, "data-popup-open:bg-fill-2", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon data-slot="dropdown-menu-sub-icon" className="ml-auto text-label-secondary" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

// El submenú abre hacia `inline-end`, como el de Menubar: es el default de Base UI para submenús y
// se da vuelta solo en un documento en árabe o hebreo.
function DropdownMenuSubContent({ side = "inline-end", align = "start", alignOffset = -5, sideOffset = 2, ...props }: DropdownMenuContentProps) {
  return <DropdownMenuContent data-slot="dropdown-menu-sub-content" side={side} align={align} alignOffset={alignOffset} sideOffset={sideOffset} {...props} />
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuSubTriggerProps,
}
