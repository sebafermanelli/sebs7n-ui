/**
 * El nombre de un contenedor que no tiene texto propio que lo nombre (un árbol, una grilla, una tabla,
 * una lista de eventos, un grupo de meters): el tipo exige `aria-label` o `aria-labelledby`. Sin él,
 * el lector anuncia «árbol» o «tabla» a secas. Es la misma regla que el botón de solo ícono.
 */
export type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-labelledby": string; "aria-label"?: string }
