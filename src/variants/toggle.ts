import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

/**
 * Chip de filtro: borde lleno en los dos estados; prendido suma fondo, un borde más oscuro y el
 * texto pleno, así que se distingue sin depender del color. Nunca usa la marca. El punteado de
 * 1.x se leía como un hueco donde soltar algo, no como un control.
 *
 * El borde apagado es el contorno del control —sin él no se ve que hay algo clickeable—, así que le
 * toca el 3:1 de WCAG 1.4.11. `gray-400` daba 1,20:1 en claro y 1,46:1 en oscuro: el chip apagado
 * era un texto suelto. `gray-700` (#8f8f8f en los dos temas) da 3,23:1 y 6,12:1.
 *
 * La escalera va apagado `gray-700` → hover `gray-800` → prendido `gray-900`: el prendido es el que
 * más contrasta en los dos temas, que es lo que el estado tiene que comunicar. Antes el prendido
 * (`gray-600`, 2,38:1 en claro) contrastaba MENOS que el apagado nuevo, y eso se lee al revés.
 *
 * 28 px, el alto de un botón `sm`: un chip es un control secundario. Con el dedo, `touch-target`.
 */
const toggleVariantsBase = cva(
  "touch-target inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-label-tertiary bg-transparent px-2.5 text-callout whitespace-nowrap text-label-secondary outline-none select-none transition-surface hover:border-label-secondary hover:text-label focus-visible:focus-ring data-pressed:border-label data-pressed:bg-fill-2 data-pressed:text-label data-pressed:hover:bg-fill-3 data-disabled:cursor-not-allowed data-disabled:border-separator data-disabled:bg-fill-1 data-disabled:text-label-tertiary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const toggleVariants = (props?: Parameters<typeof toggleVariantsBase>[0]) => cn(toggleVariantsBase(props))
