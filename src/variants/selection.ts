/**
 * Para lo que tiene color propio adentro de un ítem seleccionable: una fecha en gris, un contador,
 * un ícono de estado. Cuando el ítem se selecciona —menú resaltado, Sidebar activo, fila de tabla
 * con `data-state="selected"`, NavigationMenuLink de la página actual— pasa al color de contraste
 * del acento (`text-on-selection`), igual que el label del ítem.
 *
 * Va junto al color de reposo, que sigue siendo de la app:
 *
 * ```tsx
 * <span className={cn("text-label-secondary", selectionSecondaryClassName)}>hace 5 min</span>
 * ```
 *
 * Cuelga del variant `inside-selection` de theme.css, que mira el `group/selectable` más cercano;
 * la app lo puede usar directo (`inside-selection:border-on-selection`) para lo que no es texto.
 * Los `<svg>` sueltos ya los pasa a contraste el ítem; esto es para el texto y para un ícono con
 * clase de color propia.
 */
export const selectionSecondaryClassName = "inside-selection:text-on-selection"
