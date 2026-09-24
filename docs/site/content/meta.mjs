// Lo que no se puede leer del TypeScript: a qué grupo pertenece cada componente,
// qué hace en una línea, qué teclas responde, qué garantiza de accesibilidad y
// cuándo usarlo. La tabla de props sale del código (scripts/lib/props.mjs);
// esto es lo que un tipo no dice.
//
// `detallado: true` = página escrita a mano (ejemplos + reglas de uso).
// El resto: demo básica + props generadas.
//
// `related` es **direccional**, no un grafo simétrico: es «estando acá, a dónde te
// puede convenir ir», y eso no vale igual para los dos lados. `Spinner` manda a
// `Button` porque el caso real es poner un spinner adentro de un botón; `Button` no
// manda a `Spinner` porque quien llega a la página del botón no está buscando eso.
// Lo mismo con `Form → Button`, `Pagination → Button` o `Kbd → DropdownMenu`: hacer
// recíprocos los 63 pares que hoy no lo son convertiría la sección «Relacionados» de
// los componentes más genéricos en un índice del sitio, que ya existe y está arriba.
// Lo que sí se verifica es que todo slug de `related` exista: eso está en
// `test/generado.test.ts`.

export const GROUPS = [
  { id: "fundamentos", title: "Fundamentos" },
  { id: "formularios", title: "Formularios" },
  { id: "superposiciones", title: "Superposiciones" },
  { id: "navegacion", title: "Navegación" },
  { id: "contenido", title: "Contenido y datos" },
]

/**
 * Props de Base UI que aparecen en varios componentes: una sola descripción, en español.
 *
 * Es un **fallback**: la descripción de `meta.props` y el JSDoc del propio `src/` le ganan,
 * en ese orden. Una entrada acá no hace que la prop aparezca en la tabla — para volcar una
 * prop heredada hay que nombrarla en `props` del componente, que es lo que hace `heredadas()`.
 */
export const PROP_DESCRIPTIONS = {
  className: "Se fusiona con las clases del componente vía `cn()` (tailwind-merge): lo que pongas gana.",
  render: "Reemplaza el elemento que renderiza el componente. Es el `render` de Base UI, no `asChild`.",
  side: "De qué lado del ancla se abre el panel.",
  sideOffset: "Distancia en píxeles entre el ancla y el panel.",
  align: "Cómo se alinea el panel sobre el eje transversal.",
  alignOffset: "Corrimiento en píxeles sobre el eje de alineación.",
  anchor: "Elemento contra el que se posiciona el panel. Por defecto, el trigger.",
  collisionPadding: "Margen en píxeles que se deja contra el borde de la ventana antes de dar vuelta el panel.",
  container: "Dónde se monta el portal. Por defecto, el `<body>`.",
  "aria-label": "Nombre accesible del elemento.",
  "aria-keyshortcuts": "Atajo que se anuncia al lector de pantalla.",
  inset: "Alinea el texto con los ítems que tienen ícono, sin poner ícono.",
  labels: "Textos de la interfaz, para traducir o ajustar el tono.",

  // ── Apertura y cierre ──────────────────────────────────────────────────────
  open: "Si está abierto. Pasarla lo vuelve controlado: sin `onOpenChange` ya no se cierra solo.",
  defaultOpen: "Si arranca abierto. Es la versión no controlada de `open`.",
  onOpenChange: "Se llama con el estado nuevo cada vez que se abre o se cierra.",
  modal: "Con `true`, mientras está abierto el resto de la página no recibe clicks ni foco.",
  actionsRef: "Ref con las acciones imperativas de Base UI (`unmount()`), para desmontarlo sin esperar la animación de salida.",
  keepMounted: "Deja el contenido en el DOM mientras está cerrado, en vez de desmontarlo. Cuesta peso; sirve para que un crawler lo vea.",
  initialFocus: "Qué recibe el foco al abrir. Por defecto, el primer elemento tabulable de adentro.",
  finalFocus: "Qué recibe el foco al cerrar. Por defecto, lo que lo abrió.",
  openOnHover: "Si abre al pasar el puntero, sin click.",
  delay: "Milisegundos que hay que quedarse encima antes de que abra.",
  closeDelay: "Milisegundos que espera antes de cerrar cuando el puntero se va.",
  trackCursorAxis: "Sobre qué eje sigue al puntero mientras se mueve por el trigger.",

  // ── Valor ──────────────────────────────────────────────────────────────────
  value: "El valor actual. Pasarlo lo vuelve controlado; para dejarlo libre, `defaultValue`.",
  defaultValue: "El valor inicial. Es la versión no controlada de `value`.",
  onValueChange: "Se llama con el valor nuevo cada vez que cambia.",
  multiple: "Deja elegir más de uno: el valor pasa a ser un array.",
  filter: "Cómo se comparan los ítems con lo tipeado. Por defecto, sin distinguir mayúsculas ni acentos.",
  items: "Las opciones de la lista. Es lo que le permite al componente mostrar la etiqueta en vez del valor crudo.",
  checked: "Si está marcado. Pasarlo lo vuelve controlado; para dejarlo libre, `defaultChecked`.",
  defaultChecked: "Si arranca marcado. Es la versión no controlada de `checked`.",
  onCheckedChange: "Se llama con el estado nuevo cada vez que se marca o se desmarca.",

  // ── Formulario ─────────────────────────────────────────────────────────────
  name: "El nombre con el que el valor viaja en el submit y en el objeto `errors` de `Form`.",
  required: "Marca el campo como obligatorio para la validación nativa.",
  readOnly: "Se lee y se enfoca, pero no se cambia. No es lo mismo que `disabled`, que además lo saca del foco.",
  disabled: "Apaga la interacción y lo marca con `data-disabled`, que es el atributo del que cuelgan los estilos de apagado.",
  nativeButton: "Si el elemento que se renderiza es un `<button>` de verdad. Ponelo en `false` si lo reemplazás por un `<a>` o un `<div>`.",

  // ── Navegación por teclado ─────────────────────────────────────────────────
  orientation: "`horizontal` (default) o `vertical`. Define qué flechas mueven el foco.",
  loopFocus: "Si al pasar del último elemento el foco vuelve al primero.",
}

/**
 * Vuelca props heredadas de Base UI a la tabla, con el texto compartido de `PROP_DESCRIPTIONS`.
 *
 * El generador solo muestra una prop heredada si `meta.props` la nombra; el diccionario solo
 * pone el texto. Sin esto, un `<Dialog>` salía con **cero** props documentadas —ni `open`, ni
 * `onOpenChange`, ni `modal`—, que son justo las que alguien viene a buscar a esa página.
 */
