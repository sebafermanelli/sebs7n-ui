/**
 * Para lo que tiene color propio adentro de una fila elegida sobre el acento: una fecha en gris,
 * un contador, un ícono de estado. En iCloud (2.0) el acento sólido es solo la fila elegida de una
 * lista con foco —hoy, una `TableRow` con `data-state="selected"` en una `Table` que tiene el
 * foco—; ahí lo de adentro pasa al color de contraste (`text-on-selection`), igual que el texto
 * de la fila. Menú resaltado, sidebar activo y link actual son grises y no lo necesitan.
 *
 * Va junto al color de reposo, que sigue siendo de la app:
 *
 * ```tsx
 * <span className={cn("text-label-secondary", selectionSecondaryClassName)}>hace 5 min</span>
 * ```
 *
 * Cuelga del variant `inside-selection` de theme.css; la app lo puede usar directo
 * (`inside-selection:border-on-selection`) para lo que no es texto.
 */
export const selectionSecondaryClassName = "inside-selection:text-on-selection"
