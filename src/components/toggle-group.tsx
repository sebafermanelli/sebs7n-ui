"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { useFieldControl } from "../internal/field-control.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { segmentedGroupClassName, segmentedItemClassName, segmentedTrackClassName } from "../variants/segmented.js"
import type { ToggleProps } from "./toggle.js"

type ToggleGroupProps = WithClassName<ToggleGroupPrimitive.Props> & {
  /** La pista de 28 (el default), 36 o 40, como los campos y los botones del formulario. */
  size?: "sm" | "md" | "lg"
  /**
   * El nombre con el que viaja en un formulario: cada valor prendido es un campo con ese nombre, como
   * un grupo de checkboxes. Dentro de un `Field`, el `name` del `Field` gana y `Form` manda la lista.
   */
  name?: string
}

/**
 * Un grupo de opciones que se prenden: el segmentado de iCloud (R4). La pista gris del segmentado,
 * segmentos del mismo ancho y cada ítem prendido en el acento sólido; con `multiple` pueden ser
 * varios. No envuelve en varias filas. Para filtros sueltos
 * que envuelven en varias filas, `Toggle` de a uno (el token gris que se prende en el acento).
 *
 * Dentro de un `Field` se registra como su control (2.1): `FieldLabel` nombra el grupo, `Form` manda
 * la lista de valores y, si el campo queda inválido, enfoca el primer ítem prendido (o el primero).
 */
function ToggleGroup({ className, size = "sm", name, value, defaultValue, onValueChange, disabled, ...props }: ToggleGroupProps) {
  const [own, setOwn] = React.useState<NonNullable<ToggleGroupProps["value"]>>(defaultValue ?? [])
  const current = value ?? own
  const group = React.useRef<HTMLDivElement>(null)
  // `Form` enfoca el control de un campo inválido: el grupo no es enfocable, su primer ítem sí.
  const firstItem = React.useMemo(
    () => ({
      get current() {
        return group.current?.querySelector<HTMLElement>("[data-pressed]:not([data-disabled])") ?? group.current?.querySelector<HTMLElement>("button:not([data-disabled])") ?? null
      },
    }),
    []
  )
  const field = useFieldControl({ name, value: current, filled: current.length > 0, disabled, controlRef: firstItem, labelable: false })
  return (
    <>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        data-size={size}
        className={cn(segmentedTrackClassName, segmentedGroupClassName, "group/toggle-group", className)}
        aria-labelledby={props["aria-label"] ? undefined : field.labelId}
        aria-describedby={field.messageIds.join(" ") || undefined}
        aria-invalid={field.invalid || undefined}
        {...props}
        ref={group}
        disabled={field.disabled}
        value={current}
        onValueChange={(next, details) => {
          if (value === undefined) setOwn(next)
          onValueChange?.(next, details)
        }}
        onFocus={field.onFocus}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) field.onBlur()
        }}
      />
      {field.name && current.map((item) => <input key={String(item)} name={field.name} type="hidden" value={String(item)} />)}
    </>
  )
}

function ToggleGroupItem({ className, size: _size, name: _name, ...props }: ToggleProps) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(segmentedItemClassName, "group-data-[size=md]/toggle-group:h-8 group-data-[size=lg]/toggle-group:h-9", className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps }
