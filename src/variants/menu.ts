// Ítems, panel, encabezado de grupo y separador de menú.
//
// Los comparten seis componentes, no dos: DropdownMenu, ContextMenu, Menubar, Select, Combobox y
// Autocomplete. Todo lo que se abre como una lista de opciones se ve igual porque sale de acá.

/**
 * `inset` corre el contenido a la izquierda para que alinee con los ítems que tienen ícono
 * o check. Estaba declarado tres veces con el mismo nombre —uno por menú—, y como los tres
 * son `export *` del barrel, no se podían exportar sin chocar entre sí.
 */
export type MenuInsetProps = { inset?: boolean }

export const menuItemClassName =
  "relative flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-copy-14 text-gray-1000 outline-none select-none transition-control data-highlighted:bg-gray-200 active:bg-gray-300 data-disabled:cursor-not-allowed data-disabled:text-gray-700 data-disabled:data-highlighted:bg-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const menuPopupClassName =
  "max-h-(--available-height) min-w-40 origin-(--transform-origin) overflow-y-auto rounded-xl bg-background-100 p-1 text-gray-1000 shadow-menu outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

/**
 * El encabezado de un grupo de ítems: DropdownMenu, ContextMenu, Menubar, Select y Combobox.
 *
 * Los tres menús le suman `data-inset:pl-8` para alinear con los ítems que tienen check o ícono;
 * Select y Combobox no lo necesitan porque no tienen `inset`.
 */
export const menuLabelClassName = "px-2 py-1.5 text-label-12 text-gray-900"

/**
 * La línea entre grupos de ítems: los tres menús, Select, Combobox y Autocomplete.
 *
 * Los `-mx-1` la estiran hasta el borde del popup, que lleva `p-1`: una línea con aire a los
 * costados se lee como parte de un ítem y no como el corte entre dos grupos.
 */
export const menuSeparatorClassName = "-mx-1 my-1 h-px bg-gray-400"
