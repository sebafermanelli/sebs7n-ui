"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "../lib/utils.js"

type TabsProps = Omit<TabsPrimitive.Root.Props, "className"> & { className?: string }

function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />
}

type TabsListProps = Omit<TabsPrimitive.List.Props, "className"> & { className?: string }

function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("relative flex w-full items-center border-b border-gray-400", className)}
      {...props}
    />
  )
}

type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, "className"> & { className?: string }

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative isolate inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 px-3 text-copy-14 whitespace-nowrap text-gray-900 outline-none select-none transition-control",
        // El `before` existe solo para el anillo de foco: una pestaña no es un botón, así que en
        // hover no se pinta ninguna pastilla. Lo único que cambia es el color del texto, y el
        // activo lo marca la línea de abajo (`after`).
        "before:absolute before:inset-x-0 before:inset-y-1 before:-z-10 before:rounded-md before:transition-control",
        "hover:text-gray-1000 focus-visible:before:focus-ring",
        "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-gray-1000 after:opacity-0",
        "data-active:text-gray-1000 data-active:after:opacity-100",
        "data-disabled:cursor-not-allowed data-disabled:text-gray-700",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

type TabsContentProps = Omit<TabsPrimitive.Panel.Props, "className"> & { className?: string }

function TabsContent({ className, ...props }: TabsContentProps) {
  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn("text-copy-14 outline-none", className)} {...props} />
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
