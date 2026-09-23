"use client"

import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field"

import { cn } from "../lib/utils.js"

/**
 * El código de verificación: una casilla por dígito, un solo valor.
 *
 * Seis `<input maxlength="1">` atados a mano es el campo que peor envejece —se
 * pega el código y entra un dígito solo, Backspace no retrocede, el lector de
 * pantalla anuncia seis campos de texto vacíos sin nombre, y el iPhone no
 * ofrece el código del SMS porque el `autocomplete` quedó en la casilla que no
 * era—. Acá las casillas son la vista de un único valor: pegar reparte, borrar
 * retrocede, las flechas se mueven, y lo que se envía en el formulario es el
 * código entero.
 *
 * ```tsx
 * <Field name="codigo">
 *   <FieldLabel>Código de verificación</FieldLabel>
 *   <OTPField />
 *   <FieldError />
 * </Field>
 * ```
 *
 * Accesibilidad —el motivo por el que esto no se escribe a mano—:
 *
 * - El contenedor es un `role="group"` nombrado por el `FieldLabel`, y cada
 *   casilla hereda ese mismo nombre. Se anuncia "Código de verificación, grupo"
 *   y después cada casilla con el nombre del campo, no seis campos anónimos.
 * - Debajo viaja un input oculto con el valor completo: es el que lleva el
 *   `name`, el `required` y el `pattern`, así que la validación del navegador y
 *   el submit hablan del código entero y no de un dígito suelto.
 * - Solo la casilla activa queda en el orden de tabulación: se entra y se sale
 *   del campo con un Tab, no con seis.
 * - `autoComplete="one-time-code"` es el default y va en la primera casilla y en
 *   el input oculto: es lo que hace que iOS y Android ofrezcan el código del
 *   SMS. Si lo pisás, se pierde eso.
 * - El error se anuncia una sola vez: `FieldError` describe al grupo entero, no
 *   a cada casilla. `aria-invalid` sale cuando la invalidez la declara la app
 *   —`<Field invalid>` o un error del servidor—; la que calcula el navegador
 *   (código incompleto) pinta con `data-invalid` y se lee en el `FieldError`.
 *
 * `length` es la cantidad de casillas; `validationType` decide qué se puede
 * tipear —`numeric` por defecto, que además es lo que pone el teclado numérico
 * en el celular—.
 */
type OTPFieldProps = Omit<OTPFieldPrimitive.Root.Props, "children" | "className" | "length"> & {
  className?: string
  /** Clases de cada casilla, por si hace falta tocar el ancho o el tipo de letra. */
  inputClassName?: string
  /** Cuántas casillas. Seis es lo que manda casi todo el mundo por SMS. */
  length?: number
  /** Mismas alturas que `Input`, para que un OTP en medio de un formulario no desentone. */
  size?: "sm" | "md" | "lg"
}

function OTPField({ className, inputClassName, length = 6, size = "md", ...props }: OTPFieldProps) {
  return (
    <OTPFieldPrimitive.Root
      data-slot="otp-field"
      data-size={size}
      length={length}
      className={cn("flex w-fit items-center gap-2", className)}
      {...props}
    >
      {Array.from({ length }, (_, index) => (
        <OTPFieldPrimitive.Input
          data-slot="otp-field-input"
          data-size={size}
          key={index}
          className={cn(
            "shrink-0 rounded-md border border-gray-400 bg-background-100 text-center text-copy-14 text-gray-1000 tabular-nums outline-none transition-control",
            "data-[size=sm]:size-8 data-[size=md]:size-10 data-[size=lg]:size-12 data-[size=lg]:text-copy-16",
            "hover:border-gray-500 focus:focus-border",
            // La casilla llena se marca con el borde, no con el fondo: seis
            // rectángulos grises tapan dónde quedó el cursor.
            "data-filled:border-gray-600",
            "data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700",
            "aria-invalid:border-red-800 aria-invalid:focus:focus-border-error data-invalid:border-red-800 data-invalid:focus:focus-border-error",
            inputClassName
          )}
        />
      ))}
    </OTPFieldPrimitive.Root>
  )
}

export { OTPField, type OTPFieldProps }
