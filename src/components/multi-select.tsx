"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { MenuCheck } from "../internal/menu-check.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { menuIndicatorClassName } from "../variants/menu.js"
import { tagVariants } from "../variants/tag.js"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
} from "./combobox.js"
import { useControlSize } from "../internal/control-size.js"

/**
 * Elegir varias opciones de una lista: los elegidos como chips (el `Tag` del sistema) en la
 * superficie de campo, y la lista del menú de iCloud con el círculo de acento a la derecha de cada
 * elegida (§2.8, R3). Es `Combobox multiple` de Base UI armado de una, por datos: se escribe para
 * filtrar, Enter elige y la lista queda abierta, Backspace con el campo vacío quita el último.
 *
 * Suma «Seleccionar todo» (las opciones habilitadas que se ven) y `max`.
 */
type MultiSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type MultiSelectProps = {
  options: MultiSelectOption[]
  /** Los valores elegidos. Pasarlo lo vuelve controlado. */
  value?: string[]
  defaultValue?: string[]
  /** Se llama con los valores elegidos, en el orden de `options`. */
  onValueChange?: (value: string[]) => void
  /** Lo que dice el campo sin elegidos. */
  placeholder?: string
  /** Una opción arriba de todo que marca las habilitadas que se ven (con una búsqueda, las que coinciden) o las desmarca. */
  selectAll?: boolean
  /** Cuántas se pueden elegir. Al llegar, las demás se apagan y la lista lo dice. */
  max?: number
  /** 28, 36 (default) o 40, como los campos. */
  size?: "sm" | "md" | "lg"
  /** El botón que vacía la selección. Por defecto, sí. */
  showClear?: boolean
  disabled?: boolean
  /** El nombre del campo en un `<form>`: se envía un valor por elegido. */
  name?: string
  /** El `id` del campo, para un `<Label htmlFor>`. */
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  /** Clases de la superficie. */
  className?: string
  /**
   * Qué pasa cuando los chips no entran. `collapse` (default): **una sola línea** del alto de un `Select`; los chips que no
   * entran se esconden detrás de un chip «+N» (con nombre accesible «y N más») que abre la lista, donde se ven y se
   * quitan todos. `wrap`: los chips envuelven en varias filas y el campo crece.
   */
  overflow?: "collapse" | "wrap"
  /** Con `collapse`, el tope de chips a la vista aunque entren más (el resto va en «+N»). */
  maxVisible?: number
  labels?: Partial<Labels["multiSelect"]>
}

/** «y {count} más»: no está en `defaultLabels` (el componente es solo por subpath). */
const MORE = "y {count} más"

// El valor centinela de «Seleccionar todo»: va en la lista como una opción más, pero **nunca** en el
// valor de Base UI. Ahí descalabraba los chips (Base UI quita un chip por índice: con todo elegido,
// quitar «Beta» quitaba otro) y los `<input hidden>` del form. Su círculo y `aria-selected` se dibujan
// a mano, y nunca llega a `onValueChange`.
const ALL = "\u0000all"

/** Sin tildes ni mayúsculas: «debito» encuentra «Débito automático». */
const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

