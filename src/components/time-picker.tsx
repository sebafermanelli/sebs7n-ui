"use client"

import * as React from "react"
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { ClockIcon } from "lucide-react"
import { flushSync } from "react-dom"

import { defined } from "../internal/defined.js"
import { useFormReset } from "../internal/form-reset.js"
import { MenuCheck } from "../internal/menu-check.js"
import { clampTime, matchesTime, parseTime, timeSlots } from "../internal/time.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { inputShellClassName, inputShellInputClassName } from "../variants/input.js"
import { menuGutterClassName, menuIndicatorClassName } from "../variants/menu.js"
import { AutocompleteContent, AutocompleteItem, AutocompleteList } from "./autocomplete.js"

type TimePickerProps = {
  /** La hora elegida, «HH:MM» en 24 h. `null` es ninguna. Pasarlo lo vuelve controlado. */
  value?: string | null
  defaultValue?: string | null
  /** Avisa la hora elegida («HH:MM») o `null` al vaciar el campo. */
  onValueChange?: (value: string | null) => void
  /** Cada cuántos minutos hay una hora en la lista. Por defecto, 15. Se puede tipear cualquiera. */
  step?: number
  /** La primera hora posible, «HH:MM». Lo tipeado antes se lleva a esta. */
  min?: string
  /** La última hora posible, «HH:MM». Lo tipeado después se lleva a esta. */
  max?: string
  /**
   * Una hora que no puede quedar vacía (la apertura de un horario): vaciar el texto y salir vuelve a la
   * hora anterior y nunca avisa `null`. Pone `aria-required`.
   */
  required?: boolean
  /** El nombre con el que la hora viaja en un formulario, como «09:30» (vacío sin hora). */
  name?: string
  /** 28, 36 (default) o 40, como los campos. */
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  /** El `id` del campo, para un `<Label htmlFor>`. */
  id?: string
  placeholder?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  /** Clases de la superficie. */
  className?: string
  labels?: Partial<Labels["timePicker"]>
}

/**
 * Una hora en 24 h: se tipea («930», «9:30») o se elige de la lista, cada `step` minutos. Es un
 * `Autocomplete` de Base UI: el campo es `combobox`, la lista `listbox` y la hora elegida lleva el
 * círculo de acento de los menús.
 *
 * Lo tipeado se toma al salir del campo o con Enter (sin una opción resaltada): se escribe como
 * «HH:MM» y se lleva a `min`/`max`. Si no es una hora, el campo vuelve a la anterior y se anuncia.
 * Con `name`, un `<input type="hidden">` lleva la hora para una Server Action.
 */
function TimePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  step = 15,
  min,
  max,
  name,
  required = false,
  size = "md",
  disabled,
  id,
  placeholder,
  className,
  labels: labelsProp,
  ...aria
}: TimePickerProps) {
  const labels = { ...useLabels().timePicker, ...defined(labelsProp) }
  const [own, setOwn] = React.useState(defaultValue)
  const value = valueProp !== undefined ? valueProp : own
  const [draft, setDraft] = React.useState(value ?? "")
  const [status, setStatus] = React.useState("")
  const announce = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(announce.current), [])
  const [open, setOpen] = React.useState(false)
  // Un `value` nuevo de afuera pisa lo tipeado (el patrón de ajustar estado en el render).
  const [synced, setSynced] = React.useState(value)
  if (synced !== value) {
    setSynced(value)
    setDraft(value ?? "")
  }
  // El reset del form vuelve a `defaultValue` (sin controlar) y descarta lo tipeado.
  const formReset = useFormReset(() => {
    if (valueProp === undefined) setOwn(defaultValue)
    setDraft((valueProp !== undefined ? valueProp : defaultValue) ?? "")
    clearTimeout(announce.current)
    setStatus("")
  })
  const highlighted = React.useRef<string | undefined>(undefined)
  // Al abrir, la lista arranca en la hora elegida (centrada) y no en las 00:00. Ref estable: corre
  // cuando la opción elegida se monta (al abrir o al cambiar de hora), no en cada render.
  const revealSelected = React.useCallback((node: HTMLElement | null) => {
    const list = node?.closest<HTMLElement>("[data-slot=combobox-list]")
    if (!node || !list) return
    const offset = node.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
    list.scrollTop = Math.max(0, offset - (list.clientHeight - node.offsetHeight) / 2)
  }, [])

  const slots = React.useMemo(() => timeSlots(step, min, max), [step, min, max])
  // Con la hora elegida en el campo se ven todas; mientras se tipea, las que empiezan igual.
  const visible = draft === (value ?? "") ? slots : slots.filter((slot) => matchesTime(slot, draft))

  const commit = (next: string | null) => {
    setDraft(next ?? "")
    if (next === value) return
    if (valueProp === undefined) setOwn(next)
    onValueChange?.(next)
  }

  // Al salir del campo la lista se cierra: sin esto, volver a la hora anterior la reabría.
  const commitDraft = () => {
    setOpen(false)
    clearTimeout(announce.current)
    setStatus("")
    // Con `required` vaciar no es una respuesta: vuelve la hora de antes, sin avisar nada.
    if (draft.trim() === "") return required ? setDraft(value ?? "") : commit(null)
    const parsed = parseTime(draft)
    if (!parsed) {
      setDraft(value ?? "")
      // Vacía la región y la llena en el tick siguiente: un lector de pantalla no repite un texto
      // que no cambió, y un segundo error igual quedaba mudo.
      const invalid = labels.invalid
      announce.current = setTimeout(() => setStatus(invalid))
      return
    }
    commit(clampTime(parsed, min, max))
  }

  return (
    <>
      <AutocompletePrimitive.Root
        autoHighlight
        disabled={disabled}
        filteredItems={visible}
        items={slots}
        onOpenChange={setOpen}
        open={open}
        onItemHighlighted={(item) => {
          highlighted.current = item as string | undefined
        }}
        onValueChange={(next, details) => {
          setDraft(next)
          if (details.reason !== "input-change" && parseTime(next)) commit(next)
        }}
        openOnInputClick
        value={draft}
      >
        <AutocompletePrimitive.InputGroup
          data-slot="time-picker"
          data-size={size}
          ref={formReset}
          data-disabled={disabled ? "" : undefined}
          // `w-fit` y no el `w-full` de los campos, como NumberField: el grupo abraza al reloj y a la
          // hora. A todo el ancho, «09:15» quedaba a la izquierda de un campo vacío.
          className={cn(inputShellClassName, "w-fit max-w-full", className)}
        >
          <ClockIcon aria-hidden="true" className="pointer-events-none ms-3 size-4 shrink-0 text-label-secondary" />
          <AutocompletePrimitive.Input
            data-slot="time-picker-input"
            autoComplete="off"
            // El ancho es el del texto (`field-sizing: content`), la hora o el placeholder, con un
            // mínimo de 5 cifras para que no salte al tipear. `flex-1`: con `className="w-full"` en el
            // grupo, el campo lo llena. Sin `field-sizing` (Firefox), 6 cifras fijas: el `w-auto` que
            // lo libera va detrás de `@supports`, porque un `width` le gana al tamaño por contenido.
            className={cn(
              inputShellInputClassName,
              "ps-2 tabular-nums w-[calc(6ch+1.25rem)] min-w-[calc(5ch+1.25rem)] field-sizing-content supports-[field-sizing:content]:w-auto"
            )}
            disabled={disabled}
            id={id}
            inputMode="numeric"
            onBlur={commitDraft}
            onKeyDown={(event) => {
              // Enter sin una opción resaltada toma lo tipeado. `flushSync` para que el hidden ya tenga
              // la hora nueva cuando el Enter envíe el formulario.
              if (event.key === "Enter" && highlighted.current === undefined) flushSync(commitDraft)
            }}
            aria-required={required || undefined}
            placeholder={placeholder ?? labels.placeholder}
            {...aria}
          />
        </AutocompletePrimitive.InputGroup>
        <AutocompleteContent>
          <AutocompleteList className="max-h-64 overflow-y-auto">
            {(slot: string) => (
              <AutocompleteItem key={slot} ref={slot === value ? revealSelected : undefined} aria-selected={slot === value} className={cn("tabular-nums", menuGutterClassName)} value={slot}>
                {slot}
                {slot === value && (
                  <span data-slot="time-picker-indicator" className={menuIndicatorClassName}>
                    <MenuCheck />
                  </span>
                )}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </AutocompletePrimitive.Root>
      {name && <input name={name} type="hidden" value={value ?? ""} />}
      <span className="sr-only" data-slot="time-picker-status" role="status">
        {status}
      </span>
    </>
  )
}

export { TimePicker, type TimePickerProps }
