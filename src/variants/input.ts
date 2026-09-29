// El cuerpo de los controles de formulario, y la superficie que lo imita cuando el control es
// compuesto (Combobox, Autocomplete).
//
// El mismo borde, el mismo hover, el mismo foco, el mismo deshabilitado y el mismo inválido
// estaban escritos en ocho lugares —Input, Textarea, OTPField, SelectTrigger, ToolbarInput y la
// superficie de acá—. Subir el contraste del borde de foco, que es exactamente lo que pidió la
// auditoría de accesibilidad, había que hacerlo ocho veces y acertarle a las ocho.

/**
 * La superficie de un control: borde, fondo, texto, transición y hover.
 *
 * No trae alto ni padding: los pone cada control, porque no coinciden —un `<textarea>` crece con
 * el contenido, una casilla de OTP es cuadrada y un input de barra de herramientas mide 28px—.
 *
 * Texto 14, y **17 con el dedo** (`pointer-coarse:text-body-large`): iOS hace zoom al enfocar un
 * campo de menos de 16 px y no vuelve. Lo heredan todos los campos (también el `<input>` de
 * Combobox y Autocomplete, que es `text-inherit`).
 */
export const inputControlClassName =
  "rounded-field border border-transparent bg-fill-1 text-callout pointer-coarse:text-body-large text-label outline-none transition-control"

/**
 * El radio de un campo de más de una línea: Textarea, Combobox con chips.
 *
 * Con el `--radius-field` de iCloud (10) es el mismo radio; el tope de 16 px queda para la app que
 * pise `--radius-field` con una cápsula: una cápsula de tres renglones sería un óvalo.
 */
export const inputMultilineRadiusClassName = "rounded-[min(var(--radius-field),--spacing(4))]"

/**
 * El aire a los costados de un campo de una línea, por tamaño. Sube con el alto.
 *
 * Es una clase plana por tamaño y no `data-[size=sm]:px-3.5`. Con la variante, un `pl-9` del
 * llamador —el lugar para una lupa— perdía: la variante tiene más especificidad, y
 * tailwind-merge no las ve como un conflicto porque no comparten modificador.
 */
export const inputPaddingClassName = { sm: "px-2.5", md: "px-3", lg: "px-3" } as const

/**
 * Los tres altos del sistema, por `data-size`: 28, 36 y 40. Es la escala que comparten campos y
 * botones (revisión visual de R1): el search field de iCloud mide 32–36 y su botón de modal 36, y un
 * campo y un botón en la misma fila tienen que medir lo mismo. El texto es 14 en los tres: iCloud no
 * agranda la letra de un control.
 *
 * Con el dedo (`pointer: coarse`) `sm` y `md` suben a 36 y 44. Un `<input>` no admite `::after`,
 * así que `touch-target` no le sirve: el área de toque tiene que ser el campo mismo.
 */
export const inputSizeClassName =
  "data-[size=sm]:h-7 data-[size=md]:h-9 data-[size=lg]:h-10 " +
  "pointer-coarse:data-[size=sm]:h-9 pointer-coarse:data-[size=md]:h-11"

/**
 * Deshabilitado por `data-disabled`, que es el que pone Base UI —y también un `Fieldset`
 * deshabilitado sobre sus hijos—. El `disabled:` nativo lo agrega aparte el que lo necesite.
 *
 * Opacidad .4 (R4), como todo control de iCloud: el campo apagado es el mismo campo, más tenue.
 */
export const inputDisabledClassName = "data-disabled:cursor-not-allowed data-disabled:opacity-40"

/**
 * Inválido: borde rojo y, al enfocar, el halo rojo.
 *
 * Por `aria-invalid` y por `data-invalid`: el primero lo pone quien lo escribe a mano, el
 * segundo lo pone el `Field` cuando la validación falla. Los dos pasan.
 */
export const inputInvalidClassName =
  "aria-invalid:border-red-800 aria-invalid:focus:focus-border-error data-invalid:border-red-800 data-invalid:focus:focus-border-error"

/**
 * Superficie de Input para controles compuestos (Combobox, Autocomplete): el borde, el foco y los
 * estados van en el contenedor, y el `<input>` de adentro es transparente.
 *
 * El foco y el inválido no pueden salir de las constantes de arriba: acá el `<input>` que recibe
 * el foco es un hijo, así que van por `has-[…]` sobre el contenedor. El resto sí es el mismo.
 */
export const inputShellClassName =
  `flex w-full min-w-0 items-center ${inputControlClassName} ${inputSizeClassName} ${inputDisabledClassName} ` +
  "has-[input:focus]:focus-border " +
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
  "h-full min-w-0 flex-1 bg-transparent px-3 text-inherit outline-none placeholder:text-label-secondary disabled:cursor-not-allowed"

// Botones chicos dentro de la superficie (limpiar, chevron, quitar chip). 20 px con el glifo de 14:
// en un campo `sm` de 24 un botón de 24 lo llenaba de borde a borde.
export const inputShellButtonClassName =
  "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--radius-control)-2px)] text-label-secondary outline-none transition-control " +
  "hover:bg-fill-2 hover:text-label active:bg-fill-3 focus-visible:focus-ring " +
  "disabled:pointer-events-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-3.5"
