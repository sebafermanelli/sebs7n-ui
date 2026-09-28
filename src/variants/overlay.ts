// Las superficies que se dibujan encima de la página: el velo, el modal centrado y el popup
// anclado a un disparador.
//
// Están acá porque el mismo string estaba escrito en cuatro, dos y dos archivos. No es una
// cuestión de bytes —tailwind-merge los deduplica igual—: es que subir la duración de la
// transición, cambiar el radio o tocar la sombra había que hacerlo en todos los archivos, y
// alcanzaba con olvidarse de uno para que Drawer se viera distinto que Dialog.

/**
 * El velo detrás de un modal: Dialog, AlertDialog, Sheet y Drawer.
 *
 * `Drawer` le suma una `opacity` atada al progreso del gesto, para que el velo se aclare
 * mientras se arrastra; el resto lo usa tal cual.
 */
export const backdropClassName =
  "fixed inset-0 z-50 bg-backdrop transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

/**
 * El popup centrado de Dialog y AlertDialog: los dos son el mismo objeto.
 *
 * Lo único que los diferencia es el ancho máximo —`sm:max-w-lg` en Dialog y `sm:max-w-md` en
 * AlertDialog, porque una confirmación de dos botones no necesita más— y eso lo agrega cada uno.
 * La entrada sube 8px mientras aparece: es la señal de que algo entró, no decoración.
 */
export const modalPopupClassName =
  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-panel material-modal p-6 text-body text-gray-1000 shadow-modal outline-none " +
  "transition-[opacity,translate] duration-150 data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+8px)] data-starting-style:opacity-0"

/**
 * El pie de un modal centrado: Dialog y AlertDialog.
 *
 * Los márgenes negativos sacan el borde superior al ancho completo del popup, que tiene `p-6`.
 * `flex-col-reverse` en mobile pone la acción principal arriba, que es donde cae el pulgar.
 */
export const modalFooterClassName =
  "-mx-6 mt-2 flex flex-col-reverse gap-2 border-t border-gray-alpha-400 px-6 pt-4 sm:flex-row sm:justify-end"

/**
 * Dónde va la X de cerrar: Dialog, Sheet y Drawer.
 *
 * El botón en sí es un `Button variant="ghost" size="icon-sm"` —eso ya es una decisión con
 * nombre— y el nombre accesible lo pone cada uno desde sus `labels`. Lo único compartido, y
 * lo único que se puede desincronizar sin que nadie lo note, es la posición.
 *
 * `top-5 right-5` desde 2.0: el botón bajó de 32 a 24 y así su centro queda donde estaba, a
 * 32 px de las dos esquinas, alineado con el título.
 */
export const overlayCloseClassName = "absolute top-5 right-5"

/**
 * El popup anclado a un disparador: Popover y HoverCard, que son el mismo objeto.
 *
 * `focus-visible:focus-ring` no es opcional: si adentro no hay nada tabulable, Base UI enfoca
 * el popup mismo, y con `outline-none` sin reemplazo eso era foco invisible (WCAG 2.4.7).
 *
 * `NavigationMenu` comparte la superficie —`material-popover shadow-menu
 * outline-none focus-visible:focus-ring`— pero no el resto: su panel mide lo que mide su
 * contenido (`--popup-width`/`--popup-height`), lleva `p-1` en vez de `p-4` y anima también
 * la escala y el tamaño. No usa esta constante a propósito: forzarla pediría deshacer la
 * mitad con overrides, que es peor que repetir.
 */
export const floatingPopupClassName =
  "flex w-72 origin-(--transform-origin) flex-col gap-3 rounded-surface material-popover p-4 text-body text-gray-1000 shadow-menu outline-none " +
  "focus-visible:focus-ring transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

/**
 * La superficie del Tooltip: vidrio denso (`material-popover`) con un filo de 1 px —en claro el
 * vidrio es casi blanco y sobre una página blanca no se separaba— y el texto normal.
 *
 * La usan `TooltipContent` y la etiqueta del `AiLauncher`, que se tiene que ver igual que un
 * Tooltip pero no puede ser uno (se muestra fija con `labelVisible`, y el lanzador ya es el
 * trigger de un Popover o un Sheet). Sin posición ni animación: eso lo pone cada uno.
 */
export const tooltipSurfaceClassName =
  "rounded-control border border-gray-alpha-400 material-popover px-2 py-1 text-body text-gray-1000 shadow-tooltip"
