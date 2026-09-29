// Ítems, panel, encabezado de grupo y separador de menú.
//
// Los comparten seis componentes, no dos: DropdownMenu, ContextMenu, Menubar, Select, Combobox y
// Autocomplete. Todo lo que se abre como una lista de opciones se ve igual porque sale de acá.

/**
 * `inset` corre el contenido a la izquierda para que alinee con los ítems que tienen tilde
 * (la canaleta de `menuGutterClassName`). Estaba declarado tres veces con el mismo nombre —uno por menú—, y como los tres
 * son `export *` del barrel, no se podían exportar sin chocar entre sí.
 */
export type MenuInsetProps = { inset?: boolean }

/**
 * 24 px, el alto de un ítem de menú de macOS. Con el dedo sube a 44 de verdad y no con
 * `touch-target`: los ítems están pegados, y un `::after` de 44 taparía la mitad del de al lado
 * (el que va después en el DOM se pinta encima y se queda con el toque).
 *
 * `rounded-menu-item` (8, como los ítems de menú de Mail y Drive en iCloud).
 *
 * El resaltado es el de iCloud (2.0): gris translúcido (`fill-2`) y el texto no cambia de color;
 * apretado, `fill-3`. Base UI pone `data-highlighted` tanto con el puntero como con las flechas.
 * Un ítem deshabilitado no lo toma aunque quede resaltado: se queda transparente y en
 * `label-tertiary`.
 * `group/menu-item` es para lo que adentro tiene color propio (el atajo): ver
 * `menuItemSecondaryClassName`. `group/selectable` es el mismo gancho, compartido con los otros
 * ítems seleccionables: ver `selectionSecondaryClassName`.
 */
export const menuItemClassName =
  "group/menu-item group/selectable relative flex h-6 pointer-coarse:h-11 cursor-pointer items-center gap-2 rounded-menu-item px-2 text-callout text-label outline-none select-none transition-control data-highlighted:bg-fill-2 active:bg-fill-3 data-disabled:cursor-not-allowed data-disabled:text-label-tertiary data-disabled:active:bg-transparent data-disabled:data-highlighted:bg-transparent data-disabled:data-highlighted:text-label-tertiary data-disabled:data-highlighted:[&_svg]:text-label-tertiary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

/**
 * El texto secundario de un ítem —el atajo de teclado—: `label-secondary`, también resaltado.
 * Con el resaltado gris de iCloud el texto no cambia de color, y sobre `fill-2` el secundario
 * sigue arriba de 4,5:1 (`test/surfaces.test.ts`).
 */
export const menuItemSecondaryClassName = "text-label-secondary"

/**
 * `rounded-menu` (12, el de los menús de iCloud) con `p-1`: el ítem mide `rounded-menu-item` (8)
 * y 8 + 4 = 12, así que las dos curvas son concéntricas. iCloud usa 5 de padding; con 4 el
 * resaltado queda paralelo al borde, que es lo que se ve. Si la app pisa uno de los dos radios,
 * tiene que pisar el otro.
 *
 * `min-w-48`: un menú de dos palabras no queda más angosto que su propio atajo.
 */
export const menuPopupClassName =
  "max-h-(--available-height) min-w-48 origin-(--transform-origin) overflow-y-auto rounded-menu bg-surface p-1 text-label shadow-menu outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

/**
 * La canaleta del tilde (2.0). En macOS el tilde de un ítem marcable va a la **izquierda**, en
 * una canaleta de 24 px, y el texto de todo el menú arranca después de ella. Tres piezas:
 *
 * - `menuGutterClassName` (`pl-7`) va en todo ítem que puede llevar tilde: `CheckboxItem`,
 *   `RadioItem` y las opciones de Select y Combobox (elegida o no: todas reservan el lugar).
 * - `menuInsetClassName` (`data-inset:pl-7`) es lo que hace `inset` en un ítem común o un título:
 *   en un menú que mezcla ítems con tilde y sin él, los alinea a todos.
 * - `menuIndicatorClassName` ubica el tilde en la canaleta: 8 px de borde, 16 de ícono, 4 de aire.
 *
 * Un menú sin nada marcable no reserva canaleta y sus ítems se quedan en `px-2`, como los menús
 * de macOS que no tienen tildes. El `pl-7` le gana al `px-2` del ítem porque Tailwind v4 emite
 * `padding-left` después de `padding-inline` (verificado con el compilador 4.3).
 *
 * Los componentes lo ponen **después** del `className` de la app en el `cn()`: un `px-3` de la app
 * (más aire a la derecha, por un atajo largo) haría que tailwind-merge descarte el `pl-7` si fuera
 * antes, y el texto se metería en la canaleta del tilde.
 */
export const menuGutterClassName = "pl-7"
export const menuInsetClassName = "data-inset:pl-7"
export const menuIndicatorClassName = "pointer-events-none absolute left-2 flex items-center"

/**
 * El encabezado de un grupo de ítems: DropdownMenu, ContextMenu, Menubar, Select, Combobox y
 * Autocomplete. Chico, en negrita y gris, como el «Move & Resize» del popover de ventanas de
 * Finder (2.0): se lee como el título de lo que sigue y no como un ítem más apagado.
 *
 * Los tres menús le suman `menuInsetClassName` para que `inset` lo alinee con la canaleta del
 * tilde; Select y Combobox, `menuGutterClassName` siempre, porque todas sus opciones la reservan.
 */
export const menuLabelClassName = "px-2 pt-2 pb-1 text-callout font-semibold text-label-secondary"

/**
 * La línea entre grupos de ítems: los tres menús, Select, Combobox y Autocomplete.
 *
 * `mx-2` (2.0): en macOS la línea tiene aire a los costados y arranca donde arranca el
 * resaltado de un ítem. Hasta 1.x iba de borde a borde del panel con `-mx-1`, que en el panel
 * se leía como un corte del material y no como una pausa entre grupos.
 */
export const menuSeparatorClassName = "mx-2 my-1 h-px bg-fill-3"
