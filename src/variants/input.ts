// Superficie de Input para controles compuestos (Combobox, Autocomplete): el borde, el foco y los
// estados van en el contenedor, y el <input> de adentro es transparente. Mismo cuerpo que Input.
export const inputShellClassName =
  "flex w-full min-w-0 items-center rounded-md border border-gray-400 bg-background-100 text-copy-14 text-gray-1000 transition-control " +
  "data-[size=sm]:h-8 data-[size=md]:h-10 data-[size=lg]:h-12 data-[size=lg]:text-copy-16 " +
  "hover:border-gray-500 has-[input:focus]:focus-border " +
  "data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700 " +
  "has-[input[aria-invalid=true]]:border-red-800 has-[input[aria-invalid=true]:focus]:focus-border-error " +
  "data-invalid:border-red-800 data-invalid:has-[input:focus]:focus-border-error"

// El <input> dentro de la superficie.
//
// El placeholder va en `gray-900` y no en `gray-700` —que es el tono de Geist— porque en claro
// `gray-700` (#8f8f8f) sobre la superficie blanca da 3,23:1 y WCAG 1.4.3 pide 4,5:1 para texto. Un
// placeholder es texto: dice qué formato espera el campo, y en un formulario largo es lo único que
// queda visible hasta que se escribe. `gray-900` da 8,45:1 en claro y 7,57:1 en oscuro, y sigue
// siendo netamente más tenue que el valor tipeado (`gray-1000`), que es lo que el tono tiene que
// comunicar. Un solo tono para los dos temas: `gray-900` ya pasa en ambos, así que no hace falta
// una variante por tema ni un token nuevo.
export const inputShellInputClassName =
  "h-full min-w-0 flex-1 bg-transparent px-3 text-inherit outline-none placeholder:text-gray-900 disabled:cursor-not-allowed"

// Botones chicos dentro de la superficie (limpiar, chevron, quitar chip).
export const inputShellButtonClassName =
  "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-gray-900 outline-none transition-control " +
  "hover:bg-gray-alpha-200 hover:text-gray-1000 active:bg-gray-alpha-300 focus-visible:focus-ring " +
  "disabled:pointer-events-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4"
