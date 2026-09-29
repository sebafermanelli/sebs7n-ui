import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// Ítem de navegación del sidebar (la lista de fuentes de iCloud, catálogo §2.3). Activo con
// data-active o aria-current="page".
//
// 32 px, radio 10, 15/400 en el texto principal —en iCloud el label no se apaga: el secundario queda
// para el contador—. El ícono va en el acento (`brand-900`, que llega a 3:1 sobre el sidebar y sobre
// `fill-1`) con glifo de 18: iCloud lo centra en una caja de 28 que arranca en el padding, así que el
// texto empieza a 42 px del borde del ítem (14 + 18 + 10).
//
// El activo es el mismo gris translúcido del hover (`fill-1`) y el texto no cambia. No es acento: en
// iCloud el acento sólido es solo la fila elegida de una lista con foco. `group/selectable` queda como
// gancho de `selectionSecondaryClassName`. Colapsado (dentro de <Sidebar collapsed>): cuadrado de 32,
// solo el ícono.
//
// Con el dedo sube a 44 de verdad, por lo mismo que los ítems de menú: están pegados y un `::after`
// taparía al vecino.
const sidebarItemVariantsBase = cva(
  "group/sidebar-item group/selectable relative flex h-8 pointer-coarse:h-11 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-item ps-3.5 pe-2.5 text-start text-subheadline text-label outline-none select-none transition-control hover:bg-fill-1 active:bg-fill-2 focus-visible:focus-ring data-active:bg-fill-1 data-active:text-label aria-[current=page]:bg-fill-1 aria-[current=page]:text-label [&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg]:text-brand-900 [&>svg:not([class*='size-'])]:size-[18px] group-data-collapsed/sidebar:w-8 pointer-coarse:group-data-collapsed/sidebar:w-11 group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0"
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const sidebarItemVariants = (props?: Parameters<typeof sidebarItemVariantsBase>[0]) => cn(sidebarItemVariantsBase(props))
