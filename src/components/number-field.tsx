"use client"

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { MinusIcon, PlusIcon } from "lucide-react"

import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { inputShellButtonClassName, inputShellClassName, inputShellInputClassName } from "../variants/input.js"

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
 * <Field name="pasajeros">
 *   <FieldLabel>Pasajeros</FieldLabel>
 *   <NumberField defaultValue={1} min={1} max={9} />
 * </Field>
 * ```
 *
 * Adentro de un `Field` se engancha solo —etiqueta, descripción, error y
 * `aria-invalid`— igual que `Input`: no hace falta ni `htmlFor` ni `id`.
 *
 * Teclado: ↑/↓ mueven un `step`, con Shift un `largeStep`, con Alt un
 * `smallStep`, e Inicio/Fin van al `min` y al `max` cuando están definidos.
 */
type NumberFieldProps = Omit<NumberFieldPrimitive.Root.Props, "className"> & {
  /** Clases de la superficie con borde (el grupo). Acá va el ancho: `className="w-32"`. */
  className?: string
  /** Clases del `<input>`, por si hay que cambiarle la alineación del número. */
  inputClassName?: string
  /** Alto del control: `sm` 32px, `md` 40px, `lg` 48px. Los mismos que `Input`. */
  size?: "sm" | "md" | "lg"
  placeholder?: string
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
  size = "md",
  ...props
}: NumberFieldProps) {
  // El provider gana sobre el español; la prop `labels` gana sobre el provider, porque es la
  // excepción de una pantalla y no una traducción.
  const l = useLabels().numberField
  return (
    // El Root no dibuja nada: es el que guarda el valor numérico y el input oculto
    // que se lleva el submit. Lo que se ve —borde, foco, estados— vive en el Group.
    <NumberFieldPrimitive.Root data-slot="number-field" data-size={size} {...props}>
      <NumberFieldPrimitive.Group
        data-slot="number-field-group"
        data-size={size}
        // px-1 en vez del px-3 del Input: el aire de los costados lo ponen los botones.
        className={cn(inputShellClassName, "px-1", className)}
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
          className={cn(inputShellInputClassName, "px-2 text-center tabular-nums", inputClassName)}
          data-slot="number-field-input"
          placeholder={placeholder}
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
