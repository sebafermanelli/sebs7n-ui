// El control segmentado: una pista con `fill-2` y radio 8 y una pastilla de radio 6 que se desliza
// hasta la opción elegida. Es el segmentado de Calendar en iCloud (§2.10): pista de 28 con 2 de
// padding, segmentos de 24 pegados (sin espacio entre ellos: los separa una línea de 1 × 16).
//
// Lo usan `Tabs` y `ThemeSwitcher`, que son el mismo objeto con distinto contenido: uno lleva
// texto y el otro íconos. Están acá para que no puedan quedar distintos: la curva del
// deslizamiento, el fondo de la pista y la sombra de la pastilla se tocan en un solo lugar.

/**
 * La pista. `isolate` es lo que deja a la pastilla, que va en `-z-10`, detrás del contenido de
 * las opciones pero adelante del fondo de la pista.
 */
export const segmentedTrackClassName =
  "relative isolate flex w-fit max-w-full items-center rounded-control bg-fill-2 p-0.5"

/**
 * La pastilla, el segmento activo del segmentado de Calendar en iCloud: blanca en claro y
 * `#636366` en oscuro (`bg-segment`), siempre más clara que la pista (`fill-2`).
 *
 * No trae posición ni tamaño: los pone cada uno, porque no salen del mismo lado. En `Tabs` los
 * mide Base UI —las pestañas tienen el ancho de su texto— y llegan por `left` y `width`; en
 * `ThemeSwitcher` las opciones miden todas lo mismo y alcanza con `translate`. Por eso la
 * transición cubre las tres propiedades.
 *
 * El rebote es corto (1,25 en el segundo punto de control): la pastilla llega, se pasa un
 * pixel y vuelve. Con `prefers-reduced-motion` salta, sin recorrido.
 */
export const segmentedThumbClassName =
  "pointer-events-none absolute -z-10 rounded-[calc(var(--radius-control)-2px)] bg-segment shadow-segment " +
  "transition-[left,width,translate] duration-300 ease-[cubic-bezier(0.3,1.25,0.4,1)] motion-reduce:transition-none"

/**
 * Un ítem de `ToggleGroup`: el segmento de iCloud cuando cada opción se prende sola (los B/I/U del
 * formato de Notes). No hay pastilla que se deslice —puede haber varios prendidos—: el ítem
 * prendido se marca él mismo con el acento sólido, como un toggle de ícono de iCloud (el de Calendar,
 * fondo del acento con el glifo blanco). La pastilla blanca de antes se distinguía de la pista gris
 * a 1,16:1 (revisión de R4); el acento llega a 3:1 en las cinco marcas. En oscuro va el paso 900 de
 * la marca (L fija) con el texto oscuro de la página: el 700 quedaba en 2,3:1 contra la pista.
 *
 * 24 de alto (28 con la pista), 14 en `label` y semibold prendido; con el dedo 40. Lleva el
 * separador de 1 × 16 del segmentado, escondido en el prendido y en el que le sigue. El anillo de
 * foco sobre el acento va en el color del texto (`[--sf-focus-inverse:currentColor]`).
 */
export const segmentedItemClassName =
  "relative inline-flex h-6 min-w-8 pointer-coarse:h-10 pointer-coarse:min-w-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[calc(var(--radius-control)-2px)] px-3 text-callout whitespace-nowrap text-label outline-none select-none transition-surface " +
  "focus-visible:focus-ring data-pressed:bg-brand-700 data-pressed:text-brand-contrast dark:data-pressed:bg-brand-900 dark:data-pressed:text-background data-pressed:font-semibold data-pressed:focus-visible:focus-ring-inverse [--sf-focus-inverse:currentColor] data-disabled:cursor-not-allowed data-disabled:opacity-40 " +
  "after:absolute after:left-0 after:top-1 after:h-4 after:w-px after:bg-fill-3 pointer-coarse:after:top-3 first:after:hidden data-pressed:after:hidden [[data-pressed]+&]:after:hidden " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

/**
 * La pista de un `ToggleGroup`: la del segmentado, con los segmentos del mismo ancho (como los de
 * Calendar) y la posibilidad de achicarse por debajo de su texto.
 */
export const segmentedGroupClassName =
  "inline-grid grid-flow-col auto-cols-[minmax(0,1fr)] data-[orientation=vertical]:grid-flow-row data-[orientation=vertical]:auto-cols-auto"
