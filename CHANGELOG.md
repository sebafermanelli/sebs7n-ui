# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: SemVer 2.0.0.

Mientras el paquete sea **0.x**, un minor puede traer cambios incompatibles: SemVer no protege
la versión cero y acá todavía se mueven APIs. Cuando eso pasa, la entrada va marcada
**Breaking** con qué se rompe y cómo se migra. De 1.0 en adelante, los incompatibles esperan al
major.

## [Unreleased]

Fase 1 de la auditoría de 0.4.0: los bugs con evidencia.

### Fixed

- **`shadcn add` generaba código que no compila.** `npx shadcn@latest add
  <url>/r/button.json` dejaba un `components/ui/button.tsx` que se importaba a sí
  mismo (`TS2303 Circular definition of import alias 'buttonVariants'`). El CLI
  resuelve los imports por basename cuando la ruta exacta no está, y
  `variants/button.ts` se copiaba como `button.ts` al lado de `button.tsx`. Las
  variantes ahora se copian como `<x>-variants.ts` y los helpers como
  `<x>-helpers.ts`, con un guard en el generador para que no vuelva a pasar.
- **El registry no traía los tokens.** Ítem `theme` de tipo `registry:theme`, del
  que depende todo componente: la paleta, las cuatro variables de marca, los
  radios, las sombras y las utilidades de foco y tipografía. Antes el componente
  copiado compilaba y se veía sin estilo.
- **`TabsContent` no mostraba el foco** al llegar por Tab: tenía `outline-none`
  sin reemplazo (WCAG 2.4.7).
- **`Button variant="destructive"` abajo de AA** (WCAG 1.4.3). Claro en reposo
  daba 4,36:1; oscuro en hover 2,99:1 y en active **1,81:1**. Los tres estados
  pasan a blanco puro sobre rojos que oscurecen en los dos temas: 4,75 / 6,65 /
  10,70 en claro y 4,79 / 6,65 / 10,70 en oscuro.
- **Atajos de menú de `DropdownMenu`, `ContextMenu` y `Menubar`** de `gray-700` a
  `gray-900`: en claro pasan de 3,23:1 sobre el popup y 2,71:1 sobre el ítem
  resaltado a 8,45:1 y 7,09:1. Son contenido, no decoración.
- **`exports` que no resolvían.** `sebs7n-ui/tokens/*.json` caía en el comodín
  `./*` y apuntaba a un archivo inexistente; ahora tiene su patrón propio. Y
  `src/lib/shell-context.ts` —interno— era alcanzable por
  `sebs7n-ui/lib/shell-context`: se muda a `src/internal/`, que ningún patrón de
  `exports` alcanza.
- **Links rotos del sitio:** `llms.txt` mandaba a `/registry` y `/registry.md`,
  que no existen (lo que se sirve es `/r/registry.json`), y tres demos linkeaban
  rutas inventadas. Hay un test que recorre las dos superficies.

### Changed

- **El `@source` del `dist` lo pone el paquete.** `theme.css` trae
  `@source "../../dist"`, así que la app ya no escribe ninguna ruta a
  `node_modules`. Olvidarla —o errarle— dejaba la app entera sin estilo sin un
  solo warning. Se documenta `@source not` como opt-in para achicar el CSS.
  **Si tu `globals.css` ya tiene el `@source` a mano, sacalo**: duplicado no
  rompe, pero no hace falta.
- **Las props heredadas que la doc describe salen en la tabla** del sitio,
  marcadas «heredada de Base UI»: 19 descripciones escritas a mano no se
  mostraban en ninguna parte. El generador ahora falla si `meta.mjs` nombra una
  prop que no existe.
- **La tabla de subpaths se genera** desde `package.json#exports` (`npm run
  subpaths`). Estaba a mano en dos archivos que se contradecían y a los dos les
  faltaban entry points.

### Docs

- `Select` necesita `items` para que el trigger muestre la etiqueta y no el
  `value` crudo: documentado y aplicado en las tres demos.
