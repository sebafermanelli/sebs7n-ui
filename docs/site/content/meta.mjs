// Lo que no se puede leer del TypeScript: a qué grupo pertenece cada componente,
// qué hace en una línea, qué teclas responde, qué garantiza de accesibilidad y
// cuándo usarlo. La tabla de props sale del código (scripts/lib/props.mjs);
// esto es lo que un tipo no dice.
//
// `detallado: true` = página escrita a mano (ejemplos + reglas de uso).
// El resto: demo básica + props generadas.

export const GROUPS = [
  { id: "fundamentos", title: "Fundamentos" },
  { id: "formularios", title: "Formularios" },
  { id: "superposiciones", title: "Superposiciones" },
  { id: "navegacion", title: "Navegación" },
  { id: "contenido", title: "Contenido y datos" },
]

/** Props de Base UI que aparecen en varios componentes: una sola descripción, en español. */
export const PROP_DESCRIPTIONS = {
  className: "Se fusiona con las clases del componente vía `cn()` (tailwind-merge): lo que pongas gana.",
  render: "Reemplaza el elemento que renderiza el componente. Es el `render` de Base UI, no `asChild`.",
  side: "De qué lado del ancla se abre el panel.",
  sideOffset: "Distancia en píxeles entre el ancla y el panel.",
  align: "Cómo se alinea el panel sobre el eje transversal.",
  alignOffset: "Corrimiento en píxeles sobre el eje de alineación.",
  anchor: "Elemento contra el que se posiciona el panel. Por defecto, el trigger.",
  "aria-label": "Nombre accesible del elemento.",
  "aria-keyshortcuts": "Atajo que se anuncia al lector de pantalla.",
  inset: "Alinea el texto con los ítems que tienen ícono, sin poner ícono.",
  labels: "Textos de la interfaz, para traducir o ajustar el tono.",
}

