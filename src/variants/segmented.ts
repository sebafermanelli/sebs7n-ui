// El control segmentado: una pista hundida en cápsula y una pastilla que se desliza hasta la
// opción elegida. Es la tira de pestañas de Safari.
//
// Lo usan `Tabs` y `ThemeSwitcher`, que son el mismo objeto con distinto contenido: uno lleva
// texto y el otro íconos. Están acá para que no puedan quedar distintos: la curva del
// deslizamiento, el fondo de la pista y la sombra de la pastilla se tocan en un solo lugar.

/**
 * La pista. `isolate` es lo que deja a la pastilla, que va en `-z-10`, detrás del contenido de
 * las opciones pero adelante del fondo de la pista.
 */
export const segmentedTrackClassName =
  "relative isolate flex w-fit max-w-full items-center gap-0.5 rounded-full bg-gray-alpha-200 p-0.5 shadow-track"

/**
 * La pastilla, siempre más clara que la pista. Alfa y no vidrio: la pista casi siempre vive adentro de una superficie que ya
 * tiene el blur.
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
  // En oscuro `glass-control` es la superficie —casi negra— en alfa, y sobre una pista que es
  // blanco al 9 % la pastilla quedaba MÁS oscura que lo que la rodea: se leía como un hueco y
  // no como una pieza apoyada encima. Ahí va un blanco en alfa, que la levanta.
  "pointer-events-none absolute -z-10 rounded-full glass-control shadow-card dark:bg-gray-alpha-400 " +
  "transition-[left,width,translate] duration-300 ease-[cubic-bezier(0.3,1.25,0.4,1)] motion-reduce:transition-none"
