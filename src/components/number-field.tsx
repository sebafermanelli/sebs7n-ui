"use client"

import type * as React from "react"
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { MinusIcon, PlusIcon } from "lucide-react"

import { useLabels } from "../lib/labels.js"
import { cn, type WithClassName } from "../lib/utils.js"
import { inputShellButtonClassName, inputShellClassName, inputShellInputClassName } from "../variants/input.js"
import { useControlSize } from "../lib/control-size.js"

/**
 * Un número, con botones de −/+ y formato por locale.
 *
 * Un `<input type="number">` nativo miente: el valor sale como string, el
 * navegador acepta "1e5" y "--3", las flechas de arriba/abajo aparecen y
 * desaparecen según el navegador, y no hay forma de que muestre "$ 12.500" sin
 * romper lo que se envía. Acá el valor es `number | null` de verdad, el formato
 * lo arma `Intl.NumberFormat` y lo que viaja en el submit es el número crudo.
 *
 * ```tsx
 * <Field name="seats">
 *   <FieldLabel>Usuarios</FieldLabel>
 *   <NumberField defaultValue={1} min={1} max={9} />
 * </Field>
 *
 * <NumberField currency="USD" locale="es-AR" defaultValue={1240.5} />  // «US$ 1.240,50»; viaja 1240.5
 * ```
 *
 * Adentro de un `Field` se engancha solo —etiqueta, descripción, error y
 * `aria-invalid`— igual que `Input`: no hace falta ni `htmlFor` ni `id`.
 *
 * Teclado: ↑/↓ mueven un `step`, con Shift un `largeStep`, con Alt un
 * `smallStep`, e Inicio/Fin van al `min` y al `max` cuando están definidos.
 */
type NumberFieldProps = WithClassName<NumberFieldPrimitive.Root.Props> & {
  /** Clases de la superficie con borde (el grupo). Acá va el ancho: `className="w-32"`. */
  className?: string
  /** Clases del `<input>`, por si hay que cambiarle la alineación del número. */
  inputClassName?: string
  /** Alto del control: `sm` 28, `md` 36, `lg` 40. Los mismos que `Input`. */
  size?: "sm" | "md" | "lg"
  /** El grupo ocupa todo el ancho de su caja (el `Input` lo hace por defecto; este abraza al número). Equivale a `className="w-full"`. */
  fullWidth?: boolean
  placeholder?: string
  /**
   * Un monto: el código ISO 4217 de la moneda («USD», «ars») arma el `format` de moneda de `Intl`, y el
   * `step` pasa a `"any"` (salvo que se pase uno) para que el submit no rechace los centavos. `format`
   * se mezcla encima («sin decimales», `currencyDisplay`). Un código mal formado (vacío, «dólar») no
   * tira como en `Intl`: cae a número con 2 decimales. Lo que viaja sigue siendo el número crudo.
   */
  currency?: string
  /** Enfoca el input visible al montar (en el Root, que es un `div`, no hacía nada). */
  autoFocus?: boolean
  /** Ref del input visible (el que se enfoca y se selecciona); en Base UI apuntaba al oculto del submit. */
  inputRef?: React.Ref<HTMLInputElement>
  /**
   * Textos de la interfaz, para traducir o ajustar el tono. `roleDescription` es
   * cómo se presenta el control al lector de pantalla, antes de cantar el valor.
   */
  labels?: { increment?: string; decrement?: string; roleDescription?: string }
}

