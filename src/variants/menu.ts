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

/**
 * 24 px, el alto de un ítem de menú de macOS. Con el dedo sube a 44 de verdad y no con
 * `touch-target`: los ítems están pegados, y un `::after` de 44 taparía la mitad del de al lado
 * (el que va después en el DOM se pinta encima y se queda con el toque).
 */
export const menuItemClassName =
  "relative flex h-6 pointer-coarse:h-11 cursor-pointer items-center gap-2 rounded-control px-2 text-body text-gray-1000 outline-none select-none transition-control data-highlighted:bg-highlight active:bg-highlight-active data-disabled:cursor-not-allowed data-disabled:text-gray-700 data-disabled:data-highlighted:bg-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

/**
 * El radio del panel es el del ítem más el `p-1` que los separa: así las dos curvas son
 * concéntricas. Con un radio fijo, la esquina del ítem resaltado se ve más cerrada o más
 * abierta que la del panel, según cuál de los dos tokens haya pisado la app.
 */
/**
 * `glass-dense`: un menú es una lista que se lee y flota sobre lo que haya. Ver la utilidad.
 */
export const menuPopupClassName =
  "max-h-(--available-height) min-w-40 origin-(--transform-origin) overflow-y-auto rounded-[calc(var(--radius-control)+--spacing(1))] glass glass-dense p-1 text-gray-1000 shadow-menu outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"

/**
 * El encabezado de un grupo de ítems: DropdownMenu, ContextMenu, Menubar, Select y Combobox.
 *
 * Los tres menús le suman `data-inset:pl-8` para alinear con los ítems que tienen check o ícono;
 * Select y Combobox no lo necesitan porque no tienen `inset`.
 */
export const menuLabelClassName = "px-2 py-1.5 text-callout text-gray-900"

/**
 * La línea entre grupos de ítems: los tres menús, Select, Combobox y Autocomplete.
 *
 * Los `-mx-1` la estiran hasta el borde del popup, que lleva `p-1`: una línea con aire a los
 * costados se lee como parte de un ítem y no como el corte entre dos grupos.
 */
export const menuSeparatorClassName = "-mx-1 my-1 h-px bg-gray-alpha-400"
