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
 * 24 px desde 2.0, el alto de un botón `sm`: un chip es un control secundario y en macOS los
 * filtros de ese tamaño (las etiquetas del Finder) son así de bajos. Con el dedo, `touch-target`.
 */
const toggleVariantsBase = cva(
  "touch-target inline-flex h-6 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-gray-700 glass-control px-2.5 text-callout whitespace-nowrap text-gray-900 shadow-card outline-none select-none transition-surface hover:border-gray-800 active:translate-y-px hover:text-gray-1000 focus-visible:focus-ring data-pressed:border-gray-900 data-pressed:bg-gray-alpha-200 data-pressed:text-gray-1000 data-pressed:hover:bg-gray-alpha-300 data-disabled:cursor-not-allowed data-disabled:border-gray-alpha-400 data-disabled:bg-gray-alpha-100 data-disabled:text-gray-700 data-disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const toggleVariants = (props?: Parameters<typeof toggleVariantsBase>[0]) => cn(toggleVariantsBase(props))
