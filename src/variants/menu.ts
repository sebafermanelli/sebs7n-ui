// Ítems, panel, encabezado de grupo y separador de menú.
//
// Los comparten seis componentes, no dos: DropdownMenu, ContextMenu, Menubar, Select, Combobox y
// Autocomplete. Todo lo que se abre como una lista de opciones se ve igual porque sale de acá.

/**
 * `inset` corre el contenido a la derecha para que alinee con el texto de los ítems que llevan
 * ícono (`menuInsetClassName`). Estaba declarado tres veces con el mismo nombre —uno por menú—, y como los tres
 * son `export *` del barrel, no se podían exportar sin chocar entre sí.
 */
export type MenuInsetProps = { inset?: boolean }

/**
 * El ítem de un menú de iCloud (catálogo §2.8, medido en el menú de fila de Drive): **30 px**,
 * `px-2.5` (10), `rounded-menu-item` (8), 14/400. Con el dedo sube a 44 de verdad y no con
 * `touch-target`: los ítems están pegados, y un `::after` de 44 taparía la mitad del de al lado
 * (el que va después en el DOM se pinta encima y se queda con el toque).
 *
 * Íconos de 16 y **el primero, el que encabeza el ítem, en el acento** (`text-brand-900`, la tinta
 * de link), como los glifos azules de los menús de Drive y Mail. Los íconos propios del paquete (el
 * chevron del submenú, la flecha de `external`) llevan `data-slot` y quedan afuera: en un ítem de
 * solo texto son el primer hijo, y sin eso tomaban el acento. `gap-2.5`: el texto de un ítem con
 * ícono arranca a 36 (10 + 16 + 10; en iCloud, 37).
 *
 * El resaltado es el de iCloud: gris translúcido (`fill-2`) y el texto no cambia de color;
 * apretado, `fill-3`. Base UI pone `data-highlighted` tanto con el puntero como con las flechas.
 * Deshabilitado, el ítem entero queda al **30 %** (el `opacity .3` de iCloud) y no se resalta.
 * `group/menu-item` es para lo que adentro tiene color propio (el atajo): ver
 * `menuItemSecondaryClassName`. `group/selectable` es el mismo gancho, compartido con los otros
 * ítems seleccionables: ver `selectionSecondaryClassName`.
 */
export const menuItemClassName =
  "group/menu-item group/selectable relative flex h-7.5 pointer-coarse:h-11 cursor-pointer items-center gap-2.5 rounded-menu-item px-2.5 text-callout text-label outline-none select-none transition-control data-highlighted:bg-fill-2 active:bg-fill-3 data-disabled:cursor-not-allowed data-disabled:opacity-30 data-disabled:active:bg-transparent data-disabled:data-highlighted:bg-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>svg:first-child:not([data-slot])]:text-brand-900"

/**
 * El ítem que destruye (`variant="destructive"`): texto e ícono en rojo, como el «Delete Selected»
 * del menú de fila de Drive. Va al final, después de un separador. Se resalta en el mismo gris que
 * los demás y el rojo no cambia.
 *
 * La tinta es `red-ink`, la misma de la acción destructiva de la alerta: llega a 4,5:1 sobre el
 * panel, sobre `fill-2` y sobre `fill-3`, en claro y en oscuro (`test/contrast.test.ts`); el rojo de
 * iCloud (`rgb(255,48,55)`) se queda en 3,2:1 sobre el resaltado oscuro.
 */
export const menuItemDestructiveClassName = "text-red-ink [&>svg:first-child:not([data-slot])]:text-current"

/**
 * Un ítem que lleva a otro sitio (`external`): el texto en el acento y ↗ al final, como el «Manage
 * Apple Account ↗» del menú de cuenta de iCloud. La flecha es `menuItemExternalIconClassName`.
 *
 * El acento es `brand-ink` y no `brand-900`: el texto vive también sobre el resaltado (`fill-2`) y
 * el apretado (`fill-3`), y ahí `brand-900` no llega a 4,5:1 en claro con todas las marcas (teal y
 * emerald quedaban en 4,0–4,2). Es la misma regla que el botón `plain` (test/contrast.test.ts).
 */
