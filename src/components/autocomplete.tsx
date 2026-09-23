"use client"

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { ChevronDownIcon, XIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "../lib/utils.js"
import { inputShellButtonClassName, inputShellClassName, inputShellInputClassName } from "../variants/input.js"
import { menuItemClassName } from "../variants/menu.js"
import {
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxList,
  ComboboxStatus,
} from "./combobox.js"

// Ver renderShellTrigger en combobox.tsx: el input siempre está afuera del popup.
const renderShellTrigger = (props: React.ComponentProps<"button">) => (
  <button {...props} id={undefined} role={undefined} tabIndex={-1} aria-haspopup="listbox" />
)

// Texto libre con sugerencias: el valor es el texto del input (value/onValueChange son strings).
// Popup, lista, grupos, vacío y estado son las mismas piezas que Combobox.
const Autocomplete = AutocompletePrimitive.Root
const useAutocompleteFilter = AutocompletePrimitive.useFilter
const AutocompleteContent = ComboboxContent
const AutocompleteList = ComboboxList
const AutocompleteGroup = ComboboxGroup
const AutocompleteLabel = ComboboxLabel
const AutocompleteCollection = ComboboxCollection
const AutocompleteEmpty = ComboboxEmpty
const AutocompleteStatus = ComboboxStatus

type AutocompleteInputProps = Omit<AutocompletePrimitive.Input.Props, "className" | "size"> & {
  className?: string
  groupClassName?: string
  size?: "sm" | "md" | "lg"
  /** Sin chevron por defecto: es un campo de texto. */
  showTrigger?: boolean
  showClear?: boolean
  labels?: { clear?: string; trigger?: string }
}

function AutocompleteInput({
  className,
  groupClassName,
  size = "md",
  showTrigger = false,
  showClear = true,
  labels,
  disabled,
  ...props
}: AutocompleteInputProps) {
  return (
    <AutocompletePrimitive.InputGroup
      data-slot="autocomplete-input-group"
      data-size={size}
      // disabled en el input (no en el root) también apaga la superficie.
      data-disabled={disabled ? "" : undefined}
      className={cn(inputShellClassName, (showTrigger || showClear) && "pr-1", groupClassName)}
    >
      <AutocompletePrimitive.Input data-slot="autocomplete-input" disabled={disabled} className={cn(inputShellInputClassName, className)} {...props} />
      {showClear && (
        <AutocompletePrimitive.Clear data-slot="autocomplete-clear" aria-label={labels?.clear ?? "Limpiar"} disabled={disabled} className={inputShellButtonClassName}>
          <XIcon />
        </AutocompletePrimitive.Clear>
      )}
      {showTrigger && (
        <AutocompletePrimitive.Trigger data-slot="autocomplete-trigger" render={renderShellTrigger} aria-label={labels?.trigger ?? "Ver sugerencias"} disabled={disabled} className={inputShellButtonClassName}>
          <ChevronDownIcon />
        </AutocompletePrimitive.Trigger>
      )}
    </AutocompletePrimitive.InputGroup>
  )
}

type AutocompleteItemProps = Omit<AutocompletePrimitive.Item.Props, "className"> & { className?: string }

// Sin check: una sugerencia no queda "elegida", completa el texto.
function AutocompleteItem({ className, ...props }: AutocompleteItemProps) {
  return <AutocompletePrimitive.Item data-slot="autocomplete-item" className={cn(menuItemClassName, "w-full", className)} {...props} />
}

type AutocompleteSeparatorProps = Omit<AutocompletePrimitive.Separator.Props, "className"> & { className?: string }

function AutocompleteSeparator({ className, ...props }: AutocompleteSeparatorProps) {
  return <AutocompletePrimitive.Separator data-slot="autocomplete-separator" className={cn("-mx-1 my-1 h-px bg-gray-400", className)} {...props} />
}

export {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteSeparator,
  AutocompleteStatus,
  useAutocompleteFilter,
  type AutocompleteInputProps,
  type AutocompleteItemProps,
}