export const COMPONENTS = {
  // ─────────────────────────────── Fundamentos ───────────────────────────────
  button: {
    title: "Button",
    group: "fundamentos",
    detallado: true,
    description: "La acción. Siete variantes, seis tamaños, estado de carga y forma de píldora para marketing.",
    keyboard: [
      ["Enter", "Activa el botón."],
      ["Espacio", "Activa el botón."],
      ["Tab", "Entra y sale. Un botón `disabled` sigue en el orden de tabulación porque Base UI usa `data-disabled`, no el atributo nativo."],
    ],
    a11y: [
      "`loading` pone `aria-busy` y `aria-disabled`, y cancela el `onClick`: el botón se lee como ocupado en vez de desaparecer del foco.",
      "El anillo de foco (`focus-visible:focus-ring`) usa `brand-700` y no se saca nunca.",
      "En `size=\"icon-*\"` hace falta `aria-label`: no hay texto que leer.",
      "El texto sobre `variant=\"accent\"` llega a 4,5:1 en claro y en oscuro; hay un test que lo recalcula desde OKLCH.",
    ],
    usage: [
      "**Un solo acento por pantalla.** `variant=\"accent\"` para la acción principal; el CTA por defecto es el negro (`variant=\"default\"`).",
      "**`shape=\"pill\"` solo en los CTA de un hero o de una sección de marketing.** Nunca en el chrome de una app —nav, tablas, formularios, diálogos—: dos formas de botón en la misma pantalla se leen como un descuido.",
      "**Un link con forma de botón es un `<a>`**: `className={buttonVariants({ variant })}` sobre `<Link>`. No uses `render` para links, que Base UI les pone `role=\"button\"`.",
      "`variant=\"destructive\"` solo cuando la acción borra algo, y siempre detrás de un `AlertDialog`.",
      "`loading` no reemplaza al `disabled` del formulario: deshabilitá también el submit si no querés dobles envíos.",
    ],
    props: {
      Button: {
        loading: "Muestra el spinner encima del contenido y cancela el `onClick`. El ancho no cambia.",
        onClick: "Se ignora mientras `loading` está activo.",
        variant: "`default` (negro) · `accent` (marca) · `outline` · `secondary` · `ghost` · `destructive` · `link`.",
        size: "`sm` 32px · `md` 40px · `lg` 48px, más los tres `icon-*` cuadrados.",
      },
    },
    related: ["badge", "dropdown-menu", "alert-dialog"],
  },
  badge: {
    title: "Badge",
    group: "fundamentos",
    detallado: true,
    description: "Etiqueta de estado: nueve colores en tono suave, dos en sólido, con punto opcional.",
    keyboard: [["—", "No es interactivo. Si tiene que serlo, `render={<button />}` y pasa a comportarse como un botón."]],
    a11y: [
      "Es un `<span>`: no anuncia nada por sí solo. El color no puede ser la única señal — el texto tiene que decir el estado.",
      "`solid` existe solo en `gray` y `brand` porque los 700 de Geist con texto blanco no llegan a 4,5:1 en el resto de los tonos.",
      "El punto (`dot`) es `aria-hidden`: es decoración.",
    ],
    usage: [
      "**Estado, no acción.** Si se puede hacer click, es un `Button` o un `Toggle`.",
      "`subtle` es el default y el que va en una tabla o en una lista. `solid` solo para destacar uno entre muchos.",
      "El color tiene que significar algo consistente en toda la app: `green` pagado, `amber` pendiente, `red` vencido. No lo elijas por estética.",
      "`size=\"sm\"` dentro de una fila de tabla; `md` suelto.",
    ],
    props: {
      Badge: {
        color: "Nueve tonos. Con `variant=\"solid\"` el tipo solo deja `gray` y `brand`.",
        dot: "Agrega un punto del color del badge a la izquierda del texto.",
      },
    },
    related: ["button", "table", "alert", "tag"],
  },
  tag: {
    title: "Tag",
    group: "fundamentos",
    description: "Un dato que puso el usuario y puede sacar: un filtro, una etiqueta, un destinatario.",
    keyboard: [
      ["Tab", "Entra al botón de quitar. El cuerpo del tag no es interactivo."],
      ["Enter · Espacio", "Quita el tag."],
    ],
    a11y: [
      "El botón de quitar siempre tiene nombre accesible: «Quitar Chile», armado con el texto del tag. Si `children` no es texto, pasale `textValue`.",
      "El cuerpo es un `<span>`: lo único enfocable es el botón, así que una lista de diez tags son diez paradas de tabulación, no veinte.",
      "Quitar un tag saca el foco de la página. Devolvelo al contenedor de la lista o al control que los genera, y anunciá el cambio con una región `aria-live` si la lista es lo único que cambió.",
      "El color no puede ser la única señal de nada: el texto del tag es el dato.",
      "Sin `\"use client\"`: sirve en un Server Component (aunque `onRemove` lo pasa, por definición, un componente cliente).",
    ],
    usage: [
      "**Badge informa, Tag es un dato.** El `Badge` cuenta un estado que calculó el sistema y que el usuario no eligió ni puede sacar («Pagada», «Vencida», «Admin»). El `Tag` es algo que el usuario puso —un filtro aplicado, una etiqueta, un destinatario— y por eso se puede quitar. **Si tiene ×, es Tag; si no se puede sacar, es Badge.**",
      "Comparte forma y paleta con `Badge subtle` a propósito: el sistema tiene una sola forma de etiqueta. Lo que cambia es qué significa, no el radio.",
      "Dentro de un `Combobox` múltiple ya está `ComboboxChip`, conectado al estado del combobox: ahí no va `Tag`.",
      "`size=\"sm\"` dentro de una fila de tabla; `md` suelto, arriba de una lista de resultados.",
      "Si la etiqueta además filtra al hacer click en el cuerpo, eso es un `Toggle`, no un Tag con `onClick`.",
    ],
    props: {
      Tag: {
        onRemove: "Qué hacer al quitar. Sin esto no aparece el botón — y sin botón, probablemente sea un `Badge`.",
        removeLabel: "Prefijo del nombre del botón: «Quitar Chile».",
        textValue: "El texto del tag para el nombre del botón, cuando `children` no es texto.",
        color: "Los mismos nueve tonos del Badge.",
      },
    },
    related: ["badge", "combobox", "toggle"],
  },
  avatar: {
    title: "Avatar",
    group: "fundamentos",
    description: "Foto de una persona con iniciales de respaldo cuando la imagen no carga.",
    keyboard: [["—", "No es interactivo."]],
    a11y: [
      "`AvatarImage` necesita `alt`. Si el nombre ya está al lado, `alt=\"\"` para no repetirlo.",
      "El fallback es siempre gris: un color por persona sería una señal que nadie puede interpretar.",
    ],
    usage: ["Las iniciales, dos letras como máximo.", "Dentro de un `UserMenu` ya viene armado: no lo rehagas."],
    related: ["user-menu", "sidebar"],
  },
  kbd: {
    title: "Kbd",
    group: "fundamentos",
    description: "Una tecla o un atajo en línea, en Geist Mono.",
    keyboard: [["—", "Es texto."]],
    a11y: ["Emite `<kbd>`, que es lo que corresponde. No registra ningún atajo: solo lo muestra."],
    usage: [
      "Para anunciar el atajo, `aria-keyshortcuts` va en el control que lo dispara, no en el `Kbd`.",
      "Símbolos de Mac (`⌘`, `⌥`, `⇧`) o nombres (`Ctrl`, `Alt`): elegí uno y mantenelo en toda la app.",
    ],
    related: ["sidebar", "dropdown-menu"],
  },
  separator: {
    title: "Separator",
    group: "fundamentos",
    description: "Una línea de 1px, horizontal o vertical, que agrupa sin decir nada.",
    keyboard: [["—", "No es interactivo."]],
    a11y: [
      "Por defecto Base UI lo emite con `role=\"separator\"` y su orientación.",
      "Si solo separa visualmente y ya hay una estructura semántica alrededor (`<ul>`, `<section>`), conviene `aria-hidden`.",
    ],
    usage: ["Vertical dentro de un `flex` necesita alto: `className=\"h-4\"`.", "Entre ítems de un menú va `DropdownMenuSeparator`, no este."],
    related: ["dropdown-menu", "card"],
  },
  skeleton: {
    title: "Skeleton",
    group: "fundamentos",
    description: "El bloque gris que late mientras carga algo.",
    keyboard: [["—", "No es interactivo."]],
    a11y: [
      "La animación pasa por `motion-reduce`, además del reset global del paquete.",
      "La región que se está cargando debería tener `aria-busy=\"true\"`; el skeleton solo es el relleno visual.",
    ],
    usage: [
      "**Del tamaño de lo que viene.** Un skeleton que no coincide con el contenido final produce un salto peor que un spinner.",
      "Para una carga de menos de ~300 ms, nada: el parpadeo molesta más que la espera.",
    ],
    related: ["card", "table", "spinner"],
  },
  spinner: {
    title: "Spinner",
    group: "fundamentos",
    description: "El indicador de carga: tres tamaños, el color del texto y nombre accesible opcional.",
    keyboard: [["—", "No es interactivo."]],
    a11y: [
      "Sin `label` es decoración (`aria-hidden`): quien anuncia la espera es el contenedor, con `aria-busy`.",
      "Con `label` emite `role=\"status\"` y el lector anuncia el texto al aparecer, sin robar el foco.",
      "Con `prefers-reduced-motion` deja de girar pero **no se esconde**: un spinner que desaparece borra la única señal de que algo está pasando.",
      "Sin `\"use client\"`: sirve en un Server Component.",
    ],
    usage: [
      "**Dentro de un `Button` no lo pongas a mano**: `Button loading` ya usa este mismo Spinner, lo centra y pone `aria-busy`.",
      "Hereda el color del texto (`currentColor`): no tiene prop de color, se pinta con `text-*` del contenedor.",
      "Para una carga que reemplaza contenido que ya tiene forma —una tabla, una card— va `Skeleton`, no un spinner.",
      "Un solo nombre accesible por región: si el spinner está al lado de un texto «Buscando…», el que lleva `label` es uno de los dos.",
    ],
    props: {
      Spinner: {
        size: "`sm` 16px (el del botón) · `md` 20px · `lg` 24px.",
      },
    },
    related: ["button", "skeleton", "empty-state"],
  },
  stat: {
    title: "Stat",
    group: "fundamentos",
    description: "Un KPI: etiqueta, número grande, variación y una línea de contexto.",
    keyboard: [["—", "No es interactivo."]],
    a11y: [
      "La variación se lee junto al número: el `trend` pinta, no informa. Poné el signo en el texto (`+12 %`, `−3 %`).",
      "Sin `\"use client\"`: sirve en un Server Component.",
    ],
    usage: [
      "Dentro de un `Card`, en una grilla de 2 a 4 columnas.",
      "`trend=\"up\"` no siempre es bueno: en «tickets abiertos», subir es malo. Elegí el color por el significado, no por la flecha.",
    ],
    related: ["card", "page-header"],
  },

  // ─────────────────────────────── Formularios ───────────────────────────────
  field: {
    title: "Field",
    group: "formularios",
    detallado: true,
    description: "Un campo: la etiqueta, la ayuda y el error atados al control, sin un solo id escrito a mano.",
    keyboard: [
      ["Tab", "Entra y sale del control. La etiqueta no recibe foco: al clickearla, lo recibe el control."],
    ],
    a11y: [
      "**Esto es lo que resuelve el componente.** La etiqueta nombra al control, la ayuda y el error lo describen, y el error pone `aria-invalid`: todo por anidar las partes, sin `useId`, sin `htmlFor` y sin armar un `aria-describedby` condicional que es justo lo que se olvida.",
      "El asterisco de `required` es `aria-hidden`: nadie escucha \"Razón social asterisco\". Que el campo sea obligatorio lo anuncia el `required` del control.",
      "`FieldError` no ocupa lugar mientras el campo está bien, y cuando aparece ya está referenciado: no hace falta mover el foco para que se lea.",
      "`Input`, `Textarea` y `Select` se enganchan solos. Para cualquier otro control va `FieldControl` con `render`.",
    ],
    usage: [
      "**El `name` es la bisagra con `Form`**: es la clave de los valores del submit y la del objeto `errors` que devuelve el servidor. Para datos anidados se usa punto (`domicilio.calle`), que es lo que devuelve el adaptador de schemas.",
      "**`validationMode=\"onSubmit\"` (el default) casi siempre.** Marcar el email en rojo mientras se escribe es castigar a alguien por no haber terminado. `onBlur` para un dato que recién se puede juzgar completo; `onChange` solo cuando se puede evaluar desde el primer carácter, como el largo de una contraseña.",
      "La ayuda va visible en `FieldDescription`, no en un tooltip: una ayuda que hay que descubrir no ayuda a quien más la necesita.",
      "Un mensaje propio para un motivo puntual se escribe con `match` (`<FieldError match=\"valueMissing\">Falta el email</FieldError>`): habla del dato, no del input.",
      "Validar contra Zod, Valibot o ArkType: `fieldValidator` de `sebs7n-ui/lib/schema`.",
    ],
    props: {
      Field: {
        name: "Identifica al campo en los valores del submit y en el objeto `errors` de `Form`.",
        validate: "Devolvé el mensaje si el valor está mal, o `null` si está bien. Puede ser asíncrona.",
        validationMode: "`onSubmit` (default), `onBlur` u `onChange`. Tiene precedencia sobre el del `Form`.",
      },
      FieldLabel: { required: "Dibuja el asterisco. No hace obligatorio al campo: eso es el `required` del control." },
    },
    related: ["form", "fieldset", "input", "select"],
  },
  fieldset: {
    title: "Fieldset",
    group: "formularios",
    description: "Un grupo de campos con un título común, y un disabled que los apaga a todos.",
    keyboard: [["Tab", "Recorre los campos del grupo en orden. El título no recibe foco."]],
    a11y: [
      "El grupo tiene nombre accesible: es lo que distingue dos campos \"Calle\" en la misma pantalla, uno en \"Domicilio fiscal\" y otro en \"Dirección de entrega\".",
      "El título va con `aria-labelledby` en vez de un `<legend>` nativo, que no se puede ubicar libremente sin pelear con el navegador.",
      "`disabled` en el grupo apaga todos los campos de adentro sin que haya que repetirlo campo por campo.",
    ],
    usage: [
      "Para opciones excluyentes va `RadioGroup`, que ya trae su propia semántica de grupo.",
      "Un formulario de tres campos no necesita un `Fieldset`: agrupar de a uno agrega ruido, no estructura.",
    ],
    related: ["field", "form", "radio-group"],
  },
  form: {
    title: "Form",
    group: "formularios",
    detallado: true,
    description: "Un form nativo que junta los valores por name y reparte los errores del servidor a cada campo.",
    keyboard: [
      ["Enter", "Envía el formulario desde cualquier campo de texto, como cualquier `<form>`."],
      ["Tab", "Recorre los campos y llega al submit."],
    ],
    a11y: [
      "Es un `<form>` de verdad: lo entiende el navegador y sigue funcionando sin JavaScript.",
      "Al fallar la validación, el foco va al primer campo con error en vez de quedarse en el botón.",
      "Cada error aparece en su campo, no en un cartel arriba de todo: quien navega con lector de pantalla lo encuentra donde tiene que arreglarlo.",
    ],
    usage: [
      "**`errors` es para lo que el navegador no puede saber**: que un email ya está usado, que el cupón venció, que el CUIT no existe en AFIP. Se limpia solo cuando el campo cambia.",
      "`onFormSubmit` recibe los valores ya juntados por `name`: no hace falta `FormData` ni un `useState` por campo.",
      "Para validar todo contra un schema está `validate()` de `sebs7n-ui/lib/schema`, que devuelve el valor parseado o los errores con la forma que espera esta prop.",
      "El submit se deshabilita mientras se envía (`<Button loading>`), o el mismo formulario se manda dos veces.",
    ],
    props: {
      Form: {
        errors: "Objeto `{ nombreDelCampo: mensaje }`. Es para los errores que solo conoce el servidor.",
        onFormSubmit: "Recibe los valores juntados por `name`. Ya hace `preventDefault()`.",
        validationMode: "Cuándo se validan los campos que no lo definan por su cuenta.",
      },
    },
    related: ["field", "fieldset", "button"],
  },
  input: {
    title: "Input",
    group: "formularios",
    detallado: true,
    description: "El campo de texto. Tres alturas y el mismo cuerpo que Select, Combobox y Textarea.",
    keyboard: [
      ["Tab", "Entra y sale del campo."],
      ["Escape", "No hace nada por defecto: si limpia el campo, lo implementa la app."],
    ],
    a11y: [
      "**`aria-invalid` es todo lo que hace falta para el error**: el borde rojo y el anillo salen de ahí, no de una clase aparte.",
      "**Adentro de un `Field` no hay nada que cablear**: la etiqueta, la ayuda y el error se atan solos. `Label` con `htmlFor`/`id` a mano queda para un campo suelto fuera de un formulario.",
      "Un `placeholder` no es una etiqueta: desaparece al escribir, justo cuando hace falta recordar qué se estaba llenando.",
      "`focus:focus-border` en vez del anillo: en un campo el borde teñido molesta menos y se ve igual.",
    ],
    usage: [
      "**El tamaño se elige una vez por formulario**, no por campo. `md` (40px) es el de una app; `lg` para un formulario de una sola pregunta.",
      "`type` importa más que el estilo: `email`, `tel`, `url` y `numeric` cambian el teclado del celular.",
      "Un campo obligatorio se marca en la etiqueta (`required` en `FieldLabel` o en `Label`), no con un asterisco pegado al placeholder.",
      "Para un buscador con sugerencias no uses `Input` a mano: `Combobox` o `Autocomplete`.",
    ],
    props: { Input: { size: "`sm` 32px · `md` 40px · `lg` 48px, con el texto un paso más grande." } },
    related: ["field", "label", "textarea", "select", "combobox"],
  },
  textarea: {
    title: "Textarea",
    group: "formularios",
    description: "Texto largo, con el mismo cuerpo y los mismos estados que Input.",
    keyboard: [["Tab", "Entra y sale. Dentro, Tab escribe una tabulación solo si la app lo implementa."]],
    a11y: [
      "Mismo contrato que `Input`: adentro de un `Field` la etiqueta, la ayuda y el error se atan solos; suelta, `Label` asociado y `aria-invalid` a mano.",
      "Renderiza a través de `Field.Control`, no un `<textarea>` suelto: es lo que hace que reciba el `name` del campo y quede nombrada por su etiqueta.",
    ],
    usage: [
      "`rows` define el alto inicial. Para que crezca solo hace falta JS de la app: el paquete no lo trae.",
      "Si el texto tiene formato (markdown, código), decilo en la ayuda debajo del campo.",
    ],
    related: ["input", "label"],
  },
  label: {
    title: "Label",
    group: "formularios",
    description: "La etiqueta de un campo, con la marca de obligatorio incluida.",
    keyboard: [["Click", "Enfoca el campo asociado."]],
    a11y: [
      "`htmlFor` tiene que apuntar al `id` del campo. Sin eso, el click no enfoca y el lector no relaciona nada.",
      "`required` agrega la marca visual; el campo además necesita su propio `required` o `aria-required`.",
    ],
    usage: ["Arriba del campo, no al costado: en un celular al costado no entra.", "El texto de ayuda va debajo del campo, no dentro del label."],
    related: ["input", "textarea", "checkbox"],
  },
  "otp-field": {
    title: "OTPField",
    group: "formularios",
    description: "El código de verificación: una casilla por dígito y un solo valor, con el autorrelleno del SMS.",
    keyboard: [
      ["Tab", "Entra y sale del campo entero. Adentro hay una sola casilla tabulable, la activa."],
      ["0-9", "Escribe en la casilla y salta a la siguiente."],
      ["Backspace", "Borra el dígito y retrocede. Con ⌘/Ctrl borra el código entero."],
      ["Delete", "Borra el dígito sin moverse de casilla."],
      ["← →", "Se mueve entre casillas. Con ⌘/Ctrl va al principio o al final."],
      ["Home / End", "Primera casilla · última casilla escrita."],
      ["⌘V", "Pega el código completo y lo reparte entre las casillas."],
    ],
    a11y: [
      "El contenedor es un `role=\"group\"` nombrado por el `FieldLabel`, y cada casilla hereda ese nombre: se anuncia un campo con nombre, no seis campos de texto anónimos.",
      "Debajo viaja un input oculto con el valor entero: es el que lleva el `name`, el `required` y el largo, así que la validación y el submit hablan del código, no de un dígito.",
      "Solo la casilla activa queda en el orden de tabulación: se entra y se sale con un Tab, no con seis.",
      "`autoComplete=\"one-time-code\"` va en la primera casilla y en el input oculto: es lo que hace que iOS y Android ofrezcan el código del SMS. Pisarlo lo apaga.",
      "El error lo anuncia `FieldError` una sola vez, sobre el grupo. `aria-invalid` aparece cuando la invalidez la declara la app (`<Field invalid>` o un error del servidor); la que calcula el navegador pinta con `data-invalid`.",
    ],
    usage: [
      "**Siempre dentro de un `Field` con `FieldLabel`.** Sin etiqueta, seis casillas son seis cajas sin nombre.",
      "**Seis casillas y `validationType=\"numeric\"`** salvo que el proveedor mande otra cosa: es lo que la gente espera y lo que pone el teclado numérico en el celular.",
      "`onValueComplete` en lugar de un botón «Continuar»: cuando entra el último dígito no queda nada que decidir. Dejá el botón solo si el envío cuesta plata o es irreversible.",
      "`autoSubmit` manda el formulario solo al completarse. Úsalo cuando el error se puede reintentar sin costo; si no, el envío accidental es peor que un click de más.",
      "`mask` tapa los dígitos como una contraseña: casi nunca hace falta. Ver lo que se escribió es justamente lo que evita el segundo intento.",
      "No lo uses para un CUIT, una tarjeta ni un teléfono: esos son un `Input` con `inputMode`, porque se copian, se corrigen al medio y no tienen largo fijo de una cifra por casilla.",
    ],
    props: {
      OTPField: {
        length: "Cuántas casillas. Seis es lo que manda casi todo el mundo por SMS.",
        size: "`sm` 32px · `md` 40px · `lg` 48px, las mismas alturas que `Input`.",
        inputClassName: "Clases de cada casilla, para tocar el ancho o el tipo de letra sin reescribir el componente.",
      },
    },
    related: ["input", "label", "textarea"],
  },
  select: {
    title: "Select",
    group: "formularios",
    detallado: true,
    description: "Elegir uno de una lista corta y cerrada, con el cuerpo de Input y la lista de DropdownMenu.",
    keyboard: [
      ["Enter · Espacio · ↓", "Abre la lista."],
      ["↑ ↓", "Recorre las opciones."],
      ["Escribir", "Salta a la opción que empieza con esas letras."],
      ["Enter", "Elige y cierra."],
      ["Escape", "Cierra y devuelve el foco al trigger."],
    ],
    a11y: [
      "Base UI emite el patrón de listbox completo: `aria-expanded`, `aria-activedescendant` y el recorrido por flechas.",
      "`SelectValue` necesita `placeholder`; sin valor, el trigger queda con `data-placeholder` y el texto en `gray-700`.",
      "El error se marca con `aria-invalid` en el `SelectTrigger`, igual que en `Input`.",
      "El popup vive en un portal con `z-50` y devuelve el foco al trigger al cerrar.",
    ],
    usage: [
      "**Hasta ~8 opciones fijas.** Más que eso, o si el usuario sabe lo que busca, `Combobox`.",
      "Para 2 o 3 opciones excluyentes que entran en pantalla, `RadioGroup` o `ToggleGroup`: se ven todas sin abrir nada.",
      "`alignItemWithTrigger` está en `false` a propósito: el popup se abre debajo, no encima del trigger.",
      "Agrupá con `SelectGroup` + `SelectLabel` cuando las opciones tienen categorías; no uses ítems deshabilitados como títulos.",
    ],
    props: { SelectTrigger: { size: "Mismas tres alturas que `Input`, para que un formulario mixto quede alineado." } },
    related: ["combobox", "dropdown-menu", "radio-group"],
  },
  combobox: {
    title: "Combobox",
    group: "formularios",
    detallado: true,
    description: "Picker con búsqueda: el valor tiene que ser uno de la lista. Simple, múltiple con chips y async.",
    keyboard: [
      ["Escribir", "Filtra la lista y la abre."],
      ["↑ ↓", "Recorre los resultados."],
      ["Enter", "Elige el resaltado."],
      ["Escape", "Cierra; si está cerrado, limpia el texto."],
      ["Backspace", "En modo chips y con el input vacío, borra el último chip."],
    ],
    a11y: [
      "`ComboboxStatus` es una región `aria-live`: con `loading` anuncia «Buscando…» sin robar el foco.",
      "`ComboboxEmpty` sin children dice «Sin resultados»; con `{null}` no muestra nada (para el estado de carga).",
      "Cada chip trae un botón «Quitar …» con nombre accesible propio (`removeLabel`).",
      "El input hereda los estados de `Input`: `aria-invalid`, `disabled` y el mismo `focus-border`.",
    ],
    usage: [
      "**`Combobox` si el valor tiene que ser uno de la lista; `Autocomplete` si se acepta texto libre.** País y cliente van en Combobox; ciudad y dirección, en Autocomplete.",
      "`disabled` va en el root para bloquear todo; en el input solo apaga la superficie.",
      "Para búsqueda contra el servidor: `filter={null}`, buscá en `onInputValueChange` (salteando `reason === \"item-press\"`) y mostrá `<ComboboxStatus loading />` mientras tanto.",
      "Objetos `{ value, label }` andan solos; para otra forma, `itemToStringLabel`.",
    ],
    props: {
      ComboboxInput: {
        showClear: "La cruz de limpiar. Aparece sola cuando hay valor.",
        showTrigger: "El chevron que abre la lista.",
      },
    },
    related: ["autocomplete", "select", "input"],
  },
  autocomplete: {
    title: "Autocomplete",
    group: "formularios",
    description: "Texto libre con sugerencias: el valor es lo que se escribe, esté o no en la lista.",
    keyboard: [
      ["Escribir", "Filtra y abre las sugerencias."],
      ["↑ ↓", "Recorre."],
      ["Enter", "Toma la sugerencia resaltada; si no hay ninguna, se queda el texto escrito."],
      ["Escape", "Cierra sin elegir."],
    ],
    a11y: [
      "Mismas piezas que `Combobox` con prefijo `Autocomplete`, así que hereda `ComboboxStatus`, `ComboboxEmpty` y los estados del input.",
      "`AutocompleteItem` no lleva check: no hay «elegido», hay «sugerido».",
    ],
    usage: [
      "Ciudad, dirección, etiqueta libre. Si el valor tiene que existir en un catálogo, `Combobox`.",
      "`value`/`onValueChange` son strings, no objetos.",
    ],
    related: ["combobox", "input"],
  },
  checkbox: {
    title: "Checkbox",
    group: "formularios",
    description: "Sí o no, o varios de una lista. Con estado indeterminado.",
    keyboard: [["Espacio", "Alterna."], ["Tab", "Entra y sale."]],
    a11y: [
      "Necesita `Label` asociado o `aria-label`: la caja sola no dice nada.",
      "`indeterminate` emite `aria-checked=\"mixed\"`, que es lo que corresponde para un «seleccionar todo» parcial.",
    ],
    usage: [
      "Varias opciones no excluyentes. Una sola opción excluyente con efecto inmediato es un `Switch`.",
      "El checkbox de «seleccionar todo» de una tabla va `indeterminate` cuando hay selección parcial.",
    ],
    related: ["switch", "radio-group", "label"],
  },
  "radio-group": {
    title: "RadioGroup",
    group: "formularios",
    description: "Una opción de pocas, todas visibles.",
    keyboard: [
      ["↑ ↓ ← →", "Se mueve entre opciones y elige al pasar."],
      ["Tab", "Entra al grupo por la opción elegida y sale del grupo entero."],
    ],
    a11y: [
      "El grupo necesita nombre: `aria-labelledby` apuntando al título de la sección, o `aria-label`.",
      "Base UI maneja el foco como un grupo: una sola parada de tabulación para todo.",
    ],
    usage: [
      "De 2 a 5 opciones. Más, `Select`.",
      "Siempre con una opción elegida por defecto, salvo que «ninguna» sea una respuesta válida y explícita.",
    ],
    related: ["checkbox", "select", "toggle-group"],
  },
  switch: {
    title: "Switch",
    group: "formularios",
    description: "Encendido o apagado, con efecto inmediato. Dos tamaños y variante de acento.",
    keyboard: [["Espacio · Enter", "Alterna."], ["Tab", "Entra y sale."]],
    a11y: [
      "Emite `role=\"switch\"` con `aria-checked`: el lector dice «activado/desactivado», no «marcado».",
      "Necesita `Label` asociado. El texto no debe cambiar al alternar («Notificaciones», no «Activar notificaciones»).",
    ],
    usage: [
      "**Efecto inmediato.** Si el cambio se aplica al apretar «Guardar», es un `Checkbox`.",
      "`variant=\"accent\"` cuenta como el único acento de la pantalla: no lo combines con un `Button variant=\"accent\"`.",
    ],
    related: ["checkbox", "toggle"],
  },
  toggle: {
    title: "Toggle",
    group: "formularios",
    description: "Un botón que queda apretado: negrita, filtro activo, vista de lista.",
    keyboard: [["Espacio · Enter", "Alterna."]],
    a11y: [
      "Emite `aria-pressed`. Sin texto (solo ícono) necesita `aria-label`.",
      "El estado se ve por fondo y por `data-pressed`, no solo por color.",
    ],
    usage: ["Si la acción navega o abre algo, es un `Button`.", "Varios toggles relacionados van en un `ToggleGroup`."],
    related: ["toggle-group", "switch", "button"],
  },
  "toggle-group": {
    title: "ToggleGroup",
    group: "formularios",
    description: "Varios Toggle juntos, en modo «uno» o «varios».",
    keyboard: [["← →", "Se mueve entre ítems."], ["Espacio · Enter", "Alterna el ítem."], ["Tab", "Entra y sale del grupo entero."]],
    a11y: [
      "El grupo necesita `aria-label`: «Alineación», «Vista».",
      "En modo único es un `RadioGroup` visualmente distinto; si la lista es larga, usá `RadioGroup` de verdad.",
    ],
    usage: ["Hasta 4 o 5 ítems: es una barra, no un menú.", "Íconos solos únicamente si son universales (alineación, vista); si no, texto."],
    related: ["toggle", "radio-group", "tabs"],
  },

  slider: {
    title: "Slider",
    group: "formularios",
    description: "Elegir un número —o un rango— arrastrando. Marcas opcionales y valor visible.",
    keyboard: [
      ["← ↓", "Baja un `step`."],
      ["→ ↑", "Sube un `step`."],
      ["Shift + flecha", "Se mueve un `largeStep` (10 por defecto)."],
      ["Re Pág · Av Pág", "Igual que Shift + flecha."],
      ["Inicio · Fin", "Va al mínimo y al máximo."],
      ["Tab", "Entra y sale. En un rango, cada thumb es su propia parada."],
    ],
    a11y: [
      "Cada thumb es un `<input type=\"range\">` de verdad: el teclado y los lectores de pantalla lo tratan como el control nativo.",
      "El `label` visible queda asociado a los thumbs por Base UI. Sin `label`, el `aria-label` que pases viaja al input, no solo al grupo.",
      "En un rango, `aria-valuetext` distingue el thumb de inicio del de fin.",
      "El anillo de foco va en el thumb (`has-[input:focus-visible]:focus-ring`), porque el foco real vive en el input de adentro.",
      "Las marcas son `aria-hidden`: el valor lo canta el thumb, no un punto.",
    ],
    usage: [
      "**Si el número exacto importa, es un `Input`.** El slider es para proporciones: volumen, opacidad, un presupuesto «de tanto a tanto».",
      "Con `showValue` el número se lee mientras se arrastra; sin él, el valor solo existe para el lector de pantalla.",
      "`marks` son referencias, no topes: el valor sigue siendo continuo salvo que subas el `step`.",
      "En un rango, `minStepsBetweenValues` evita que los dos thumbs terminen encimados.",
      "`onValueCommitted` para lo caro (pegarle a la API): `onValueChange` dispara en cada píxel del arrastre.",
    ],
    props: {
      Slider: {
        size: "`sm` 32px · `md` 40px de área arrastrable. La pista es 4px y 6px.",
        marks: "Valores donde va un punto de referencia. Siguen a `min` y `max`, no al 0–100 fijo.",
      },
    },
    related: ["input", "switch", "progress"],
  },
  "number-field": {
    title: "NumberField",
    group: "formularios",
    description: "Un número con botones de −/+, topes de verdad y formato por locale. El valor sale como `number`, no como texto.",
    keyboard: [
      ["↑ ↓", "Suben y bajan un `step`."],
      ["Shift + ↑ ↓", "Un `largeStep` (10 por defecto)."],
      ["Alt + ↑ ↓", "Un `smallStep` (0,1 por defecto)."],
      ["Inicio · Fin", "Van al `min` y al `max`, pero solo cuando ese tope está definido."],
      ["Tab", "Una sola parada: el input. Los botones −/+ tienen `tabindex=\"-1\"` a propósito, porque el teclado ya sube y baja con las flechas."],
      ["Re Pág · Av Pág", "No hacen nada: Base UI no las ata. Para saltos grandes está Shift + flecha."],
    ],
    a11y: [
      "El input es `type=\"text\"` con `inputmode=\"numeric\"`, no `type=\"number\"`: así el número formateado («$ 12.500») se puede mostrar sin que el navegador lo rechace, y el teclado del celular sigue siendo el numérico.",
      "`aria-roledescription` se lee «Campo numérico» antes del valor; los botones se anuncian «Aumentar» y «Disminuir». Los tres textos se cambian con `labels`.",
      "Adentro de un `Field`, la etiqueta nombra al input por `aria-labelledby`, sin `htmlFor` ni `id`. Suelto, el `aria-label` que pases viaja al input, no al grupo.",
      "En el tope, el botón queda `disabled` de verdad: no es solo un gris.",
      "El borde rojo sale del `aria-invalid` del input (`has-[input[aria-invalid=true]]`), así que el estado inválido lo maneja el `Field` y no hay que pintarlo a mano.",
    ],
    usage: [
      "**Si el número exacto importa, es este componente y no un `Slider`.** El slider es para proporciones; acá el dato se tipea, se pega y se verifica.",
      "**No uses `<input type=\"number\">`.** El valor sale como string, el navegador acepta «1e5» y «--3», y no hay forma de mostrar moneda sin romper lo que se envía.",
      "`format` y `locale` son los de `Intl.NumberFormat`: cambian lo que se ve, nunca lo que viaja en el submit, que es siempre el número crudo.",
      "Un campo vacío es `null`, no `0`. Distinguir «no cargó nada» de «cargó cero» es casi siempre lo que hace falta.",
      "`min` y `max` son topes reales: los steppers y las flechas clampean. Si querés que se pueda escribir fuera de rango y que valide el navegador, `allowOutOfRange`.",
      "`onValueCommitted` para lo caro (pegarle a la API): `onValueChange` dispara en cada tecla.",
      "No trae zona de arrastre (`ScrubArea`). Es un gesto sin afordancia visible, sin equivalente de teclado y que cambia un dato en silencio: en un formulario es un problema, no una comodidad. Quien la necesite la compone con `@base-ui/react/number-field`.",
    ],
    props: {
      NumberField: {
        size: "`sm` 32px · `md` 40px · `lg` 48px. Los mismos altos que `Input`.",
        className: "Clases de la superficie con borde. Acá va el ancho: `className=\"w-32\"`.",
        inputClassName: "Clases del `<input>`. Por defecto va centrado y con cifras de ancho fijo.",
        labels: "`increment`, `decrement` y `roleDescription`: los tres textos que lee el lector de pantalla.",
        placeholder: "Texto del input vacío. Con `format` casi nunca hace falta: el formato ya dice qué se espera.",
      },
    },
    related: ["input", "slider", "textarea"],
  },
  // ───────────────────────────── Superposiciones ─────────────────────────────
  dialog: {
    title: "Dialog",
    group: "superposiciones",
    detallado: true,
    description: "Una tarea corta encima de la página, sin perder el contexto de atrás.",
    keyboard: [
      ["Enter · Espacio", "Abre desde el trigger."],
      ["Tab · ⇧Tab", "Recorre solo el contenido del diálogo: el foco queda atrapado adentro."],
      ["Escape", "Cierra y devuelve el foco al trigger."],
      ["Click en el fondo", "Cierra."],
    ],
    a11y: [
      "`DialogTitle` no es opcional: es el nombre accesible del diálogo. Si no querés mostrarlo, ocultalo visualmente pero dejalo en el DOM.",
      "`DialogDescription` se asocia con `aria-describedby` y se lee después del título.",
      "El foco entra al abrir y vuelve al trigger al cerrar, y el fondo queda inerte.",
      "El botón X trae su propio nombre accesible; `showCloseButton={false}` obliga a dejar otra salida visible.",
    ],
    usage: [
      "**Los triggers usan `render={<Button … />}`, no `asChild`.**",
      "Para confirmar algo destructivo, `AlertDialog`: no se cierra con click afuera y exige una respuesta.",
      "En mobile, un formulario largo no va en Dialog: va en una página o en un `Sheet`.",
      "El footer va con la acción principal a la derecha y «Cancelar» a su izquierda.",
    ],
    props: { DialogContent: { showCloseButton: "El botón X de la esquina. Si lo sacás, tiene que haber otra salida visible." } },
    related: ["alert-dialog", "sheet", "popover"],
  },
  "alert-dialog": {
    title: "AlertDialog",
    group: "superposiciones",
    description: "Confirmar algo que no se puede deshacer. Exige una respuesta.",
    keyboard: [
      ["Escape", "Cierra (equivale a cancelar)."],
      ["Tab", "Atrapado entre las acciones."],
      ["Click en el fondo", "No cierra: es la diferencia con `Dialog`."],
    ],
    a11y: [
      "Emite `role=\"alertdialog\"`, que el lector anuncia con más urgencia que un diálogo común.",
      "No tiene botón X: la única salida es una de las dos acciones.",
      "El foco arranca en «Cancelar», no en la acción destructiva.",
    ],
    usage: [
      "**`AlertDialogAction` no cierra sola** — a propósito, para poder mostrar `loading` mientras corre la acción. O controlás `open`, o la envolvés: `<AlertDialogClose render={<AlertDialogAction variant=\"destructive\" />}>Eliminar</AlertDialogClose>`.",
      "`AlertDialogCancel` sí cierra sola.",
      "El título es la pregunta («¿Eliminar la factura 0012?»), no «¿Estás seguro?».",
      "El botón dice qué va a pasar («Eliminar»), no «Aceptar».",
    ],
    related: ["dialog", "button"],
  },
  sheet: {
    title: "Sheet",
    group: "superposiciones",
    description: "Un panel que entra desde un borde. Los cuatro lados.",
    keyboard: [["Escape", "Cierra y devuelve el foco."], ["Tab", "Atrapado adentro."], ["Click en el fondo", "Cierra."]],
    a11y: [
      "Mismo contrato que `Dialog`: `SheetTitle` obligatorio, foco atrapado, fondo inerte.",
      "El movimiento de entrada pasa por `motion-reduce`.",
    ],
    usage: [
      "Un formulario largo o una lista de filtros sin perder la tabla de atrás.",
      "`side=\"left\"` es el del menú mobile —lo usa `AppShell`—; para contenido, `right`.",
      "En desktop, más de 640px de ancho es una página, no un panel.",
    ],
    related: ["dialog", "app-shell", "sidebar"],
  },
  popover: {
    title: "Popover",
    group: "superposiciones",
    description: "Una tarjeta anclada a un control, con contenido interactivo.",
    keyboard: [["Enter · Espacio", "Abre."], ["Escape", "Cierra y devuelve el foco al trigger."], ["Tab", "Recorre el contenido y sale."]],
    a11y: [
      "El trigger lleva `aria-expanded` y `aria-controls`, puestos por Base UI.",
      "A diferencia del `Tooltip`, el contenido es alcanzable con el teclado: puede tener inputs y botones.",
    ],
    usage: [
      "Si el contenido es una lista de acciones, es un `DropdownMenu`. Si es solo texto de ayuda, un `Tooltip`.",
      "En mobile un popover ancho se sale de la pantalla: usá `Sheet`.",
    ],
    related: ["dropdown-menu", "tooltip", "dialog"],
  },
  tooltip: {
    title: "Tooltip",
    group: "superposiciones",
    description: "Una línea de texto que aclara un control, en hover y en foco.",
    keyboard: [["Tab", "Enfocar el trigger lo muestra."], ["Escape", "Lo cierra."]],
    a11y: [
      "**No sirve como nombre accesible.** Un botón de ícono necesita `aria-label` igual: en un celular el tooltip no existe.",
      "Aparece con foco de teclado, no solo con mouse.",
      "`TooltipProvider` va una vez en el layout raíz; `delay` por defecto, 300 ms.",
    ],
    usage: [
      "Una línea. Si necesita dos, es un `Popover`.",
      "Nunca contenido interactivo adentro: no se puede llegar con el teclado.",
      "No lo pongas en algo que ya dice lo que hace.",
    ],
    related: ["popover", "button", "kbd"],
  },
  "hover-card": {
    title: "HoverCard",
    group: "superposiciones",
    description: "Una tarjeta con el adelanto de un link, al pasar el mouse. Nunca contenido crítico.",
    keyboard: [
      ["Tab", "Enfocar el link la abre."],
      ["Escape", "Cierra y deja el foco en el link."],
    ],
    a11y: [
      "**En táctil no existe.** No hay hover y un toque navega: todo lo que esté en la tarjeta tiene que estar también del otro lado del link.",
      "El trigger es un `<a>`: se le pasa `href`, no `render={<Button />}`.",
      "Abre también con el foco del teclado, no solo con el mouse.",
      "El retardo de apertura (600 ms) existe para no dispararla al pasar de largo; el de cierre (300 ms) para poder llegar con el mouse.",
    ],
    usage: [
      "**Un adelanto, nunca la información.** Si el contenido es el dato, va en la página.",
      "Si hace falta interactuar con algo, es un `Popover`: abre con click y se cierra con Escape en cualquier dispositivo.",
      "Si es una línea que aclara un control, es un `Tooltip`.",
      "No la cargues: una ficha, no una pantalla.",
    ],
    props: {
      HoverCardTrigger: {
        delay: "Cuánto espera antes de abrir, en ms.",
        closeDelay: "Cuánto espera antes de cerrar, en ms.",
      },
    },
    related: ["popover", "tooltip", "avatar"],
  },
  "dropdown-menu": {
    title: "DropdownMenu",
    group: "superposiciones",
    detallado: true,
    description: "Acciones sobre la página en la que estás. Ítems, checks, radios, submenús y atajos.",
    keyboard: [
      ["Enter · Espacio · ↓", "Abre."],
      ["↑ ↓", "Recorre los ítems."],
      ["→ ←", "Entra y sale de un submenú."],
      ["Escribir", "Salta al ítem que empieza con esas letras."],
      ["Enter", "Ejecuta y cierra."],
      ["Escape", "Cierra y devuelve el foco al trigger."],
    ],
    a11y: [
      "Emite `role=\"menu\"` / `role=\"menuitem\"`, atrapa el foco y se recorre con flechas: el lector anuncia «menú, N elementos».",
      "Los `CheckboxItem` y `RadioItem` emiten `menuitemcheckbox` / `menuitemradio` y no cierran el menú.",
      "`DropdownMenuShortcut` es decorativo: el atajo real lo registra la app.",
    ],
    usage: [
      "**`NavigationMenu` si los ítems navegan, `DropdownMenu` si ejecutan algo.** No es cosmético: el modo de navegación por links de un lector no ve los `menuitem`.",
      "**`DropdownMenuLabel` va dentro de `DropdownMenuGroup`.** Suelto, Base UI tira la página abajo.",
      "El trigger usa `render={<Button … />}`.",
      "`variant=\"destructive\"` para el ítem que borra, y siempre al final, separado.",
      "Más de ~10 ítems: paleta de comandos o `Combobox`, no un menú.",
    ],
    props: {
      DropdownMenuItem: { variant: "`destructive` pinta el ítem en rojo y va último, después de un separador." },
    },
    related: ["navigation-menu", "user-menu", "select", "popover"],
  },
  sonner: {
    title: "Toaster (Sonner)",
    group: "superposiciones",
    detallado: true,
    description: "Los avisos de la esquina. El `Toaster` va una vez en el layout; los mensajes salen de `toast()`.",
    keyboard: [
      ["⌥T / F6", "Enfoca la región de toasts (lo trae Sonner)."],
      ["Tab", "Recorre las acciones del toast enfocado."],
      ["Escape", "Sale de la región."],
    ],
    a11y: [
      "Sonner emite una región `aria-live` con `role=\"status\"`: el mensaje se anuncia sin robar el foco.",
      "El `Toaster` de sebs7n-ui toma el tema de `next-themes` y las superficies del paquete (`bg-background-100`, `shadow-menu`).",
      "Un toast con acción tiene que durar lo suficiente para leerlo y apretarla, o no llevarla.",
    ],
    usage: [
      "**Un toast es para confirmar, no para informar de un error que hay que resolver.** Un error de formulario va al lado del campo.",
      "`<Toaster />` una sola vez, en el layout raíz, dentro del `ThemeProvider`.",
      "`toast.promise()` para una operación con espera: muestra cargando, éxito y error en el mismo toast.",
      "Si el usuario puede perder trabajo, es un `AlertDialog`, no un toast.",
    ],
    related: ["alert", "alert-dialog"],
  },

  // ──────────────────────────────── Navegación ────────────────────────────────
  breadcrumb: {
    title: "Breadcrumb",
    group: "navegacion",
    description: "Dónde estoy en la jerarquía del sitio: `<nav>` + `<ol>`, con el medio colapsable en «…».",
    keyboard: [
      ["Tab", "Recorre los links. El último nivel no es link, así que no entra al orden de tabulación."],
      ["Enter", "Navega."],
    ],
    a11y: [
      "Es un `<nav aria-label=\"Migas de pan\">` con un `<ol>` adentro: el orden de los niveles es información, no estilo.",
      "El separador es un `<li role=\"presentation\" aria-hidden=\"true\">`: el lector lee «Inicio, Clientes, 0012», no «Inicio barra Clientes».",
      "El último nivel lleva `aria-current=\"page\"` y **no** es un link: no se navega a donde ya estás.",
      "El «…» del colapso tiene nombre accesible (`ellipsisLabel`); el carácter en sí es `aria-hidden`.",
      "Sin `\"use client\"`: los `<a>` salen en el HTML del server, que es lo que ve un crawler.",
    ],
    usage: [
      "**Dentro de `PageHeader` va `BreadcrumbList` suelto**, sin `Breadcrumb`: el `<nav>` ya lo pone la prop `breadcrumb`, y dos landmarks anidados confunden.",
      "**Los separadores los pone `BreadcrumbList`**, no el llamador. Para cambiarlos, `separator={<SlashIcon />}`.",
      "**No inventes otro estilo de link**: usa `linkVariants({ variant: \"subtle\" })`, el mismo de cualquier link suelto del sistema.",
      "Con Next, `render={<Link href=\"/clientes\" />}`: sigue siendo un `<a>`, se abre en una pestaña nueva y el crawler lo ve.",
      "De cuatro niveles para arriba, `maxItems={4}`. En mobile un breadcrumb de seis niveles ocupa tres líneas.",
      "No es un reemplazo del botón «Volver» del navegador ni de la navegación principal: es contexto.",
    ],
    props: {
      BreadcrumbList: {
        maxItems: "A partir de cuántos ítems se colapsa el medio. Sin valor, no colapsa nunca.",
        separator: "Reemplaza el chevron. Es decoración: va `aria-hidden`.",
      },
      BreadcrumbLink: {
        render: "El elemento que se renderiza en lugar del `<a>`: `render={<Link href=\"/x\" />}`. Clona el elemento del llamador —no es el `render` de Base UI— así que sigue siendo un `<a>`.",
      },
    },
    related: ["page-header", "navigation-menu", "pagination"],
  },
  pagination: {
    title: "Pagination",
    group: "navegacion",
    description: "Anterior, números con «…» y siguiente. Con links de verdad o con botones.",
    keyboard: [
      ["Tab", "Recorre los controles en el orden visual. Anterior y siguiente siguen tabulables en las puntas."],
      ["Enter", "Va a esa página. En un control sin destino no hace nada."],
    ],
    a11y: [
      "Es un `<nav aria-label=\"Paginación\">` con un `<ul>`: un lector anuncia «navegación, lista, 7 elementos».",
      "Cada número tiene nombre accesible propio («Página 3»), no solo el dígito suelto.",
      "La página actual lleva `aria-current=\"page\"`.",
      "En las puntas, anterior y siguiente usan `aria-disabled` y **no** `disabled`: si se deshabilitaran, el foco se perdería justo después de hacer click. Es la misma decisión que `Button loading`.",
      "El «…» es `role=\"presentation\"` con texto solo para lectores («Más páginas»).",
      "Sin `\"use client\"`: en modo links los `<a>` salen en el HTML del server.",
    ],
    usage: [
      "**Si la página vive en la URL, `render`**: `render={(page) => <Link href={`?page=${page}`} />}`. Son `<a>` de verdad, así que el crawler los ve, se abren en una pestaña nueva y se puede copiar el link.",
      "**`onPageChange` solo para una lista que se pagina sin cambiar de URL.** Si al recargar volvés a la página 1, elegiste mal.",
      "**Qué páginas mostrar es una función pura**: `paginationRange` (`sebs7n-ui/lib/pagination`). Si necesitás el mismo cálculo en otro lado —un resumen «4 de 27»—, llamala, no la copies.",
      "El ancho no salta al cambiar de página: cuando un «…» desaparece, lo reemplaza un número.",
      "Para una lista infinita o un scroll continuo esto no sirve: hace falta saber cuántas páginas hay.",
    ],
    props: {
      Pagination: {
        render: "Modo links: devuelve el elemento de cada página. Clona el elemento del llamador, así que sigue siendo un `<a>`.",
        onPageChange: "Modo botones: se llama con la página destino.",
        siblings: "Cuántas páginas a cada lado de la actual.",
        boundaries: "Cuántas páginas fijas en cada punta.",
      },
    },
    related: ["breadcrumb", "table", "button"],
  },
  "navigation-menu": {
    title: "NavigationMenu",
    group: "navegacion",
    description: "El mega menú de un sitio: un trigger abre un panel donde cada ítem es un link.",
    keyboard: [
      ["Enter · Espacio · ↓", "Abre el panel."],
      ["Tab", "Recorre los links del panel."],
      ["Escape", "Cierra y devuelve el foco al trigger."],
      ["Hover", "También abre, con 50 ms de retardo."],
    ],
    a11y: [
      "Emite `<nav>` + `<ul>` + `<a>`: el modo de navegación por links del lector los encuentra.",
      "El trigger **no** lleva `aria-current`: no es un link. Para marcar la sección está `active`, que solo pinta.",
      "`keepMounted` deja los links en el HTML del server para que los vea un crawler, que nunca abre el menú.",
      "`aria-expanded` y `aria-controls` los pone Base UI; el movimiento pasa por `motion-reduce`.",
    ],
    usage: [
      "**Si los ítems navegan, `NavigationMenu`; si ejecutan algo, `DropdownMenu`.** El menú de idioma y el de usuario son `DropdownMenu`.",
      "`NavigationMenuViewport` va **una sola vez**, hermano de la lista: el panel es uno para todos los ítems.",
      "Adentro de un `<nav>` que ya existe, `render={<div />}` para no anidar dos landmarks.",
    ],
    related: ["dropdown-menu", "sidebar", "tabs"],
  },
  tabs: {
    title: "Tabs",
    group: "navegacion",
    detallado: true,
    description: "Secciones de la misma página que se turnan. Subrayado bajo la activa.",
    keyboard: [
      ["← →", "Se mueve entre tabs y activa al pasar."],
      ["Home · End", "Primera y última."],
      ["Tab", "Sale de la lista al panel: la lista entera es una sola parada."],
    ],
    a11y: [
      "Base UI emite `role=\"tablist\"` / `tab` / `tabpanel` con `aria-selected` y `aria-controls`.",
      "El panel es enfocable (`tabindex=\"0\"`) para poder llegar a su contenido con el teclado.",
      "La tab activa se marca con el subrayado **y** con el color del texto: no depende solo del color.",
    ],
    usage: [
      "**Contenido de la misma página, mismo nivel.** Si cada sección tiene su URL, son links, no tabs.",
      "El contenido de todas las tabs debería costar lo mismo: si una tarda 3 segundos en cargar, poné una página.",
      "3 a 6 tabs. Más, un `Select` o una navegación lateral.",
      "No anides tabs dentro de tabs.",
    ],
    related: ["toggle-group", "navigation-menu"],
  },
  sidebar: {
    title: "Sidebar",
    group: "navegacion",
    detallado: true,
    description: "La navegación lateral de un panel: header, grupos, ítems con ícono y contador, footer y modo colapsado.",
    keyboard: [
      ["Tab", "Recorre los ítems en orden."],
      ["Enter", "Navega."],
      ["⌘B / Ctrl+B", "Colapsa y expande — **lo registra la app**, no el paquete."],
    ],
    a11y: [
      "`SidebarContent` es un `<nav>` con `aria-label=\"Navegación principal\"` por defecto.",
      "`SidebarItem active` pone `aria-current=\"page\"`.",
      "`SidebarItemBadge` acepta `label` para que el contador se lea con contexto: «Clientes, 3 pendientes».",
      "`SidebarSearch shortcut` emite `aria-keyshortcuts`, pero **no registra el atajo**: eso es de la app.",
      "Colapsado, cada ítem muestra su label en un tooltip y conserva el nombre accesible.",
    ],
    usage: [
      "**El paquete no guarda el estado de colapsado.** Guardalo en una cookie y pasá `defaultCollapsed` desde el layout: así el server ya renderiza el ancho correcto y no hay salto.",
      "`SidebarItem` es un `<a>`: con Next, `render={<Link href />}`.",
      "Lo que sea texto del header se oculta con `group-data-collapsed/sidebar:hidden`.",
      "Grupos de 3 a 7 ítems con `SidebarGroupLabel`. Si hay más de ~20 ítems en total, hace falta una paleta de comandos.",
    ],
    props: {
      Sidebar: { collapsed: "Solo íconos, 64px. El ancho cambia sin animación: animarlo hace saltar todo el contenido." },
      SidebarSearch: { shortcut: "Solo muestra el `Kbd` y lo anuncia. Escuchar la tecla es trabajo de la app." },
    },
    related: ["app-shell", "user-menu", "navigation-menu"],
  },
  "app-shell": {
    title: "AppShell",
    group: "navegacion",
    detallado: true,
    description: "El layout de un panel: sidebar sticky desde `lg` y, debajo, una barra de 56px con hamburguesa.",
    keyboard: [
      ["Tab (primera parada)", "«Ir al contenido», el skip link que salta al `<main>`."],
      ["Escape", "Cierra el Sheet mobile."],
    ],
    a11y: [
      "Trae el skip link «Ir al contenido» apuntando al `<main>`: es la primera parada de tabulación de toda la app.",
      "El `<main>` tiene `id` (`mainId`, por defecto `contenido`) y es enfocable por programa.",
      "Al elegir un ítem en el Sheet mobile, se cierra y el foco va al `<main>`.",
      "Los textos son configurables por `labels`, para traducir la app entera.",
    ],
    usage: [
      "**Pasale `pathname={usePathname()}`**: cualquier navegación —un link del contenido, un `router.push`— cierra el Sheet mobile.",
      "**Usá `AppShellContent` como hijo directo**: es el contenedor de página, así todas las pantallas tienen el mismo ancho.",
      "El alto sale de `--app-shell-height` (100dvh). Para embeberlo en una caja: `className=\"[--app-shell-height:720px]\"`.",
      "Para cerrar el Sheet desde un caso propio: `useAppShell().closeMobile({ focusMain: true })`.",
    ],
    props: {
      AppShell: {
        pathname: "La ruta actual. Cuando cambia, el Sheet mobile se cierra.",
        mobileBar: "Contenido de la barra de 56px a la derecha de la hamburguesa.",
        mainId: "`id` del `<main>`; es a donde apunta el skip link.",
      },
    },
    related: ["sidebar", "app-shell-content", "user-menu", "sheet"],
  },
  "app-shell-content": {
    title: "AppShellContent",
    group: "navegacion",
    description: "El contenedor de una página de panel: ancho máximo, márgenes y separación, iguales en toda la app.",
    keyboard: [["—", "No es interactivo."]],
    a11y: ["Sin `\"use client\"`: sirve en un Server Component, así la página no arrastra JS de más."],
    usage: [
      "Hijo directo de `AppShell`, uno por página.",
      "`size=\"wide\"` (1600px) para tablas anchas; `size=\"full\"` sin máximo, para un mapa o un canvas.",
      "No le pongas padding extra: el que trae es el del sistema.",
    ],
    related: ["app-shell", "page-header"],
  },
  "user-menu": {
    title: "UserMenu",
    group: "navegacion",
    description: "El avatar del footer del sidebar con el menú de la cuenta y el selector de tema.",
    keyboard: [["Enter · Espacio", "Abre."], ["↑ ↓", "Recorre."], ["Escape", "Cierra."]],
    a11y: [
      "La fila «Tema» son ítems `menuitemradio`: se recorren con flechas y **no** cierran el menú.",
      "Con el sidebar colapsado muestra solo el avatar, pero conserva el nombre accesible.",
      "`signOut` es un ítem neutral, **no** `variant=\"destructive\"`: cerrar sesión no destruye nada.",
    ],
    usage: [
      "Toma el estado del sidebar solo: no le pases `collapsed` a mano si está dentro de un `Sidebar`.",
      "`showTheme={false}` si la app ya tiene el selector de tema en otro lado.",
    ],
    related: ["dropdown-menu", "sidebar", "theme-switcher", "avatar"],
  },
  "theme-switcher": {
    title: "ThemeSwitcher",
    group: "navegacion",
    description: "Los tres estados del tema —sistema, claro, oscuro— en una barra segmentada.",
    keyboard: [["← →", "Se mueve entre las tres opciones."], ["Enter · Espacio", "Aplica."], ["Tab", "Entra y sale del grupo."]],
    a11y: [
      "Cada opción tiene nombre accesible propio; los textos se cambian con `labels`.",
      "Sin `enableSystem` en el `ThemeProvider` no aparece la opción «Sistema».",
      "Para el mismo control dentro de un menú propio, `ThemeMenuRadio` (ítems `menuitemradio`).",
    ],
    usage: [
      "`ThemeSwitcher` para fuera de un menú: header público, página de ajustes.",
      "`ThemeMenuRadio` dentro de un `DropdownMenu`. `UserMenu` ya lo trae.",
      "Necesita `next-themes` con `attribute=\"class\"` y `suppressHydrationWarning` en `<html>`.",
    ],
    related: ["user-menu", "dropdown-menu", "toggle-group"],
  },

  // ──────────────────────────── Contenido y datos ────────────────────────────
  table: {
    title: "Table",
    group: "contenido",
    detallado: true,
    description: "Una tabla de datos: cabecera con banda, columnas numéricas alineadas a la derecha y densidad compacta.",
    keyboard: [
      ["Tab", "Recorre los controles de las celdas, no las celdas."],
      ["—", "No es una grilla: si necesitás navegar celda por celda con flechas, hace falta una data grid de verdad."],
    ],
    a11y: [
      "Emite `<table>` nativa: el lector anuncia filas y columnas sin ayuda.",
      "`TableCaption` es el nombre de la tabla. Si el título ya está arriba en un `PageHeader`, asocialo con `aria-labelledby`.",
      "`TableHead` con `numeric` alinea a la derecha y usa cifras tabulares: las columnas de plata se comparan de un vistazo.",
      "Una tabla sin `<thead>` no es una tabla: es una lista.",
    ],
    usage: [
      "**Números a la derecha con `numeric`, texto a la izquierda.** Nunca centrado.",
      "`density=\"compact\"` para más de ~20 filas visibles.",
      "En mobile una tabla de más de 3 columnas no entra: o hacés scroll horizontal con la primera columna fija, o cambiás a tarjetas.",
      "Las acciones de fila van en la última columna, en un `DropdownMenu`, no como tres botones sueltos.",
      "El `thead` y el `tfoot` usan `bg-background-200`: es la banda, no la superficie.",
    ],
    props: {
      Table: { density: "`compact` baja el alto de fila. Para listas largas." },
      TableHead: { numeric: "Alinea a la derecha con cifras tabulares." },
      TableCell: { numeric: "Alinea a la derecha con cifras tabulares. Tiene que coincidir con el `TableHead`." },
    },
    related: ["card", "badge", "empty-state", "skeleton"],
  },
  card: {
    title: "Card",
    group: "contenido",
    detallado: true,
    description: "La superficie que agrupa: cabecera, contenido, pie y acción. Dos variantes, dos tamaños, interactiva y seleccionable.",
    keyboard: [
      ["Tab", "Con `interactive` (y `render` sobre un link o un botón), la tarjeta entera es una parada."],
      ["Enter", "Activa la tarjeta interactiva."],
    ],
    a11y: [
      "**Una tarjeta interactiva tiene que ser un `<a>` o un `<button>`.** `interactive` solo agrega los estilos de hover y foco: no la hace clickeable ni enfocable.",
      "Con `selected` hace falta además `aria-pressed` o `aria-checked` según el patrón: el anillo de marca es visual.",
      "`CardTitle` es un `<div>`: si la tarjeta encabeza una sección, poné el heading vos (`render` no aplica acá — usá tu propio `<h3>` adentro).",
    ],
    usage: [
      "**`variant=\"default\"` es la superficie** (borde + `bg-background-100`); **`subtle` es la banda** (`bg-background-200`, sin borde) para una zona hundida.",
      "Una card dentro de otra card es una señal de que falta una tabla o una lista.",
      "`size=\"sm\"` en una grilla de 3 o más columnas; `md` suelta.",
      "`CardAction` se ubica sola arriba a la derecha si está dentro de `CardHeader`.",
    ],
    props: {
      Card: {
        variant: "`default` superficie con borde · `subtle` banda sin borde.",
        interactive: "Estilos de hover, active y foco. No hace la tarjeta clickeable: eso lo hace el elemento.",
        selected: "Borde y anillo de marca.",
      },
    },
    related: ["stat", "table", "empty-state"],
  },
  alert: {
    title: "Alert",
    group: "contenido",
    description: "Un aviso fijo dentro de la página: informativo, éxito, atención o error.",
    keyboard: [["—", "No es interactivo, salvo que le pongas un link o un botón adentro."]],
    a11y: [
      "Un aviso que aparece por algo que hizo el usuario necesita `role=\"status\"` (o `alert` si es urgente): si no, nadie se entera.",
      "El fondo es neutro a propósito: la variante solo cambia la franja izquierda y el ícono, que llega a 3:1.",
      "El ícono es decorativo — el texto tiene que decir de qué se trata sin él.",
    ],
    usage: [
      "**Fijo en la página, para algo que sigue siendo verdad.** Lo que pasa y se va es un toast.",
      "Un error de un campo va al lado del campo, no en un Alert arriba del formulario.",
      "Si hay una acción, que sea una sola y esté adentro.",
    ],
    related: ["sonner", "empty-state", "badge"],
  },
  "empty-state": {
    title: "EmptyState",
    group: "contenido",
    description: "Qué se ve cuando no hay nada: ícono, título, una línea y la acción que lo arregla.",
    keyboard: [["Tab", "Llega a la acción."]],
    a11y: [
      "`titleAs` controla el nivel del heading: dentro de una página con `<h1>`, que sea `h2`.",
      "Es una zona hundida (`bg-background-200`), sin borde ni sombra.",
      "Sin `\"use client\"`: sirve en un Server Component.",
    ],
    usage: [
      "**Distinguí los tres vacíos**: todavía no hay nada (con acción), el filtro no encontró nada (con «limpiar filtros») y hubo un error (con «reintentar»). No son el mismo texto.",
      "El título dice qué falta, no «Sin resultados».",
      "Una sola acción.",
    ],
    related: ["alert", "card", "table"],
  },
  progress: {
    title: "Progress",
    group: "contenido",
    description: "Cuánto falta para que termine algo. Determinada o indeterminada, en dos altos.",
    keyboard: [["—", "No es interactivo."]],
    a11y: [
      "Emite `role=\"progressbar\"` con `aria-valuenow`, `aria-valuemin` y `aria-valuemax`.",
      "Con `value={null}` es indeterminada: desaparece `aria-valuenow` y el lector anuncia que está en curso, sin porcentaje.",
      "El `label` visible es el nombre accesible. Sin `label` hace falta `aria-label`.",
      "Con movimiento reducido la franja indeterminada no queda congelada a mitad de camino: la pista se llena de un gris más apagado.",
    ],
    usage: [
      "**Si sabés cuánto falta, pasá el número.** La indeterminada es para cuando no se puede saber.",
      "La forma de algo que todavía no llegó es un `Skeleton`; el spinner de una acción es `Button loading`.",
      "Poné `label` o `aria-label`: una barra sin nombre no dice qué está progresando.",
      "`size=\"sm\"` dentro de una fila o una card chica; `md` suelto.",
    ],
    props: {
      Progress: {
        value: "El valor actual. `null` la deja indeterminada.",
        size: "`sm` 4px · `md` 6px de alto de la pista.",
        showValue: "Muestra el porcentaje a la derecha. Indeterminada no muestra número.",
      },
    },
    related: ["skeleton", "slider", "button"],
  },
  collapsible: {
    title: "Collapsible",
    group: "contenido",
    description: "Mostrar y ocultar un bloque con un botón. La pieza simple detrás del Accordion.",
    keyboard: [
      ["Enter · Espacio", "Abre y cierra."],
      ["Tab", "Entra y sale del trigger."],
    ],
    a11y: [
      "El trigger lleva `aria-expanded` y `aria-controls`, puestos por Base UI.",
      "El contenido cerrado no está en el DOM salvo `keepMounted`; con `hiddenUntilFound` queda y lo encuentra el buscador del navegador.",
      "El alto pasa por `motion-reduce`, además del reset global del paquete.",
    ],
    usage: [
      "**Si hay varias secciones que son un grupo, es un `Accordion`**: trae el `<h3>` por sección.",
      "El trigger no trae estilo a propósito: va `render={<Button variant=\"ghost\" />}`.",
      "`className` cae en el contenido, no en el elemento que anima el alto: ahí va el padding.",
      "Lo que está plegado no se lee ni se indexa: `keepMounted` si esos links importan para el crawler.",
    ],
    related: ["accordion", "card", "button"],
  },
  accordion: {
    title: "Accordion",
    group: "contenido",
    description: "Secciones plegables que se leen como una lista. Una sola abierta, o varias.",
    keyboard: [
      ["Enter · Espacio", "Abre y cierra la sección enfocada."],
      ["Tab", "Cada trigger es su propia parada: desde Base UI 1.8 no hay foco rotativo, siguiendo la corrección de la APG."],
    ],
    a11y: [
      "Cada trigger va dentro de un `<h3>`: eso es lo que deja saltar de sección en sección con un lector de pantalla.",
      "`aria-expanded` y `aria-controls` los pone Base UI; el panel es un `role=\"region\"` con el nombre del trigger.",
      "El alto y el chevron pasan por `motion-reduce`, además del reset global del paquete.",
      "`hiddenUntilFound` deja que el buscador del navegador (⌘F) encuentre y abra el contenido cerrado.",
    ],
    usage: [
      "**Una sola sección plegable es un `Collapsible`.** El `Accordion` existe para el grupo.",
      "Por defecto se abre una a la vez. `multiple` solo si comparar dos secciones es parte del uso.",
      "El trigger dice de qué es la sección, no «Ver más».",
      "No escondas ahí lo que la pantalla tiene que mostrar: lo plegado no se lee.",
      "Si las secciones son excluyentes y cortas, probablemente sean `Tabs`.",
    ],
    props: {
      Accordion: {
        multiple: "Deja varias secciones abiertas a la vez.",
      },
      AccordionTrigger: {
        chevron: "Saca el chevron para poner otro indicador.",
      },
    },
    related: ["collapsible", "tabs", "card"],
  },
  "scroll-area": {
    title: "ScrollArea",
    group: "contenido",
    description: "Una caja con scroll y una barra propia, discreta: aparece al pasar el mouse o al scrollear.",
    keyboard: [
      ["Tab", "Llega al viewport cuando hay desborde."],
      ["↑ ↓ ← →", "Scrollean, como en cualquier caja con overflow."],
      ["Re Pág · Av Pág · Inicio · Fin", "Saltan de a una pantalla o a los extremos."],
    ],
    a11y: [
      "Adentro hay un `div` con `overflow` nativo: la rueda, el trackpad y el arrastre táctil funcionan como siempre. Lo único que cambia es que se oculta la barra del sistema.",
      "Base UI le pone `tabIndex={0}` al viewport cuando hay desborde, así que se llega con Tab y se scrollea con las flechas. Por eso el foco es visible.",
      "En táctil la barra propia no se muestra: ahí la nativa ya es un overlay que aparece y se va.",
      "`overscroll-contain` evita que el scroll se escape a la página al llegar al final.",
    ],
    usage: [
      "**No para la página entera.** El scroll del documento es del navegador; esto es para una caja: una lista dentro de un panel, un log, una tabla ancha.",
      "La caja necesita un alto (o un ancho) propio: sin límite no hay desborde y no hay nada que scrollear.",
      "El padding va en `contentClassName`, no en el viewport: si no, el contenido se corta contra la barra.",
      "`orientation=\"both\"` solo cuando de verdad desborda en los dos ejes; si no, sobra una barra.",
    ],
    props: {
      ScrollArea: {
        orientation: "`vertical` (default) · `horizontal` · `both`, que agrega la esquina.",
        contentClassName: "Clases del contenido, dentro del viewport. Ahí va el padding.",
        viewportClassName: "Clases del viewport: el elemento que scrollea y recibe el foco.",
      },
    },
    related: ["table", "card", "sidebar"],
  },
  "page-header": {
    title: "PageHeader",
    group: "contenido",
    description: "El encabezado de una pantalla: migas, título, bajada y acciones.",
    keyboard: [["Tab", "Migas primero, después las acciones."]],
    a11y: [
      "`PageHeaderTitle` es el `<h1>` de la página: uno solo por pantalla.",
      "`breadcrumb` emite un `<nav>` con su propio `aria-label` (configurable con `breadcrumbLabel`).",
      "Sin `\"use client\"`: sirve en un Server Component.",
    ],
    usage: [
      "Primer hijo de `AppShellContent`.",
      "Hasta dos acciones: la principal y una secundaria. El resto, en un `DropdownMenu`.",
      "La bajada es una línea que explica la pantalla, no una descripción de marketing.",
    ],
    related: ["app-shell-content", "stat", "button"],
  },
}

export const SLUGS = Object.keys(COMPONENTS).sort()