function MultiSelect({
  options,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  placeholder,
  selectAll = false,
  max,
  size: sizeProp,
  showClear = true,
  disabled,
  name,
  id,
  className,
  overflow = "collapse",
  maxVisible,
  labels: labelsProp,
  ...aria
}: MultiSelectProps) {
  const size = useControlSize(sizeProp, "md")
  const labels = { ...useLabels().multiSelect, ...defined(labelsProp) }
  const [own, setOwn] = React.useState(defaultValue)
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const collapse = overflow === "collapse"

  const byValue = React.useMemo(() => new Map(options.map((option) => [option.value, option])), [options])
  const position = React.useMemo(() => new Map(options.map((option, index) => [option.value, index])), [options])
  const sorted = (values: string[]) => [...new Set(values)].filter((item) => byValue.has(item)).sort((a, b) => position.get(a)! - position.get(b)!)
  // Los chips van en el orden de las opciones, no en el de los clicks.
  const value = sorted(valueProp ?? own)

  const commit = (next: string[]) => {
    const clean = sorted(next)
    if (valueProp === undefined) setOwn(clean)
    onValueChange?.(clean)
  }

  const selected = new Set(value)
  const full = max !== undefined && value.length >= max
  const needle = normalize(query.trim())
  const matches = options.filter((option) => !needle || normalize(option.label).includes(needle))
  const enabledMatches = matches.filter((option) => !option.disabled)
  // Si «todo» (lo ya elegido más lo que se ve) pasa el tope, no se ofrece.
  const offerAll =
    selectAll && enabledMatches.length > 1 && (max === undefined || new Set([...value, ...enabledMatches.map((option) => option.value)]).size <= max)
  const allChosen = offerAll && enabledMatches.every((option) => selected.has(option.value))
  const items = offerAll ? [ALL, ...matches.map((option) => option.value)] : matches.map((option) => option.value)

  const handleChange = (next: string[]) => {
    // Base UI suma el centinela al elegir «Seleccionar todo» (nunca está en su valor): marca las que se
    // ven, o las desmarca si ya estaban todas.
    if (next.includes(ALL)) {
      const visible = enabledMatches.map((option) => option.value)
      if (allChosen) return commit(value.filter((item) => !visible.includes(item)))
      return commit([...value, ...visible])
    }
    const real = next
    // El tope también vale para lo que no pasa por la lista (un valor controlado de más no se recorta).
    if (max !== undefined && real.length > max && real.length > value.length) return
    commit(real)
  }

  const label = (item: string) => (item === ALL ? labels.selectAll : (byValue.get(item)?.label ?? item))

  // Los chips que entran en una línea: se miden con todos montados y se esconden los que pasan el borde.
  // `fit === null` es la pasada de medir (todos a la vista); la siguiente, con el número.
  const chipsRef = React.useRef<HTMLDivElement>(null)
  const [fit, setFit] = React.useState<number | null>(null)
  const valueKey = value.join("\u0000")
  React.useLayoutEffect(() => setFit(null), [valueKey, size, collapse])
  React.useLayoutEffect(() => {
    if (!collapse || fit !== null) return
    const row = chipsRef.current
    if (!row) return
    const chips = [...row.querySelectorAll<HTMLElement>("[data-slot=combobox-chip]")]
    // Sin layout (jsdom, oculto): todos a la vista. Si no, lugar para el input (48), el «+N» (40) y los huecos de 4.
    const room = row.clientWidth - 48
    let used = 0
    let count = row.clientWidth === 0 ? chips.length : 0
    if (count === 0) {
      for (const [index, chip] of chips.entries()) {
        const next = used + chip.offsetWidth + 4
        if (count > 0 && next + (index < chips.length - 1 ? 40 : 0) > room) break
        used = next
        count++
      }
    }
    setFit(Math.min(count, maxVisible ?? count))
  }, [collapse, fit, maxVisible, valueKey])
  React.useEffect(() => {
    const row = chipsRef.current
    if (!collapse || !row || typeof ResizeObserver === "undefined") return
    let width = row.clientWidth
    const observer = new ResizeObserver(() => {
      if (Math.abs(row.clientWidth - width) < 1) return
      width = row.clientWidth
      setFit(null)
    })
    observer.observe(row)
    return () => observer.disconnect()
  }, [collapse])
  const shown = collapse && fit !== null ? value.slice(0, fit) : value
  const hidden = value.length - shown.length

  return (
    <Combobox<string, true>
      disabled={disabled}
      filteredItems={items}
      inputValue={query}
      items={items}
      itemToStringLabel={label}
      multiple
      name={name}
      onInputValueChange={(next) => setQuery(next)}
      onOpenChange={setOpen}
      open={open}
      onValueChange={(next) => handleChange(next as string[])}
      value={value}
    >
      <ComboboxChips className={className} disabled={disabled} ref={chipsRef} showClear={showClear && value.length > 0} size={size} wrap={!collapse}>
        {shown.map((item) => (
          <ComboboxChip className={collapse ? "shrink-0" : undefined} key={item} textValue={label(item)}>
            {label(item)}
          </ComboboxChip>
        ))}
        {hidden > 0 && (
          // El resto, en la lista: abre el menú, donde cada elegido lleva su círculo y se quita con un click.
          <button
            aria-expanded={open}
            aria-label={(labels.more ?? MORE).replace("{count}", String(hidden))}
            className={cn(tagVariants({ size: size === "sm" ? "sm" : "md" }), "shrink-0 cursor-pointer outline-none focus-visible:focus-ring")}
            data-slot="multi-select-more"
            disabled={disabled}
            onClick={() => setOpen(true)}
            type="button"
          >
            +{hidden}
          </button>
        )}
        <ComboboxChipsInput id={id} placeholder={value.length ? undefined : placeholder} {...aria} />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty />
        {full && <ComboboxStatus>{`${labels.max} ${max}`}</ComboboxStatus>}
        <ComboboxList>
          {(item: string) => (
            item === ALL ? (
              <ComboboxItem key={item} aria-selected={allChosen} className="font-semibold" value={item}>
                {label(item)}
                {allChosen && (
                  <span data-slot="combobox-item-indicator" className={menuIndicatorClassName}>
                    <MenuCheck />
                  </span>
                )}
              </ComboboxItem>
            ) : (
              <ComboboxItem key={item} disabled={byValue.get(item)?.disabled || (full && !selected.has(item))} value={item}>
                {label(item)}
              </ComboboxItem>
            )
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { MultiSelect, type MultiSelectOption, type MultiSelectProps }
