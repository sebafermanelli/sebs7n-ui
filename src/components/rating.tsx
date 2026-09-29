"use client"

import * as React from "react"
import { StarIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { useFieldControl } from "../internal/field-control.js"
import { useFormReset } from "../internal/form-reset.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

type RatingLabels = NonNullable<Labels["rating"]>

/** Los textos por defecto (no están en `defaultLabels`: el componente es solo por subpath). */
const ratingLabels: RatingLabels = { star: "estrella", stars: "estrellas", of: "de", locale: "es-AR" }

type RatingProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "children"> & {
  /** El valor, controlado: de 1 a `max`, o `null` sin elegir. De solo lectura admite fracciones (4,5). */
  value?: number | null
  /** El valor al montar, sin controlar. */
  defaultValue?: number | null
  /** Avisa el valor elegido. */
  onValueChange?: (value: number) => void
  /** Cuántas estrellas. Por defecto, 5. */
  max?: number
  /** Solo muestra el valor (el de una reseña): una imagen con el valor en palabras, sin foco. */
  readOnly?: boolean
  disabled?: boolean
  /** Sin valor no se puede enviar: dentro de un `Form`, el campo queda inválido y `Form` lo enfoca. */
  required?: boolean
  /** El nombre con el que viaja en un formulario («4»; vacío sin valor). */
  name?: string
  /** Estrellas de 16, 20 (default) o 24. El área de toque es de 24 como mínimo. */
  size?: "sm" | "md" | "lg"
  /** Textos: `star`, `stars`, `of` y `locale` (el de los decimales). Por defecto, `ratingLabels`. */
  labels?: Partial<RatingLabels>
}

const STAR_SIZE = { sm: "size-4", md: "size-5", lg: "size-6" }

/** Una estrella: la vacía abajo y la llena encima, recortada a `--sf-rating-fill` (para 4,5). */
function Star({ fill, size }: { fill: number; size: "sm" | "md" | "lg" }) {
  return (
    <span
      data-slot="rating-star"
      aria-hidden="true"
      className={cn("relative inline-flex shrink-0", STAR_SIZE[size])}
      style={{ "--sf-rating-fill": `${fill * 100}%` } as React.CSSProperties}
    >
      <StarIcon className="size-full text-label-tertiary" strokeWidth={1.5} />
      {fill > 0 && (
        <StarIcon
          className="absolute inset-0 size-full fill-current text-amber-900 [clip-path:inset(0_calc(100%-var(--sf-rating-fill))_0_0)]"
          strokeWidth={1.5}
        />
      )}
    </span>
  )
}

/**
 * Una calificación con estrellas. De solo lectura (`readOnly`) muestra un valor, con fracciones, como
 * una imagen con nombre («4,5 de 5 estrellas»). Como campo es un `radiogroup` (el patrón de ARIA): una
 * estrella radio por valor, Tab entra en la elegida, las flechas, Inicio y Fin eligen, y con `name`
 * viaja en el `<form>`. Solo valores enteros: media estrella como entrada es más precisión de la que
 * alguien sabe dar.
 *
 * Dentro de un `Field` se registra como su control: `FieldLabel` nombra el grupo, `Form` manda el
 * número y, si queda inválido, enfoca la estrella.
 */
function Rating({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  max = 5,
  readOnly = false,
  disabled: disabledProp,
  required = false,
  name,
  size = "md",
  labels: labelsProp,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  ...props
}: RatingProps) {
  const labels = { ...ratingLabels, ...useLabels().rating, ...defined(labelsProp) }
  const [own, setOwn] = React.useState(defaultValue)
  const value = valueProp !== undefined ? valueProp : own
  const [hover, setHover] = React.useState<number | null>(null)
  const group = React.useRef<HTMLDivElement>(null)
  // `Form` enfoca el control de un campo inválido: el grupo no es enfocable, la estrella de Tab sí.
  const focusTarget = React.useMemo(
    () => ({
      get current() {
        return group.current?.querySelector<HTMLElement>("[role=radio][tabindex='0']") ?? null
      },
    }),
    []
  )
  const field = useFieldControl({ id, name, value, filled: value != null, disabled: disabledProp, controlRef: focusTarget, labelable: false })
  const disabled = field.disabled
  const resetRef = useFormReset(() => {
    if (valueProp === undefined) setOwn(defaultValue)
  })
  const count = (n: number) => `${n} ${n === 1 ? labels.star : labels.stars}`
  const indexes = Array.from({ length: max }, (_, index) => index + 1)

  if (readOnly) {
    const shown = value ?? 0
    const number = new Intl.NumberFormat(labels.locale, { maximumFractionDigits: 1 }).format(shown)
    return (
      <div
        data-slot="rating"
        role="img"
        aria-label={ariaLabel ?? `${number} ${labels.of} ${max} ${labels.stars}`}
        className={cn("inline-flex items-center gap-0.5", className)}
        {...props}
      >
        {indexes.map((index) => (
          <Star fill={Math.min(1, Math.max(0, shown - index + 1))} key={index} size={size} />
        ))}
      </div>
    )
  }

  const choose = (next: number) => {
    if (disabled) return
    if (valueProp === undefined) setOwn(next)
    if (next !== value) onValueChange?.(next)
    // La elegida es la que queda en el orden de Tab: el foco la sigue.
    group.current?.querySelectorAll<HTMLElement>("[role=radio]")[next - 1]?.focus()
  }
  const focusable = value ?? 1
  const shown = hover ?? value ?? 0

  return (
    <div
      ref={resetRef}
      data-slot="rating"
      className={cn("inline-flex flex-col", className)}
      {...props}
    >
      <div
        ref={group}
        role="radiogroup"
        data-size={size}
        id={field.id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby ?? (ariaLabel ? undefined : field.labelId)}
        aria-describedby={cn(ariaDescribedby, field.messageIds.join(" ")) || undefined}
        aria-required={required || undefined}
        aria-invalid={field.invalid || undefined}
        aria-disabled={disabled || undefined}
        className="inline-flex items-center"
        onPointerLeave={() => setHover(null)}
        onFocus={field.onFocus}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) field.onBlur()
        }}
        onKeyDown={(event) => {
          const current = value ?? 0
          const next =
            event.key === "ArrowRight" || event.key === "ArrowUp"
              ? Math.min(max, current + 1)
              : event.key === "ArrowLeft" || event.key === "ArrowDown"
                ? Math.max(1, current - 1)
                : event.key === "Home"
                  ? 1
                  : event.key === "End"
                    ? max
                    : null
          if (next === null) return
          event.preventDefault()
          choose(next)
        }}
      >
        {indexes.map((index) => (
          <button
            key={index}
            type="button"
            role="radio"
            aria-checked={value === index}
            aria-label={count(index)}
            data-slot="rating-item"
            disabled={disabled}
            tabIndex={index === focusable ? 0 : -1}
            onClick={() => choose(index)}
            onPointerEnter={() => !disabled && setHover(index)}
            // 24 de área (WCAG 2.5.8) aunque la estrella sea de 16; el foco rodea la estrella.
            className="inline-flex min-h-6 min-w-6 cursor-pointer items-center justify-center rounded-control outline-none focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Star fill={index <= shown ? 1 : 0} size={size} />
          </button>
        ))}
      </div>
      {field.name && <input name={field.name} type="hidden" value={value ?? ""} />}
      {required && (
        // La validación nativa de `required`: fuera de la vista y del Tab, devuelve el foco a la estrella.
        <input
          ref={field.inputRef}
          aria-hidden="true"
          className="sr-only"
          disabled={disabled}
          onChange={() => {}}
          onFocus={() => focusTarget.current?.focus()}
          required
          tabIndex={-1}
          value={value ?? ""}
        />
      )}
    </div>
  )
}

export { Rating, ratingLabels, type RatingLabels, type RatingProps }
