"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { mergeRefs } from "../internal/merge-refs.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, type InputGroupInputProps } from "./input-group.js"

type SearchFieldLabels = NonNullable<Labels["searchField"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const searchFieldLabels: SearchFieldLabels = { placeholder: "Buscar", clear: "Borrar búsqueda" }

type SearchFieldProps = Omit<InputGroupInputProps, "value" | "defaultValue" | "onValueChange" | "type" | "size"> & {
  /** El texto, controlado. */
  value?: string
  /** El texto al montar, sin controlar. */
  defaultValue?: string
  /** Avisa el texto en cada tecla y al borrar (con `""`). El debounce, si hace falta, es de la app. */
  onValueChange?: (value: string) => void
  /**
   * Avisa el texto con retraso (`debounceMs`): para buscar contra el servidor sin una consulta por
   * tecla. Vaciar el campo (borrar, Escape) y Enter avisan al instante; un cambio pendiente se
   * descarta al desmontar. Convive con `onValueChange`, que sigue avisando en cada tecla.
   */
  onSearch?: (value: string) => void
  /** El retraso de `onSearch`, en ms. Default 300. */
  debounceMs?: number
  /** 28, 36 (default) o 40, como los campos. */
  size?: "sm" | "md" | "lg"
  /** Clases de la superficie. El `className` va al `<input>`. */
  groupClassName?: string
  /** Textos: `placeholder` y `clear`. Por defecto, `searchFieldLabels`. */
  labels?: Partial<SearchFieldLabels>
}

/**
 * El buscador de una lista: la lupa adentro del campo, «Borrar búsqueda» cuando hay texto y Escape
 * que vacía. Es un `<input type="search">` (el lector lo anuncia como «campo de búsqueda») sobre la
 * superficie de `InputGroup`, así que dentro de un `Field` se engancha solo (etiqueta, ayuda, `name`).
 *
 * No filtra ni busca: avisa el texto con `onValueChange` y la app decide (en memoria, o contra el
 * servidor con su debounce). Para sugerencias mientras se escribe, `Autocomplete` con `startIcon`.
 */
function SearchField({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSearch,
  debounceMs = 300,
  size = "md",
  disabled,
  groupClassName,
  labels: labelsProp,
  placeholder,
  className,
  onKeyDown,
  ref,
  ...props
}: SearchFieldProps) {
  const labels = { ...searchFieldLabels, ...useLabels().searchField, ...defined(labelsProp) }
  const [own, setOwn] = React.useState(defaultValue)
  const value = valueProp ?? own
  const input = React.useRef<HTMLInputElement>(null)
  const inputRef = React.useMemo(() => mergeRefs(input, ref), [ref])
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const onSearchRef = React.useRef(onSearch)
  onSearchRef.current = onSearch
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const search = (next: string, now: boolean) => {
    clearTimeout(timer.current)
    if (!onSearchRef.current) return
    if (now) onSearchRef.current(next)
    else timer.current = setTimeout(() => onSearchRef.current?.(next), debounceMs)
  }
  const change = (next: string) => {
    if (valueProp === undefined) setOwn(next)
    onValueChange?.(next)
    search(next, next === "")
  }
  const clear = () => {
    change("")
    // El botón desaparece al vaciar: el foco vuelve al campo, que es donde se sigue escribiendo.
    input.current?.focus()
  }
  return (
    <InputGroup className={groupClassName} disabled={disabled} size={size}>
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        autoComplete="off"
        enterKeyHint="search"
        placeholder={placeholder ?? labels.placeholder}
        spellCheck={false}
        {...props}
        ref={inputRef}
        type="search"
        value={value}
        // El ✕ propio de WebKit en `type="search"` sobra: el botón de borrar es el del paquete.
        className={cn("[&::-webkit-search-cancel-button]:appearance-none", className)}
        onValueChange={(next) => change(next)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.key === "Enter" && !event.defaultPrevented) search(event.currentTarget.value, true)
          // Con texto, Escape lo vacía y no sigue (no cierra el diálogo de afuera); vacío, sigue de largo.
          if (event.key === "Escape" && value !== "" && !event.defaultPrevented) {
            event.preventDefault()
            event.stopPropagation()
            change("")
          }
        }}
      />
      {value !== "" && (
        <InputGroupAddon>
          <InputGroupButton aria-label={labels.clear} data-slot="search-field-clear" onClick={clear} type="button">
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

export { SearchField, searchFieldLabels, type SearchFieldLabels, type SearchFieldProps }
