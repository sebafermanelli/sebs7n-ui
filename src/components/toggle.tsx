"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"

import { useFieldControl } from "../internal/field-control.js"
import { useFormReset } from "../internal/form-reset.js"
import { mergeRefs } from "../internal/merge-refs.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { toggleVariants } from "../variants/toggle.js"

type ToggleProps = WithClassName<TogglePrimitive.Props> & {
  /** 28 (el default, un chip), 36 o 40: los altos de `Button`, para un formulario de ese tamaño. */
  size?: "sm" | "md" | "lg"
  /**
   * El nombre con el que viaja en un formulario: prendido manda `value` (o «on»), apagado nada, como
   * un checkbox. Dentro de un `Field`, el `name` del `Field` gana y `Form` manda el booleano.
   */
  name?: string
}

function Toggle({ className, size, name, pressed, defaultPressed = false, onPressedChange, disabled, id, ref, onFocus, onBlur, ...props }: ToggleProps) {
  const [own, setOwn] = React.useState(defaultPressed)
  const on = pressed ?? own
  const button = React.useRef<HTMLButtonElement>(null)
  // El reset nativo no sabe del estado de React: vuelve a `defaultPressed`, y con él el hidden.
  const resetRef = useFormReset(() => setOwn(defaultPressed))
  const buttonRef = React.useMemo(() => mergeRefs(button, ref, resetRef), [ref, resetRef])
  const field = useFieldControl({ id, name, value: on, filled: on, disabled, controlRef: button })
  return (
    <>
      <TogglePrimitive
        data-slot="toggle"
        className={cn(toggleVariants({ size }), className)}
        {...props}
        ref={buttonRef}
        id={field.id}
        aria-describedby={cn(props["aria-describedby"], field.messageIds.join(" ")) || undefined}
        disabled={field.disabled}
        pressed={on}
        onPressedChange={(next, details) => {
          if (pressed === undefined) setOwn(next)
          onPressedChange?.(next, details)
        }}
        onFocus={(event) => {
          field.onFocus()
          onFocus?.(event)
        }}
        onBlur={(event) => {
          field.onBlur()
          onBlur?.(event)
        }}
      />
      {field.name && on && <input name={field.name} type="hidden" value={props.value ?? "on"} />}
    </>
  )
}

export { Toggle, type ToggleProps }
