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
 * El popup centrado de Dialog: la hoja de macOS.
 *
 * Hasta 1.x lo compartía AlertDialog, con otro ancho. Desde 2.0 la alerta es otro objeto
 * (`alertPopupClassName`): más chica y con los botones de otra forma.
 * La entrada sube 8px mientras aparece: es la señal de que algo entró, no decoración.
 */
export const modalPopupClassName =
  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-panel material-modal p-5 text-body text-gray-1000 shadow-modal outline-none " +
  "transition-[opacity,translate] duration-150 data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+8px)] data-starting-style:opacity-0"

/**
 * La alerta de macOS: compacta, con el ícono arriba y los botones iguales a lo ancho. Es otro
 * objeto que la hoja (`Dialog`): una alerta interrumpe para una sola pregunta, así que es chica
 * y no tiene un pie separado por una línea. 20 px de padding y 12 entre ícono, textos y botones.
 */
export const alertPopupClassName =
  "fixed top-1/2 left-1/2 z-50 flex w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-panel material-modal p-5 text-body text-gray-1000 shadow-modal outline-none sm:max-w-[300px] " +
  "transition-[opacity,translate] duration-150 data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+8px)] data-starting-style:opacity-0"

/**
 * El pie de la alerta: botones del mismo ancho a lo ancho, el primero del DOM a la izquierda
 * (Cancelar a la izquierda y la acción a la derecha, como macOS).
 *
 * Con tres o más, o en una pantalla angosta, se apilan **en el orden del DOM**. macOS pone el
 * botón por defecto arriba, pero para eso habría que invertir la pila con CSS, y entonces Tab
 * recorrería los botones al revés de como se ven (WCAG 1.3.2 y 2.4.3). Quien quiera la acción
 * arriba la escribe primero.
 */
export const alertFooterClassName =
  "grid auto-cols-fr grid-flow-col gap-2 pt-1 has-[>:nth-child(3)]:grid-flow-row max-[360px]:grid-flow-row [&>*]:w-full"

/**
 * El pie de la hoja (Dialog): los botones abajo a la derecha, sin línea arriba, como una hoja de
 * macOS («Done» en la esquina). Hasta 1.x llevaba un borde al ancho completo con márgenes
 * negativos; en macOS el aire alcanza para separar el contenido de las acciones.
 *
 * `flex-col-reverse` en mobile pone la acción principal arriba, que es donde cae el pulgar.
 */
export const modalFooterClassName = "flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"

/**
 * Dónde va la X de cerrar: Dialog, Sheet y Drawer. Se queda en 2.0 aunque macOS no la ponga en
 * las hojas: en la web es la salida que todos buscan (decisión de Sebastián).
 *
 * El botón en sí es un `Button variant="ghost" size="icon-sm"` —eso ya es una decisión con
 * nombre— y el nombre accesible lo pone cada uno desde sus `labels`. Lo único compartido, y
 * lo único que se puede desincronizar sin que nadie lo note, es la posición.
 *
 * Con el padding de 20 px de 2.0 y el título `title-3` (renglón de 20 px), el centro del título
 * queda a 30 px del borde. La X mide 24: a 18 px (`4.5`) su centro cae en esa misma línea, y a la
 * misma distancia del borde derecho.
 */
export const overlayCloseClassName = "absolute top-4.5 right-4.5"

/**
 * El popup anclado a un disparador: Popover y HoverCard, que son el mismo objeto.
 *
 * `focus-visible:focus-ring` no es opcional: si adentro no hay nada tabulable, Base UI enfoca
 * el popup mismo, y con `outline-none` sin reemplazo eso era foco invisible (WCAG 2.4.7).
 *
 * Desde 2.0 mide `w-64` con `p-3` y `gap-2`: un popover de macOS es más angosto y más apretado
 * que el panel de 288 px y 16 de aire de 1.x, que se leía como una tarjeta suelta. Quien necesita
 * más ancho lo pide con `className` (ColorPicker, DatePicker y el chat ya lo hacen).
 *
 * `NavigationMenu` comparte la superficie —`material-popover shadow-menu
 * outline-none focus-visible:focus-ring`— pero no el resto: su panel mide lo que mide su
 * contenido (`--popup-width`/`--popup-height`), lleva `p-1` en vez de `p-3` y anima también
 * la escala y el tamaño. No usa esta constante a propósito: forzarla pediría deshacer la
 * mitad con overrides, que es peor que repetir.
 */
export const floatingPopupClassName =
  "flex w-64 origin-(--transform-origin) flex-col gap-2 rounded-surface material-popover p-3 text-body text-gray-1000 shadow-menu outline-none " +
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
