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
] as const

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...TYPE_SCALE],
      shadow: ["tooltip", "menu", "modal", "card", "card-hover", "button"],
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
