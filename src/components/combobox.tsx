"use client"

import type * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon, ChevronDownIcon, Loader2Icon, XIcon } from "lucide-react"

import { nombreDeQuitar } from "../internal/remove-label.js"
import { renderShellTrigger } from "../internal/shell-trigger.js"
import { useLabels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { inputShellButtonClassName, inputShellClassName, inputShellInputClassName } from "../variants/input.js"
import { menuItemClassName, menuLabelClassName, menuPopupClassName, menuSeparatorClassName } from "../variants/menu.js"
import { tagRemoveClassName, tagVariants } from "../variants/tag.js"

type InputSize = "sm" | "md" | "lg"

// Root de Base UI: items, value/onValueChange, multiple, filter, itemToStringLabel, etc.
const Combobox = ComboboxPrimitive.Root
const ComboboxValue = ComboboxPrimitive.Value
const ComboboxCollection = ComboboxPrimitive.Collection
const useComboboxFilter = ComboboxPrimitive.useFilter

type ComboboxInputProps = Omit<ComboboxPrimitive.Input.Props, "className" | "size"> & {
  className?: string
  /** Clases del contenedor (la superficie con borde). */
  groupClassName?: string
  size?: InputSize
  /** Chevron que abre la lista. */
  showTrigger?: boolean
  /** Botón para vaciar; aparece solo cuando hay un valor. */
  showClear?: boolean
  labels?: { clear?: string; trigger?: string }
}

// Mismo cuerpo y estados que Input: el borde y el foco van en el contenedor.
function ComboboxInput({
  className,
  groupClassName,
  size = "md",
  showTrigger = true,
  showClear = true,
  labels,
  disabled,
  ...props
}: ComboboxInputProps) {
  // El provider gana sobre el español; la prop `labels` gana sobre el provider, porque es la
  // excepción de una pantalla («Ver ciudades») y no una traducción.
  const l = useLabels().combobox
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-input-group"
      data-size={size}
      // disabled en el input (no en el root) también apaga la superficie.
      data-disabled={disabled ? "" : undefined}
      className={cn(inputShellClassName, (showTrigger || showClear) && "pr-1", groupClassName)}
    >
      <ComboboxPrimitive.Input data-slot="combobox-input" disabled={disabled} className={cn(inputShellInputClassName, className)} {...props} />
      {showClear && (
        <ComboboxPrimitive.Clear data-slot="combobox-clear" aria-label={labels?.clear ?? l.clear} disabled={disabled} className={inputShellButtonClassName}>
          <XIcon />
        </ComboboxPrimitive.Clear>
      )}
      {showTrigger && (
        <ComboboxPrimitive.Trigger
          data-slot="combobox-trigger"
          render={renderShellTrigger}
          aria-label={labels?.trigger ?? l.trigger}
          disabled={disabled}
          className={cn(inputShellButtonClassName, "[&_svg]:transition-transform [&_svg]:duration-150 data-popup-open:[&_svg]:rotate-180")}
        >
          <ChevronDownIcon />
        </ComboboxPrimitive.Trigger>
      )}
    </ComboboxPrimitive.InputGroup>
  )
}

type ComboboxContentProps = WithClassName<ComboboxPrimitive.Popup.Props> &
  Pick<ComboboxPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "anchor">

// Panel de menú (shadow-menu, radio 12, p-1), al menos tan ancho como el input.
function ComboboxContent({ className, side = "bottom", sideOffset = 6, align = "start", alignOffset = 0, anchor, ...props }: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} anchor={anchor} className="isolate z-50">
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(menuPopupClassName, "min-w-(--anchor-width) max-w-(--available-width)", className)}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

type ComboboxListProps = WithClassName<ComboboxPrimitive.List.Props>

function ComboboxList({ className, ...props }: ComboboxListProps) {
  return <ComboboxPrimitive.List data-slot="combobox-list" className={cn("scroll-py-1 outline-none", className)} {...props} />
}

