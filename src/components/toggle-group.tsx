"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { useFieldControl } from "../internal/field-control.js"
import { useFormReset } from "../internal/form-reset.js"
import { mergeRefs } from "../internal/merge-refs.js"
import { renderElement, type RenderElement } from "../lib/render.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { segmentedGroupClassName, segmentedItemClassName, segmentedTrackClassName } from "../variants/segmented.js"
import type { ToggleProps } from "./toggle.js"
import { useControlSize } from "../internal/control-size.js"

type ToggleGroupProps = WithClassName<ToggleGroupPrimitive.Props> & {
  /**
   * La pista de 28, 36 (el default desde 2.4) o 40, como los campos y los botones del formulario. En
   * una barra de filtros mide lo que la búsqueda y los `Select` de al lado. Adentro de una `Toolbar`
   * queda en 28, el escalón de la barra, sea cual sea.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Siempre hay uno prendido, como en un grupo de radios `required`: tocar el último prendido no lo
   * apaga (con `multiple`, se apagan todos menos el último). Dentro de un `Form`, sin ninguno elegido
   * no envía y enfoca el grupo. Es el filtro de selección única: «Todas» es una opción más, con `""`.
   */
  required?: boolean
  /**
   * El nombre con el que viaja en un formulario: cada valor prendido es un campo con ese nombre, como
   * un grupo de checkboxes. Dentro de un `Field`, el `name` del `Field` gana y `Form` manda la lista.
   */
  name?: string
}

// Base UI toma el `value=""` de un Toggle como «sin valor» (le inventa un id) y ese ítem nunca se
// prende. «Todas» suele ser justo `""` en los searchParams: adentro del primitivo viaja con este valor
// y se traduce en los bordes, así la app ve `""` en `value`, en `onValueChange` y en el submit.
const EMPTY = "\u0000"
const inner = (item: string) => item || EMPTY
// Lo prendido, tal como lo ve la app: lo leen los ítems que son links, que no son Toggles de Base UI.
const Pressed = React.createContext<readonly string[]>([])

/**
 * Un grupo de opciones que se prenden: el segmentado de iCloud (R4). La pista gris del segmentado,
 * segmentos del mismo ancho y cada ítem prendido en el acento sólido; con `multiple` pueden ser
 * varios. No envuelve en varias filas. Para filtros sueltos
 * que envuelven en varias filas, `Toggle` de a uno (el token gris que se prende en el acento).
 *
 * Dentro de un `Field` se registra como su control (2.1): `FieldLabel` nombra el grupo, `Form` manda
 * la lista de valores y, si el campo queda inválido, enfoca el primer ítem prendido (o el primero).
 *
 * Filtro de selección única (2.4): `required` para que siempre haya uno prendido, «Todas» con
 * `value=""` y, si el filtro vive en la URL, ítems con `href` que son links de verdad.
 */
function ToggleGroup({ className, size: sizeProp, name, value, defaultValue, onValueChange, disabled, required, ref, ...props }: ToggleGroupProps) {
  const size = useControlSize(sizeProp, "md")
  const [own, setOwn] = React.useState<NonNullable<ToggleGroupProps["value"]>>(defaultValue ?? [])
  const current = value ?? own
  const group = React.useRef<HTMLDivElement>(null)
  // El reset nativo no sabe del estado de React: vuelve a `defaultValue`, y con él los hidden.
  const resetRef = useFormReset(() => setOwn(defaultValue ?? []))
  const groupRef = React.useMemo(() => mergeRefs(group, ref, resetRef), [ref, resetRef])
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
    <Pressed.Provider value={current}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        data-size={size}
        className={cn(segmentedTrackClassName, segmentedGroupClassName, "group/toggle-group", className)}
        aria-labelledby={props["aria-label"] ? undefined : field.labelId}
        aria-describedby={field.messageIds.join(" ") || undefined}
        // `aria-invalid` no vale en un role=group: el estado va en `data-invalid` y el `FieldError` se
        // asocia por `aria-describedby`.
        data-invalid={field.invalid ? "" : undefined}
        {...props}
        ref={groupRef}
        disabled={field.disabled}
        value={current.map(inner)}
        onValueChange={(next, details) => {
          if (required && !next.length) return
          next = next.map((item) => (item === EMPTY ? "" : item))
          if (value === undefined) setOwn(next)
          onValueChange?.(next, details)
        }}
        onFocus={field.onFocus}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) field.onBlur()
        }}
      />
      {field.name && current.map((item) => <input key={item} name={field.name} type="hidden" value={item} />)}
      {required && (
        // La validación nativa de `required`, como en `Rating`: fuera de la vista y del Tab, devuelve
        // el foco al grupo.
        <input
          ref={field.inputRef}
          aria-hidden
          className="sr-only"
          onChange={() => {}}
          onFocus={() => firstItem.current?.focus()}
          required
          tabIndex={-1}
          value={current.length ? "on" : ""}
        />
      )}
    </Pressed.Provider>
  )
}

type ToggleGroupItemProps = ToggleProps & {
  /**
   * La opción navega: se dibuja un `<a href>` real con el mismo segmento, que se abre en una pestaña
   * nueva y que el router puede precargar. Con Next, `render={<Link href="?status=paid" />}` (con el
   * `href` en el `Link`, alcanza). La elegida (la que
   * está en el `value` del grupo) lleva `aria-current="page"` en vez de `aria-pressed`: un link no se
   * «presiona», lleva a la página que ya se está viendo. Cada link es una parada de Tab.
   */
  href?: string
}

function ToggleGroupItem({ className, size: _size, name: _name, href, value, render, ...props }: ToggleGroupItemProps) {
  const on = React.useContext(Pressed).includes(value!)
  const itemProps = {
    "data-slot": "toggle-group-item",
    // Adentro de una Toolbar, 28 siempre: la barra tiene su escalón.
    className: cn(
      segmentedItemClassName,
      "group-data-[size=md]/toggle-group:not-in-data-[slot=toolbar]:h-8 group-data-[size=lg]/toggle-group:not-in-data-[slot=toolbar]:h-9",
      className
    ),
  }
  // Es link si trae `href`, suelto o en el elemento de `render` (`<Link href>`, que lo exige en su tipo).
  if ((href ?? (React.isValidElement<{ href?: string }>(render) ? render.props.href : undefined)) != null)
    return renderElement(render as RenderElement, "a", {
      ...props,
      ...itemProps,
      href,
      "aria-current": on ? "page" : undefined,
      "data-pressed": on ? "" : undefined,
    })
  return <TogglePrimitive {...itemProps} {...props} render={render} value={value == null ? value : inner(value)} />
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupItemProps, type ToggleGroupProps }
