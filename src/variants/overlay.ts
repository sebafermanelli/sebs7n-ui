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
 * El popup centrado de Dialog y AlertDialog.
 *
 * Es el contenedor de diálogo de iCloud (catálogo §2.15): radio 11 (`rounded-panel`), opaco
 * (`bg-surface`), la sombra de popover con su filo (`shadow-modal`) y 20 px de padding. Lo
 * comparten Dialog y AlertDialog; la alerta solo es más angosta (`alertWidthClassName`).
 * La entrada sube 8px mientras aparece: es la señal de que algo entró, no decoración.
 */
export const modalPopupClassName =
  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-panel bg-surface p-5 text-callout text-label shadow-modal outline-none " +
  "transition-[opacity,translate] duration-150 data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+8px)] data-starting-style:opacity-0"

/**
 * El ancho de la confirmación (AlertDialog): el mismo diálogo que Dialog, más angosto. 400 px es
 * el diálogo chico de iCloud (el «Go To Date…» de Calendar mide 395) y deja una pregunta con dos o
 * tres botones en un renglón. Sin breakpoint: en un celular es el ancho menos 2rem.
 */
export const alertWidthClassName = "max-w-[min(400px,calc(100%-2rem))]"

/**
 * El pie de un diálogo (Dialog y AlertDialog): los botones abajo a la derecha, sin línea arriba y
 * separados 8 px. iCloud centra el único botón de sus hojas informativas («What's New»); en una
 * confirmación o un formulario —«Cancelar» y la acción— van a la derecha, y el CTA centrado sale
 * con `sm:justify-center`.
 *
 * En mobile se apilan **en el orden del DOM**. Hasta 2.0 era `flex-col-reverse` —la acción
 * principal arriba—, pero invertir con CSS hace que Tab recorra al revés de como se ve (WCAG
 * 1.3.2 y 2.4.3). Qué va arriba lo decide quien arma el pie: con «Cancelar» primero (lo habitual,
 * así en desktop queda a la izquierda) el principal queda abajo en mobile, al alcance del pulgar.
 * Apilados van a 12 px: las áreas de 44 de dos botones de 32 no se pisan. Lado a lado alcanza con
 * 8, porque el área crece en alto y no en ancho.
 */
export const modalFooterClassName = "flex flex-col gap-3 pt-1 sm:flex-row sm:justify-end sm:gap-2"

/**
 * El botón de cerrar de iCloud (catálogo §2.12): 28 × 28, radio 8 (el del `Button`) y glifo de
 * 14. Va sobre un `Button variant="ghost" size="icon-sm"`, que pone el nombre accesible obligatorio
 * y el área táctil de 44.
 */
export const closeButtonClassName = "size-7 [&_svg:not([class*='size-'])]:size-3.5"

/**
 * Dónde va la X de un Dialog: **arriba a la izquierda**, como en iCloud (Calendar → «Go To
 * Date…»), con el título centrado. Con el padding de 20 px y el título `title-3` (renglón de 24),
 * el centro del título queda a 32 px del borde; la X mide 28, así que a 18 px (`4.5`) su centro
 * cae en la misma línea.
 */
export const dialogCloseClassName = "absolute top-4.5 left-4.5"

/**
 * Dónde va la X de Sheet y Drawer: arriba a la derecha. iCloud no tiene panel lateral; en una hoja
 * pegada al borde el título va a la izquierda, así que la X se queda del otro lado, en la línea
 * del título (la misma cuenta que `dialogCloseClassName`).
 */
export const overlayCloseClassName = "absolute top-4.5 right-4.5"

/**
 * El margen de una hoja flotante (2.0): Sheet y Drawer se despegan 8 px de cada borde de la
 * pantalla que tocan, como la píldora del Sidebar y las hojas de iOS 26. Pegadas y cuadradas se
 * leían toscas, y con las esquinas redondeadas contra el borde quedaba una franja de fondo.
 *
 * Son cuatro variables y no un `m-2` porque el mismo número se usa dos veces: para ubicar la hoja
 * y para sacarla entera al cerrar (`translate` de su ancho **más** el margen; con el ancho solo
 * quedaban 8 px asomados). En un teléfono con muesca o barra de inicio el margen es el área
 * segura cuando es más grande: la hoja no se mete abajo de la barra de estado ni del indicador.
 */
export const floatingSheetGapClassName =
  "[--sheet-gap-t:max(--spacing(2),env(safe-area-inset-top))] [--sheet-gap-r:max(--spacing(2),env(safe-area-inset-right))] [--sheet-gap-b:max(--spacing(2),env(safe-area-inset-bottom))] [--sheet-gap-l:max(--spacing(2),env(safe-area-inset-left))]"

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
 * `NavigationMenu` comparte la superficie —`bg-surface shadow-menu
 * outline-none focus-visible:focus-ring`— pero no el resto: su panel mide lo que mide su
 * contenido (`--popup-width`/`--popup-height`), lleva `p-1` en vez de `p-3` y anima también
 * la escala y el tamaño. No usa esta constante a propósito: forzarla pediría deshacer la
 * mitad con overrides, que es peor que repetir.
 */
export const floatingPopupClassName =
  "flex w-64 origin-(--transform-origin) flex-col gap-2 rounded-menu bg-surface p-3 text-callout text-label shadow-menu outline-none " +
  "focus-visible:focus-ring transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

/**
 * La superficie del Tooltip: opaca (`bg-surface`) con el filo de 1 px de `shadow-tooltip` —en
 * claro la superficie es blanca y sobre una página blanca no se separaba— y el texto normal.
 *
 * La usan `TooltipContent` y la etiqueta del `AiLauncher`, que se tiene que ver igual que un
 * Tooltip pero no puede ser uno (se muestra fija con `labelVisible`, y el lanzador ya es el
 * trigger de un Popover o un Sheet). Sin posición ni animación: eso lo pone cada uno.
 */
export const tooltipSurfaceClassName =
  "rounded-control bg-surface px-2 py-1 text-callout text-label shadow-tooltip"
