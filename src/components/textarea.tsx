"use client"

import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn } from "../lib/utils.js"

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
type TextareaProps = Omit<FieldPrimitive.Control.Props, "className" | "render"> & {
  className?: string
}

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <FieldPrimitive.Control
      data-slot="textarea"
      render={<textarea />}
      className={cn(
        "peer field-sizing-content min-h-20 w-full min-w-0 rounded-md border border-gray-400 bg-background-100 px-3 py-2.5 text-copy-14 text-gray-1000 outline-none transition-control",
        "placeholder:text-gray-700 hover:border-gray-500 focus:focus-border",
        // `disabled:` cubre el atributo nativo y `data-disabled:` el que pone
        // un `Fieldset` deshabilitado. Los dos, porque los dos pasan.
        "disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-700",
        "data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700",
        "aria-invalid:border-red-800 aria-invalid:focus:focus-border-error data-invalid:border-red-800 data-invalid:focus:focus-border-error",
        className
      )}
      {...props}
    />
  )
}

export { Textarea, type TextareaProps }
