import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

export const TYPE_SCALE = [
  "heading-72", "heading-64", "heading-56", "heading-48", "heading-40",
  "heading-32", "heading-24", "heading-20", "heading-16", "heading-14",
  "button-16", "button-14", "button-12",
  "label-20", "label-18", "label-16", "label-14", "label-13", "label-12",
  "label-14-mono", "label-13-mono", "label-12-mono",
  "copy-24", "copy-20", "copy-18", "copy-16", "copy-14", "copy-13",
  "copy-14-mono", "copy-13-mono",
  // Roles tipográficos de iCloud (2.0): ver theme.css.
  "large-title", "title-1", "title-2", "title-3", "headline", "body", "body-large", "callout",
  "subheadline", "footnote", "caption", "mono-body", "mono-callout",
] as const

const twMerge = extendTailwindMerge<"touch-target" | "focus-ring">({
  extend: {
    theme: {
      text: [...TYPE_SCALE],
      shadow: ["tooltip", "menu", "modal", "widget", "segment", "badge", "thumbnail", "card", "card-hover", "ai"],
      radius: ["control", "surface", "panel", "field", "item", "menu", "menu-item", "tag", "tooltip", "meter", "menu-header", "thumb"],
    },
    classGroups: {
      // `material-translucent` y `bg-ambient` pintan el fondo. Sin esto, un `bg-*` que pase el llamador
      // convive con ellos y gana el que Tailwind haya emitido último, que no se elige.
      // Las dos formas del área táctil pelean por el mismo `::after`: la que se pase después gana.
      "touch-target": ["touch-target", "touch-target-y"],
      // Los anillos pintan el mismo `box-shadow`: el de la variante (sobre la marca, o el del campo)
      // reemplaza al de la base.
      "focus-ring": ["focus-ring", "focus-ring-inverse", "focus-border", "focus-border-error"],
      "bg-color": ["material-translucent", "bg-ambient"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Las props de un primitivo con el `className` estrechado a `string`.
 *
 * Base UI tipa `className` como `string | ((state) => string)`: la función existe para
 * calcular clases a partir del estado del componente. Acá eso no hace falta —el estado ya
 * viaja en los `data-*` y las clases condicionales se escriben con `data-open:`,
 * `data-highlighted:` y compañía— y además rompe el contrato de `cn()`, que espera strings.
 * Por eso los 58 componentes reescriben `Omit<X, "className"> & { className?: string }`,
 * que estaba copiado 110 veces: un ajuste al contrato había que hacerlo 110 veces.
 */
export type WithClassName<P> = Omit<P, "className"> & { className?: string }
