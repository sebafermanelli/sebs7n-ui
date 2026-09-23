import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// Ítem de navegación del sidebar. Activo con data-active o aria-current="page" (nunca color de marca).
// Colapsado (dentro de <Sidebar collapsed>): cuadrado de 32px, solo el ícono.
const sidebarItemVariantsBase = cva(
  "relative flex h-8 w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 text-copy-14 text-gray-900 outline-none select-none transition-control hover:bg-gray-alpha-100 hover:text-gray-1000 active:bg-gray-alpha-200 focus-visible:focus-ring data-active:bg-gray-alpha-200 data-active:text-gray-1000 aria-[current=page]:bg-gray-alpha-200 aria-[current=page]:text-gray-1000 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-collapsed/sidebar:w-8 group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0"
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const sidebarItemVariants = (props?: Parameters<typeof sidebarItemVariantsBase>[0]) => cn(sidebarItemVariantsBase(props))