function heredadas(...names) {
  return Object.fromEntries(
    names.map((name) => {
      if (!PROP_DESCRIPTIONS[name]) throw new Error(`PROP_DESCRIPTIONS no describe "${name}"`)
      return [name, PROP_DESCRIPTIONS[name]]
    })
  )
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
      ["Tab", "Entra y sale. Un botón `disabled` **sale** del orden de tabulación: Base UI le pone el atributo nativo `disabled` además del `data-disabled` del que cuelgan los estilos. Si necesitás que se pueda leer por qué está apagado, no lo deshabilites — `aria-disabled` y un `onClick` que no hace nada, o el `focusableWhenDisabled` de `ToolbarButton`."],
    ],
    a11y: [
      "`loading` pone `aria-busy` y `aria-disabled`, y cancela el `onClick`: el botón se lee como ocupado en vez de desaparecer del foco.",
      "El anillo de foco (`focus-visible:focus-ring`) usa `brand-700` y no se saca nunca.",
      "En `size=\"icon-*\"` **el tipo exige** `aria-label` o `aria-labelledby`: no hay texto que leer, y un botón de ícono sin nombre se anuncia «botón» a secas. Si el nombre ya está en los hijos (un `sr-only`, el número de un día) o lo pone un envoltorio (`<DropdownMenuTrigger aria-label=\"Menú\" render={<Button size=\"icon-sm\" />} />`), escribilo igual en el `aria-label` del `Button`: es el que termina en el DOM.",
      "El texto sobre `variant=\"accent\"` llega a 4,5:1 en claro y en oscuro; hay un test que lo recalcula desde OKLCH.",
    ],
    usage: [
      "**Un solo acento por pantalla.** `variant=\"accent\"` para la acción principal; el CTA por defecto es el negro (`variant=\"default\"`).",
      "**`shape=\"pill\"` solo en los CTA de un hero o de una sección de marketing.** Nunca en el chrome de una app —nav, tablas, formularios, diálogos—: dos formas de botón en la misma pantalla se leen como un descuido.",
      "**Un link con forma de botón es un `<a>`**: `className={buttonVariants({ variant })}` sobre `<Link>`. No uses `render` para links: con el `nativeButton` que trae el `Button` por defecto, Base UI le pone `type=\"button\"` al `<a>` y avisa por consola en desarrollo.",
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
      "Sin `\"use client\"`: sirve en un Server Component. Una tabla de facturas renderizada en el server no arrastra JS por tener un estado por fila.",
    ],
    usage: [
      "**Estado, no acción.** Si se puede hacer click, es un `Button` o un `Toggle`.",
      "`subtle` es el default y el que va en una tabla o en una lista. `solid` solo para destacar uno entre muchos.",
      "El color tiene que significar algo consistente en toda la app: `green` pagado, `amber` pendiente, `red` vencido. No lo elijas por estética.",
      "`size=\"sm\"` dentro de una fila de tabla; `md` suelto.",
    ],
    props: {
      Badge: {
        variant: "`subtle` (fondo tenue, los nueve tonos) · `solid` (fondo lleno, solo `gray` y `brand`).",
        size: "`sm` 20px · `md` 24px de alto. El texto es `label-12` en los dos.",
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
        size: "Las dos alturas del `Badge`: `sm` 20px · `md` 24px.",
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
      "`AvatarImage` **exige `alt` en el tipo**, incluso vacío. Sin `alt` el lector lee la URL del archivo letra por letra; con `alt=\"\"` la foto sale del árbol y la nombra el contexto, que es lo correcto cuando el nombre de la persona ya está al lado. Las dos decisiones son válidas; no haber decidido, no.",
      "El fallback es siempre gris: un color por persona sería una señal que nadie puede interpretar.",
    ],
    usage: ["Las iniciales, dos letras como máximo.", "Dentro de un `UserMenu` ya viene armado: no lo rehagas."],
    props: {
      Avatar: { size: "`sm` 24px · `md` 32px · `lg` 40px." },
    },
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
      "Sale con `role=\"separator\"` y su orientación en `aria-orientation`.",
      "Sin `\"use client\"`: sirve en un Server Component. Por eso es un `<div>` propio y no el primitivo de Base UI, que trae su `'use client'`.",
      "Si solo separa visualmente y ya hay una estructura semántica alrededor (`<ul>`, `<section>`), conviene `aria-hidden`.",
    ],
    usage: ["Vertical dentro de un `flex` ya se estira solo (`self-stretch`): el que necesita alto es el contenedor. Poné `h-4` únicamente si querés una línea **más corta** que la fila.", "Entre ítems de un menú va `DropdownMenuSeparator`, no este."],
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
    props: {
      Stat: {
        label: "Qué se mide («Ingresos del mes»). Va arriba del número, en `label-13`.",
        value: "El número grande. Sale en `heading-24` con cifras tabulares, así una fila de KPIs queda alineada.",
      },
    },
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
      "**Escribí siempre el mensaje, con `match` o con `validate`.** El del navegador sale en el idioma del navegador y no en el de la página: con Chrome en inglés, abajo de «Razón social» aparece «Please fill out this field». `match=\"valueMissing\"` y compañía además hablan del dato —«Falta la razón social»— en vez del input.",
      "El mensaje se lee al enfocar el campo, porque el campo lo referencia con `aria-describedby`. Con `validationMode=\"onChange\"` eso no alcanza: el error aparece con el foco ya adentro y nada lo anuncia. Para ese caso está `alert`, que le pone `role=\"alert\"`. Es opt-in porque `role=\"alert\"` interrumpe: en el camino de enviar duplicaría el anuncio y cortaría el del nombre del campo, que es la mitad que da contexto.",
      "`Input`, `Textarea` y `Select` se enganchan solos. Para cualquier otro control va `FieldControl` con `render`.",
      "**Un control propio se engancha solo si reenvía lo que recibe.** `FieldControl` le pasa `id`, `name`, `aria-describedby`, `aria-invalid` y una `ref`; un componente que declara `id` y `name` como props propias y no hace spread del resto se queda sin nada, y la etiqueta del campo apunta al vacío. Pasa seguido con un date picker o un autocomplete hechos con un `<input type=\"hidden\">` más un botón: el arreglo va adentro de ese componente, no en cada uso.",
    ],
    usage: [
      "**El `name` es la bisagra con `Form`**: es la clave de los valores del submit y la del objeto `errors` que devuelve el servidor. Para datos anidados se usa punto (`domicilio.calle`), que es lo que devuelve el adaptador de schemas.",
      "**`validationMode=\"onSubmit\"` (el default) casi siempre.** Marcar el email en rojo mientras se escribe es castigar a alguien por no haber terminado. `onBlur` para un dato que recién se puede juzgar completo; `onChange` solo cuando se puede evaluar desde el primer carácter, como el largo de una contraseña.",
      "La ayuda va visible en `FieldDescription`, no en un tooltip: una ayuda que hay que descubrir no ayuda a quien más la necesita.",
      "Un mensaje propio para un motivo puntual se escribe con `match` (`<FieldError match=\"valueMissing\">Falta el email</FieldError>`): habla del dato, no del input.",
      "Validar contra Zod, Valibot o ArkType: `fieldValidator` de `sebs7n-ui/lib/schema`.",
      "**`FieldError` es una fuente o la otra, no las dos.** Sin `match` se muestra ante *cualquier* invalidez —la del navegador y la que vino del servidor—, así que puesto al lado de uno con `match` imprime el mensaje dos veces. Si escribís mensajes propios con `match`, renderizá el genérico solo cuando el servidor devolvió algo para ese campo.",
      "Un mensaje propio por `match` no es adorno: el del navegador sale en el idioma del navegador, no en el de la página, y habla del input (\"complete este campo\") en vez del dato que se pide.",
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
      "**El error del grupo no va en el `Fieldset`.** No tiene parte de error a propósito: un `<fieldset>` no lleva un mensaje que el lector de pantalla anuncie —lo que anuncia al entrar es la leyenda—, así que sería un cartel rojo que media pantalla nunca escucha.",
      "**Cuando el error es de un conjunto de opciones (\"tildá al menos un archivo\"), ese conjunto es un campo**: un `Field` con `name` alrededor de un `CheckboxGroup`, y el `FieldError` adentro. Ahí sí queda atado al `role=\"group\"` por `aria-describedby`, entra en el `errors` de `Form` por su `name` y se limpia solo al tildar. El `Fieldset` sigue siendo el que agrupa, si hace falta.",
      "Un error que cruza campos que siguen siendo distintos (\"el domicilio no existe\", sobre calle + localidad) va en el campo que se puede corregir, o arriba del formulario en un `Alert`.",
    ],
    related: ["field", "checkbox-group", "form"],
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
      "**Escribí siempre el mensaje del error, con `match` o con `validate`.** El del navegador sale en el idioma del navegador, no en el de la página: un formulario en español puede terminar diciendo «Please fill out this field». Es el error más fácil de no ver, porque en la máquina de quien lo programó el navegador está en español.",
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
    props: {
      Label: {
        required: "Agrega el asterisco rojo, que es `aria-hidden`: la señal para el lector la da el `required` del campo, no esta prop.",
      },
    },
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
      "Base UI emite el patrón de listbox completo: `aria-haspopup=\"listbox\"` y `aria-expanded` en el trigger, `role=\"listbox\"` en la lista y `role=\"option\"` en cada ítem. El foco real se mueve al ítem resaltado: no hay `aria-activedescendant`, que es el mecanismo del `Combobox`.",
      "`SelectValue` necesita `placeholder`; sin valor, el trigger queda con `data-placeholder` y el texto en `gray-900`, que es el gris tenue que sí llega a AA.",
      "**El `Select` raíz necesita `items`.** Sin eso, `SelectValue` muestra —y el lector de pantalla anuncia— el `value` crudo: elegís «Consumidor final» y el trigger dice `cf`. Es el caso de la demo de abajo, y pasa siempre que el `value` no sea ya el texto que se lee.",
      "El error se marca con `aria-invalid` en el `SelectTrigger`, igual que en `Input`.",
      "El popup vive en un portal con `z-50` y devuelve el foco al trigger al cerrar.",
    ],
    usage: [
      "**Hasta ~8 opciones fijas.** Más que eso, o si el usuario sabe lo que busca, `Combobox`.",
      "Para 2 o 3 opciones excluyentes que entran en pantalla, `RadioGroup` o `ToggleGroup`: se ven todas sin abrir nada.",
      "`alignItemWithTrigger` está en `false` a propósito: el popup se abre debajo, no encima del trigger.",
      "Agrupá con `SelectGroup` + `SelectLabel` cuando las opciones tienen categorías; no uses ítems deshabilitados como títulos.",
      "**Pasale `items` al `Select` raíz** con el mismo mapa `value → label` que usan los `SelectItem`: es lo que le permite a `SelectValue` mostrar la etiqueta en vez del valor. La alternativa es `<SelectValue>{(value) => …}</SelectValue>`, que sirve para formatear, pero duplica el mapa.",
    ],
    props: {
      Select: {
        items:
          "El mapa `value → label` de las opciones. **Ponelo siempre**: sin él `SelectValue` muestra el `value` crudo. Acepta `{ ri: \"Responsable inscripto\" }` o `[{ value, label }]`.",
        ...heredadas("value", "defaultValue", "onValueChange", "multiple", "open", "defaultOpen", "onOpenChange", "modal", "name", "required", "disabled"),
      },
      SelectTrigger: { size: "Mismas tres alturas que `Input`, para que un formulario mixto quede alineado." },
      SelectContent: {
        alignItemWithTrigger:
          "Con `true` el popup se abre **encima** del trigger, con la opción elegida sobre él (el comportamiento nativo de macOS). Acá está en `false`: la lista baja, que es lo que hace el resto de los menús del sistema.",
      },
    },
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
      "**El filtrado es en memoria y en cada tecla, sin debounce.** Con una lista local es lo correcto: esperar se nota. Para búsqueda contra el servidor el debounce lo pone la app, en su `onInputValueChange`; el componente no lo hace por vos.",
    ],
    props: {
      Combobox: {
        ...heredadas(
          "items",
          "value",
          "defaultValue",
          "onValueChange",
          "multiple",
          "filter",
          "open",
          "defaultOpen",
          "onOpenChange",
          "modal",
          "name",
          "required",
          "readOnly",
          "disabled"
        ),
        items: "Los objetos de la lista. Con `{ value, label }` anda solo; para otra forma, `itemToStringLabel`.",
        filter: "Cómo se comparan los ítems con lo tipeado. Con `null` no filtra nada: es lo que va cuando busca el servidor.",
        disabled: "En el root apaga todo el combobox. En el input solo apaga la superficie, y la lista sigue viva.",
      },
      ComboboxInput: {
        size: "Mismas tres alturas que `Input`: `sm` 32px · `md` 40px · `lg` 48px.",
        showClear: "La cruz de limpiar. Aparece sola cuando hay valor.",
        showTrigger: "El chevron que abre la lista.",
        disabled: "Apaga el input y la superficie que lo rodea. Para bloquear todo el combobox, ponelo en el root.",
      },
      ComboboxChips: {
        size: "Mismas tres alturas que `Input`, aunque con varios chips la superficie crece hacia abajo.",
        showClear: "La cruz que borra todos los chips de una.",
        showTrigger: "El chevron que abre la lista.",
        disabled: "Apaga la superficie, el input y los botones de quitar de cada chip.",
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
      "**El filtrado es en memoria y en cada tecla, sin debounce**, igual que en `Combobox`. Si las sugerencias vienen del servidor, el debounce lo pone la app.",
    ],
    props: {
      Autocomplete: {
        ...heredadas("items", "value", "defaultValue", "onValueChange", "open", "defaultOpen", "onOpenChange", "modal", "name", "required", "readOnly", "disabled"),
        value: "El texto del input, siempre un string: acá el valor es lo que se escribió, no un ítem de la lista.",
        filter: "Cómo se comparan las sugerencias con lo tipeado. Con `null` no filtra: es lo que va cuando busca el servidor.",
      },
      AutocompleteInput: {
        size: "Mismas tres alturas que `Input`: `sm` 32px · `md` 40px · `lg` 48px.",
        groupClassName: "Clases de la superficie con borde que envuelve al input y a sus botones. Acá va el ancho.",
        showClear: "La cruz de limpiar. Aparece sola cuando hay texto.",
        disabled: "Apaga el input y la superficie que lo rodea. Para bloquear todo, ponelo en el root.",
      },
    },
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
    related: ["checkbox-group", "switch", "label"],
  },
  "checkbox-group": {
    title: "CheckboxGroup",
    group: "formularios",
    description: "Varias casillas que son un solo dato: el valor sale como array y el error es del grupo.",
    keyboard: [
      ["Tab", "Una parada por casilla. No es un `RadioGroup`: acá no hay flechas, porque las opciones no compiten entre sí."],
      ["Espacio", "Tilda y destilda la casilla que tiene el foco."],
      ["Espacio en el padre", "Pasa de indeterminado a todos, y de todos a ninguno."],
    ],
    a11y: [
      "El grupo es `role=\"group\"` con **un solo** nombre accesible: el `FieldLabel` del campo que lo envuelve. Cada casilla conserva el suyo.",
      "El error del campo describe al grupo (`aria-describedby` sobre el `role=\"group\"`), así que se anuncia al entrar en el grupo y no hace falta moverle el foco.",
      "El padre emite `aria-checked=\"mixed\"` cuando hay selección parcial, y `aria-controls` con los ids de las casillas que gobierna.",
      "La ayuda de un ítem describe solo a ese ítem: por dentro cada opción es un `Field.Item`, que abre su propio ámbito de etiquetado.",
      "La etiqueta de la opción es el `<label>` nativo de su casilla: clickear el texto tilda, que es la mitad del área útil de una lista de opciones.",
    ],
    usage: [
      "**Va adentro de un `Field`, aunque no haya formulario.** De ahí salen el nombre del grupo, el error y el estado; un grupo suelto —los filtros de una lista— se envuelve igual en un `<Field>` pelado, que es un `<div>` con contexto.",
      "**El `value` de cada ítem es lo que termina en el array, y no se reemplaza por `name`**: adentro de un `Field`, el `name` del campo le gana al de la casilla y las tres opciones terminarían con el mismo valor.",
      "**«Seleccionar todo» necesita las dos piezas**: `allValues` en el grupo —la lista completa, que es de donde sale la cuenta— y `parent` en el ítem. El padre no aporta valor propio ni viaja en el submit.",
      "El error de \"tildá al menos uno\" es del grupo: va en el `validate` del `Field`, no en cada casilla. Un `Fieldset` no tiene dónde mostrarlo.",
      "De 2 a 7 opciones visibles. Más que eso se busca, no se recorre: `Combobox` con `multiple`.",
      "Para opciones excluyentes, `RadioGroup`. Para una sola casilla —aceptar los términos—, `Checkbox` solo.",
    ],
    props: {
      CheckboxGroup: {
        allValues: "La lista completa de valores. Solo hace falta si hay un ítem `parent`.",
        value: "Los valores tildados. Para dejarlo no controlado, `defaultValue`.",
        onValueChange: "Recibe el array nuevo cada vez que se tilda o destilda una casilla.",
      },
      CheckboxGroupItem: {
        value: "La identidad de la opción: es lo que entra y sale del array.",
        parent: "Convierte al ítem en el «seleccionar todo» del grupo. Necesita `allValues` en el grupo.",
        disabled: "Apaga la casilla y su etiqueta. El `disabled` del grupo o del `Field` le gana.",
        description: "Ayuda debajo de la etiqueta. Describe a esa opción, no al grupo.",
        checkboxClassName: "Clases de la casilla. En `className` van las de la fila entera.",
      },
    },
    related: ["checkbox", "field", "radio-group"],
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
    props: {
      RadioGroup: heredadas("value", "defaultValue", "onValueChange", "name", "required", "readOnly", "disabled"),
    },
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
    props: {
      Switch: {
        size: "`sm` 16×28px · `md` 20×36px. El `after:-inset-2` suma 8px por lado, así que el área que recibe el dedo es de 32×44px y de 36×52px: las dos pasan los 24px de la 2.5.8 sin cambiar el dibujo.",
        variant: "`default` pinta la pista encendida de `gray-1000`; `accent`, del color de marca.",
        ...heredadas("checked", "defaultChecked", "onCheckedChange", "name", "required", "readOnly", "disabled"),
      },
    },
    related: ["checkbox", "toggle"],
  },
  toggle: {
    title: "Toggle",
    group: "formularios",
    description: "Un chip de filtro que queda apretado: apagado con borde punteado, prendido sólido y con fondo.",
    keyboard: [["Espacio · Enter", "Alterna."]],
    a11y: [
      "Emite `aria-pressed`. Sin texto (solo ícono) necesita `aria-label`.",
      "El estado se ve por la forma del borde —punteado apagado, sólido prendido— además del fondo y de `data-pressed`: no depende del color, y por eso nunca usa la marca.",
    ],
    usage: [
      "Si la acción navega o abre algo, es un `Button`.",
      "Varios toggles relacionados van en un `ToggleGroup`.",
      "**El botón de negrita de una barra no es este.** Ahí va un `ToolbarButton render={<ToggleGroupItem />}`, que toma la forma del `Button` en `ghost`. `Toggle` es el chip suelto que filtra.",
    ],
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
    props: {
      ToggleGroup: heredadas("value", "defaultValue", "onValueChange", "multiple", "orientation", "loopFocus", "disabled"),
    },
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
        value: "Un número, o un array de dos para un rango. Pasarlo lo vuelve controlado.",
        defaultValue: "El valor inicial. La forma que le des acá decide si el slider es simple (`40`) o de rango (`[20, 60]`).",
        min: "El extremo de la izquierda. Por defecto, 0.",
        max: "El extremo de la derecha. Por defecto, 100.",
        ...heredadas("onValueChange", "orientation", "name", "disabled"),
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
      "Si el diálogo se monta sin `DialogTitle` ni `aria-labelledby`, en desarrollo sale un aviso por consola. No hay tipo que pueda exigirlo —el título es un hijo—, y mirando la pantalla no se nota: el título casi siempre está escrito, pero como un `<h2>` suelto en vez de `DialogTitle`.",
    ],
    usage: [
      "**Los triggers usan `render={<Button … />}`, no `asChild`.**",
      "Para confirmar algo destructivo, `AlertDialog`: no se cierra con click afuera y exige una respuesta.",
      "En mobile, un formulario largo no va en Dialog: va en una página o en un `Sheet`.",
      "El footer va con la acción principal a la derecha y «Cancelar» a su izquierda.",
    ],
    props: {
      Dialog: {
        ...heredadas("open", "defaultOpen", "onOpenChange", "modal", "actionsRef"),
        modal: "Con `true`, mientras está abierto el resto de la página no recibe clicks ni foco. Con `\"trap-focus\"` atrapa el foco pero deja pasar los clicks de afuera.",
      },
      DialogContent: {
        labels: "El texto del botón X. Con un `LabelsProvider` se traduce para toda la app; esta prop es la excepción de una pantalla puntual.",
        showCloseButton: "El botón X de la esquina. Si lo sacás, tiene que haber otra salida visible.",
        ...heredadas("initialFocus", "finalFocus"),
      },
    },
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
    props: {
      AlertDialog: heredadas("open", "defaultOpen", "onOpenChange", "actionsRef"),
      AlertDialogAction: {
        variant: "`default` (negro) o `destructive` (rojo). Es el `variant` del `Button`, recortado a los dos que tienen sentido acá.",
        loading: "El spinner del `Button` mientras corre la acción. Es el motivo por el que esta acción no cierra sola.",
      },
      AlertDialogContent: heredadas("initialFocus", "finalFocus"),
    },
    related: ["dialog", "button"],
  },
  sheet: {
    title: "Sheet",
    group: "superposiciones",
    description: "Un panel que entra desde un borde. Los cuatro lados.",
    keyboard: [["Escape", "Cierra y devuelve el foco."], ["Tab", "Atrapado adentro."], ["Click en el fondo", "Cierra."]],
    a11y: [
      "Mismo contrato que `Dialog`: `SheetTitle` obligatorio, foco atrapado, fondo inerte. Sin título, aviso por consola en desarrollo.",
      "El movimiento de entrada lo corta el reset global de `base.css`, no una clase del componente: con `prefers-reduced-motion` el panel aparece en lugar de deslizarse.",
    ],
    usage: [
      "Un formulario largo o una lista de filtros sin perder la tabla de atrás.",
      "`side=\"left\"` es el del menú mobile —lo usa `AppShell`—; para contenido, `right`.",
      "En desktop, más de 640px de ancho es una página, no un panel.",
    ],
    props: {
      Sheet: {
        ...heredadas("open", "defaultOpen", "onOpenChange", "modal", "actionsRef"),
        modal: "Con `true`, mientras está abierto el resto de la página no recibe clicks ni foco. Con `\"trap-focus\"` atrapa el foco pero deja pasar los clicks de afuera.",
      },
      SheetContent: {
        labels: "El texto del botón X. Con un `LabelsProvider` se traduce para toda la app; esta prop es la excepción de una pantalla puntual.",
        showCloseButton: "El botón X de la esquina. Si lo sacás, tiene que haber otra salida visible.",
        ...heredadas("initialFocus", "finalFocus"),
      },
    },
    related: ["dialog", "app-shell", "sidebar", "drawer"],
  },
  drawer: {
    title: "Drawer",
    group: "superposiciones",
    description: "La hoja que se arrastra: entra desde un borde, se cierra deslizándola y para en puntos de anclaje.",
    keyboard: [
      ["Enter · Espacio", "Abre desde el trigger."],
      ["Escape", "Cierra y devuelve el foco al trigger. Es el camino de teclado, y no se puede apagar."],
      ["Tab · ⇧Tab", "Recorre solo el contenido del drawer: el foco queda atrapado adentro."],
      ["Click en el fondo", "Cierra."],
      ["—", "**No hay tecla para arrastrar.** El gesto es un atajo: el cierre accesible es Escape y el botón X."],
    ],
    a11y: [
      "**Un drawer que solo se cierra deslizando es un drawer que no se puede cerrar.** Por eso `showCloseButton` viene prendido y Escape siempre funciona: arrastrar no es una opción con teclado, con switch control ni con una sola mano ocupada.",
      "El handle es `aria-hidden`: es una pista visual, no un control. No recibe foco ni se anuncia, así que nunca cuenta como la salida del drawer.",
      "`DrawerTitle` no es opcional: es el nombre accesible del diálogo. Sin él, aviso por consola en desarrollo.",
      "El movimiento pasa por `motion-reduce`: con `prefers-reduced-motion` la hoja aparece en lugar de deslizarse.",
      "Lo que arrastra es todo el popup menos `DrawerBody`. Un control que se maneja con el dedo adentro del área de arrastre —un slider, un canvas— necesita `data-base-ui-swipe-ignore` para que el gesto no se lo robe.",
    ],
    usage: [
      "**El dedo lo mueve → `Drawer`. Solo se lee y se cierra → `Sheet`. Está centrado y es una decisión → `Dialog`.** Esa es toda la regla.",
      "**No reemplaza a `Sheet`, y `Sheet` no está construido sobre esto.** `Sheet` es un `Dialog` pegado a un borde, sin gesto; `Drawer` trae `swipeDirection`, `snapPoints`, el área de swipe y el handle. Son dos patrones, y `Sheet` ya vive en producción: darle gesto por abajo sería un cambio de comportamiento que no aparece en ningún diff.",
      "En desktop, casi siempre querés `Sheet`: nadie arrastra una hoja con el mouse. `Drawer` es para la mano.",
      "Lo que scrollea va adentro de `DrawerBody`. Es la zona donde el dedo mueve el contenido en vez de la hoja; sin eso, cada intento de scrollear cierra el drawer.",
      "`snapPoints` solo tiene sentido con `swipeDirection` vertical (`down` o `up`), que es el default.",
      "El lado sale de `swipeDirection` del root, no de una prop del contenido: una sola fuente de verdad para de dónde entra y hacia dónde se descarta.",
      "`DrawerSwipeArea` abre con un swipe desde el borde, pero nunca va sola: sin un `DrawerTrigger` al lado, el drawer no existe para quien usa teclado.",
    ],
    props: {
      Drawer: {
        ...heredadas("open", "defaultOpen", "onOpenChange", "modal", "actionsRef"),
        modal: "Con `true`, mientras está abierto el resto de la página no recibe clicks ni foco. Con `\"trap-focus\"` atrapa el foco pero deja pasar los clicks de afuera.",
      },
      DrawerContent: {
        ...heredadas("initialFocus", "finalFocus"),
        labels: "El texto del botón X. Con un `LabelsProvider` se traduce para toda la app; esta prop es la excepción de una pantalla puntual.",
        showCloseButton: "El botón X de la esquina. Apagarlo deja al drawer sin control visible de cierre: si lo hacés, poné otro.",
        showHandle: "La barra de arrastre. Es decoración: apagala solo si el drawer no se puede arrastrar.",
      },
    },
    related: ["sheet", "dialog", "popover"],
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
    props: {
      Popover: {
        ...heredadas("open", "defaultOpen", "onOpenChange", "modal", "actionsRef"),
        modal: "Con `true`, mientras está abierto el resto de la página no recibe clicks ni foco. Con `\"trap-focus\"` atrapa el foco pero deja pasar los clicks de afuera.",
      },
      PopoverContent: heredadas("initialFocus", "finalFocus"),
    },
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
    props: {
      Tooltip: {
        ...heredadas("open", "defaultOpen", "onOpenChange", "actionsRef", "trackCursorAxis", "disabled"),
        disabled: "Apaga el tooltip sin sacarlo del árbol: el trigger sigue funcionando, solo que no muestra nada.",
      },
      TooltipProvider: {
        delay: "Cuánto espera antes de abrir, en ms. Va una sola vez en el layout raíz y vale para todos los tooltips de abajo.",
      },
    },
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
      HoverCard: heredadas("open", "defaultOpen", "onOpenChange", "actionsRef"),
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
      DropdownMenu: heredadas("open", "defaultOpen", "onOpenChange", "modal", "loopFocus", "orientation", "actionsRef", "disabled"),
      DropdownMenuItem: { variant: "`destructive` pinta el ítem en rojo y va último, después de un separador." },
    },
    related: ["navigation-menu", "user-menu", "select", "popover"],
  },
  "context-menu": {
    title: "ContextMenu",
    group: "superposiciones",
    detallado: true,
    description: "El menú del botón derecho: las mismas acciones del `DropdownMenu`, ancladas al puntero.",
    keyboard: [
      ["Tab", "Llega al área disparadora, que es una sola parada de tabulación."],
      ["Menú contextual · Shift+F10", "Abre con el foco en el área, anclado a ella y no al puntero."],
      ["Click derecho", "Abre en el punto exacto del puntero."],
      ["Mantener apretado (touch)", "Abre a los 500 ms; moverse más de 10 px cancela."],
      ["↑ ↓", "Recorre los ítems."],
      ["→ ←", "Entra y sale de un submenú."],
      ["Escribir", "Salta al ítem que empieza con esas letras."],
      ["Enter · Espacio", "Ejecuta y cierra."],
      ["Escape", "Cierra y devuelve el foco al área."],
    ],
    a11y: [
      "El trigger es un `<div>`: sin `tabIndex` no le llega el foco y la tecla de menú contextual no tiene sobre qué disparar. `ContextMenuTrigger` lo hace enfocable y sintetiza el evento `contextmenu`, así que la apertura por teclado funciona aunque Base UI no la traiga.",
      "Lleva `aria-haspopup=\"menu\"` y `aria-keyshortcuts=\"Shift+F10\"`: sobre un área sin botón visible, el atajo es lo único que se puede anunciar.",
      "El panel es el mismo `role=\"menu\"` del `DropdownMenu`: atrapa el foco, se recorre con flechas y al cerrar lo devuelve al área.",
      "`focusable={false}` saca la parada de tabulación **y** la apertura por teclado: solo si el área ya tiene adentro un control enfocable que abre el mismo menú.",
    ],
    usage: [
      "**Nunca puede ser el único camino a una acción.** El click derecho no se ve, no se descubre y en touch depende de un long-press que la mitad de la gente no conoce. Todo lo que esté acá tiene que estar también en un botón visible, en un `DropdownMenu` o en un atajo anunciado.",
      "**Es un atajo, no una puerta de entrada.** Se pone sobre lo que ya tiene sus acciones a la vista: una fila, una tarjeta, un lienzo.",
      "Comparte la pastilla con `DropdownMenu` a propósito: son el mismo menú abierto de dos maneras, no dos componentes.",
      "`ContextMenuShortcut` pesa más acá que en un `DropdownMenu`: es el cartel que enseña el camino alternativo.",
      "Sobre un `<input>` o un `<textarea>` no: te comés el menú de corregir, copiar y pegar del navegador.",
    ],
    props: {
      ContextMenu: heredadas("open", "defaultOpen", "onOpenChange", "loopFocus", "orientation", "actionsRef", "disabled"),
      ContextMenuTrigger: {
        focusable: "`false` saca la parada de tabulación y con ella la apertura por teclado.",
        onKeyDown: "Corre **antes** que el manejador propio del trigger. Si hacés `preventDefault()`, la apertura por Shift+F10 no llega a dispararse.",
        tabIndex: "Pisa el `0` que pone `focusable`. Casi nunca hace falta: es la salida para meter el área en un orden de tabulación armado a mano.",
      },
      ContextMenuItem: { variant: "`destructive` pinta el ítem en rojo y va último, después de un separador." },
    },
    related: ["dropdown-menu", "menubar", "toolbar", "popover"],
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
      "**Dentro de `PageHeader` va `BreadcrumbList` suelto**, sin `Breadcrumb`: el `<nav>` ya lo pone la prop `breadcrumb`, y dos landmarks anidados confunden. Si igual lo envolvés, `PageHeader` avisa por consola en desarrollo.",
      "**Los separadores los pone `BreadcrumbList`**, no el llamador. Para cambiarlos, `separator={<SlashIcon />}`.",
      "**No inventes otro estilo de link**: usa `linkVariants({ variant: \"subtle\" })`, el mismo de cualquier link suelto del sistema.",
      "Con Next, `render={<Link href=\"/clientes\" />}`: sigue siendo un `<a>`, se abre en una pestaña nueva y el crawler lo ve.",
      "De cuatro niveles para arriba, `maxItems={4}`. En mobile un breadcrumb de seis niveles ocupa tres líneas.",
      "No es un reemplazo del botón «Volver» del navegador ni de la navegación principal: es contexto.",
    ],
    props: {
      BreadcrumbList: {
        maxItems: "A partir de cuántos ítems se colapsa el medio. Sin valor, no colapsa nunca. El «…» además tiene que tapar **dos o más** ítems, así que con `maxItems={4}` el colapso arranca recién en el quinto nivel.",
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
        boundaries: "Cuántas páginas fijas en cada punta. El mínimo real es 1: un `0` se sube a 1, porque un paginador sin la página 1 a la vista no se puede usar.",
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
    props: {
      NavigationMenu: {
        ...heredadas("value", "defaultValue", "onValueChange", "orientation", "delay", "closeDelay", "actionsRef"),
        value: "El `value` del ítem abierto, o `null` si están todos cerrados. Pasarlo lo vuelve controlado.",
      },
      NavigationMenuPositioner: {
        ...heredadas("collisionPadding", "container"),
        container: "Dónde se monta el portal del panel. Es el `container` del portal, no el del contenido.",
      },
      NavigationMenuViewport: {
        container: "Dónde se monta el portal del panel compartido. Por defecto, el `<body>`.",
      },
    },
    related: ["dropdown-menu", "sidebar", "tabs"],
  },
  menubar: {
    title: "Menubar",
    group: "navegacion",
    detallado: true,
    description: "La barra de menús de una app: Archivo, Editar, Ver. Un `DropdownMenu` por título, coordinados.",
    keyboard: [
      ["Tab", "Entra a la barra y sale. Los títulos son **una sola** parada de tabulación."],
      ["← →", "Cambia de título. Con un menú abierto, abre el del título al que llegás."],
      ["Home · End", "Primer y último título."],
      ["Enter · Espacio · ↓", "Abre el menú del título enfocado."],
      ["↑ ↓", "Recorre los ítems del menú abierto."],
      ["→ ←", "Entra y sale de un submenú."],
      ["Escribir", "Salta al ítem que empieza con esas letras."],
      ["Enter", "Ejecuta y cierra."],
      ["Escape", "Cierra el menú y devuelve el foco a su título."],
      ["Pasar el mouse", "Con un menú abierto, pasar por otro título lo abre sin click."],
    ],
    a11y: [
      "Base UI emite `role=\"menubar\"` con `aria-orientation`, y cada menú es el `role=\"menu\"` del sistema: el lector anuncia «barra de menús, N elementos».",
      "El recorrido es roving tabindex: la barra entera ocupa una parada de Tab, no una por título.",
      "Un `MenubarMenu disabled` deja el título en la barra y apagado, en vez de sacarlo: una barra que cambia de ancho según el documento obliga a buscar de nuevo cada vez.",
      "`MenubarShortcut` es decorativo: el `keydown` lo registra la app. El tilde de los checks va a la izquierda para no pelear con él por el borde derecho.",
    ],
    usage: [
      "**Casi ninguna web necesita un menubar.** Es para apps con decenas de comandos y ninguna otra superficie donde meterlos: un editor, una planilla, una herramienta de diseño.",
      "**Si los ítems son secciones del sitio, lo que querés es `NavigationMenu`.** Un menubar usado para navegación esconde atrás de tres menús lo que una barra de links mostraba de entrada.",
      "**Si es un solo grupo de acciones, es un `DropdownMenu` suelto.** Una barra de un título no es una barra.",
      "Sin fondo ni borde propios: vive dentro del header de la app y hereda su superficie.",
      "Los atajos son la mitad del trabajo: el menú se abre una vez para descubrir el comando y después se usa el teclado para siempre. Un menubar sin `MenubarShortcut` desperdicia el componente.",
    ],
    props: {
      Menubar: {
        modal: "Con `true` (el default), mientras hay un menú abierto el resto de la página no recibe clicks.",
        loopFocus: "Si al pasar del último título se vuelve al primero.",
      },
      MenubarMenu: heredadas("open", "defaultOpen", "onOpenChange", "loopFocus", "actionsRef", "disabled"),
      MenubarItem: { variant: "`destructive` pinta el ítem en rojo y va último, después de un separador." },
    },
    related: ["dropdown-menu", "navigation-menu", "toolbar", "context-menu"],
  },
  toolbar: {
    title: "Toolbar",
    group: "navegacion",
    detallado: true,
    description: "Acciones agrupadas con roving tabindex: una parada de tabulación para toda la barra.",
    keyboard: [
      ["Tab", "Entra a la barra y sale. Veinte botones adentro siguen siendo **una** parada."],
      ["← →", "Mueve entre controles en una barra horizontal."],
      ["↑ ↓", "Lo mismo con `orientation=\"vertical\"`."],
      ["Home · End", "Primer y último control. Lo agrega sebs7n-ui: Base UI las deja apagadas en `Toolbar`."],
      ["Enter · Espacio", "Activa el control enfocado."],
      ["← → · Home · End dentro de un `ToolbarInput`", "Mueven el cursor en el texto, no saltan de control."],
    ],
    a11y: [
      "Base UI emite `role=\"toolbar\"` con `aria-orientation` y maneja el roving tabindex: un solo hijo tiene `tabIndex=0` a la vez.",
      "Home y End las pone el componente. El patrón toolbar de la WAI las pide y el composite de Base UI las trae detrás de un flag que `Menubar` prende y `Toolbar` no; en una barra larga son la diferencia entre una tecla y quince flechas.",
      "`ToolbarGroup` **exige `aria-label` o `aria-labelledby` en el tipo**: sin él el lector anuncia «grupo» y nada más.",
      "`focusableWhenDisabled` viene en `true`: un control apagado sigue en el recorrido, así se puede leer por qué está apagado y la barra no se mueve abajo de los dedos.",
      "Los `ToolbarButton` de ícono necesitan `aria-label`: no hay texto que leer.",
    ],
    usage: [
      "**El roving tabindex es toda la razón del componente.** Veinte botones sueltos son veinte paradas de Tab entre el contenido de arriba y el de abajo; quien navega con teclado o con un switch los atraviesa todos cada vez. La barra ya se veía bien con un `<div className=\"flex gap-1\">`.",
      "**Todo hijo interactivo tiene que ser `ToolbarButton`, `ToolbarLink` o `ToolbarInput`.** Un `<button>` puesto a mano queda fuera del recorrido y se vuelve inalcanzable, porque la barra le sacó el Tab al resto.",
      "**`render` en vez de estilos nuevos**: `render={<Toggle />}`, `render={<ToggleGroupItem value=\"bold\" />}`, `render={<DropdownMenuTrigger render={<Button />} />}`. El default ya es el `Button` del sistema en `ghost`.",
      "`ToolbarInput` es el campo chico de una barra —zoom, ancho de línea—, no un campo de formulario: para eso está `Field` + `Input`, con label, error y descripción.",
      "Menos de tres o cuatro controles no justifica la barra: son botones sueltos y se acabó.",
    ],
    props: {
      Toolbar: {
        orientation: "`vertical` cambia las flechas a ↑ ↓ y da vuelta los separadores.",
        loopFocus: "Si al pasar del último control se vuelve al primero.",
        onKeyDown: "Corre **antes** que el manejador propio de la barra. Si hacés `preventDefault()`, Home y End no mueven el foco.",
      },
      ToolbarButton: {
        render: "El componente que pone los estilos. Por defecto, `<Button size=\"icon-sm\" variant=\"ghost\" />`.",
        focusableWhenDisabled: "Deshabilitado pero todavía en el recorrido con flechas. Dejalo en `true`.",
      },
    },
    related: ["button", "toggle-group", "menubar", "dropdown-menu"],
  },
  tabs: {
    title: "Tabs",
    group: "navegacion",
    detallado: true,
    description: "Secciones de la misma página que se turnan. Subrayado bajo la activa.",
    keyboard: [
      ["← →", "Mueve el foco entre tabs. **No** activa al pasar."],
      ["Enter · Espacio", "Activa la tab que tiene el foco."],
      ["Home · End", "Primera y última."],
      ["Tab", "Sale de la lista al panel: la lista entera es una sola parada."],
    ],
    a11y: [
      "Base UI emite `role=\"tablist\"` / `tab` / `tabpanel` con `aria-selected` y `aria-controls`.",
      "La activación es **manual**: las flechas mueven el foco y recién Enter o Espacio cambian de panel. Es el patrón que recomienda APG cuando el panel puede tardar en aparecer — con activación automática, recorrer cinco tabs con el teclado monta y desmonta cinco paneles.",
      "El panel es enfocable (`tabindex=\"0\"`) para poder llegar a su contenido con el teclado, y muestra el anillo de foco al llegar por Tab.",
      "La tab activa se marca con el subrayado **y** con el color del texto: no depende solo del color.",
    ],
    usage: [
      "**Contenido de la misma página, mismo nivel.** Si cada sección tiene su URL, son links, no tabs.",
      "El contenido de todas las tabs debería costar lo mismo: si una tarda 3 segundos en cargar, poné una página.",
      "3 a 6 tabs. Más, un `Select` o una navegación lateral.",
      "No anides tabs dentro de tabs.",
    ],
    props: {
      Tabs: {
        ...heredadas("value", "defaultValue", "onValueChange", "orientation"),
        value: "El `value` de la tab activa. Pasarlo lo vuelve controlado: es lo que hace falta para atar las tabs a la URL.",
      },
      TabsList: { loopFocus: "Si al pasar de la última tab las flechas vuelven a la primera." },
      TabsContent: {
        ...heredadas("value", "keepMounted"),
        value: "Con qué `TabsTrigger` se corresponde este panel.",
      },
    },
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
      SidebarItem: { icon: "El ícono de la izquierda, que es lo único que queda visible con el sidebar colapsado." },
      SidebarGroupLabel: {
        id: "Pisa el `id` que genera el grupo. El `SidebarGroup` lo usa para su `aria-labelledby`, así que solo cambialo si ya tenés un id propio.",
      },
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
    props: {
      UserMenu: {
        user: "Quién está adentro: `{ name, email?, image? }`. `name` arma las iniciales del fallback y el nombre accesible del trigger.",
      },
    },
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
    props: {
      ThemeSwitcher: {
        onKeyDown: "Corre **después** de que el control frene la propagación de las teclas que usa el menú: así el switcher adentro de un `DropdownMenu` no lo cierra con cada flecha.",
      },
    },
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
      "**No virtualiza.** Renderiza las filas que le pasás, todas. Hasta ~500 anda bien; más que eso, paginá con `Pagination` o virtualizá vos y pasale la ventana.",
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
        size: "El padding interno, vía `--card-spacing`: `sm` 16px · `md` 24px.",
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
    props: {
      Alert: {
        variant: "`neutral` · `brand` · `success` · `warning` · `error`. Solo cambia la franja de la izquierda y el color del ícono: el fondo es el mismo en las cinco.",
      },
    },
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
    props: {
      EmptyState: {
        icon: "El ícono de arriba, dentro de su cuadrito. Es decoración (`aria-hidden`): el título tiene que alcanzar solo.",
        title: "Qué falta, en una línea. Sale como el heading que diga `titleAs`.",
        description: "La línea que explica por qué no hay nada y qué se puede hacer.",
      },
    },
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
      "El nombre es **obligatorio y lo exige el tipo**: `label` (visible, la preferida), `aria-label` o `aria-labelledby`. Una barra sin nombre se anuncia «60 %» y nada más, y el 60 % de qué es justamente lo que hace falta saber.",
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
        label: "El nombre visible de la barra. Es la forma preferida de nombrarla; sin él, el tipo exige `aria-label` o `aria-labelledby`.",
      },
    },
    related: ["meter", "skeleton", "slider"],
  },
  meter: {
    title: "Meter",
    group: "contenido",
    description: "Una medida dentro de un rango: disco usado, cupo consumido, ocupación. No es un progreso.",
    keyboard: [["—", "No es interactivo."]],
    a11y: [
      "Emite `role=\"meter\"`, no `role=\"progressbar\"`: el lector anuncia una medida y no una tarea en curso. Es la diferencia que hace que valga la pena tener los dos componentes.",
      "`aria-valuetext` lleva el valor ya formateado —«62%», «$ 321.400»—, que es más útil que el número crudo de `aria-valuenow`.",
      "Lo que se ve con `showValue` y lo que se lee salen del mismo texto: no se pueden desincronizar.",
      "El nombre es **obligatorio y lo exige el tipo**: `label` (visible, la preferida), `aria-label` o `aria-labelledby`. Mismo motivo que en `Progress`.",
      "Un valor fuera de rango se recorta contra `min` y `max` en vez de desbordar la pista.",
    ],
    usage: [
      "**Si el número puede bajar solo, es un `Meter`.** Un disco que se libera al borrar un archivo, un cupo que se renueva, una ocupación que sube y baja. Si en cambio arrancó, va para un lado solo y al llegar al final la pantalla cambia de estado, es un `Progress`.",
      "**Ese es el error que garantiza que alguien use el equivocado**: las dos barras se ven igual, pero un lector de pantalla anuncia cosas distintas, y «subiendo el archivo» no es lo mismo que «6,4 GB de 10».",
      "`min` y `max` son el rango real del dato: la barra se llena sobre ese rango, no sobre 100.",
      "`format` y `locale` son los de `Intl.NumberFormat`. Sin `format`, lo que se anuncia es la proporción.",
      "Poné `label` o `aria-label`: una barra sin nombre no dice qué está midiendo.",
      "`size=\"sm\"` cuando acompaña una fila de una lista y el texto de al lado ya dice el número; `md` suelta.",
    ],
    props: {
      Meter: {
        value: "El valor actual, siempre un número: un `Meter` no tiene estado indeterminado.",
        label: "El nombre visible de la medida. Es la forma preferida de nombrarla; sin él, el tipo exige `aria-label` o `aria-labelledby`.",
        size: "`sm` 4px · `md` 6px de alto de la pista, los mismos que `Progress`.",
        showValue: "Muestra el valor formateado a la derecha.",
        format: "Opciones de `Intl.NumberFormat`. Cambian lo que se ve y lo que se lee, nunca el valor.",
        locale: "El locale de `Intl.NumberFormat`. Por defecto, el del navegador.",
      },
    },
    related: ["progress", "stat", "slider"],
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
    props: {
      Collapsible: heredadas("open", "defaultOpen", "onOpenChange", "disabled"),
      CollapsibleContent: heredadas("keepMounted"),
    },
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
        ...heredadas("value", "defaultValue", "onValueChange", "orientation", "loopFocus", "keepMounted", "disabled"),
        value: "Los `value` de las secciones abiertas, siempre un array. Pasarlo lo vuelve controlado.",
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
      "`breadcrumb` emite un `<nav>` cuyo nombre sale del `LabelsProvider` (`pageHeader.breadcrumb`), así que en una app traducida ya está bien sin escribir nada. `breadcrumbLabel` sigue existiendo como override de una pantalla.",
      "**Adentro de `breadcrumb` va `BreadcrumbList` suelto**, sin `Breadcrumb`: el `<nav>` lo pone `PageHeader`. Dos landmarks de navegación anidados le dan al lector dos entradas para la misma lista; en desarrollo avisa por consola.",
      "Sin `\"use client\"`: sirve en un Server Component. El `<nav>` de las migas es un subcomponente de cliente interno —por eso puede leer el provider—, y un Server Component puede renderizar uno de cliente.",
    ],
    usage: [
      "Primer hijo de `AppShellContent`.",
      "Hasta dos acciones: la principal y una secundaria. El resto, en un `DropdownMenu`.",
      "La bajada es una línea que explica la pantalla, no una descripción de marketing.",
      "**No pases `breadcrumbLabel` en cada página.** Es el override del caso raro; el idioma lo resuelve el `LabelsProvider` una vez, en el layout raíz.",
    ],
    props: {
      PageHeader: {
        breadcrumb: "Las migas, solo en páginas de detalle. Va `BreadcrumbList` suelto: el `<nav>` lo pone `PageHeader`.",
        breadcrumbLabel: "Nombre del `<nav>` de las migas para una pantalla puntual. Sin esto, el del `LabelsProvider`.",
      },
    },
    related: ["app-shell-content", "stat", "button"],
  },
}

export const SLUGS = Object.keys(COMPONENTS).sort()