type ComboboxItemProps = WithClassName<ComboboxPrimitive.Item.Props>

// menuItemClassName + check a la derecha si está elegido.
function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  return (
    <ComboboxPrimitive.Item data-slot="combobox-item" className={cn(menuItemClassName, "w-full pr-8", className)} {...props}>
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
      <ComboboxPrimitive.ItemIndicator data-slot="combobox-item-indicator" className="absolute right-2 flex items-center">
        <CheckIcon />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

type ComboboxGroupProps = WithClassName<ComboboxPrimitive.Group.Props>

function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" className={cn("py-1", className)} {...props} />
}

type ComboboxLabelProps = WithClassName<ComboboxPrimitive.GroupLabel.Props>

function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  return <ComboboxPrimitive.GroupLabel data-slot="combobox-label" className={cn(menuLabelClassName, className)} {...props} />
}

type ComboboxSeparatorProps = WithClassName<ComboboxPrimitive.Separator.Props>

function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return <ComboboxPrimitive.Separator data-slot="combobox-separator" className={cn(menuSeparatorClassName, className)} {...props} />
}

type ComboboxEmptyProps = WithClassName<ComboboxPrimitive.Empty.Props> & {
  labels?: { empty?: string }
}

// Base UI renderiza los hijos solo con la lista vacía; el root queda montado para anunciar el cambio.
// Sin children: "Sin resultados". children={null} (p. ej. mientras carga) no muestra nada.
function ComboboxEmpty({ className, children, labels, ...props }: ComboboxEmptyProps) {
  const l = useLabels().combobox
  const content = children === undefined ? (labels?.empty ?? l.empty) : children
  return (
    <ComboboxPrimitive.Empty data-slot="combobox-empty" {...props}>
      {/* Del alto de un ítem (h-8) y con su mismo padding: un popup con «Sin resultados» no
          es más alto que uno con una sola coincidencia. Antes era py-6 y ocupaba tres filas. */}
      {content ? <div className={cn("flex h-8 items-center px-2 text-copy-14 text-gray-900", className)}>{content}</div> : null}
    </ComboboxPrimitive.Empty>
  )
}

type ComboboxStatusProps = WithClassName<ComboboxPrimitive.Status.Props> & {
  /** Búsqueda async en curso: fila con spinner. */
  loading?: boolean
  labels?: { loading?: string }
}

// Región aria-live siempre montada: con loading muestra la fila de carga; si no, sus children (si hay).
function ComboboxStatus({ className, loading = false, labels, children, ...props }: ComboboxStatusProps) {
  const l = useLabels().combobox
  const content = loading ? (
    <div data-slot="combobox-loading" className="flex h-8 items-center gap-2 px-2 text-copy-14 text-gray-900">
      <Loader2Icon aria-hidden="true" className="size-4 shrink-0 animate-spin" />
      {labels?.loading ?? l.loading}
    </div>
  ) : children ? (
    <div className="flex min-h-8 items-center px-2 text-copy-14 text-gray-900">{children}</div>
  ) : null
  return (
    <ComboboxPrimitive.Status data-slot="combobox-status" className={className} {...props}>
      {content}
    </ComboboxPrimitive.Status>
  )
}

type ComboboxChipsProps = WithClassName<ComboboxPrimitive.Chips.Props> & {
  size?: InputSize
  showTrigger?: boolean
  showClear?: boolean
  disabled?: boolean
  labels?: { clear?: string; trigger?: string }
}

