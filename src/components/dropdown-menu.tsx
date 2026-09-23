"use client"

import type * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

import { cn, type WithClassName } from "../lib/utils.js"
import { menuItemClassName, menuLabelClassName, menuPopupClassName, menuSeparatorClassName, type MenuInsetProps } from "../variants/menu.js"

function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

type DropdownMenuContentProps = WithClassName<MenuPrimitive.Popup.Props> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">

function DropdownMenuContent({ className, align = "start", alignOffset = 0, side = "bottom", sideOffset = 6, ...props }: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} className="isolate z-50 outline-none">
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
      className={cn(menuLabelClassName, "data-inset:pl-8", className)}
      {...props}
    />
  )
}

type DropdownMenuItemProps = WithClassName<MenuPrimitive.Item.Props> &
  MenuInsetProps & { variant?: "default" | "destructive" }

function DropdownMenuItem({ className, inset, variant = "default", ...props }: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
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

type DropdownMenuCheckboxItemProps = WithClassName<MenuPrimitive.CheckboxItem.Props>

function DropdownMenuCheckboxItem({ className, children, ...props }: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem data-slot="dropdown-menu-checkbox-item" className={cn(menuItemClassName, "pr-8", className)} {...props}>
      {children}
      <MenuPrimitive.CheckboxItemIndicator className="absolute right-2 flex items-center">
        <CheckIcon />
      </MenuPrimitive.CheckboxItemIndicator>
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

type DropdownMenuRadioItemProps = WithClassName<MenuPrimitive.RadioItem.Props>

function DropdownMenuRadioItem({ className, children, ...props }: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" className={cn(menuItemClassName, "pr-8", className)} {...props}>
      {children}
      <MenuPrimitive.RadioItemIndicator className="absolute right-2 flex items-center">
        <CheckIcon />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  )
}

type DropdownMenuSeparatorProps = WithClassName<MenuPrimitive.Separator.Props>

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return <MenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn(menuSeparatorClassName, className)} {...props} />
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="dropdown-menu-shortcut" className={cn("ml-auto text-label-12-mono text-gray-900", className)} {...props} />
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

type DropdownMenuSubTriggerProps = WithClassName<MenuPrimitive.SubmenuTrigger.Props> & MenuInsetProps

function DropdownMenuSubTrigger({ className, inset, children, ...props }: DropdownMenuSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(menuItemClassName, "data-inset:pl-8 data-popup-open:bg-gray-200", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto text-gray-900" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({ side = "right", align = "start", alignOffset = -4, sideOffset = 2, ...props }: DropdownMenuContentProps) {
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
