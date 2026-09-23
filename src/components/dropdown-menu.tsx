"use client"

import type * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "../lib/utils.js"
import { menuItemClassName, menuPopupClassName } from "../variants/menu.js"

function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

type DropdownMenuContentProps = Omit<MenuPrimitive.Popup.Props, "className"> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & { className?: string }

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

type InsetProps = { inset?: boolean }

type DropdownMenuLabelProps = Omit<MenuPrimitive.GroupLabel.Props, "className"> & InsetProps & { className?: string }

function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset ? "" : undefined}
      className={cn("px-2 py-1.5 text-label-12 text-gray-900 data-inset:pl-8", className)}
      {...props}
    />
  )
}

type DropdownMenuItemProps = Omit<MenuPrimitive.Item.Props, "className"> &
  InsetProps & { className?: string; variant?: "default" | "destructive" }

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

type DropdownMenuCheckboxItemProps = Omit<MenuPrimitive.CheckboxItem.Props, "className"> & { className?: string }

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

type DropdownMenuRadioItemProps = Omit<MenuPrimitive.RadioItem.Props, "className"> & { className?: string }

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

type DropdownMenuSeparatorProps = Omit<MenuPrimitive.Separator.Props, "className"> & { className?: string }

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return <MenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("-mx-1 my-1 h-px bg-gray-400", className)} {...props} />
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="dropdown-menu-shortcut" className={cn("ml-auto text-label-12-mono text-gray-700", className)} {...props} />
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

type DropdownMenuSubTriggerProps = Omit<MenuPrimitive.SubmenuTrigger.Props, "className"> & InsetProps & { className?: string }

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
}
