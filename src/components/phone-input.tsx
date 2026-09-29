"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronsUpDownIcon } from "lucide-react"

import { countryFlag } from "../lib/countries.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { nationalNumber, onlyDigits, parsePhone, PHONE_COUNTRIES, phoneCountry, type PhoneCountry } from "../lib/phone.js"
import { cn } from "../lib/utils.js"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group.js"
import { SelectContent, SelectItem } from "./select.js"

type PhoneInputProps = {
  /** El teléfono en E.164 («+5491155552002»); vacío sin número. Pasarlo lo vuelve controlado. */
  value?: string
  defaultValue?: string
  /** Avisa el teléfono en E.164, o vacío si se borró el número. */
  onValueChange?: (value: string) => void
  /** El país del selector si el valor no dice otro. Por defecto, «AR». */
  defaultCountry?: string
  /** El nombre con el que el E.164 viaja en un formulario. */
  name?: string
  /** El idioma de los nombres de la lista. Por defecto, el de `labels` (`countryPicker.locale`). */
  locale?: string
  placeholder?: string
  /** 28, 36 (default) o 40, como los campos. */
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  /** El `id` del campo del número, para un `<Label htmlFor>`. */
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  /** Clases de la superficie. */
  className?: string
  labels?: Partial<Labels["phoneInput"]>
}

/**
 * Un teléfono: a la izquierda, adentro del campo, un selector compacto con la bandera y el código
 * («🇦🇷 +54»); a la derecha, el número, solo dígitos y con el largo máximo del país. El valor es
 * E.164 y un `<input type="hidden">` con `name` lo lleva al formulario. Pegar un número que empieza
 * con «+» o «00» cambia el país solo; si el código no está en la lista, el número no cambia y se
 * anuncia.
 *
 * El prefijo nacional no entra al E.164: «011 5555 2002» es +54 11 5555 2002. En Argentina, el
 * celular escrito con el 15 («11 15 5555 2002») pasa a la forma con 9 (+54 9 11 5555 2002).
 *
 * No formatea mientras se escribe ni valida el tipo de línea (eso es libphonenumber). Para validar
 * al enviar, `isValidPhone` de `sebs7n-ui/lib/phone`, que también corre en el servidor.
 */
function PhoneInput({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  defaultCountry = "AR",
  name,
  locale: localeProp,
  placeholder,
  size = "md",
  disabled,
  id,
  className,
  labels: labelsProp,
  ...aria
}: PhoneInputProps) {
  const all = useLabels()
  const labels = { ...all.phoneInput, ...labelsProp }
  const locale = localeProp ?? all.countryPicker.locale
  const fallback = phoneCountry(defaultCountry) ?? PHONE_COUNTRIES[0]!

  const [own, setOwn] = React.useState(defaultValue)
  const value = valueProp !== undefined ? valueProp : own
  const [status, setStatus] = React.useState("")
  const [chosen, setChosen] = React.useState(() => parsePhone(value, defaultCountry)?.country ?? fallback)
  // El país sale del valor; con un código compartido (+1) o sin número, el que se eligió.
  const parsed = parsePhone(value, chosen.code)
  const country = parsed?.country ?? chosen
  const national = parsed?.national ?? ""

  const names = React.useMemo(() => {
    const display = new Intl.DisplayNames([locale], { type: "region", fallback: "code" })
    return new Map(PHONE_COUNTRIES.map((item) => [item.code, display.of(item.code) ?? item.code]))
  }, [locale])
  const sorted = React.useMemo(() => {
    const collator = new Intl.Collator(locale)
    return [...PHONE_COUNTRIES].sort((a, b) => collator.compare(names.get(a.code)!, names.get(b.code)!))
  }, [names, locale])

  const commit = (nextCountry: PhoneCountry, nextNational: string) => {
    setChosen(nextCountry)
    setStatus("")
    // Sin el prefijo nacional y con el 15 argentino ya pasado a 9, y recién ahí se corta en el máximo.
    const digits = nationalNumber(nextCountry, nextNational).slice(0, nextCountry.max)
    const next = digits ? `+${nextCountry.dial}${digits}` : ""
    if (next === value) return
    if (valueProp === undefined) setOwn(next)
    onValueChange?.(next)
  }

  return (
    <InputGroup className={className} disabled={disabled} size={size}>
      <InputGroupAddon>
        <SelectPrimitive.Root
          disabled={disabled}
          onValueChange={(code) => commit(phoneCountry(code as string) ?? country, national)}
          value={country.code}
        >
          <SelectPrimitive.Trigger
            aria-label={`${labels.country}: ${names.get(country.code)} (+${country.dial})`}
            data-slot="phone-input-country"
            className={cn(
              "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-[calc(var(--radius-field)-4px)] px-2 text-callout tabular-nums text-label outline-none transition-control",
              "hover:bg-fill-2 active:bg-fill-3 focus-visible:focus-ring data-popup-open:bg-fill-2 data-disabled:pointer-events-none",
              "group-data-[size=sm]/input-group:h-5 group-data-[size=sm]/input-group:px-1.5 group-data-[size=lg]/input-group:h-8",
              "pointer-coarse:group-data-[size=sm]/input-group:h-7 pointer-coarse:group-data-[size=md]/input-group:h-9"
            )}
          >
            <span aria-hidden="true">{countryFlag(country.code)}</span>
            <span>+{country.dial}</span>
            <ChevronsUpDownIcon aria-hidden="true" className="size-3.5 text-label-secondary" />
          </SelectPrimitive.Trigger>
          <SelectContent alignItemWithTrigger={false}>
            {sorted.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                <span aria-hidden="true" className="w-5 shrink-0 text-center">
                  {countryFlag(item.code)}
                </span>
                {names.get(item.code)}
                <span className="text-label-secondary tabular-nums">+{item.dial}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </SelectPrimitive.Root>
      </InputGroupAddon>
      <InputGroupInput
        autoComplete="tel-national"
        id={id}
        inputMode="tel"
        onChange={(event) => {
          const text = event.currentTarget.value.trim()
          // Pegado con el código («+54 9 11 …», «0054 9 11 …»): el país sale del número. Si el código
          // no está en la tabla, el número queda como estaba: tomar esos dígitos como nacionales
          // guardaría otro teléfono.
          if (/^(\+|00)/.test(text)) {
            const pasted = parsePhone(text.replace(/^00/, "+"), country.code)
            if (pasted) return commit(pasted.country, pasted.national)
            if (onlyDigits(text).replace(/^00/, "")) setStatus(labels.unknownCode)
            return
          }
          commit(country, text)
        }}
        placeholder={placeholder}
        type="tel"
        value={national}
        {...aria}
      />
      {name && <input name={name} type="hidden" value={value} />}
      <span className="sr-only" data-slot="phone-input-status" role="status">
        {status}
      </span>
    </InputGroup>
  )
}

export { PhoneInput, type PhoneInputProps }