- La doc de teclado de `Tabs` decía que las flechas activan al pasar; la
  activación es manual (Enter o Espacio), que es el patrón de APG para paneles
  caros.
- Son **cuatro** variables de marca, no tres: faltaba `--brand-contrast`.
- El ejemplo del layout raíz del README importa por subpath, con el bloque de
  ESLint `no-restricted-imports` para las apps.
- `geist` es peer **opcional**, no "no declarado"; y el paso de verificación de
  la instalación usaba `bg-blue-500`, que sí compila (Geist tiene escala `blue`).
- Se sacan las referencias a versiones que nunca existieron (1.2, 1.3.0, 1.4).

---

Fase 2 de la auditoría de 0.4.0: accesibilidad.

### Added

- **`sebs7n-ui/labels`: `LabelsProvider`, `useLabels` y `defaultLabels`.** Los
  textos que los componentes escriben solos —«Cerrar», «Sin resultados», «Ir al
  contenido», «Buscando…»— se traducen todos de una vez desde el layout raíz.
  `defaultLabels` está tipado como `Labels` completo, así que
  `{ ...defaultLabels, ...en }` hace que TypeScript marque lo que falte. La prop
  `labels` de cada componente sigue existiendo y le gana al provider: es la
  excepción de una pantalla, no la traducción. `Breadcrumb`, `Pagination`, `Tag`
  y `PageHeader` no leen del provider a propósito —los volvería componentes de
  cliente y hoy se pueden renderizar en un Server Component—: sus textos van por
  prop, como venían.
- **`labels={{ close }}` en `DialogContent`, `SheetContent` y `DrawerContent`.**
  Era el único texto del paquete que no se podía cambiar de ninguna forma.
- **`alert` en `FieldError`**: le pone `role="alert"` para que el error se
  anuncie al aparecer. Es opt-in y solo para `validationMode="onChange"`: en el
  camino de enviar, `Form` ya mueve el foco al campo y un `role="alert"`
  duplicaría el anuncio interrumpiendo el del nombre del campo.
- **Aviso en desarrollo** cuando un `DialogContent`, `SheetContent` o
  `DrawerContent` se monta sin nombre accesible. No se puede exigir por tipo
  —el título es un hijo—, y en producción el aviso no existe.

### Fixed

- **Placeholders a `gray-900`** (WCAG 1.4.3): en claro `gray-700` daba 3,23:1;
  ahora 8,45:1 en claro y 7,57:1 en oscuro. Toca `Input`, `Textarea`,
  `SelectTrigger`, `Combobox`, `Autocomplete` y `ToolbarInput`.
- **El contorno de Checkbox, Radio, Switch y Toggle sin marcar a `gray-700`**
  (WCAG 1.4.11, 3:1): Checkbox y Radio pasan de 1,66/2,06 a 3,23/6,12; Switch y
  Toggle apagados, de 1,20/1,46 a lo mismo. En el Switch además arregla que el
  pulgar blanco era invisible contra su propia pista (1,20:1 → 3,23:1). El borde
  del `Input` se deja como está y la decisión queda escrita en
  `accesibilidad.md`.
- **El borde de foco de los campos se ve en claro** (WCAG 2.4.11): de 1,78:1 a
  4,12:1. En oscuro se queda donde estaba, que ya daba 5,51.
- **Anillo de foco en los popups de `Popover`, `HoverCard` y `NavigationMenu`**:
  sin nada tabulable adentro, Base UI enfoca el popup y con `outline-none` no se
  veía nada (WCAG 2.4.7).
- **Objetivos táctiles de 24×24** (WCAG 2.5.8): el botón de quitar de `Tag` y de
  `ComboboxChip` suman área con un `::after` sin cambiar el dibujo (16→24 y
  20→28), y el link de `Breadcrumb` pasa de 32×16 a 32×24.

### Changed

