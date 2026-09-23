# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: SemVer 2.0.0.

## [Unreleased]

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
