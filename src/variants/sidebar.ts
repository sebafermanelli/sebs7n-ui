import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

// Ítem de navegación del sidebar. Activo con data-active o aria-current="page".
//
// El activo es el de iCloud (2.0): el mismo gris translúcido del hover (`fill-1`) con el texto
// principal; el ícono conserva su color. No es acento: en iCloud el acento sólido es solo la fila
// elegida de una lista con foco. `group/selectable` queda como gancho de `selectionSecondaryClassName`.
// Colapsado (dentro de <Sidebar collapsed>): cuadrado de 28px, solo el ícono.
//
// 28 px es el alto de una fila del sidebar de macOS (Finder, Mail). Con el dedo sube a 44 de
// verdad, por lo mismo que los ítems de menú: están pegados y un `::after` taparía al vecino.
const sidebarItemVariantsBase = cva(
  "group/sidebar-item group/selectable relative flex h-7 pointer-coarse:h-11 w-full min-w-0 cursor-pointer items-center gap-2 rounded-item px-2 text-subheadline text-label-secondary outline-none select-none transition-control hover:bg-fill-1 hover:text-label active:bg-fill-2 focus-visible:focus-ring data-active:bg-fill-1 data-active:text-label aria-[current=page]:bg-fill-1 aria-[current=page]:text-label [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-collapsed/sidebar:w-7 pointer-coarse:group-data-collapsed/sidebar:w-11 group-data-collapsed/sidebar:justify-center group-data-collapsed/sidebar:px-0"
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const sidebarItemVariants = (props?: Parameters<typeof sidebarItemVariantsBase>[0]) => cn(sidebarItemVariantsBase(props))