- **Breaking — los nombres accesibles que el sistema puede exigir, los exige.**
  `Button` con un `size` de ícono escrito literal pide `aria-label` o
  `aria-labelledby`; `Progress` y `Meter` piden `label`, `aria-label` o
  `aria-labelledby`; `AvatarImage` pide `alt` (aunque sea `""`); `ToolbarGroup`
  pide `aria-label`. `ButtonProps` es genérico en el `size` para que la
  exigencia no rompa a quien envuelve el botón y ya pasa el nombre bien.
  *Migración:* agregá el nombre donde el compilador lo pida. Si ya está en los
  hijos o en un envoltorio, escribilo igual en el `aria-label` del `Button`, que
  es el que termina en el DOM.
- `AlertDialogAction` y `AlertDialogCancel` aceptan solo los tamaños con texto:
  sus botones nunca son de ícono.
- La X de `Dialog`, `Sheet` y `Drawer` lleva el nombre en `aria-label` en vez de
  un `<span class="sr-only">`.

### Docs

- **`accesibilidad.md` reescrita**: cinco líneas prometían de más. `gray-800` no
  es un color de texto (4,12:1 en claro, y no se usa como texto en ningún
  componente); el foco visible ahora dice "sin reemplazarlo" y nombra los casos;
  la reducción de movimiento dice la verdad —el reset global cubre todo y las
  que tienen recorrido suman `motion-reduce`—; y `aria-invalid` sincroniza el
  estilo con la semántica pero no es garantía por sí solo.
- **RTL: LTR only, y dicho**, con la lista de lo que asume dirección física y el
  camino de migración si algún día hace falta.
- Sección **Idioma** en el README y en `instalacion.md`.
- Los errores de formulario se escriben siempre con `match` o `validate`: el
  mensaje del navegador sale en el idioma del navegador, no en el de la página.
  La demo `Valores` del sitio lo muestra.

### Tests

- `test/contrast.test.ts` pasa de 12 a 62 pares: los grises de texto sobre los
  tres fondos, el `Badge` en las paletas fijas, el anillo de foco de las cuatro
  marcas y todo lo corregido en esta fase. Sigue leyendo los hexadecimales de
  `colors.css` y `theme.css`, no una copia. Los deshabilitados quedan exentos y
  el archivo dice por qué.
- `test/nombres-accesibles.test.tsx` verifica los tipos con `@ts-expect-error`:
  si alguien afloja uno, falla el `typecheck`.

---

Fase 3 de la auditoría de 0.4.0: rendimiento.

### Changed

- **El build cuelga de `prepack`, no de `prepare`.** `npm install` en el repo
  corría `tsc`, así que un error de tipos hacía fallar el **install**, no el
  build. `prepack` lo corre igual `npm pack` y `npm publish`, que es donde hace
  falta. En CI el job de `size` ahora pide `npm run build` explícito.
- **El pulso del `Skeleton` deja de repintar.** `@keyframes skeleton` animaba
  `background-color`, o sea interpolación de color en el hilo principal y un
  repintado por frame durante toda la carga —justo cuando el hilo está ocupado—.
  Ahora `animate-skeleton` es una utilidad que pone una capa de `gray-200` con
  `opacity` animada encima del `gray-100`, que el compositor resuelve sin
  repintar. Se ve igual: componer `gray-200` con alfa *t* sobre `gray-100` da la
  misma mezcla sRGB que interpolar de un color al otro, y con
  `prefers-reduced-motion` queda en `gray-100` como antes.
- **`Badge` y `Separator` dejan de ser componentes de cliente.** No tenían estado
  ni handlers: arrastraban `"use client"` por transitividad, porque uno usaba el
  hook `useRender` de Base UI y el otro el primitivo `Separator`, que trae su
  propio `'use client'`. `Badge` pasa a `renderElement` de `lib/render.ts` —que
  existe exactamente para esto y cuyo docstring ya lo pedía— y `Separator` a un
  `<div role="separator" aria-orientation>` propio. El DOM que sale es idéntico
  al anterior, atributo por atributo. Pasan de 14 a **16** los componentes
  usables en un Server Component. Medido con esbuild resolviendo Base UI:
  `Badge` 15,18 → 13,59 KB gz y `Separator` 14,42 → 9,88 KB gz cuando se importan
  sueltos; en una página RSC que solo los use, el ahorro es todo el JS.
  **Breaking menor:** `render` ya no acepta una función, solo un elemento
  (`render={<a href="/planes" />}`), y `Separator` ya no acepta las props
  propias del primitivo de Base UI.