// Selección múltiple: superficie de Input que crece con los chips.
function ComboboxChips({ className, size = "md", showTrigger = true, showClear = false, disabled, labels, ...props }: ComboboxChipsProps) {
  const l = useLabels().combobox
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-chips-group"
      data-size={size}
      // disabled en el input (no en el root) también apaga la superficie.
      data-disabled={disabled ? "" : undefined}
      className={cn(
        inputShellClassName,
        "h-auto! data-[size=sm]:min-h-8 data-[size=md]:min-h-10 data-[size=lg]:min-h-12 items-start py-1 pr-1 pl-1",
        className
      )}
    >
      <ComboboxPrimitive.Chips data-slot="combobox-chips" className="flex min-w-0 flex-1 flex-wrap items-center gap-1 self-center" {...props} />
      {showClear && (
        <ComboboxPrimitive.Clear data-slot="combobox-clear" aria-label={labels?.clear ?? l.clear} disabled={disabled} className={cn(inputShellButtonClassName, "self-center")}>
          <XIcon />
        </ComboboxPrimitive.Clear>
      )}
      {showTrigger && (
        <ComboboxPrimitive.Trigger
          data-slot="combobox-trigger"
          render={renderShellTrigger}
          aria-label={labels?.trigger ?? l.trigger}
          disabled={disabled}
          className={cn(inputShellButtonClassName, "self-center")}
        >
          <ChevronDownIcon />
        </ComboboxPrimitive.Trigger>
      )}
    </ComboboxPrimitive.InputGroup>
  )
}

type ComboboxChipProps = WithClassName<ComboboxPrimitive.Chip.Props> & {
  /**
   * Nombre del botón de quitar. Un string es el prefijo del dato («Quitar» → «Quitar Chile»);
   * una función recibe el dato y devuelve la frase entera, para los idiomas donde el verbo no
   * va adelante: `(name) => name + " entfernen"`.
   */
  removeLabel?: string | ((name: string) => string)
  /** Texto para el nombre accesible cuando children no es texto. */
  textValue?: string
}

/**
 * El `Tag` del sistema, conectado al estado del combobox.
 *
 * Usa `tagVariants` y `tagRemoveClassName` y no una copia: hasta 0.4.0 eran dos dibujos que
 * decían ser el mismo y habían quedado distintos —el botón de quitar medía 20px acá y 16 en
 * `Tag`, el hover era `gray-alpha-200` contra `gray-alpha-300`, y el aire a la derecha del
 * texto era la mitad—. Dos etiquetas que el usuario ve una al lado de la otra en el mismo
 * formulario no pueden diferir en 4px.
 *
 * Lo propio es el foco: el chip es enfocable y el combobox lo resalta con `data-highlighted`,
 * cosa que un `Tag` suelto no hace.
 */
function ComboboxChip({ className, children, removeLabel, textValue, ...props }: ComboboxChipProps) {
  // `useLabels()` va suelto y no adentro de un `??`: el `??` corta, y un hook que a veces se llama
  // y a veces no rompe el orden de los hooks.
  const l = useLabels().combobox
  const name = textValue ?? (typeof children === "string" || typeof children === "number" ? String(children) : undefined)
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(tagVariants({ removable: true }), "outline-none focus-visible:focus-ring data-highlighted:focus-ring", className)}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ComboboxPrimitive.ChipRemove
        data-slot="combobox-chip-remove"
        aria-label={nombreDeQuitar(removeLabel ?? l.remove, name)}
        className={tagRemoveClassName.md}
      >
        <XIcon />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  )
}

type ComboboxChipsInputProps = Omit<ComboboxPrimitive.Input.Props, "className" | "size"> & { className?: string }

function ComboboxChipsInput({ className, ...props }: ComboboxChipsInputProps) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chips-input"
      className={cn("h-6 min-w-16 flex-1 bg-transparent px-1.5 text-inherit outline-none placeholder:text-gray-900 disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxStatus,
  ComboboxValue,
  useComboboxFilter,
  type ComboboxChipProps,
  type ComboboxChipsInputProps,
  type ComboboxChipsProps,
  type ComboboxContentProps,
  type ComboboxEmptyProps,
  type ComboboxGroupProps,
  type ComboboxInputProps,
  type ComboboxItemProps,
  type ComboboxLabelProps,
  type ComboboxListProps,
  type ComboboxSeparatorProps,
  type ComboboxStatusProps,
}
