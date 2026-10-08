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
  "fixed inset-0 z-50 bg-backdrop transition-opacity duration-200 ease-out-expo motion-reduce:transition-none data-ending-style:opacity-0 data-starting-style:opacity-0"

/**
 * El popup centrado de Dialog y AlertDialog.
 *
 * Es el contenedor de diálogo de iCloud (catálogo §2.15): radio 11 (`rounded-panel`), opaco
 * (`bg-surface`), la sombra de popover con su filo (`shadow-modal`) y 20 px de padding. Lo
 * comparten Dialog y AlertDialog; la alerta es más angosta (`alertWidthClassName`), con 24 de
 * aire y centrada.
 * La entrada sube 8px y crece de 97 a 100 % mientras aparece, con easing exponencial y sin rebote: es la señal de que algo entró, no decoración.
 */
export const modalPopupClassName =
  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-panel bg-surface p-5 text-callout text-label shadow-modal outline-none " +
  "transition-[opacity,translate,scale] duration-200 ease-out-expo motion-reduce:transition-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+8px)] data-starting-style:scale-[0.97] data-starting-style:opacity-0"

/**
 * El ancho de la alerta (AlertDialog): el mismo diálogo que Dialog, más angosto. 450 px es la
 * alerta de iCloud. Sin breakpoint: en un celular es el ancho menos 2rem.
 */
export const alertWidthClassName = "max-w-[min(450px,calc(100%-2rem))]"

/**
 * El pie de la alerta de iCloud: dos botones iguales a todo el ancho, separados 10 px, el primero
 * del DOM a la izquierda («Cancelar»). Con tres o más, o en 360 px o menos, se apilan **en el
 * orden del DOM** —invertir con CSS haría que Tab recorra al revés de como se ve (WCAG 1.3.2 y
 * 2.4.3)—, a todo el ancho y con los mismos estilos.
 *
 * La última línea es una red de seguridad: un Button es `whitespace-nowrap`, y una etiqueta larga
 * en media alerta se salía del botón. Acá el texto baja de renglón (centrado), una palabra sola más
 * larga que la columna se corta (`min-w-0` + `break-words`) y el botón crece en alto desde sus 36.
 * Por eso el `size` de los botones no cambia nada adentro del pie.
 */
export const alertFooterClassName =
  "grid w-full auto-cols-fr grid-flow-col gap-2.5 pt-2 has-[>:nth-child(3)]:grid-flow-row max-[360px]:grid-flow-row [&>*]:w-full " +
  "[&>*]:h-auto [&>*]:min-h-9 [&>*]:min-w-0 [&>*]:py-1.5 [&>*]:text-center [&>*]:whitespace-normal [&>*]:break-words"

/**
 * El pie de Dialog: los botones abajo a la derecha, sin línea arriba y
 * separados 8 px. iCloud centra el único botón de sus hojas informativas («What's New»); en una
 * confirmación o un formulario —«Cancelar» y la acción— van a la derecha, y el CTA centrado sale
 * con `sm:justify-center`.
 *
 * En mobile se apilan **en el orden del DOM**. Hasta 2.0 era `flex-col-reverse` —la acción
 * principal arriba—, pero invertir con CSS hace que Tab recorra al revés de como se ve (WCAG
 * 1.3.2 y 2.4.3). Qué va arriba lo decide quien arma el pie: con «Cancelar» primero (lo habitual,
 * así en desktop queda a la izquierda) el principal queda abajo en mobile, al alcance del pulgar.
 * Apilados van a 12 px: dos botones de 36 quedan a 48 entre centros y sus áreas de 44 no se pisan. Lado a lado alcanza con
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
export const dialogCloseClassName = "absolute top-4.5 start-4.5"

/**
 * Dónde va la X de Sheet y Drawer: arriba a la derecha. iCloud no tiene panel lateral; en una hoja
 * pegada al borde el título va a la izquierda, así que la X se queda del otro lado, en la línea
 * del título (la misma cuenta que `dialogCloseClassName`: 18 px).
 *
 * **Más el área segura**: la hoja pone su padding con `env(safe-area-inset-*)`, pero la X es
 * `absolute` y lo ignora, así que en un iPhone quedaba debajo de la isla. La hoja declara
 * `--sf-safe-top` y `--sf-safe-right` solo para los bordes de pantalla que toca (una hoja de abajo
 * no suma el notch de arriba); sin ellas, 0.
 */
export const overlayCloseClassName = "absolute top-[calc(var(--sf-safe-top,0px)+1.125rem)] end-[calc(var(--sf-safe-right,0px)+1.125rem)]"

/**
 * El popup anclado a un disparador: Popover y HoverCard, que son el mismo objeto.
 *
 * `focus-visible:focus-ring` no es opcional: si adentro no hay nada tabulable, Base UI enfoca
 * el popup mismo, y con `outline-none` sin reemplazo eso era foco invisible (WCAG 2.4.7).
 *
 * Es el popover de iCloud (catálogo §2.8): radio 12 (`rounded-menu`), opaco (`bg-surface`) y
 * `shadow-menu`, que ya trae el filo de 1 px que iCloud dibuja como borde (`rgba(116,116,128,.25)`
 * en oscuro, `.08` en claro: el token `hairline`) además de la sombra `0 11 34`. Como sombra y no
 * como `border`, el filo no le suma 2 px a la caja. Mide `w-64` con `p-4`: 16 px es el inset de
 * los títulos de los popovers de iCloud («Show», «Apps»). Quien necesita más ancho lo pide con
 * `className` (ColorPicker, DatePicker y el chat ya lo hacen).
 *
 * **Nunca más grande que el lugar que queda** (2.5): `max-w`/`max-h` con `--available-width` y
 * `--available-height`, que Base UI mide contra el viewport menos el `collisionPadding`. Un `w-80`
 * en un teléfono de 320 px se salía 5 px; ahora se achica y el contenido scrollea adentro.
 *
 * `NavigationMenu` comparte la superficie —`bg-surface shadow-menu
 * outline-none focus-visible:focus-ring`— pero no el resto: su panel mide lo que mide su
 * contenido (`--popup-width`/`--popup-height`), lleva `p-1` en vez de `p-4` y anima también
 * la escala y el tamaño. No usa esta constante a propósito: forzarla pediría deshacer la
 * mitad con overrides, que es peor que repetir.
 */
export const floatingPopupClassName =
  "flex max-h-(--available-height) w-64 max-w-(--available-width) origin-(--transform-origin) flex-col overflow-y-auto gap-2 rounded-menu bg-surface p-4 text-callout text-label shadow-menu outline-none " +
  "focus-visible:focus-ring transition-[opacity,scale] duration-150 ease-out-expo motion-reduce:transition-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"

/**
 * La superficie del Tooltip (R5a): chica, gris oscura con texto blanco de 12 en los dos temas
 * (`bg-tooltip`), radio 6, sin flecha y con la sombra suave de `shadow-tooltip`. Es la de la
 * captura de Sebastián; iCloud usa el `title` nativo y no tiene una propia.
 *
 * La usan `TooltipContent` y la etiqueta del `AiLauncher`, que se tiene que ver igual que un
 * Tooltip pero no puede ser uno (se muestra fija con `labelVisible`, y el lanzador ya es el
 * trigger de un Popover o un Sheet). Sin posición ni animación: eso lo pone cada uno.
 */
export const tooltipSurfaceClassName =
  "rounded-tooltip bg-tooltip px-2 py-1 text-footnote text-on-tooltip shadow-tooltip"
