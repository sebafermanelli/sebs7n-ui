"use client"

import type * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn } from "../lib/utils.js"
import { inputControlClassName, inputDisabledClassName, inputInvalidClassName } from "../variants/input.js"

/**
 * Texto largo, con el mismo cuerpo y los mismos estados que `Input`.
 *
 * Renderiza un `<textarea>` a través de `Field.Control` y no suelto. Suelto era
 * el único control del paquete que **no** se enganchaba a un `Field`: adentro
 * de uno se quedaba sin `name`, sin etiqueta asociada y sin error, y el
 * formulario se veía perfecto mientras el dato no viajaba. Un control que
 * pierde lo que el usuario escribió sin avisar es peor que uno que no anda.
 *
 * Fuera de un `Field` se comporta igual que antes: es un `<textarea>` común.
 */
type TextareaProps = React.ComponentProps<"textarea">

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <FieldPrimitive.Control
      data-slot="textarea"
      render={<textarea />}
      className={cn(
        inputControlClassName,
        inputDisabledClassName,
        inputInvalidClassName,
        // Sin alto del sistema: `field-sizing-content` lo hace crecer con el texto.
        "peer field-sizing-content min-h-20 w-full min-w-0 px-3 py-2.5 placeholder:text-gray-900 focus:focus-border",
        // Además del `data-disabled:` de arriba —que es el que pone un `Fieldset`—, el
        // `<textarea>` puede venir deshabilitado por el atributo nativo. Los dos pasan.
        "disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-700",
        className
      )}
      // `Field.Control` tipa sus props contra un `<input>`, así que no conoce
      // `rows` ni `cols`. Las reenvía igual al elemento de `render`, que es un
      // `<textarea>` de verdad: por eso el tipo público sigue siendo el del
      // `<textarea>` —nadie tiene que cambiar su código— y el cast vive acá
      // adentro, en el único lugar donde se sabe por qué es seguro.
      {...(props as FieldPrimitive.Control.Props)}
    />
  )
}

export { Textarea, type TextareaProps }