- **El sitio de docs carga las demos por página, no las 59 de golpe.**
  `/docs/components/<slug>` es una sola ruta para los 58 componentes, así que todo
  componente de cliente alcanzable desde ella entraba en el manifiesto de las 58
  páginas: el registry de demos metía un chunk de 454 KB raw / 137 KB gz en cada
  una para mostrar dos o tres. Ahora el registry es un mapa de `next/dynamic`
  detrás de un `"use client"` (`app/_components/demo-slot.tsx`), y el chunk de
  cada demo se pide solo donde se usa. Medido sumando los `<script>` del HTML
  prerenderizado y comprimiendo con gzip: **421,3 → 298,9 KB gz** por página de
  componente (−29 %). Las páginas sin demos pagan 6,6 KB gz más porque Turbopack
  reparte el código compartido en más chunks (home 284,0 → 290,6). El
  prerenderizado y el «Ver el código» quedan igual.

### Removed

- **`sebs7n-ui/styles.css`, la hoja precompilada** (70 KB, el 15 % del tarball).
  **Breaking** para quien la importara, aunque el propio README desaconsejaba
  usarla y ninguna de las cuatro apps lo hacía. Cargada junto a la hoja de la app
  quedaban dos capas de utilidades, y la que gana es la declarada último y no la
  más específica: un `hidden lg:block` de la app perdía contra el `hidden` del
  paquete. Desde que `theme.css` trae su propio `@source` (Fase 1), no tenía
  ninguna razón de existir. Si dependías de ella, la migración es la instalación
  normal: `@import "tailwindcss"` y después `@import "sebs7n-ui/theme.css"`.
  Se van con ella el script `build:css`, `src/styles/build.css` y las
  devDependencies `tailwindcss` y `@tailwindcss/cli`, que solo servían para eso.

## [0.4.0] - 2026-09-23

Con esta versión el paquete cubre **todas las primitivas de Base UI**: 58
componentes. No quedó ninguna sin envolver.

### Added

- **`CheckboxGroup`** — varias casillas que son un solo dato: el valor sale como
  array y el grupo se nombra y se valida como un campo. Incluye el padre con
  estado indeterminado ("seleccionar todo"), que es la razón principal por la
  que el componente existe. Va siempre adentro de un `Field`, porque la pieza
  de Base UI que nombra cada opción por separado lo exige.
- **`Meter`** — una **medida** en un rango: espacio usado, cupo consumido,
  ocupación. No es `Progress`: si el número puede bajar solo, es `Meter`; si
  arrancó, va para un lado y al terminar la pantalla cambia de estado, es
  `Progress`. Comparte forma y tokens con `Progress` para que el sistema no
  tenga dos barras distintas.
- **`ContextMenu`** — el menú del botón derecho, **que también se abre con el
  teclado**. Base UI escucha el evento `contextmenu` pero su trigger es un
  `<div>` sin `tabIndex`, así que el foco nunca le llegaba: acá el trigger es
  enfocable, anuncia `aria-keyshortcuts="Shift+F10"` y ancla el menú al
  rectángulo del elemento, porque varios navegadores emiten esa tecla con las
  coordenadas en cero y el menú saltaba a la esquina de la ventana.
- **`Menubar`** — la barra de menús de una app (Archivo, Editar, Ver), con
  recorrido entre títulos y apertura al pasar de uno a otro. El tilde de los
  checks va a la izquierda, como en macOS y Windows, porque la derecha la ocupa
  el atajo.