export const menuItemExternalClassName = "text-brand-ink"
export const menuItemExternalIconClassName = "ml-auto size-3.5"

/**
 * El texto secundario de un ítem —el atajo de teclado—: `label-secondary`, también resaltado.
 * Con el resaltado gris de iCloud el texto no cambia de color, y sobre `fill-2` el secundario
 * sigue arriba de 4,5:1 (`test/surfaces.test.ts`).
 */
export const menuItemSecondaryClassName = "text-label-secondary"

/**
 * El panel de un menú de iCloud: `rounded-menu` (12) con **5 de padding** (`p-1.25`), opaco
 * (`bg-surface`) y `shadow-menu`, que ya trae el filo de 1 px que iCloud dibuja como borde. El
 * ítem mide 8 de radio: 8 + 5 = 13 contra 12, lo mismo que iCloud.
 *
 * `min-w-52` (208): el menú más angosto de iCloud mide 207 con el borde.
 */
export const menuPopupClassName =
  "max-h-(--available-height) min-w-52 origin-(--transform-origin) overflow-y-auto rounded-menu bg-surface p-1.25 text-label shadow-menu outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

/**
 * El tilde (R3): el **círculo de acento a la derecha** del «View as» de Drive, que es el Select de
 * iCloud. Reemplaza la canaleta izquierda de la fase 3 (la del menú de macOS). Cuatro piezas:
 *
 * - `menuGutterClassName` (`pr-9`) va en todo ítem que puede llevar tilde: `CheckboxItem`,
 *   `RadioItem` y las opciones de Select y Combobox (elegida o no: todas reservan el lugar, así el
 *   ancho del menú no cambia al marcar). El atajo, con su `ml-auto`, queda antes de esa columna.
 * - `menuIndicatorClassName` ubica el tilde en la columna: 10 px del borde, 16 de círculo.
 * - `menuCheckClassName` es el círculo: `brand-900` (la tinta de link) con el tilde en el color de
 *   la superficie; claro sobre oscuro en claro, oscuro sobre claro en oscuro, como el día elegido
 *   del calendario de iCloud.
 * - `menuInsetClassName` (`data-inset:pl-9`) es lo que hace `inset` en un ítem común o un título:
 *   lo alinea con el texto de los ítems que llevan ícono (10 + 16 + 10).
 *
 * Los componentes ponen el `pr-9` **después** del `className` de la app en el `cn()`: un `px-3` de
 * la app haría que tailwind-merge descarte el `pr-9` si fuera antes, y el texto se metería debajo
 * del tilde. Tailwind v4 emite `padding-right` después de `padding-inline`, así que le gana al `px-*`.
 */
export const menuGutterClassName = "pr-9"
export const menuInsetClassName = "data-inset:pl-9"
export const menuIndicatorClassName = "pointer-events-none absolute right-2.5 flex items-center"
export const menuCheckClassName = "flex size-4 items-center justify-center rounded-full bg-brand-900 text-surface"

/**
 * El título de un grupo de ítems: DropdownMenu, ContextMenu, Menubar, Select, Combobox,
 * Autocomplete y Command. Es el «View as» o el «Create New» de iCloud: una fila de 30 como las
 * demás, en **14/600 y el color del texto**, no gris. Se lee como el título de lo que sigue por el
 * peso, no por estar apagado.
 */
export const menuLabelClassName = "flex h-7.5 items-center px-2.5 text-callout font-semibold text-label"

/**
 * La línea entre grupos de ítems: los tres menús, Select, Combobox y Autocomplete.
 *
 * El divisor de iCloud: 9 px de alto (`my-1` + la línea) y la línea de 1 px en `fill-2`, con
 * **11 de margen** a los costados (`mx-2.75`), así arranca un poco más adentro que el resaltado.
 */
export const menuSeparatorClassName = "mx-2.75 my-1 h-px bg-fill-2"
