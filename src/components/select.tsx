"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from "lucide-react"

import { cn, type WithClassName } from "../lib/utils.js"
import { inputControlClassName, inputDisabledClassName, inputPaddingClassName, inputSizeClassName } from "../variants/input.js"
import { menuGutterClassName, menuIndicatorClassName, menuItemClassName, menuLabelClassName, menuPopupClassName, menuSeparatorClassName } from "../variants/menu.js"

const Select = SelectPrimitive.Root

type SelectTriggerProps = WithClassName<SelectPrimitive.Trigger.Props> & {
  size?: "sm" | "md" | "lg"
}

// Mismo cuerpo y estados que Input.
function SelectTrigger({ className, size = "md", children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        inputControlClassName,
        inputSizeClassName,
        inputDisabledClassName,
        inputPaddingClassName[size],
        "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 whitespace-nowrap select-none",
        // El foco va por `focus-visible` y no por `focus`, que es lo que hacen los demás: el
        // trigger es un botón y con `focus:` el borde aparecía también al hacer click. Por eso
        // tampoco usa `inputInvalidClassName`, que trae el halo rojo en `focus:`.
        "focus-visible:focus-border data-popup-open:focus-border data-placeholder:text-gray-900",
        "aria-invalid:border-red-800 data-invalid:border-red-800",
        "*:data-[slot=select-value]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      {/* ⌃⌄ y no ⌄: es el pop-up button de macOS. La lista no baja, se abre encima con la opción
          elegida sobre el disparador (ver `alignItemWithTrigger`), y las dos flechas lo dicen. */}
      <SelectPrimitive.Icon render={<ChevronsUpDownIcon className="size-3.5 text-gray-900" />} />
    </SelectPrimitive.Trigger>
  )
}

type SelectValueProps = WithClassName<SelectPrimitive.Value.Props>

function SelectValue({ className, ...props }: SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn("flex-1 text-left", className)} {...props} />
}

type SelectContentProps = WithClassName<SelectPrimitive.Popup.Props> &
  Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger">

// Las flechas de desplazamiento de una lista larga: una franja de vidrio encima del borde de la lista.
const scrollArrowClassName = "absolute inset-x-0 z-10 flex h-5 cursor-default items-center justify-center glass-control text-gray-900"

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  // Como el pop-up button de macOS (2.0): la lista se abre con la opción elegida encima del
  // disparador y su texto en el mismo lugar que el del valor, así el ojo no la tiene que buscar.
  // Base UI lo apaga solo cuando se abrió con el dedo (`openMethod === "touch"`): en un teléfono
  // la lista baja como un menú, que es lo que el pulgar espera. `false` vuelve al menú en todos lados.
  alignItemWithTrigger = true,
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
        {/* El scroll va en la lista y no en el panel (como en los ejemplos de Base UI): para
            alinear la opción elegida con el disparador, Base UI desplaza `listElement ?? popupElement`,
            y con el scroll en el panel la lista larga abría con la elegida fuera de lugar. El panel
            recorta (`overflow-hidden`) y las flechas flotan arriba y abajo de la lista. */}
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(menuPopupClassName, "relative max-h-none min-w-(--anchor-width) overflow-hidden p-0", className)}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow className={cn(scrollArrowClassName, "top-0")}>
            <ChevronUpIcon className="size-4" />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List data-slot="select-list" className="max-h-(--available-height) scroll-py-6 overflow-y-auto p-1.5">
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className={cn(scrollArrowClassName, "bottom-0")}>
            <ChevronDownIcon className="size-4" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

type SelectItemProps = WithClassName<SelectPrimitive.Item.Props>

// Todas las opciones reservan la canaleta del tilde, esté elegida o no: así el texto no salta
// al cambiar de opción y la lista se lee como una columna (el pop-up menu de macOS).
function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn(menuItemClassName, "w-full", className, menuGutterClassName)} {...props}>
      <SelectPrimitive.ItemIndicator data-slot="select-item-indicator" className={menuIndicatorClassName}>
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className="flex flex-1 items-center gap-2 whitespace-nowrap">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

type SelectGroupProps = WithClassName<SelectPrimitive.Group.Props>

function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("py-1", className)} {...props} />
}

type SelectLabelProps = WithClassName<SelectPrimitive.GroupLabel.Props>

function SelectLabel({ className, ...props }: SelectLabelProps) {
  // Alinea con el texto de las opciones, después de la canaleta.
  return <SelectPrimitive.GroupLabel data-slot="select-label" className={cn(menuLabelClassName, className, menuGutterClassName)} {...props} />
}

type SelectSeparatorProps = WithClassName<SelectPrimitive.Separator.Props>

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn(menuSeparatorClassName, className)} {...props} />
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectContentProps,
  type SelectGroupProps,
  type SelectItemProps,
  type SelectLabelProps,
  type SelectSeparatorProps,
  type SelectTriggerProps,
  type SelectValueProps,
}