- **`Toolbar`** — acciones agrupadas con roving tabindex: una sola parada de
  tabulación para todo el grupo en vez de una por botón. Se le suman `Home` y
  `End`, que el patrón de la WAI pide y Base UI deja apagadas en este
  componente, con guarda para no pisarlas dentro de un campo de texto.
- **`Drawer`** — la hoja que se arrastra y se cierra deslizando, con puntos de
  anclaje. Convive con `Sheet` en lugar de reemplazarlo: no es el mismo panel
  con gestos, es otro árbol de partes —su popup exige un viewport, y su
  `Content` marca la zona donde el dedo *no* arrastra—. La regla queda escrita
  en los dos: **el dedo lo mueve → `Drawer`; solo se lee y se cierra →
  `Sheet`; centrado y es una decisión → `Dialog`**. Siempre con `Escape` y un
  botón de cierre visible: un panel que solo se cierra deslizando es un panel
  que no se puede cerrar.

### Changed

- `FieldError` muestra los mensajes múltiples como lista con viñeta. Base UI
  los mete en un `<ul>` sin clases cuando hay más de uno, y el reset de
  Tailwind lo dejaba como una frase pegada.

### Docs

- `Field` explica por qué un control propio a veces no se engancha:
  `FieldControl` le pasa `id`, `name`, `aria-*` y una `ref`, y un componente que
  declara `id` y `name` como props propias sin reenviar el resto se queda sin
  nada. Es lo que les pasa a los date pickers hechos con un campo oculto más un
  botón.
- `Field` documenta que **`FieldError` es una fuente o la otra**: sin `match` se
  muestra ante cualquier invalidez, así que junto a uno con `match` duplica el
  mensaje.
- `Fieldset` explica **dónde va el error que es del grupo**. No se agregó un
  `FieldsetError`: un `<fieldset>` no tiene forma estándar de llevar un mensaje
  que el lector de pantalla anuncie, así que sería un cartel rojo que media
  pantalla nunca escucha. Cuando el error es de un conjunto de opciones, ese
  conjunto es un campo: va un `Field` envolviéndolo.

## [0.3.3] - 2026-09-23

### Changed

- **`Field`, `Fieldset` y `Form` ya no traen `w-full`.** Era redundante —un
  contenedor flex ya es de nivel bloque y ocupa el ancho disponible— y hacía
  daño en el único caso donde se notaba: un campo puesto como ítem de un flex
  horizontal se comía el renglón entero, y había que acordarse de pasarle
  `w-auto`. Apareció migrando una app de verdad, donde hubo que parchear ocho
  lugares. En un formulario vertical no cambia nada.

### Docs

- `Field` documenta que **`FieldError` es una fuente o la otra**: sin `match` se
  muestra ante cualquier invalidez, así que junto a uno con `match` imprime el
  mensaje dos veces. Es una trampa que se cobró dos migraciones antes de quedar
  escrita.

## [0.3.2] - 2026-09-23

### Fixed

- **`Textarea` dejó de aceptar `rows` y `cols` en 0.3.1.** Al pasarlo por
  `Field.Control` quedó tipado contra un `<input>`, que no conoce esas props, y
  el build de cualquier app que usara `rows` fallaba. El tipo público vuelve a
  ser el del `<textarea>`; el enganche con el campo sigue igual. Hay un test que
  fija que `rows` y `cols` llegan al DOM.

## [0.3.1] - 2026-09-23

### Fixed

- **`Textarea` adentro de un `Field` se quedaba sin `name` y sin etiqueta.** Era
  el único control del paquete construido sobre un `<textarea>` nativo en lugar
  de una primitiva de Base UI, así que no se enganchaba al campo: el formulario
  se veía perfecto, el lector de pantalla no anunciaba la etiqueta, y lo que el
  usuario escribía **no se enviaba**. Ahora renderiza a través de
  `Field.Control`, como el resto. Fuera de un `Field` se comporta igual que
  antes. Apareció migrando el formulario de contacto de un sitio real, y hay un
  test que lo fija.
