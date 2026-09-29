"use client"

import * as React from "react"

import { COUNTRY_CODES, countryFlag } from "../lib/countries.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./combobox.js"

type CountryPickerProps = {
  /** El país elegido, código ISO 3166-1 alfa-2 («AR»). `null` es ninguno. Pasarlo lo vuelve controlado. */
  value?: string | null
  defaultValue?: string | null
  /** Avisa el código elegido, o `null` al limpiar. */
  onValueChange?: (value: string | null) => void
  /** El nombre con el que el código viaja en un formulario. */
  name?: string
  /** Los países de la lista, si no son todos. En el orden que sea: se ordenan por nombre. */
  countries?: readonly string[]
  /** El idioma de los nombres. Por defecto, el de `labels` (`countryPicker.locale`, `es-AR`). */
  locale?: string
  placeholder?: string
  /** 28, 36 (default) o 40, como los campos. */
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  /** El `id` del campo, para un `<Label htmlFor>`. */
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  /** Clases de la superficie. */
  className?: string
  labels?: Partial<Labels["countryPicker"]>
}

/** Sin tildes ni mayúsculas: «peru» encuentra «Perú». */
const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

/**
 * Un país de la lista ISO: se escribe para filtrar (sin tildes, por nombre o por código), ↓/↑
 * recorren y Enter elige. Es un
 * `Combobox` con los nombres de `Intl.DisplayNames` en el idioma de la app y la bandera armada con
 * el código. El valor es el código («AR»), que es lo que se guarda.
 */
function CountryPicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  name,
  countries = COUNTRY_CODES,
  locale: localeProp,
  placeholder,
  size = "md",
  disabled,
  id,
  className,
  labels: labelsProp,
  ...aria
}: CountryPickerProps) {
  const labels = { ...useLabels().countryPicker, ...labelsProp }
  const locale = localeProp ?? labels.locale
  const [own, setOwn] = React.useState(defaultValue)
  const value = valueProp !== undefined ? valueProp : own

  const { names, items } = React.useMemo(() => {
    const display = new Intl.DisplayNames([locale], { type: "region", fallback: "code" })
    const names = new Map(countries.map((code) => [code.toUpperCase(), display.of(code.toUpperCase()) ?? code]))
    const collator = new Intl.Collator(locale)
    return { names, items: [...names.keys()].sort((a, b) => collator.compare(names.get(a)!, names.get(b)!)) }
  }, [countries, locale])
  const nameOf = (code: string) => names.get(code) ?? code
  // El código ISO también encuentra («US», «uy»), y el país de ese código va primero: si no,
  // «US» resaltaba Australia, que lo lleva en el nombre.
  const [query, setQuery] = React.useState("")
  const code = query.trim().toUpperCase()
  const sorted = names.has(code) ? [code, ...items.filter((item) => item !== code)] : items

  return (
    <Combobox<string>
      autoHighlight
      disabled={disabled}
      filter={(item, text) => item === text.trim().toUpperCase() || normalize(nameOf(item)).includes(normalize(text.trim()))}
      items={sorted}
      itemToStringLabel={nameOf}
      name={name}
      onInputValueChange={setQuery}
      onValueChange={(next) => {
        if (valueProp === undefined) setOwn(next)
        onValueChange?.(next)
      }}
      value={value}
    >
      <ComboboxInput
        autoComplete="off"
        disabled={disabled}
        groupClassName={className}
        id={id}
        placeholder={placeholder ?? labels.placeholder}
        size={size}
        spellCheck={false}
        {...aria}
      />
      <ComboboxContent>
        <ComboboxEmpty />
        <ComboboxList className="max-h-64 overflow-y-auto">
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              <span aria-hidden="true" data-slot="country-flag" className="w-5 shrink-0 text-center">
                {countryFlag(item)}
              </span>
              <span className="truncate">{nameOf(item)}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { CountryPicker, type CountryPickerProps }
