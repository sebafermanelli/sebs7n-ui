import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// Chip de filtro: apagado = borde punteado, prendido = sólido + fondo. Nunca usa la marca.
const toggleVariantsBase = cva(
  "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-dashed border-gray-400 bg-background-100 px-3 text-copy-14 whitespace-nowrap text-gray-900 outline-none select-none transition-control hover:border-gray-500 hover:text-gray-1000 focus-visible:focus-ring data-pressed:border-solid data-pressed:border-gray-600 data-pressed:bg-gray-100 data-pressed:text-gray-1000 data-pressed:hover:bg-gray-200 data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const toggleVariants = (props?: Parameters<typeof toggleVariantsBase>[0]) => cn(toggleVariantsBase(props))