- La documentación de `Field` afirmaba que `Input`, `Textarea` y `Select` se
  enganchaban solos. De los tres, `Textarea` no lo hacía. Ahora es cierto.

## [0.3.0] - 2026-09-23

Formularios. Hasta acá el sistema traía los controles sueltos —`Input`,
`Select`, `Checkbox`— y cada app armaba a mano el andamiaje que los convierte
en un formulario. Eso ya no.

### Added

- **`Field`** — el campo completo: `Field`, `FieldLabel`, `FieldDescription`,
  `FieldError`, `FieldControl` y `FieldValidity`. La etiqueta nombra al
  control, la ayuda y el error lo describen, y el error pone `aria-invalid`,
  todo por anidar las partes. Sin `useId`, sin `htmlFor` y sin armar el
  `aria-describedby` condicional que es justo el que se olvida. `Input`,
  `Textarea` y `Select` se enganchan solos.
- **`Fieldset`** y **`FieldsetLegend`** — un grupo de campos con nombre
  accesible. Es lo que distingue dos campos "Calle" en la misma pantalla, uno
  bajo "Domicilio fiscal" y otro bajo "Dirección de entrega". `disabled` en el
  grupo apaga todo lo de adentro.
- **`Form`** — un `<form>` nativo que junta los valores por `name`, reparte a
  cada campo los errores que solo conoce el servidor (`errors`) y decide cuándo
  se valida (`validationMode`, `onSubmit` por defecto). Al fallar, el foco va al
  primer campo con error.
- **`sebs7n-ui/lib/schema`** — puente con **Standard Schema**, la interfaz que
  ya implementan Zod, Valibot y ArkType: `validate(schema, valores)` devuelve el
  valor parseado o los errores con la forma que espera `Form`, y
  `fieldValidator(schema)` arma el `validate` de un campo. El paquete no depende
  de ninguna de las tres librerías: habla la interfaz. Son funciones puras, sin
  React, así que el mismo schema revalida en el servidor.
- **`NumberField`** — un número de verdad: flechas, `Shift`/`Alt` para paso
  grande y chico, topes `min`/`max` y formato por locale (moneda, porcentaje,
  unidades). El valor que sale es `number`, no el string del input. Sin zona de
  arrastre a propósito: es un gesto invisible, sin equivalente de teclado, que
  cambiaría en silencio un dato de formulario.
- **`OTPField`** — código de verificación de N casillas (6 por defecto). Pegar
  reparte el código, `Backspace` retrocede, y `autoComplete="one-time-code"`
  hace que el teléfono ofrezca el código del SMS. Es **un solo valor** para el
  formulario y para el lector de pantalla, no seis campos sueltos.

### Changed

- La guía de `Input` decía "siempre con `Label` asociado por `htmlFor`/`id`" y
  explicaba cómo armar a mano el `aria-describedby` del error. Con `Field` eso
  dejó de ser el camino recomendado.

## [0.2.0] - 2026-09-23

Diez componentes nuevos: los que faltaban para cubrir una app entera sin salir
del sistema. Van de 37 a 47.

### Added

- **`Progress`** — barra determinada o indeterminada (`value={null}`), con
  `label` propio que hace de nombre accesible y `showValue` para el porcentaje.
  Dos alturas: `sm` (4px) dentro de una fila, `md` (6px) suelta.
- **`Collapsible`** — mostrar y ocultar un bloque con un botón, animando la
  altura real del contenido.
- **`Accordion`** — secciones plegables, una sola abierta o varias
  (`multiple`), recorribles con las flechas.
- **`Slider`** — elegir un número o un rango arrastrando, con teclado completo
  (flechas, `Home`/`End`, `PageUp`/`PageDown`) y `formatValue` para lo que
  anuncia el lector de pantalla.
