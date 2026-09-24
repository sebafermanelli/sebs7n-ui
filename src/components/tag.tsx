import type * as React from "react"
import { XIcon } from "lucide-react"

import { nombreDeQuitar } from "../internal/remove-label.js"
import { cn } from "../lib/utils.js"
import { tagRemoveClassName, tagVariants, type TagColor, type TagSize } from "../variants/tag.js"

type TagProps = Omit<React.ComponentProps<"span">, "color"> & {
  color?: TagColor
  size?: TagSize
  /** Qué hacer al quitar. Sin esto el tag no se puede sacar, y entonces probablemente sea un `Badge`. */
  onRemove?: () => void
  /**
   * Nombre del botón de quitar. Un string es el prefijo del dato («Quitar» → «Quitar Chile»);
   * una función recibe el dato y devuelve la frase entera, para los idiomas donde el verbo no
   * va adelante: `(name) => name + " entfernen"`.
   */
  removeLabel?: string | ((name: string) => string)
  /** El texto del tag, para el nombre del botón, cuando `children` no es texto. */
  textValue?: string
}

/**
 * Un dato que puso el usuario y puede sacar: un filtro aplicado, una etiqueta,
 * un destinatario.
 *
 * **No es un `Badge`.** El Badge informa un estado que el sistema calculó
 * —«Pagada», «Vencida», «Admin»— y que el usuario no eligió ni puede sacar. El
 * Tag es el dato en sí, y por eso trae el botón de quitar. Si no se puede
 * sacar, es un Badge.
 *
 * Dentro de un `Combobox` múltiple ya está `ComboboxChip`, que es literalmente
 * este objeto —sale de `tagVariants` y `tagRemoveClassName`— conectado al estado
 * del combobox: ahí no va este.
 */
function Tag({
  className,
  color = "gray",
  size = "md",
  onRemove,
  removeLabel = "Quitar",
  textValue,
  children,
  ...props
}: TagProps) {
  const name = textValue ?? (typeof children === "string" || typeof children === "number" ? String(children) : undefined)
  return (
    <span
      data-slot="tag"
      data-color={color}
      className={cn(tagVariants({ color, size, removable: Boolean(onRemove) }), className)}
      {...props}
    >
      <span data-slot="tag-label" className="truncate">
        {children}
      </span>
      {onRemove && (
        <button
          data-slot="tag-remove"
          type="button"
          aria-label={nombreDeQuitar(removeLabel, name)}
          onClick={onRemove}
          className={tagRemoveClassName[size]}
        >
          <XIcon />
        </button>
      )}
    </span>
  )
}

export { Tag, type TagProps }
