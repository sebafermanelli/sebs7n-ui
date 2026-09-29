// La paleta de comandos estilo Spotlight (2.0): el panel de `CommandDialog` y las filas de resultados.
//
// Están acá y no adentro de `command.tsx` por la misma razón que los menús: una app que arma su
// propia lista de resultados —con otra primitiva, o sin Base UI— puede verse igual sin copiar clases.

/**
 * El panel de `CommandDialog`. Anclado arriba (`top-[18vh]`) y no centrado: es lo que hace Spotlight,
 * y es lo que evita que el campo salte cuando la lista crece o se achica con cada tecla; centrado,
 * el panel entero se movería con los resultados.
 *
 * `material-popover` y no `material-modal`: una búsqueda flota sobre lo que haya, como un menú, y se
 * va apenas se elige algo. `rounded-panel`, el radio de las ventanas; `overflow-hidden` para que el
 * separador del campo y la lista respeten la curva.
 */
export const commandDialogPopupClassName =
  "fixed top-[18vh] left-1/2 z-50 flex max-h-[min(560px,calc(100dvh-18vh-1rem))] w-[min(640px,calc(100%-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-panel material-popover text-gray-1000 shadow-modal outline-none " +
  "transition-[opacity,scale] duration-150 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"

/**
 * Una fila de resultados: 40 px, ícono, título y detalle.
 *
 * **El elegido va en gris translúcido (`bg-gray-alpha-200`), no en el acento de los menús.** Es lo
 * que hace Spotlight, y por la misma razón: en un menú el resaltado dice «esto se ejecuta si soltás»
 * y hay un ítem por vez bajo el puntero; en una búsqueda el primer resultado está elegido desde la
 * primera tecla, todo el tiempo, y una franja de acento sólido fija en la fila de arriba grita más
 * que los resultados mismos. El gris marca cuál es sin competir con el texto, y deja el título y el
 * detalle en sus colores —con el acento, el detalle gris tendría que pasar a blanco—.
 *
 * El radio es concéntrico con el panel: el de `rounded-panel` menos el `p-1.5` de la lista.
 * `group/command-item` es para la pista `tab`, que solo se ve en el elegido.
 */
export const commandItemClassName =
  "group/command-item relative flex h-10 cursor-pointer items-center gap-3 rounded-[calc(var(--radius-panel)-(--spacing(1.5)))] px-2 text-callout text-gray-1000 outline-none select-none transition-control " +
  "data-highlighted:bg-gray-alpha-200 data-disabled:cursor-not-allowed data-disabled:text-gray-700 [&_svg]:pointer-events-none [&_svg]:shrink-0"

/**
 * El ícono de un resultado: 32×32 con radio 8, como los íconos de la lista de Spotlight. Un ícono de
 * lucide adentro va a 20 px sobre un fondo gris sutil, para que la columna se lea pareja aunque unas
 * filas traigan una imagen y otras un glifo.
 */
export const commandItemIconClassName =
  "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-control bg-gray-alpha-100 text-gray-900 [&_svg:not([class*='size-'])]:size-5 [&>img]:size-full [&>img]:object-cover"