- **`ScrollArea`** — caja con scroll y barra propia discreta, que no tapa el
  contenido ni cambia de ancho entre sistemas operativos.
- **`HoverCard`** — tarjeta de adelanto de un link. Aparece en hover **y en
  foco**, con demora de entrada y de salida: con el teclado también existe.
- **`Spinner`** — indicador de carga en `currentColor`, así hereda el color de
  quien lo contiene; se detiene con `prefers-reduced-motion`.
- **`Breadcrumb`** — migas de pan como `<nav>` + `<ol>`, con la página actual
  marcada `aria-current="page"` y colapso del medio cuando la ruta es larga.
- **`Pagination`** — paginador que renderiza links reales (`<a>`) o botones
  según le pases `href`. El cálculo del rango vive aparte, en
  `sebs7n-ui/lib/pagination`, y es una función pura testeable sin DOM.
- **`Tag`** — etiqueta que puso el usuario y puede sacar. Comparte forma y
  paleta con `Badge` a propósito; lo que la distingue es el botón de quitar,
  no otro radio.

### Changed

- El estado `loading` del `Button` usa el `Spinner` del sistema en lugar de su
  propio ícono. Un solo indicador de carga en todo el paquete, y el del botón
  también respeta `prefers-reduced-motion`. No cambia la API.

## [0.1.2] - 2026-09-23

### Changed

- `geist` pasa a estar declarada como dependencia par **opcional**. El sistema
  la usa para las fuentes (`--font-geist-sans` / `--font-geist-mono`), así que
  un proyecto que no la instale se queda con las tipografías del sistema y
  nunca se entera de por qué. Ahora el gestor de paquetes lo avisa. Es opcional
  porque `theme.css` tiene alternativas declaradas: quien cargue las fuentes
  por su cuenta (`next/font`, self-hosted) sigue funcionando sin instalarla.

## [0.1.1] - 2026-09-23

Primera versión publicada de `sebs7n-ui`: un design system para React que pone
**Geist** —el lenguaje visual de Vercel— sobre las primitivas de **shadcn/ui
`base-nova`** (Base UI), empaquetado como una sola dependencia.

Se instala desde npm:

```bash
pnpm add sebs7n-ui @base-ui/react next-themes sonner geist
```

### Added

- **37 componentes** accesibles sobre Base UI, cada uno con su propio entry
  point (`sebs7n-ui/<componente>`), más el barrel `sebs7n-ui`. Primitivas de
  formulario (Input, Textarea, Label, Select, Checkbox, RadioGroup, Switch,
  Toggle, ToggleGroup), superposiciones (Dialog, AlertDialog, Sheet, Popover,
  Tooltip, DropdownMenu, Toaster) y contenido (Card, Table, Tabs, Badge,
  Avatar, Alert, Separator, Skeleton, Kbd, Button).
- **Búsqueda dentro de un campo: `Combobox` y `Autocomplete`.** El primero
  elige de una lista cerrada; el segundo sugiere sobre texto libre. Los dos
  filtran, se recorren con las flechas y anuncian el resultado.
- **Shell de aplicación completo**: `AppShell` y `AppShellContent` (con su
  «Ir al contenido» como primera parada de tabulación), `Sidebar`, `UserMenu`,
  `ThemeSwitcher`, `PageHeader`, `EmptyState` y `Stat`. Una app arranca con
  navegación, cabecera, menú de usuario y cambio de tema sin escribirlos.
- **`NavigationMenu`** sobre `@base-ui/react/navigation-menu`: navegación de
  sitio con paneles animados, con `keepMounted` para que los links estén en el
  HTML del server y un crawler los vea.
- **Tokens de Geist** como variables CSS y utilidades de Tailwind v4, sin
  `tailwind.config`: 9 escalas de 10 pasos (`gray`, `gray-alpha`, `blue`, `red`,
  `amber`, `green`, `teal`, `purple`, `pink`) en claro y oscuro, radios, sombras
  (`tooltip`, `menu`, `modal`), anillo de foco y foco de inputs.
