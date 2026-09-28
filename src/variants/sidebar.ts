import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// Ítem de navegación del sidebar. Activo con data-active o aria-current="page".
//
// El activo lleva el brand en el fondo (`bg-highlight`) y en el ícono, no en el texto: `brand-900`
// sobre el tinte da 4,35:1 con el blue del paquete, abajo del 4,5 de WCAG 1.4.3. El ícono es un
// gráfico y le alcanza el 3:1 de 1.4.11, así que el color va ahí y el texto queda en `gray-1000`.
// Colapsado (dentro de <Sidebar collapsed>): cuadrado de 28px, solo el ícono.
//
// 28 px es el alto de una fila del sidebar de macOS (Finder, Mail). Con el dedo sube a 44 de
// verdad, por lo mismo que los ítems de menú: están pegados y un `::after` taparía al vecino.
const sidebarItemVariantsBase = cva(
  "relative flex h-7 pointer-coarse:h-11 w-full min-w-0 cursor-pointer items-center gap-2 rounded-control px-2 text-body text-gray-900 outline-none select-none transition-control hover:bg-gray-alpha-100 hover:text-gray-1000 active:bg-gray-alpha-200 focus-visible:focus-ring data-active:bg-highlight data-active:text-gray-1000 data-active:[&_svg]:text-brand-900 aria-[current=page]:bg-highlight aria-[current=page]:text-gray-1000 aria-[current=page]:[&_svg]:text-brand-900 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-collapsed/sidebar:w-7 pointer-coarse:group-data-collapsed/sidebar:w-11 group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0"
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const sidebarItemVariants = (props?: Parameters<typeof sidebarItemVariantsBase>[0]) => cn(sidebarItemVariantsBase(props))
