"use client"

import type * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "../lib/utils.js"
import { menuItemClassName, menuPopupClassName } from "../variants/menu.js"

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
type MenubarProps = Omit<MenubarPrimitive.Props, "className"> & { className?: string }

function Menubar({ className, ...props }: MenubarProps) {
  return <MenubarPrimitive data-slot="menubar" className={cn("flex items-center gap-0.5", className)} {...props} />
}

/** Un título de la barra con su menú. Va directo adentro de `Menubar`. */
function MenubarMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="menubar-menu" {...props} />
}

type MenubarTriggerProps = Omit<MenuPrimitive.Trigger.Props, "className"> & { className?: string }

/**
 * El título clickeable.
 *
 * Más chato que un `Button`: en una barra de menús el fondo lo gana el menú
 * abierto (`data-popup-open`), no el reposo. Si todos los títulos tuvieran
 * fondo, la barra se leería como cinco botones y no como un menú.
 */
function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return (
    <MenuPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1 rounded-md bg-transparent px-2.5 text-copy-14 text-gray-1000 outline-none select-none",
        "transition-control hover:bg-gray-alpha-200 focus-visible:focus-ring",
        "data-popup-open:bg-gray-200 data-popup-open:hover:bg-gray-200",
        "data-disabled:cursor-not-allowed data-disabled:text-gray-700 data-disabled:hover:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

type MenubarContentProps = Omit<MenuPrimitive.Popup.Props, "className"> &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & { className?: string }

function MenubarContent({ className, align = "start", alignOffset = 0, side = "bottom", sideOffset = 6, ...props }: MenubarContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} className="isolate z-50 outline-none">
        <MenuPrimitive.Popup data-slot="menubar-content" className={cn(menuPopupClassName, "min-w-48", className)} {...props} />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function MenubarGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="menubar-group" {...props} />
}

type InsetProps = { inset?: boolean }

type MenubarLabelProps = Omit<MenuPrimitive.GroupLabel.Props, "className"> & InsetProps & { className?: string }

function MenubarLabel({ className, inset, ...props }: MenubarLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menubar-label"
      data-inset={inset ? "" : undefined}
      className={cn("px-2 py-1.5 text-label-12 text-gray-900 data-inset:pl-8", className)}
      {...props}
    />
  )
}

type MenubarItemProps = Omit<MenuPrimitive.Item.Props, "className"> &
  InsetProps & { className?: string; variant?: "default" | "destructive" }

function MenubarItem({ className, inset, variant = "default", ...props }: MenubarItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="menubar-item"
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

/**
 * El tilde va a la **izquierda**, al revés que en `DropdownMenu`.
 *
 * Es la convención de los menús de aplicación de macOS y Windows, y acá importa
 * porque la derecha ya está ocupada por el atajo (`MenubarShortcut`): un tilde
 * y un `⌘B` peleando por el mismo borde se leen como una sola columna de ruido.
 */
type MenubarCheckboxItemProps = Omit<MenuPrimitive.CheckboxItem.Props, "className"> & { className?: string }

function MenubarCheckboxItem({ className, children, ...props }: MenubarCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem data-slot="menubar-checkbox-item" className={cn(menuItemClassName, "pl-8", className)} {...props}>
      <MenuPrimitive.CheckboxItemIndicator className="absolute left-2 flex items-center">
        <CheckIcon />
      </MenuPrimitive.CheckboxItemIndicator>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function MenubarRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}

type MenubarRadioItemProps = Omit<MenuPrimitive.RadioItem.Props, "className"> & { className?: string }

function MenubarRadioItem({ className, children, ...props }: MenubarRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem data-slot="menubar-radio-item" className={cn(menuItemClassName, "pl-8", className)} {...props}>
      <MenuPrimitive.RadioItemIndicator className="absolute left-2 flex items-center">
        <CheckIcon />
      </MenuPrimitive.RadioItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

type MenubarSeparatorProps = Omit<MenuPrimitive.Separator.Props, "className"> & { className?: string }

function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
  return <MenuPrimitive.Separator data-slot="menubar-separator" className={cn("-mx-1 my-1 h-px bg-gray-400", className)} {...props} />
}

/**
 * El atajo a la derecha del ítem, decorativo: el `keydown` lo registra la app.
 *
 * En un menubar es la mitad del trabajo del componente: el menú se abre una vez
 * para descubrir el comando y después se usa el atajo para siempre.
 */
function MenubarShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="menubar-shortcut" className={cn("ml-auto pl-6 text-label-12-mono text-gray-900", className)} {...props} />
}

function MenubarSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="menubar-sub" {...props} />
}

type MenubarSubTriggerProps = Omit<MenuPrimitive.SubmenuTrigger.Props, "className"> & InsetProps & { className?: string }

function MenubarSubTrigger({ className, inset, children, ...props }: MenubarSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset ? "" : undefined}
      className={cn(menuItemClassName, "data-inset:pl-8 data-popup-open:bg-gray-200", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto text-gray-900" />
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
}
