import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

/**
 * Chip de filtro: apagado = borde punteado, prendido = sólido + fondo. Nunca usa la marca.
 *
 * El borde apagado es el contorno del control —sin él no se ve que hay algo clickeable—, así que le
 * toca el 3:1 de WCAG 1.4.11. `gray-400` daba 1,20:1 en claro y 1,46:1 en oscuro: el chip apagado
 * era un texto suelto. `gray-700` (#8f8f8f en los dos temas) da 3,23:1 y 6,12:1.
 *
 * La escalera va apagado `gray-700` → hover `gray-800` → prendido `gray-900`: el prendido es el que
 * más contrasta en los dos temas, que es lo que el estado tiene que comunicar. Antes el prendido
 * (`gray-600`, 2,38:1 en claro) contrastaba MENOS que el apagado nuevo, y eso se lee al revés.
 */
const toggleVariantsBase = cva(
  "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-dashed border-gray-700 bg-background-100 px-3 text-copy-14 whitespace-nowrap text-gray-900 outline-none select-none transition-control hover:border-gray-800 hover:text-gray-1000 focus-visible:focus-ring data-pressed:border-solid data-pressed:border-gray-900 data-pressed:bg-gray-100 data-pressed:text-gray-1000 data-pressed:hover:bg-gray-200 data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const toggleVariants = (props?: Parameters<typeof toggleVariantsBase>[0]) => cn(toggleVariantsBase(props))