- **Color de marca en tres variables CSS.** La app define `--brand-base`,
  `--brand-base-dark` y `--brand-contrast-dark`; de ahí sale la escala
  `brand-100..1000` con color relativo de CSS y el `--brand-contrast` del texto
  sobre `brand-700`. `tokens/brands.json` trae cuatro marcas de ejemplo (`teal`,
  `terracotta`, `emerald`, `blue`) y no hace falta tocarlo.
- **Escala tipográfica con corrección óptica.** `text-heading-*`, `text-copy-*`,
  `text-label-*` y `text-button-*`; el peso de los `heading` baja a medida que
  sube el tamaño (72 → 400 … 16 → 600, 14 → 600) en lugar de quedar fijo en 600,
  que es lo que se mide en vercel.com. Requiere Geist como fuente variable
  (rango `100 900`).
- **Semántica de fondos en tres roles, tres tokens.** `--sf-background` es la
  página, `--sf-background-100` la superficie que flota sobre ella (input, popup,
  card, sheet) y `--sf-background-200` el fondo sutil o banda (sidebar,
  `thead`/`tfoot`, `EmptyState`). En oscuro las superficies son `#0a0a0a` sobre
  una página `#000000`, así que se despegan.
- **`shape="pill"` en `Button`**: `rounded-full` con un escalón más de padding
  horizontal (`sm` 20px, `md` 24px, `lg` 28px), pensado para los CTA de un hero
  o de una sección de marketing, no para el chrome de una app.
- **Variantes exportadas aparte** para componer sin montar el componente:
  `buttonVariants`, `badgeVariants`, `cardVariants`, `linkVariants`,
  `toggleVariants`, `sidebarItemVariants`, `menuItemClassName` /
  `menuPopupClassName` e `inputShell*ClassName`, en `sebs7n-ui/variants/*`.
  `linkVariants` cubre los links de texto (`inline`, `subtle`, `row`), que no
  tienen forma de botón y por eso no pueden usar `buttonVariants`.
- **Server Components por defecto.** `"use client"` solo donde hace falta
  estado; el resto (variantes, `AppShellContent`, `lib/utils`) sirve en el
  server. Los entry points por módulo dejan que Next pode el bundle cliente:
  medido en Next 16.3, una página con `Button` + `Card` + `ThemeSwitcher` baja
  de 297,5 KB a 234,8 KB de JS cliente gzip importando por subpath.
- **Contraste AA verificado por tests**, no a ojo: se calcula con la fórmula de
  WCAG 2.1 sobre `tokens/geist.json` y falla si un par cruza 4,5:1. También hay
  tests de tokens, de tipografía, de los componentes, del build y del contenido
  del paquete publicado.
- **`test/despersonalizacion.test.ts`**: falla si el nombre de una de las
  aplicaciones privadas vuelve a entrar en `src/`, `tokens/`, `README.md` o
  `package.json`.
- **Sitio de documentación** (`docs/site`) con las demos ejecutables de cada
  componente, la tabla de props generada desde el TypeScript, una superficie
  para agentes (`.md` por página, `llms.txt`, `llms-full.txt`) y una registry
  con formato shadcn para sacar un componente y editarlo (`shadcn add <url>`).
- **Licencia MIT** (`LICENSE`), más la metadata de publicación: `keywords`,
  `author`, `repository`, `homepage`, `bugs` y `publishConfig.access: public`.

### Known issues

- **i18n sin provider global.** Los textos de interfaz vienen en español y se
  ajustan componente por componente con la prop `labels` (`Combobox`,
  `Autocomplete`, `ThemeSwitcher`, `UserMenu`, `AppShell`). No hay un mecanismo
  global —un provider de locale o un diccionario único—, así que una app en otro
  idioma tiene que pasar `labels` en cada punto de uso.

[Unreleased]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.3.3...v0.4.0
[0.3.3]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/sebafermanelli/sebs7n-ui/releases/tag/v0.1.1
