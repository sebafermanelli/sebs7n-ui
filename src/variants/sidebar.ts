import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// Ítem de navegación del sidebar. Activo con data-active o aria-current="page".
//
// El activo es la selección de macOS (2.0), como en el sidebar de Finder o de Ajustes: acento
// sólido (`bg-selection`) con texto e ícono de contraste. Es el par del botón `accent`, que ya
// pasa 4,5:1. El contador (`SidebarItemBadge`) y el punto del colapsado cuelgan de
// `group/sidebar-item` para pasar también al color de contraste; `group/selectable` es el gancho
// compartido de `selectionSecondaryClassName`.
// Colapsado (dentro de <Sidebar collapsed>): cuadrado de 28px, solo el ícono.
//
// 28 px es el alto de una fila del sidebar de macOS (Finder, Mail). Con el dedo sube a 44 de
// verdad, por lo mismo que los ítems de menú: están pegados y un `::after` taparía al vecino.
const sidebarItemVariantsBase = cva(
  "group/sidebar-item group/selectable relative flex h-7 pointer-coarse:h-11 w-full min-w-0 cursor-pointer items-center gap-2 rounded-control px-2 text-body text-gray-900 outline-none select-none transition-control hover:bg-gray-alpha-100 hover:text-gray-1000 active:bg-gray-alpha-200 focus-visible:focus-ring data-active:bg-selection data-active:text-on-selection data-active:[&_svg]:text-on-selection aria-[current=page]:bg-selection aria-[current=page]:text-on-selection aria-[current=page]:[&_svg]:text-on-selection [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-collapsed/sidebar:w-7 pointer-coarse:group-data-collapsed/sidebar:w-11 group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0"
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const sidebarItemVariants = (props?: Parameters<typeof sidebarItemVariantsBase>[0]) => cn(sidebarItemVariantsBase(props))
