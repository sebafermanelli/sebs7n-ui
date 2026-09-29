// El control segmentado: una pista con `fill-2` y radio 8 y una pastilla de radio 6 que se desliza
// hasta la opción elegida. Es el segmentado de Calendar en iCloud.
//
// Lo usan `Tabs` y `ThemeSwitcher`, que son el mismo objeto con distinto contenido: uno lleva
// texto y el otro íconos. Están acá para que no puedan quedar distintos: la curva del
// deslizamiento, el fondo de la pista y la sombra de la pastilla se tocan en un solo lugar.

/**
 * La pista. `isolate` es lo que deja a la pastilla, que va en `-z-10`, detrás del contenido de
 * las opciones pero adelante del fondo de la pista.
 */
export const segmentedTrackClassName =
  "relative isolate flex w-fit max-w-full items-center gap-0.5 rounded-control bg-fill-2 p-0.5"

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
