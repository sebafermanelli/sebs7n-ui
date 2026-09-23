"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"

import { cn } from "../lib/utils.js"
import {
  buttonVariants,
  type ButtonIconSize,
  type ButtonSize,
  type ButtonVariantProps,
} from "../variants/button.js"
import { Spinner } from "./spinner.js"

type ButtonBaseProps = Omit<ButtonPrimitive.Props, "className"> &
  Omit<ButtonVariantProps, "size"> & {
    className?: string
    loading?: boolean
  }

/** Las dos formas válidas de nombrar un control que no tiene texto adentro. */
type NombreAccesible = { "aria-label": string } | { "aria-labelledby": string }

/**
 * El botón del sistema.
 *
 * Con un `size` de ícono escrito literal (`size="icon-sm"`, `"icon-md"`,
 * `"icon-lg"`) el tipo **exige** `aria-label` o `aria-labelledby`. No es una
 * preferencia de estilo: un botón que solo tiene un `<svg>` adentro no tiene
 * nombre accesible, y un lector de pantalla lo anuncia como «botón» a secas —
 * hay que apretarlo para averiguar qué hace—. `accesibilidad.md` lo pedía desde
 * 0.1 en la lista de "lo que le queda a la app" y no lo verificaba nadie: ni un
 * tipo, ni un test, ni un warning.
 *
 * Un `Tooltip` **no** reemplaza al nombre: en un celular no existe.
 *
 * El tipo es genérico en el `size` justamente para que la exigencia no se le
 * caiga encima a quien envuelve el botón. Cuando el `size` llega como variable
 * —`<Button size={size} {...props} />` adentro de un `IconButton` propio—, `S`
 * se infiere como la unión entera de tamaños, el condicional distribuye y el
 * resultado incluye la rama sin exigencia: el wrapper compila. Ahí el nombre lo
 * garantiza el wrapper, que es donde se sabe. Con una unión no genérica esto no
 * pasaba: el tipo rompía los wrappers correctos, y un tipo que castiga al que
 * ya hizo las cosas bien se termina apagando con un `any`.
 *
 * Dos casos donde el tipo pide el nombre aunque ya esté puesto, y qué hacer:
 *
 * - **El nombre está en los hijos** (un texto `sr-only`, o el número de un día
 *   en un calendario). Ningún tipo puede mirar adentro de `children`. Escribilo
 *   en `aria-label`: gana sobre el contenido y casi siempre es mejor —«12 de
 *   marzo de 2026» en vez de «12»—.
 * - **El nombre lo pone el envoltorio**, como en
 *   `<DropdownMenuTrigger aria-label="Menú" render={<Button size="icon-sm" />} />`.
 *   Va adentro del elemento de `render`, que es el `<Button>` real: el
 *   `aria-label` del elemento de `render` es el que termina en el DOM.
 */
type ButtonProps<S extends ButtonSize = ButtonSize> = ButtonBaseProps & {
  size?: S | null
} & (S extends ButtonIconSize ? NombreAccesible : unknown)

function Button<S extends ButtonSize = ButtonSize>({
  className,
  variant,
  size,
  shape,
  loading = false,
  onClick,
  children,
  ...props
}: ButtonProps<S>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      className={cn(buttonVariants({ variant, size, shape }), loading && "cursor-progress", className)}
      {...props}
    >
      {/* El mismo Spinner del sistema, sin nombre accesible: quien anuncia la espera es el
          aria-busy del botón, no el ícono. 20px solo en los tamaños grandes, como antes. */}
      {loading && (
        <Spinner
          data-slot="button-spinner"
          size={size === "lg" || size === "icon-lg" ? "md" : "sm"}
          className="absolute inset-0 m-auto"
        />
      )}
      <span className={cn("inline-flex items-center justify-center gap-2", loading && "opacity-0")}>{children}</span>
    </ButtonPrimitive>
  )
}

export { Button, type ButtonBaseProps, type ButtonProps }
