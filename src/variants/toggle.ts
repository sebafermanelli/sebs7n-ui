import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

/**
 * Chip de filtro (R4): el token de iCloud —los filtros de su búsqueda, el botón de formato de Notes
 * prendido—, el mismo objeto que `commandFilterClassName`. Gris (`fill-1`) sin borde en reposo,
 * `fill-2` con el puntero, y prendido el **acento sólido** con su color de contraste: el estado se
 * lee por el relleno, no por un borde. Hasta la fase 3 era un borde lleno gris que se oscurecía;
 * iCloud no tiene controles con borde.
 *
 * 36 px por defecto (2.5), el alto de un botón `md`: en una barra de filtros va al lado de la búsqueda y
 * de los Select. Adentro de una `Toolbar` se queda en 28, el escalón de la barra, como el `ToggleGroup`.
 * `size="sm"` o `"lg"` lo llevan a 28 o 40. Con el dedo, `touch-target`.
 * Deshabilitado a .4, como los botones.
 */
const toggleVariantsBase = cva(
  "touch-target inline-flex w-fit shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-control bg-fill-1 text-callout whitespace-nowrap text-label outline-none select-none transition-surface hover:bg-fill-2 focus-visible:focus-ring data-pressed:bg-brand-700 data-pressed:text-brand-contrast data-pressed:hover:bg-brand-800 data-pressed:focus-visible:focus-ring-inverse data-disabled:cursor-not-allowed data-disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  { variants: { size: { sm: "h-7 px-2.5", md: "h-9 px-3 in-data-[slot=toolbar]:h-7 in-data-[slot=toolbar]:px-2.5", lg: "h-10 px-3.5" } }, defaultVariants: { size: "md" } }
)

// Pasa por cn() (tailwind-merge): usada sobre <a>/<Link>, la clase de la variante tiene que ganarle a la base.
export const toggleVariants = (props?: Parameters<typeof toggleVariantsBase>[0]) => cn(toggleVariantsBase(props))
