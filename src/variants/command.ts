// La búsqueda de iCloud (2.0, R2): el panel de `CommandDialog`, el campo, los filtros y las filas.
//
// Están acá y no adentro de `command.tsx` por la misma razón que los menús: una app que arma su
// propia lista de resultados —con otra primitiva, o sin Base UI— puede verse igual sin copiar clases.

/**
 * El panel de `CommandDialog`: la superficie de un popover de iCloud (catálogo §2.8) —radio 12,
 * opaco, `shadow-menu` con su filo— y los 5 px de padding de un menú (R3). Anclado arriba (`top-[18vh]`) y no centrado: el campo no salta cuando
 * la lista crece o se achica con cada tecla; centrado, el panel entero se movería con los
 * resultados. Hasta R1 era la paleta de Spotlight (radio de ventana, 640 px, campo como cabecera).
 */
export const commandDialogPopupClassName =
  "fixed top-[18vh] left-1/2 z-50 flex max-h-[min(480px,calc(100dvh-18vh-1rem))] w-[min(560px,calc(100%-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-menu bg-surface p-1.25 text-label shadow-menu outline-none " +
  "transition-[opacity,scale] duration-150 ease-out-expo motion-reduce:transition-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"

/**
 * El search field de iCloud (§2.13): 36 px, radio 10, relleno `fill-1`, la lupa a 10 px del borde.
 * Con el foco el relleno se va (`bg-transparent`) y queda el anillo interior (`focus-ring`), como
 * en Mail. Va en la caja y no en el `input` porque la lupa está adentro. Con el dedo, 44.
 */
export const commandInputClassName =
  "flex h-9 pointer-coarse:h-11 shrink-0 items-center gap-2 rounded-field bg-fill-1 px-2.5 transition-control focus-within:bg-transparent focus-within:focus-ring"

/**
 * Un filtro de la búsqueda: el token de iCloud (§2.13), gris (`fill-1`) y el prendido en el acento
 * sólido, que es como iCloud marca un botón abierto o un toggle activo (§1.8). Sobre el acento el
 * anillo de foco es el inverso.
 */
export const commandFilterClassName =
  "inline-flex h-6 shrink-0 cursor-pointer items-center rounded-[calc(var(--radius-control)-2px)] bg-fill-1 px-2 text-callout whitespace-nowrap text-label outline-none select-none transition-control hover:bg-fill-2 focus-visible:focus-ring " +
  "data-checked:bg-brand-700 data-checked:text-brand-contrast data-checked:hover:bg-brand-800 data-checked:focus-visible:focus-ring-inverse"

/**
 * Una fila de resultados: la del menú de iCloud (§2.8). 30 px de alto (más, con detalle), radio 8,
 * 14/400 y el resaltado en `fill-2`, el gris del menú: el texto no cambia de color. Con ícono el
 * padding izquierdo baja a 4, como en iCloud, para que la caja de 30 del ícono quede al borde. Con
 * el dedo sube a 44 de verdad, como los ítems de menú: las filas están pegadas.
 */
export const commandItemClassName =
  "group/command-item relative flex min-h-7.5 pointer-coarse:min-h-11 cursor-pointer items-center gap-1.5 rounded-menu-item px-2.5 py-1 text-callout text-label outline-none select-none transition-control has-[>[data-slot=command-item-icon]]:ps-1 " +
  "data-highlighted:bg-fill-2 active:bg-fill-3 data-disabled:cursor-not-allowed data-disabled:text-label-tertiary [&_svg]:pointer-events-none [&_svg]:shrink-0"

/**
 * El ícono de un resultado: una caja de 30 px con el glifo de 16 en el acento, como los íconos de
 * los menús de iCloud. Una imagen (un avatar, un logo) va a 20 px con el radio de un thumbnail.
 */
export const commandItemIconClassName =
  "flex size-7.5 shrink-0 items-center justify-center text-brand-900 [&_svg:not([class*='size-'])]:size-4 [&>img]:size-5 [&>img]:rounded-tag [&>img]:object-cover"