function NumberField({
  "aria-label": ariaLabel,
  className,
  inputClassName,
  labels,
  placeholder,
  size: sizeProp,
  fullWidth = false,
  currency,
  autoFocus,
  inputRef,
  format,
  locale,
  step,
  ...props
}: NumberFieldProps) {
  const size = useControlSize(sizeProp, "md")
  // El provider gana sobre el español; la prop `labels` gana sobre el provider, porque es la
  // excepción de una pantalla y no una traducción.
  const l = useLabels().numberField
  if (currency != null) {
    // `Intl` tira RangeError con un código que no son tres letras; cualquier código bien formado lo
    // acepta. Un código que viene de la base o de una IA puede ser cualquier cosa: mejor un número
    // con centavos que la pantalla rota.
    const code = currency.trim()
    format = { ...(/^[a-z]{3}$/i.test(code) ? { style: "currency", currency: code } : { minimumFractionDigits: 2, maximumFractionDigits: 2 }), ...format }
    step ??= "any"
  }
  return (
    // El Root no dibuja nada: es el que guarda el valor numérico y el input oculto
    // que se lleva el submit. Lo que se ve —borde, foco, estados— vive en el Group.
    <NumberFieldPrimitive.Root data-slot="number-field" data-size={size} format={format} locale={locale ?? l.locale} step={step} {...props}>
      <NumberFieldPrimitive.Group
        data-slot="number-field-group"
        data-size={size}
        // px-1 en vez del px-3 del Input: el aire de los costados lo ponen los botones.
        // `w-fit` y no el `w-full` del Input: el grupo abraza al número y a los botones. A todo
        // el ancho, un «1» quedaba con − y + en las puntas y un hueco en el medio.
        className={cn(inputShellClassName, "max-w-full px-1", fullWidth ? "w-full" : "w-fit", className)}
      >
        {/* Base UI nombra los steppers "Increase"/"Decrease" en inglés. */}
        <NumberFieldPrimitive.Decrement
          aria-label={labels?.decrement ?? l.decrement}
          className={inputShellButtonClassName}
          data-slot="number-field-decrement"
        >
          <MinusIcon />
        </NumberFieldPrimitive.Decrement>

        <NumberFieldPrimitive.Input
          // Sin `Field` alrededor, el nombre del control tiene que caer en el
          // <input>: el Root es un div y un `aria-label` ahí no se lee.
          aria-label={ariaLabel}
          aria-roledescription={labels?.roleDescription ?? l.roleDescription}
          // Centrado y con cifras de ancho fijo: al pulsar −/+ repetido el número
          // crece y se achica sin que el resto de la fila se mueva.
          //
          // El ancho es el del número (`field-sizing: content`), con un mínimo de 3 cifras, y crece
          // si el valor es largo. `flex-initial` y no `flex-1`: no se estira, pero se achica si el
          // llamador le pone un ancho al grupo. Donde no hay `field-sizing` (Firefox) queda en 5
          // cifras fijas: el `w-auto` que lo libera va detrás de `@supports`, porque un `width`
          // explícito le gana al tamaño por contenido.
          className={cn(
            inputShellInputClassName,
            "flex-initial w-[calc(5ch+1rem)] min-w-[calc(3ch+1rem)] field-sizing-content supports-[field-sizing:content]:w-auto px-2 text-center tabular-nums",
            inputClassName
          )}
          data-slot="number-field-input"
          placeholder={placeholder}
          autoFocus={autoFocus}
          ref={inputRef}
        />

        <NumberFieldPrimitive.Increment
          aria-label={labels?.increment ?? l.increment}
          className={inputShellButtonClassName}
          data-slot="number-field-increment"
        >
          <PlusIcon />
        </NumberFieldPrimitive.Increment>
      </NumberFieldPrimitive.Group>
    </NumberFieldPrimitive.Root>
  )
}

// Sin `ScrubArea`, a propósito. Arrastrar sobre la etiqueta para cambiar el número
// es lindo en un editor de diseño, donde el valor es tentativo y se ve el efecto en
// vivo; en un formulario es un cambio silencioso de un dato que después se firma —
// y encima no tiene equivalente de teclado, no se anuncia, no tiene afordancia
// visible, y su cursor usa Pointer Lock, que Base UI apaga en Safari. Quien lo
// necesite lo compone con `@base-ui/react/number-field` directo.

export { NumberField, type NumberFieldProps }
