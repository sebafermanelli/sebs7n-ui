"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "../lib/utils.js"
import { menuItemClassName, menuPopupClassName } from "../variants/menu.js"

const Select = SelectPrimitive.Root

type SelectTriggerProps = Omit<SelectPrimitive.Trigger.Props, "className"> & {
  className?: string
  size?: "sm" | "md" | "lg"
}

// Mismo cuerpo y estados que Input.
function SelectTrigger({ className, size = "md", children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border border-gray-400 bg-background-100 px-3 text-copy-14 whitespace-nowrap text-gray-1000 outline-none select-none transition-control",
        "data-[size=sm]:h-8 data-[size=md]:h-10 data-[size=lg]:h-12 data-[size=lg]:text-copy-16",
        "hover:border-gray-500 focus-visible:focus-border data-popup-open:focus-border data-placeholder:text-gray-900",
        "data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700",
        "aria-invalid:border-red-800 data-invalid:border-red-800",
        "*:data-[slot=select-value]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon render={<ChevronDownIcon className="text-gray-900" />} />
    </SelectPrimitive.Trigger>
  )
}

type SelectValueProps = Omit<SelectPrimitive.Value.Props, "className"> & { className?: string }

function SelectValue({ className, ...props }: SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn("flex-1 text-left", className)} {...props} />
}

type SelectContentProps = Omit<SelectPrimitive.Popup.Props, "className"> &
  Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"> & {
    className?: string
  }

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup data-slot="select-content" className={cn(menuPopupClassName, "min-w-(--anchor-width)", className)} {...props}>
          <SelectPrimitive.ScrollUpArrow className="flex w-full cursor-default items-center justify-center bg-background-100 py-1 text-gray-900">
            <ChevronUpIcon className="size-4" />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className="flex w-full cursor-default items-center justify-center bg-background-100 py-1 text-gray-900">
            <ChevronDownIcon className="size-4" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

type SelectItemProps = Omit<SelectPrimitive.Item.Props, "className"> & { className?: string }

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn(menuItemClassName, "w-full pr-8", className)} {...props}>
      <SelectPrimitive.ItemText className="flex flex-1 items-center gap-2 whitespace-nowrap">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

type SelectGroupProps = Omit<SelectPrimitive.Group.Props, "className"> & { className?: string }

function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("py-1", className)} {...props} />
}

type SelectLabelProps = Omit<SelectPrimitive.GroupLabel.Props, "className"> & { className?: string }

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return <SelectPrimitive.GroupLabel data-slot="select-label" className={cn("px-2 py-1.5 text-label-12 text-gray-900", className)} {...props} />
}

type SelectSeparatorProps = Omit<SelectPrimitive.Separator.Props, "className"> & { className?: string }

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("-mx-1 my-1 h-px bg-gray-400", className)} {...props} />
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue }
