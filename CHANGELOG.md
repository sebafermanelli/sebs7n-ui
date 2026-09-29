# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: SemVer 2.0.0.

Mientras el paquete sea **0.x**, un minor puede traer cambios incompatibles: SemVer no protege
la versión cero y acá todavía se mueven APIs. Cuando eso pasa, la entrada va marcada
**Breaking** con qué se rompe y cómo se migra. De 1.0 en adelante, los incompatibles esperan al
major.

## [Unreleased] — 2.0.0

Borrador de la 2.0.0: sin versión ni fecha hasta que salga. Todos los «antes» son contra **1.13.1**,
la última publicada. Guía paso a paso con el antes y el después de cada componente:
[`/docs/migrating-to-2`](https://ui.sebastianfermanelli.com/docs/migrating-to-2).

### Resumen

La 2.0 cambia el lenguaje visual entero: de las superficies de vidrio y las cápsulas de la 1.x al
de **iCloud web** (icloud.com), con valores medidos en claro y oscuro. Superficies opacas en capas
de gris, **Inter** con una escala de base 17, radios de 8–12 sin cápsula, foco interior de 3 px,
menús de 30 px con el tilde en un círculo de acento, barras fijas a todo el ancho y un sidebar de
lista de fuentes. Lo que iCloud no tiene (Switch, Tooltip, toasts, Tree, Stepper…) se deriva de
esos tokens. Suma 14 módulos de componentes nuevos; los grandes van solo por subpath para que el
barrel no pase de 55 kB gzip.

La API es la misma en casi todo: lo que se rompe es sobre todo **visual** (alturas, radios,
colores, defaults). Lo que cambia en el código de la app está marcado **Migración**.

### Breaking

#### Tokens

- **Tipografía: Inter y roles con la escala de iCloud.** `--font-sans` pasa de Geist a
  `var(--font-inter)` (con `Inter Variable`, `Inter` y `system-ui` de respaldo) y la mono a la del
  sistema. **`geist` deja de ser peer**: la app carga Inter con `next/font/google`
  (`variable: "--font-inter"`) o `@fontsource-variable/inter`. Los componentes dejan las clases de
  Geist (`text-copy-14`, `text-label-12`, `text-heading-20`…) por **roles nuevos**:

  | rol | px / peso / interlineado | en iCloud |
  |---|---|---|
  | `text-large-title` | 48 / 600 / 52, −0,005em | título grande de página |
  | `text-title-1` | 28 / 600 / 34 | título de modal, detalle |
  | `text-title-2` | 21 / 600 / 25 | título de lista, de sidebar, de widget |
  | `text-title-3` | 19 / 600 / 24 | título de grupo, de diálogo |
  | `text-headline` | 17 / 600 / 22 | título de una fila |
  | `text-body` | 17 / 400 / 22 | lo que se lee: párrafos, celdas de nombre |
  | `text-subheadline` | 15 / 400 / 20 | ítems del sidebar, mensajes del Chat |
  | `text-callout` | 14 / 400 / 18 | el chrome: menús, campos, botones, metadatos |
  | `text-footnote` | 12 / 400 / 16 | snippets, badges, ticks de gráfico |
  | `text-caption` | 11 / 400 / 13 | contador, pie legal |
  | `text-mono-body` · `text-mono-callout` | 14 · 12 | código, atajos |

  `text-body-large` es alias de `text-body`. Las clases de Geist (`text-copy-*`, `text-label-*`,
  `text-heading-*`, `text-button-*`) **siguen andando** y `cn()` las sigue fusionando, pero quedan
  obsoletas y se van en 3.0. **Migración:** la prosa de la app pasa a `text-body` (17) y el chrome a
  `text-callout` (14).
- **Radios de iCloud, sin cápsula.** `--radius-control` 10 → **8** (botones, toggles, segmentado),
  `--radius-field` 9999 → **10** (los campos dejan de ser cápsula), `--radius-surface` 20 → **11**
  (cards) y `--radius-panel` 26 → **11** (diálogos, hojas). Nuevos: `item` 10 (sidebar, filas),
  `menu` 12 (menús, popovers, toast), `menu-item` 8, `tag` 4, `tooltip` 6, `meter` 6,
  `menu-header` 7 y `thumb` 5, con sus `rounded-*` (y `cn()` los fusiona). Botones, chips, el
  segmentado, las pistas y los botoncitos de los campos dejan `rounded-full`.
- **Se va el vidrio.** Desaparecen `--glass`, `--glass-tint`, todas las `--sf-glass-*`, las
  utilidades `glass`, `glass-thin`, `glass-thick`, `glass-dense`, `glass-control`, `glass-rim`,
  `sheen` y `thumb-lens`, y `glassAlpha`/`glassSurface` del barrel. Una clase que ya no existe no
  falla: el elemento queda sin fondo. **Migración:**

  | 1.13.1 | 2.0 |
  |---|---|
  | `glass`, `glass-thick` (popover, modal, card) | `bg-surface` (+ `shadow-menu` / `shadow-modal`) |
  | `glass` en barras y sidebar | `bg-surface-bar` · `bg-surface-header` · `bg-surface-secondary` |
  | `glass-control` (campos, chips) | `bg-fill-1` |
  | `glass-dense`, grupos | `bg-grouped` |
  | `glass-rim`, `sheen`, `thumb-lens` | nada (la sombra ya trae el filo) |
  | vidrio sobre un wallpaper | `material-translucent` |

- **Superficies opacas en capas.** Tokens nuevos (`--sf-*` y su color de Tailwind): `surface`,
  `surface-secondary`, `surface-bar`, `surface-header`, `grouped`, `fill-1/2/3`, `separator`,
  `separator-strong`, `hairline`, `label`, `label-secondary/-tertiary/-quaternary`,
  `selection-inactive`, `segment`, `tooltip`/`on-tooltip`. **La página oscura pasa de `#000000` a
  `#1C1C1E`.** Los componentes dejan `text-gray-1000/900/700` por `text-label*`,
  `bg-gray-alpha-100/200/300` por `bg-fill-1/2/3` y `border-gray-alpha-400` por
  `border-separator`; la paleta de Geist sigue disponible para la app. `bg-ambient` queda como
  wallpaper opcional (`AppShell ambient`).
- **Sombras de iCloud.** `shadow-menu` y `shadow-modal` son `0 11px 34px` (16 % en claro, 65 % en
  oscuro) con el filo de 1 px; `shadow-card` es plana. **Se van** `shadow-button`,
  `shadow-button-inverted`, `shadow-button-accent`, `shadow-chip` y `shadow-track`. Botones, campos,
  chips, casillas y pistas son planos y **ya no se hunden al apretar** (`active:translate-y-px`).
- **Foco interior.** `focus-ring` pasa del anillo de Geist por fuera (`0 0 0 2px` fondo +
  `0 0 0 4px` marca) a **`inset 0 0 0 3px`** del color de foco (`--sf-focus`: `brand-700` en claro,
  `brand-900` en oscuro; `--sf-focus-alpha` lo baja al 70 % de iCloud si la marca aguanta 3:1).
  Va en `--tw-inset-ring-shadow` y se compone con la sombra del elemento. `focus-border` (campos)
  es el mismo anillo, **se ve también con el puntero** y **saca el relleno** del campo (la búsqueda
  de iCloud). Se va `data-sf-modality`. Sobre un fondo de color va `focus-ring-inverse` (nuevo).
  Switch y Slider llevan el foco **por fuera** (sobre la pista gris el interior daba 1,3:1).
- **Selección de iCloud.** El ítem resaltado de un menú (también Select, Combobox y Command) va en
  **`fill-2`** y el activo del Sidebar y de NavigationMenu en **`fill-1`**, sin cambiar el color
  del texto; en 1.13.1 era el tinte de la marca (`bg-highlight`). El acento sólido
  (`bg-selection` + `text-on-selection`) queda para la fila elegida de una lista **con el foco
  adentro** (`Table`, `List`, `Tree`, `FileGrid`); sin foco, `bg-selection-inactive`.
- **Una sola escala de alturas** para campos y botones (la del search field y el botón de iCloud):

  | tamaño | 1.13.1 | 2.0 | con el dedo |
  |---|---|---|---|
  | `sm` | 32 | **28** | 36 (campos) / 44 (botones) |
  | `md` | 40 | **36** | 44 |
  | `lg` | 48 | **40** | 44 |
  | `icon-sm` · `icon-md` · `icon-lg` | 32 · 40 · 48 | **28 · 36 · 40** | 44 |

  Input, Textarea, NumberField, OTPField, DatePicker, ColorPicker, Select, Combobox, Autocomplete,
  InputGroup y Button comparten la escala. Texto 14 e íconos 16 en los tres (el `lg` ya no sube a
  16/20); con el dedo el texto de los campos sube a 17 para que iOS no haga zoom. **Revisá los
  layouts que contaban con el `lg` de 48.** Deshabilitado = **opacidad .4** en botones y campos
  (antes gris con texto terciario).

- **El wallpaper (`bg-ambient`) cambia de contrato.** El dibujo va en un `::before` con
  `position: fixed` (ya no `background-attachment: fixed`, que iOS ignora) y el elemento pasa a
  `isolation: isolate`: un `z-index` negativo de un hijo ya no sale detrás de él. Lo translúcido
  cuelga de `data-ambient`, no de `bg-ambient`: **sin el atributo el wallpaper se ve pero las cards
  y barras siguen opacas.** **Migración:**
  `<body className="bg-ambient">` → `<body className="bg-ambient" data-ambient="">` (con
  `AppShell ambient` no hace falta); una vista previa del wallpaper en una caja lleva
  `[contain:paint]`; si pisabas `--sf-ambient-*`, pisá `--sf-wallpaper-1…4` (1 la base, 2–4 los
  círculos).

#### Diálogos

- **Dialog y AlertDialog comparten el contenedor** (`modalPopupClassName`): radio 11, `bg-surface`
  opaco, `shadow-modal`, **20 px** de padding (antes 24, vidrio) y el velo sin blur. El pie ya no
  tiene línea arriba ni márgenes negativos (`modalFooterClassName`).
- **AlertDialog es la alerta de iCloud:** **450 px** (antes 448), **todo centrado** (antes a la
  izquierda), título `text-headline`, detalle `text-callout` secundario y **dos botones iguales a
  todo el ancho** (antes a la derecha); con tres o más, o en 360 px o menos, se apilan en el orden
  del DOM. **El botón por defecto es el seguro:** con una `AlertDialogAction variant="destructive"`,
  «Cancelar» pasa a acento sólido y es el foco inicial, y la acción que destruye es gris con texto
  rojo; sin destructiva, la acción es el acento y el foco inicial (Return la dispara). En 1.13.1 la
  acción `default` era negra, `destructive` rojo sólido y el foco lo elegía Base UI. Un `<Button
  variant="destructive">` suelto en el pie no se detecta.
- **Dialog con la X arriba a la izquierda** (antes a la derecha), de 28 × 28 con glifo de 14, y el
  título centrado (`DialogHeader` `px-8 text-center`). Pie a la derecha; un único CTA centrado con
  `<DialogFooter className="sm:justify-center">`.
- **Sheet y Drawer** siguen pegados al borde, ahora opacos (antes vidrio) con `rounded-panel` (11)
  en las esquinas de adentro (el Sheet antes sin radio, el Drawer con 26), el área segura como
  padding y la X de 28 arriba a la derecha.
- **Popover y HoverCard**: `rounded-menu` (12, antes `rounded-surface` 20), opacos y con
  `shadow-menu`, 256 de ancho (antes 288) y `gap-2` (antes 3); `p-4` como antes.

#### Menús

DropdownMenu, ContextMenu, Menubar, Select, Combobox, Autocomplete y las filas de Command comparten
`variants/menu`.

| | 1.13.1 | 2.0 |
|---|---|---|
| panel | radio 14, `p-1`, `min-w` 160, vidrio | **radio 12, `p-1.25` (5), `min-w-52` (208), opaco** + `shadow-menu` |
| ítem | 32, `px-2`, radio 10, 14 `gray-1000` | **30**, `px-2.5`, radio 8, 14/400 `label`; el primer ícono en el acento |
| resaltado | tinte de marca (`bg-highlight`) | **`fill-2`**, apretado `fill-3`; el texto no cambia |
| deshabilitado | texto `gray-700` | **`opacity-30`** |
| título de grupo | 12 `gray-900`, `px-2 py-1.5` | **fila de 30, 14/600 `label`** |
| separador | borde a borde (`-mx-1`) | **`mx-2.75 my-1`**, línea `fill-2` |
| tilde | suelto a la derecha (`right-2`) | **círculo de acento a la derecha** (`right-2.5`); columna reservada `pr-9` |
| `inset` | `pl-8` | **`data-inset:pl-9`** (alinea con los ítems con ícono) |
| destructivo | `red-900`, resaltado `red-100` | **`text-red-ink`**, resaltado gris como el resto |
| atajo | 12 mono `gray-900` | **14 `label-secondary`** |

- **Menubar**: títulos de 28 (antes 32), `px-2.5`, abierto en `fill-2`.
- **NavigationMenu**: el link suelto de la barra es igual al trigger (28, 14 `label-secondary` →
  `label`); antes heredaba el texto de la página. Con `keepMounted` cerrado no ocupa lugar.
- **Select** lleva ⌃⌄ y `alignItemWithTrigger` pasa a `true` por defecto (para el de 1.x,
  `alignItemWithTrigger={false}`). **Combobox** lleva ⌃⌄. El submenú de DropdownMenu abre hacia
  `inline-end`.

#### Controles

- **Button, solo las variantes de iCloud:**

  | 1.13.1 | 2.0 |
  |---|---|
  | `default` (negro) | **`default` = acento sólido** |
  | `accent` | `default` (`accent` queda como alias **obsoleto**) |
  | `outline` | **se va** → `secondary` |
  | `secondary` | `secondary` (gris `fill-2`) |
  | `ghost` | `ghost` (texto `label`, hover `fill-2`) |
  | `destructive` (rojo sólido) | **`destructive` = gris con texto rojo** |
  | — | **`plain`** (texto semibold de acento) y **`destructive-plain`** (texto rojo) |
  | `link` | `link` (ya no agranda su área con el dedo) |

  **Migración:** `outline` → `secondary`; `accent` → sin `variant`; el negro a propósito →
  `className="bg-label text-surface hover:bg-label/85"`. Si en una pantalla convivían `default` y
  `accent`, ahora son dos acentos: pasá el secundario a `secondary` o `plain`.
- **Tabs: `line` es el default** (antes `segmented`) y es la de Settings: 17 `label-secondary` →
  `label`, subrayado de **1 px** del ancho del texto sobre la línea base `fill-3`, 60 de alto (antes
  14 px, 40 de alto y 2 px de línea). **Para el segmentado, `variant="segmented"`.** El segmentado:
  pista de **28** (antes cápsula de 32 con la pastilla que se deslizaba), segmentos de 24 del mismo
  ancho, radio 6, activo en semibold. La lista ya no lleva `group/tabs-list`: se mira su
  `data-variant` (`in-data-[variant=line]:…`). ThemeSwitcher igual.
- **ToggleGroup es el segmentado** (antes chips con `flex-wrap gap-2`); cada ítem prendido va en el
  acento sólido y admite varios. **Ya no envuelve:** para filtros que envuelven, `Toggle` de a uno en
  un `<div className="flex flex-wrap gap-2">`. **Toggle** suelto es el token de búsqueda de iCloud:
  `fill-1` sin borde y acento sólido prendido (antes borde punteado que pasaba a sólido).
- **Checkbox y Radio** marcados sin borde, sin sombra y deshabilitados a .4. **Switch**
  deshabilitado a .4, foco por fuera.
- **Slider = el de Photos:** pista de **2 px** (antes 4/6) en `label/32`, progreso en `label` (antes
  `brand-700`), perilla de **14** con borde de 2 en `label` y centro `surface` (antes círculo blanco
  de 16/20 que se estiraba como lente). `sliderThumbClassName` y sus estados cambian de valor; el
  ColorPicker los sigue.
- **Badge y Tag: etiquetas sólidas rectangulares.** Radio 4 (antes cápsula con borde), altos
  **20 / 16** (antes 24 / 20), texto 12, relleno lleno con **tinta blanca en los nueve colores** (gris, ámbar, verde y teal van
  en rellenos propios, `badge-*`, porque ningún paso de la paleta llega a 4,5:1 con blanco en oscuro).
  **El default pasa de `subtle` a `solid`**: `subtle` se acepta y dibuja lo mismo (obsoleto). `solid`
  `gray` ya no es el negro invertido (`className="bg-gray-1000 text-background-100"` para el de
  antes). El punto de `dot` va en la tinta. `--sf-tint-border` ya no lo usa ningún componente.
- **Kbd**: `fill-2` sin borde ni sombra, radio 4 (antes borde, radio 2, mono 12).
- **NumberField mide lo que el número** (`w-fit`, `field-sizing: content`): `className="w-full"`
  para el ancho entero.
- **Calendar**: días de 28 (antes 36), 40 con el dedo.
- **Chat**: mensajes a 15, campo de 36 (17 con el dedo), «Reintentar» en `secondary`.

#### Navegación y listas

- **Sin flotantes ni cápsulas.** `Sidebar` y `AppShell` pierden `variant="floating"` (su default en
  1.13.1) y `Navbar` también; la prop queda como `variant?: "bar"` **obsoleta y sin efecto** (se va
  en 3.0). `Sidebar` y `Navbar` ya no ponen `data-variant`. `useNavbar()` pierde `floating`.
  **Migración:** borrá `variant="floating"`; un estilo colgado de `[data-variant=floating]` pasa a
  `data-slot`.
- **Sidebar = lista de fuentes:** a ras (antes panel de vidrio con margen 12, radio 26 y sombra),
  `surface-secondary` con borde derecho; ítem 32 radio 10 en **15/400 `label`** (antes 14
  `gray-900`), ícono de 18 siempre en el acento, activo `fill-1`, contador en texto 14 sin pill,
  título de sección 14/600. `SidebarSearch` es el campo de iCloud (32, radio 10, `fill-1`; antes
  cápsula con borde y vidrio).
- **AppShell:** barra del teléfono de **44** (antes el `Navbar` flotante de 56); ya no importa
  `Navbar`.
- **Navbar = la barra de la home de iCloud:** a todo el ancho, **44** (antes 56), con borde abajo
  y **translúcida con desenfoque desde arriba** (`material-translucent` con su propio fill,
  `--sf-translucent-bar`, al 88 %: el texto y el secundario llegan a 4,5:1 con blanco o negro puro
  debajo, en los dos temas); antes transparente hasta scrollear. Con menos transparencia o más
  contraste es opaca (`surface-header`). `NavbarContent` sin `max-w-6xl`, padding `0 6px 0 16px`.
  La barra de `AppShell` no cambia con esto: es opaca, como la de Mail o Drive.
- **Toolbar:** `variant="bar"` es el nuevo default (antes `glass`, cápsula de vidrio del ancho del
  contenido): a todo el ancho, 44, `surface-bar`, borde abajo, gap 6. `glass` queda como alias
  obsoleto de `bar`. El botón por defecto de la Toolbar es `plain`.
- **Card = widget de iCloud:** radio 11, cuerpo `surface`, `shadow-widget`, `overflow-hidden`,
  padding 20 en `md` (antes 24, vidrio con borde). `CardHeader` es una **franja** `surface-bar` con
  `CardTitle` 21/600; `CardFooter` sin línea (antes `border-t`); `selected` es un anillo de 2 por
  fuera. **Migración:** para el grupo plano, `variant="subtle"` o
  `className="bg-grouped shadow-none"`.
- **Table = lista de Drive:** sin caja (antes borde, radio y fondo), cabecera 14 secundaria sin
  fondo, filas de **41** (antes 48; `compact` 32, antes 40), celdas con padding 10 (antes 16), primera celda
  17 `label` y el resto 14 secundario, selección redondeada. La tabla es `border-separate` y el
  fondo de hover y selección está en las celdas. **Migración:** un `border-b` o un `bg-*` en el `<tr>`
  no se ve: pasalo a las celdas (`[&>td]:border-b`, `[&>td]:bg-*`). Con grupos, **un `TableBody` por
  grupo**, cada uno con su `TableGroupHeader`.
- **Accordion y Collapsible:** filas de 44 con separador, chevron › que gira a ⌄ (antes ⌄ que
  giraba 180°), contenido a 14.
- **Tooltip gris oscuro en los dos temas** (`bg-tooltip`), 12 px, radio 6, sin flecha (antes
  `gray-1000` invertido, 13 px, radio 10).
- **Skeleton:** brillo que cruza en vez del pulso; `animate-skeleton` ya no pone `position:
  relative` (si adentro había algo `absolute`, sumale `relative`).
- **Avatar:** `sm` 28 (antes 24), `md` 32, `lg` 40, `xl` 80 (nuevo); fallback = monograma blanco
  sobre gradiente gris (antes `gray-200` con texto 12).
- **Breadcrumb** en 12 secundario con chevrons de 10; **UserMenu** con la cabecera de cuenta (72,
  `fill-2`); **Sonner** con título 600 y la acción en el acento (antes el botón invertido);
  **Meter/Progress** con el valor en 14 tabular (antes mono).

#### Command

Command es nuevo en 2.0 (no hay antes contra 1.13.1): es la **búsqueda de iCloud**, no una paleta
de Spotlight. Ver «Added».

#### Componentes solo por subpath

Todos los componentes de 1.13.1 siguen en el barrel. Los nuevos grandes van **solo por su ruta**
para no pasar el tope de 55 kB gzip del barrel (sus textos de `labels` sí entran):

`sebs7n-ui/chart` (como en 1.x, por el peer `recharts`), `sebs7n-ui/tree`, `sebs7n-ui/split-view`,
`sebs7n-ui/file-grid`, `sebs7n-ui/calendar-view`, `sebs7n-ui/stepper`, `sebs7n-ui/data-table`,
`sebs7n-ui/input-group`, `sebs7n-ui/multi-select`, `sebs7n-ui/timeline`, `sebs7n-ui/resizable`.

#### Nombres accesibles obligatorios en el tipo

- `Tree`, `FileGrid`, `StackedMeter`, `DataTable` y `Timeline` exigen `aria-label` o
  `aria-labelledby` (no compila sin uno).
- `SidebarGroupAction` exige `aria-label` (el «+» solo no dice qué crea).
- `TableGroupHeader` exige `colSpan` (el lector lo anuncia como el ancho del grupo).
- Siguen como en 1.x: Button de solo ícono, `ToolbarButton`, `Progress` y `Meter` sin `label`.

### Added

- **`material-translucent-body`** y los tokens `--sf-translucent-body` / `--sf-translucent-strip`
  (`bg-translucent-strip`): el cuerpo y la franja de un widget sobre el wallpaper.
- **Componentes nuevos:**
  - **`Command`** (`sebs7n-ui/command`, también en el barrel): la búsqueda de iCloud. `Command`,
    `CommandDialog` (anclado arriba, superficie de popover, sin X ni velo), `CommandInput` (search
    field de 36, radio 10, `fill-1`), `CommandFilters`/`CommandFilter` (tokens en un `radiogroup`),
    `CommandList`, `CommandGroup`, `CommandItem` (fila de 30 con ícono en el acento y detalle;
    `keywords`, `onSelect`) y `CommandEmpty`. Filtrado propio sin mayúsculas ni tildes;
    `shouldFilter={false}` para resultados ya filtrados.
  - **`TextLink`**: el link de Settings, semibold en el acento, `trailing="chevron" | "external"`
    (↗ con `target="_blank"`, `rel` y aviso `sr-only` por `externalLabel`). Sin `"use client"`.
  - **`List`, `ListSection`, `ListRow`** (`sebs7n-ui/list-row`): la fila de lista de iCloud (ícono
    32, título 17, detalle 14, `trailing`, `dot`, `chevron`, `selected`, `render`). Sin `"use client"`.
  - **`WidgetCard`** y **`PromoCard`**/`PromoCardLink` (`sebs7n-ui/widget-card`): el widget de Home
    armado sobre `Card`, y la card promocional de Ajustes.
  - **`StackedMeter`** (`sebs7n-ui/meter`): la barra de almacenamiento, un `meter` por segmento.
  - **`Tree`** (subpath): árbol de carpetas en el lenguaje de Drive, patrón `tree` de WAI-ARIA
    completo, hijos perezosos (`onLoadChildren`), columnas.
  - **`SplitView`** (subpath): el master-detail de Mail (230 · 380 · detalle), un panel en angosto
    con `SplitViewBack`; `resizable` con `defaultWidths`/`onWidthsChange`.
  - **`FileGrid`** (subpath): la vista de íconos de Drive, `listbox` con flechas en 2D.
  - **`CalendarView`** (subpath): mes y semana de Calendar, `role="grid"` con foco itinerante,
    `now` inyectable.
  - **`Stepper`** (subpath): pasos de un asistente en una `<ol>` nombrada, `aria-current="step"`.
  - **`DataTable`** (subpath): tabla genérica sobre `Table` con orden (`aria-sort`), búsqueda,
    páginas o «Cargar más», selección por id (sigue aunque la búsqueda o la página la escondan, y la
    región viva dice cuántas hay), vacío, carga y `groupBy`; fechas con el `locale` de la tabla.
  - **`InputGroup`** (subpath): campo con addons (texto, ícono, `Kbd`, botón) y el foco en el grupo.
  - **`MultiSelect`** (subpath): `Combobox multiple` por datos con chips, «Seleccionar todo» y `max`.
  - **`Timeline`** (subpath): eventos agrupados por día unidos por una línea de 1 px.
  - **`Resizable`** (subpath): `ResizablePanelGroup`/`ResizablePanel`/`ResizableHandle`, separador
    de WAI-ARIA con teclado y puntero, `onLayout`/`defaultLayout`. El HTML del servidor ya sale
    repartido (con los paneles como hijos directos del grupo).
- **Props nuevas:** `AlertDialogIcon` y `AlertDialogDescription align`; `PopoverContent
  translucent`; `external` en los ítems de DropdownMenu, ContextMenu y Menubar;
  `Button variant="plain" | "destructive-plain"`; `Badge variant="count"`; `Checkbox shape="circle"`;
  `Kbd size`; `SidebarGroup collapsible`/`defaultOpen`/`open`/`onOpenChange` y
  `SidebarGroupAction`; `AppShell header`; `CardHeader icon`, `CardRow`, `CardContent columns`;
  `TableGroupHeader`; `CollapsibleTrigger chevron`; `Avatar size="xl"`; `Meter size="lg"`;
  `EmptyState variant` (`default`, `subtle`, `plain`, `placeholder`); `Toolbar variant="bar"`;
  `linkVariants({ variant: "accent" })`.
- **Tokens y utilidades:** los roles tipográficos; los radios nuevos (ver Breaking); las superficies,
  fills, separadores y labels; `--sf-selection`/`--sf-on-selection`/`--sf-selection-inactive`;
  `--sf-focus`/`--sf-focus-alpha`; `focus-ring-inverse`; `material-translucent` (el único material
  con blur, opaco con `prefers-reduced-transparency`) y `--sf-translucent-bar` (su fill para el
  Navbar); `shadow-widget`, `shadow-segment`,
  `shadow-badge`, `shadow-thumbnail`; `touch-target` y `touch-target-y`; el variant
  `inside-selection`; `--sf-skeleton-shine`; `monogram-top`/`monogram-bottom`.
- **Clases compartidas** (`variants/*`, también en el barrel): `menuGutterClassName`,
  `menuInsetClassName`, `menuIndicatorClassName`, `menuCheckClassName`, `menuItemContentClassName`,
  `menuItemDestructiveClassName`, `menuItemExternalClassName`, `menuItemExternalIconClassName`,
  `menuItemSecondaryClassName`, `selectionSecondaryClassName`, `commandDialogPopupClassName`,
  `commandInputClassName`, `commandFilterClassName`, `commandItemClassName`,
  `commandItemIconClassName`, `alertWidthClassName`, `alertFooterClassName`,
  `closeButtonClassName`, `dialogCloseClassName`, `tooltipSurfaceClassName`,
  `segmentedItemClassName`, `sliderThumbClassName` y sus estados.
- **Labels nuevos:** `command`, `tree`, `meter` (`free`, `used`), `calendarView`, `stepper`,
  `dataTable`, `multiSelect`, `resizable`.
- La tabla de subpaths del README dice qué componentes no están en el barrel (la lee de
  `src/index.ts`).

### Changed

- **Wallpaper de la home de iCloud (W).** `bg-ambient` deja los tres focos casi invisibles por
  círculos grandes superpuestos del color del brand, de borde nítido, sobre una base del tono más
  profundo, en claro y en oscuro. Adentro de `data-ambient` pasan a translúcidos con blur `Card`,
  `WidgetCard`, `Sidebar`, `Toolbar` y la barra de `AppShell`, y el `Navbar` usa el fill de
  `material-translucent` en vez del denso; menús, diálogos y campos siguen opacos. `label` y
  `label-secondary` llegan a 4,5:1 directo sobre cualquier punto del wallpaper. Lo que rompe está
  en **Breaking › Tokens** y en **Removed**.
- Los íconos de Button crecen con el tamaño: 16 en `icon-sm`, **18 en `icon-md`**, 20 en `icon-lg`.
- `Badge variant="subtle"` y `Button variant="accent"` quedan obsoletos (siguen andando; se van en 3.0).
- `Toolbar variant="glass"` y `variant="bar"` de Sidebar/AppShell/Navbar quedan como alias obsoletos.
- Con el dedo, pestañas, filas de Command y botones llegan a 44; Toolbar, Calendar y ToggleGroup
  separan sus controles 20 px para que las áreas no se pisen.
- La paleta de gráficos, las burbujas del Chat, Stat, Spinner y Pagination solo cambian por los
  tokens (sin cambios de API).

### Removed

- El vidrio: `--glass`, `--glass-tint`, `--sf-glass-*`, `glass`, `glass-thin`, `glass-thick`,
  `glass-dense`, `glass-control`, `glass-rim`, `sheen`, `thumb-lens`, `glassAlpha`, `glassSurface`.
- Sombras `shadow-button`, `shadow-button-inverted`, `shadow-button-accent`, `shadow-chip`,
  `shadow-track`.
- `Button shape` (y el tipo `ButtonShape`): con el radio de iCloud `pill` y `rect` ya no
  cambiaban la forma. Una sola forma de botón.
- `Button variant="outline"`; `variant="floating"` de Sidebar, AppShell y Navbar;
  `useNavbar().floating`; `data-sf-modality`.
- El peer opcional `geist`.
- `--sf-ambient-gain` y `--sf-ambient-1`, `-2`, `-3` (los focos de la luz ambiente de 1.x): los
  tonos del wallpaper son `--sf-wallpaper-1…4`, y cuánto color se regula con `--ambient`.

### Migración

Paso a paso, con el antes y el después de cada componente y una lista para revisar una app:
**[`/docs/migrating-to-2`](https://ui.sebastianfermanelli.com/docs/migrating-to-2)**. Lo mínimo:

1. Cargar Inter (`next/font/google` con `variable: "--font-inter"`, o `@fontsource-variable/inter`)
   y sacar `geist`.
2. Reemplazar `glass*` y `shadow-button*` propios por las superficies y sombras de la tabla.
3. `Button variant="outline"` → `"secondary"`; borrar `variant="floating"` y `shape`.
4. Tabs que dependían del segmentado por defecto → `variant="segmented"`.
5. Revisar alturas (`lg` 48 → 40), la Table (bordes y fondos en celdas) y las alertas.

## [1.13.1] - 2026-09-28

### Fixed

- **Peso: cuatro componentes dejan de cargar partes de Base UI que no usan al abrir.** Sin cambios
  de API: los mismos subpaths y los mismos exports. Medido con Turbopack en el sitio de docs, en
  KB gzip de JS inicial, con Base UI adentro; como se reparten floating-ui, en otra app los
  números no se suman tal cual.
  - **`ThemeSwitcher`, −52 KB.** Importaba el `Menu` entero de Base UI porque `ThemeMenuRadio`
    vivía en el mismo módulo y ningún bundler lo descartaba (ni con `sideEffects`, ni sin
    `"use client"`). `ThemeMenuRadio` se sigue importando de `sebs7n-ui/theme-switcher` y del
    barrel; solo cambió de archivo.
  - **`Sidebar`, −43 KB.** El `Tooltip` se pide recién cuando el Sidebar está colapsado, que es
    el único caso en que muestra tooltips. La primera vez, el tooltip aparece cuando llega el
    módulo; mientras tanto el ítem se ve y se anuncia igual, y si tenía el foco lo conserva.
    Colapsar y expandir después ya no vuelve a montar los ítems.
  - **`UserMenu`.** El mismo arreglo que el Sidebar: el tooltip del avatar colapsado carga el
    `Tooltip` recién ahí. No tiene medición propia: el sitio de docs no lo usa.
  - **`AppShell`, −13 KB.** El `Sheet` de la barra mobile se pide al tocar la hamburguesa. Hasta
    entonces la hamburguesa es un botón con el mismo aspecto, que anuncia `aria-haspopup` y
    `aria-expanded` como el trigger de Base UI. El primer toque no se pierde: el Sheet se abre
    cuando llega, deslizándose como las demás veces, y al cerrarlo el foco vuelve a la
    hamburguesa.

## [1.13.0] - 2026-09-28

### Added

- **`DatePicker clearable`.** Suma un «Limpiar» al pie del calendario cuando hay fecha elegida,
  para filtros y campos opcionales: sin él, una fecha elegida no se podía sacar. Vacía también
  el campo del formulario (en rango, los dos) y cierra el calendario. El texto sale de
  `labels.datePicker.clear`.

## [1.12.1] - 2026-09-27

### Fixed

- **`BreadcrumbList` ya no duplica los separadores.** Un `map` que devolvía un fragment por
  nivel con su propio `BreadcrumbSeparator` adentro dibujaba dos flechas seguidas: la lista
  contaba el fragment como un ítem y le sumaba la suya. Ahora abre los fragments e ignora los
  separadores escritos a mano; los pone siempre la lista.

## [1.12.0] - 2026-09-27

### Added

- **`scroll-fade`**: el difuminado de un scroll interno. Arriba y abajo el contenido se
  desvanece en vez de cortarse contra el borde, y solo del lado donde hay algo escondido. Lo
  mueve el propio scroll (`animation-timeline`), sin JavaScript; donde el navegador no lo
  soporta, se corta como antes. Lo traen `SidebarContent`, `ChatMessages` y `DrawerBody`.

## [1.11.0] - 2026-09-27

### Changed

- **El vidrio lleva 65 % de fill con `--glass: 1`**, no 30 %. Es el mínimo con el que el
  texto principal pasa 4,5:1 contra cualquier cosa que pase por debajo: los links de una
  barra ya no se pierden sobre una foto clara. El blur, la saturación y el canto no cambian.
  Con `--glass: 0.5` el fill es 82 %.

### Removed

- **`glass-halo` y `no-halo`**, de 1.9. El halo detrás de cada letra resolvía la legibilidad
  pero se veía mal; la solución es más fill en todo el material.

## [1.10.0] - 2026-09-27

### Changed

- **El `Sidebar` flota por defecto** (`variant="floating"`): una píldora de vidrio despegada
  12px del borde, con radio de panel, sombra y el canto especular, como el sidebar de macOS
  con Liquid Glass. `variant="bar"` vuelve al de antes, a ras de la ventana.
- **La barra del teléfono del `AppShell` es el `Navbar` flotante** (`variant="floating"`):
  transparente arriba de todo y una píldora de vidrio al scrollear. `variant="bar"` vuelve a
  la barra a ras.

Es un cambio de aspecto, no de API: nada deja de compilar. Quien quiera el estilo anterior
pasa `variant="bar"` a los dos.

## [1.9.1] - 2026-09-27

### Fixed

- **`glass-halo` más fuerte.** Con una sola capa, un link gris sobre una ilustración clara en
  tema oscuro seguía perdiéndose. Ahora son cuatro capas de halo y un velo difuso detrás de
  cada link y botón (en `background-image`, así el hover sigue igual).

## [1.9.0] - 2026-09-27

### Added

- **`glass-halo`**: un halo del color de la página detrás del texto y los íconos de una
  barra de vidrio, como hace Apple sobre fondos que cambian. Sobre la página no se ve; cuando
  pasa una foto clara por debajo en tema oscuro, los links se siguen leyendo con el vidrio en
  1. Escala con `--glass`. Lo traen `Navbar` (con vidrio) y `Toolbar variant="glass"`; los
  botones sólidos lo apagan con `no-halo`.

## [1.8.0] - 2026-09-27

### Changed

- **Los menús llevan un vidrio más denso** (`glass-dense`): DropdownMenu, ContextMenu,
  Menubar, Select, Combobox y Autocomplete. Un menú se lee, y flota sobre lo que haya: sobre
  una foto clara en tema oscuro el texto quedaba en 1,64:1. Ahora el fill es de 65 % en
  oscuro y 80 % en claro, y en oscuro lo de atrás baja al 40 % de su brillo. El texto
  principal y el secundario pasan 4,5:1 contra cualquier fondo en los dos temas. Las barras,
  tarjetas, paneles y diálogos no cambian.

### Added

- La utilidad `glass-dense` y sus dos tokens por tema, `--sf-glass-dense-fill` y
  `--sf-glass-dense-backdrop`, para darle el mismo material a una lista propia.

## [1.7.0] - 2026-09-27

### Added

- **`useNavbar()`**: el estado del `Navbar` (`scrolled`, `floating`) para un hijo que tiene
  que cambiar con él y no le alcanza con CSS.
- **`Toolbar variant="plain"`**: sin material, para una barra que vive adentro de otra
  superficie. Las dos juntas permiten una segunda fila en el `Navbar` que arriba es su propia
  cápsula y, con la barra despegada, pasa a ser parte de ella.

## [1.6.0] - 2026-09-27

### Added

- **`Navbar`: `surfaceClassName`.** Las clases de la caja de vidrio, que es la que tiene el
  ancho y el radio de la barra despegada (`className` va al `<header>`). Para que `floating`
  sea una cápsula del ancho del contenido de la app y no un panel de `max-w-6xl`.

## [1.5.2] - 2026-09-27

### Fixed

- **`Button`: un texto con `truncate` adentro ahora se recorta con «…».** El envoltorio del
  contenido no podía medir menos que su texto, así que en un botón angosto el texto se cortaba
  contra el borde.

## [1.5.1] - 2026-09-27

### Fixed

- **`Toolbar`: Inicio y Fin ignoran los controles escondidos.** Un control oculto por CSS —el
  que una barra muestra en el teléfono y no en escritorio— sigue en el DOM pero no puede
  recibir el foco: si quedaba primero, Inicio le apuntaba a él y el foco no se movía.

## [1.5.0] - 2026-09-27

### Added

- **`Calendar` y `DatePicker` con varios meses** (`numberOfMonths`). Para un rango que cruza
  de un mes al otro. Cada fecha aparece una sola vez: con más de un mes a la vista, los
  huecos de cada grilla quedan vacíos en vez de repetir los días del mes de al lado, que es
  lo que hace que un rango se vea partido. Los botones van en las puntas, las flechas cruzan
  de un mes al otro sin mover la vista y sigue siendo una sola parada de tabulación.

### Changed

- `Calendar`: la banda de un rango se cierra redonda en el primer y el último día del mes,
  igual que en las puntas de una semana.
- `Calendar`: el contenedor pasa a tener un bloque por mes (`data-slot="calendar-month"`).
  Quien le pasaba `className` con `gap-*` o `flex-*` a la raíz para separar título y grilla
  ya no los mueve.

## [1.4.1] - 2026-09-27

### Changed

- **La luz ambiente del tema oscuro, un paso más abajo.** La de 1.4.0 todavía teñía la página.
  Baja el alfa (la ganancia pasa de 0,7 a 0,5) y el croma (de 0,6–0,45 a 0,45–0,35 del
  brand): el color se intuye detrás del vidrio, no tiñe. `--glass` y el tema claro no cambian.

## [1.4.0] - 2026-09-27

### Added

- **`--ambient`**: cuánta luz ambiente, de 0 a 1 (default 1). Un solo número, como `--glass`.
  `bg-ambient` lo lee en el elemento, así que se puede pisar en `:root`, en `.dark` o donde
  esté la utilidad. El Playground suma el control.

### Changed

- **La luz ambiente del tema oscuro es más tenue.** Sobre negro, un color saturado compite
  con el contenido: los focos bajan de croma (de 0,95–0,75 a 0,6–0,45 del brand), de
  luminosidad y de alfa (×0,7), y se acercan al matiz de la marca (30° y −25°, antes 55° y
  −45°), para que detrás del vidrio haya un color y no tres. El vidrio no cambia: `--glass`
  sigue en 1. El tema claro queda igual.

## [1.3.0] - 2026-09-27

### Added

- **`AiGlow`** (`sebs7n-ui/ai-button`): el borde de la IA para cualquier contenedor —un
  diálogo que lee un documento, una tarjeta que se completa sola—. Se suelta adentro, toma la
  forma del contenedor y se enciende con `active`. La regla es una sola: siempre que la IA
  esté trabajando, y solo entonces.
- `ChatInput` acepta `inputRef`, para enfocar el campo desde afuera.

### Changed

- Sitio: los ejemplos usan un solo vocabulario, genérico (facturas, clientes, equipos). Las
  demos de `Chat`, `AiButton` y el Playground, y seis anteriores, tenían contenido de un
  dominio puntual.

### Fixed

- **`ChatMessages` con un `ref` dejaba de seguir al último mensaje.** El `ref` del llamador
  pisaba el interno, que es el que mide la lista. Ahora los dos apuntan al mismo nodo.

## [1.2.0] - 2026-09-27

### Added

- **El borde de la IA mientras trabaja** (`ai-glow`): el contorno encendido que recorre la
  pantalla del iPhone cuando se activa Siri. Es una señal de estado, no un adorno: solo se ve
  con una respuesta en curso, y reemplaza a un spinner. Con `prefers-reduced-motion` se
  enciende pero no gira.
- `Chat` acepta `busy`: enciende el borde alrededor de la conversación y les avisa a
  `ChatMessages` y a `ChatInput`, que ya no necesitan su propio `busy` (lo siguen aceptando).
- `AiLauncher` acepta `active`: el canto gira mientras hay una respuesta en camino.

## [1.1.0] - 2026-09-27

### Added

- **`AiButton`** (`sebs7n-ui/ai-button`), con `AiIcon`, `AiLauncher` y `AiShimmer`: lo que hace
  la IA, con su propio color. `AiButton` es el `Button` del sistema en `outline` o `solid`;
  `AiLauncher`, el botón redondo de vidrio que abre el asistente, con el canto en el degradé de
  la IA y una etiqueta que aparece al pasar el puntero; `AiShimmer`, el placeholder de «la IA
  está trabajando».
- **`Chat`** (`sebs7n-ui/chat`): las piezas de una conversación con un asistente. `Chat`,
  `ChatHeader`, `ChatTitle`, `ChatActions`, `ChatMessages`, `ChatMessage`,
  `ChatMessageActions`, `ChatEmpty`, `ChatSuggestions`, `ChatSuggestion`, `ChatTyping`,
  `ChatError`, `ChatFooter`, `ChatInput` y `ChatDisclaimer`. La lista sigue al último mensaje
  mientras el usuario esté abajo; Enter envía y en táctil baja de renglón; con una respuesta en
  curso, el botón de enviar pasa a ser el de detener. No sabe de modelos ni de streaming.
- **El color de la IA**: `text-ai`, `bg-ai-solid`, `bg-ai-solid-hover` y `ai-2`, más las
  utilidades `ai-rim` y `ai-shimmer` y la sombra `shadow-ai`. Es propio y no el de marca: una
  acción de IA se reconoce igual con cualquier brand. El sólido es el mismo tono en los dos
  temas, para que el texto blanco pase 4,5:1.
- `Labels` suma los grupos `ai` y `chat`.

## [1.0.0] - 2026-09-27

El material pasa a ser vidrio. La guía para migrar el código de una app está en
[Migrar a 1.0](https://ui.sebastianfermanelli.com/docs/migracion).

### Breaking

- **El material por defecto es vidrio.** Todo lo que flota —Card, Alert, Table, Popover,
  HoverCard, los tres menús, Select, Combobox, Dialog, AlertDialog, Sheet, Drawer, Sidebar,
  Navbar, Toolbar, Toast— cambia `bg-background-100` por la utilidad `glass`. Para volver al
  sólido de 0.8.0: `--glass: 0` en `:root`.
- **Radios.** Los componentes dejan `rounded-md` / `rounded-xl` / `rounded-2xl` y usan tres
  tokens propios: `--radius-control` (10px), `--radius-surface` (20px) y `--radius-panel`
  (26px). Para volver a los de Geist: 6px, 12px y 16px. Quien pisaba `--radius-md` o
  `--radius-xl` en un `@theme` para cambiarle el radio a los componentes tiene que pisar los
  nuevos: la escala de Tailwind ya no los alcanza.
- **Los campos son cápsulas**, como los botones: `Input`, `Select`, `Combobox`, `Autocomplete`,
  `NumberField`, `DatePicker`, `ToolbarInput` y `SidebarSearch` usan el token nuevo
  `--radius-field` (9999px), y el padding horizontal pasa de 12 a 16px. `Textarea` y un
  `Combobox` con chips frenan el radio en 20px; las casillas de `OTPField`, en 10. Con
  `--radius-field: 10px` vuelve el rectángulo.
- **`Button` es una cápsula** (`rounded-full`), los de ícono incluidos. `shape="rect"` devuelve
  el rectángulo. `shape="pill"` sigue sumando padding, pero ya no cambia el radio.
- **Los estados prendidos usan el brand.** `Checkbox` y `Radio` marcados, `Switch`, y el
  relleno de `Slider`, `Progress` y `Meter` pasan de `gray-1000` a `brand-700`.
  `Switch variant="accent"` queda igual que el default; `variant="neutral"` es el gris.
- **La selección usa el brand en tinte.** El ítem de menú resaltado (`data-highlighted`) y el
  ítem activo del `Sidebar` pasan de `gray-200` / `gray-alpha-200` a `bg-highlight`. En el
  `Sidebar` el ícono del activo toma `brand-900`; el texto sigue en `gray-1000`.
- **El foco de los campos usa el brand.** `--sf-focus-border` es `brand-700` y el halo, el mismo
  color al 22 % (30 % en oscuro).
- **`Tabs` es una pista segmentada por defecto.** `<TabsList variant="line">` es la de antes.
  `TabsList` ya no mide `w-full`: mide lo que miden sus pestañas.
- **`ThemeSwitcher` y `ThemeMenuRadio` son la pista segmentada de `Tabs`**, con íconos: la opción
  elegida ya no se pinta (`data-checked:bg-*`), la marca una pastilla que se desliza.
- **El panel de `NavigationMenu`** usa el radio concéntrico de los menús (el del link más su
  `p-1`) en vez del de superficie.
- **`Badge` y `Tag` son vidrio teñido.** El fondo y el borde pasan de `-100` y `-400` opacos al
  `-700` de la paleta en alfa (12 % y 24 % en claro; 22 % y 34 % en oscuro), con un filo de luz
  (`shadow-chip`). El texto pasa de `-900` a la tinta de la paleta (`text-red-ink`), que es el
  60 % de `-900` y el 40 % de `-1000`: `-900` sobre un tinte visible no llega a 4,5:1.
  `solid` suma el brillo de los botones de color.
- **El pie de `Table`** (`TableCaption`) tiene aire arriba y abajo: quedaba apoyado en el borde
  inferior del contorno.
- **El borde por defecto es alfa.** El `border-color` de base pasa de `gray-400` a
  `gray-alpha-400`, y los estados apagados (`data-disabled:`) de todos los controles, de
  `gray-400` / `gray-100` a sus pares en alfa. `Accordion`, `Sheet`, `Drawer` y `Card` también.
- **`Alert` es alfa sin blur** (`glass-control`): su lugar más común es adentro de una `Card`, y
  como vidrio era vidrio sobre vidrio.
- **`Tooltip` ya no tiene flecha.**
- **La franja de color de `Alert`** es una píldora adentro de la superficie, a 8px del borde, y
  el padding izquierdo pasa de 16 a 20px. Pegada al borde no entraba en el radio de 20px.
- **Bordes y fondos internos pasan a alfa**: `border-gray-400` → `border-gray-alpha-400`,
  `bg-gray-100/200/300` → `bg-gray-alpha-*`, `bg-background-200` → `bg-gray-alpha-100`. El
  hover de una fila de `Table` es `gray-alpha-100` y la elegida, `bg-highlight`. Un
  test de la app que fije esas clases sobre un componente del paquete va a fallar.
- **`Sidebar`** ya no pinta `background-200`: es vidrio grueso.

### Added

- **`--glass`** (0 a 1, default 1) y **`--glass-tint`** (0 a 1, default 0): las dos variables
  del material. De `--glass` salen el alfa del fill, el blur, la saturación, el brillo y el
  canto especular. Se pueden pisar en `:root` o en un subárbol.
- Utilidades **`glass`**, **`glass-thin`**, **`glass-thick`**, **`glass-control`**,
  **`glass-rim`**, **`sheen`** y **`bg-ambient`**. tailwind-merge las conoce: un `bg-*` del
  llamador le gana a `glass`.
- **`<AppShell ambient>`**: la luz ambiente, tres focos de color derivados de `--brand-base`.
  Opt-in.
- **Accesibilidad del material**: con `prefers-reduced-transparency: reduce` o
  `prefers-contrast: more` el paquete apaga el vidrio y todo se ve sólido.
- **El halo de foco de un campo aparece solo al navegar con teclado.** Con el puntero queda
  el borde de color, que sigue siendo el indicador. El paquete anota la modalidad en
  `<html data-sf-modality>`.
- **El pulgar de `Slider` y `Switch` se vuelve lente mientras se lo arrastra**
  (`thumb-lens`, `transition-thumb`).
- **`Calendar`** (`sebs7n-ui/calendar`) y **`DatePicker`** (`sebs7n-ui/date-picker`): un mes en
  una grilla y un campo que lo abre, para una fecha o un rango (`mode="range"`). Reemplazan a
  `<input type="date">`, cuyo calendario es del navegador y no toma el material, la tipografía
  ni el idioma de la app. Grilla de fechas de WAI-ARIA, con `min`, `max`, `isDateDisabled`,
  `locale` y `weekStartsOn`. **`DatePicker` no valida**: no tiene `required` ni se registra en
  un `Field`.
- **`ColorPicker`** (`sebs7n-ui/color-picker`): un campo que abre un selector de color con tres
  pestañas —paleta, espectro y valores— y los últimos colores usados (`recent`). Trabaja en
  OKLCH; con `name`, el formulario lo recibe como hexadecimal. **No guarda los recientes:** los
  muestra, y la app decide dónde vive la lista. `footer` recibe el color actual, para una vista
  previa o un aviso de contraste. Reemplaza a `<input type="color">`.
- `sebs7n-ui/lib/color`: `oklchOfHex`, `cssOfOklch` e `isSameColor`.
- `Labels` suma el grupo `colorPicker`.
- `sebs7n-ui/lib/dates`: aritmética de fechas de calendario, sin dependencias.
- `Labels` suma los grupos `calendar` y `datePicker`.
- `sebs7n-ui/variants/segmented`: `segmentedTrackClassName` y `segmentedThumbClassName`, la
  pista y la pastilla que comparten `Tabs` y `ThemeSwitcher`.
- `Button` expone `data-size`, como `Input` y `Select`.
- `bg-highlight` y `bg-highlight-active`, `shadow-button-accent`.
- `sebs7n-ui/lib/contrast`: `glassAlpha`, `glassSurface`, `composite` y `hexOfOklch`, para
  que una app mida el contraste de su texto sobre su vidrio.
- Sitio: **Playground** (`/docs/playground`), con el material, el tinte, el color de marca
  —selector con paleta, espectro y valores en OKLCH—, los radios y la luz ambiente. Copia el
  CSS y la configuración vale para todo el sitio.

### Contraste sobre vidrio: lo que se garantiza y lo que no

- Con el default (`--glass: 1`), texto principal y secundario a 4,5:1 **sobre la página y
  sobre la luz ambiente**.
- Hasta `--glass: 0.5`, texto principal a 4,5:1 **contra cualquier fondo**.
- **No se garantiza**, con el default, el texto de un vidrio que flota sobre contenido
  arbitrario: negro detrás de un vidrio claro deja `gray-1000` en 2,12:1; blanco detrás de uno
  oscuro, en 1,64:1. La salida es `--glass: 0.5` en ese subárbol. Está medido en
  `test/glass-contrast.test.ts` y explicado en la página de Accesibilidad.

## [0.8.0] - 2026-09-26

### Added

- **`Navbar`** (`sebs7n-ui/navbar`) + `NavbarContent`: la barra de arriba de un
  sitio o un portal, con dos variantes. `bar` va a todo el ancho, transparente
  arriba y translúcida con blur (`background-100` al 80 %) y borde abajo al
  scrollear. `floating` arranca igual y al scrollear se despega en una píldora:
  margen a los costados y arriba, `rounded-2xl`, borde y `shadow-menu`. La
  transición es de 300 ms sobre padding, radio, fondo y blur. `position`
  `sticky` (default) o `fixed`; `scrollThreshold` configurable; `data-scrolled`
  en el `<header>` para que los hijos cambien con ella.

### Changed

- La barra mobile del `AppShell` es translúcida con blur, igual que `Navbar`.


## [0.7.2] - 2026-09-26

### Fixed

- **El botón blanco no tenía relieve en oscuro.** `shadow-button` pone un filo
  blanco arriba, y el Button `default` es `gray-1000`: negro en claro, **blanco**
  en oscuro, donde un filo blanco no se ve. Token nuevo `shadow-button-inverted`
  para lo que se pinta con `gray-1000` (Button `default`, Checkbox y Radio
  marcados): en claro es el mismo filo claro; en oscuro el filo es un gris apenas
  más oscuro que la superficie, que es lo que le da el relieve a algo blanco.


## [0.7.1] - 2026-09-26

### Fixed

- **El barrel arrastraba `recharts`.** `src/index.ts` hacía `export *` de
  `chart`, que importa `recharts`, y `recharts` es un peer opcional: toda app
  que hiciera `from "sebs7n-ui"` sin tenerlo instalado dejaba de compilar
  (`Module not found: Can't resolve 'recharts'`), aunque no usara ningún
  gráfico. Apareció en la primera app que instaló 0.7.0. `Chart` queda **solo
  por subpath** (`sebs7n-ui/chart`), y un test verifica que el barrel no
  nombre ningún módulo que importe un peer opcional.


## [0.7.0] - 2026-09-26

Íconos, gráficos y un toque de profundidad. Salió de mirar el sitio con ojos de
consumidor: no había forma de mostrar un dato en un gráfico, los íconos se
ponían a mano en cada app, y todo era plano hasta que se tocaba.

### Added

- **`Icon`** (`sebs7n-ui/icon`): un ícono de lucide con los tamaños del sistema
  (`sm` 16 · `md` 20 · `lg` 24), tonos (`current`, `muted`, `subtle`, `brand`,
  `success`, `warning`, `danger`: el 900 de cada familia, que llega a 4,5:1) y la
  semántica resuelta: sin `label` es decoración (`aria-hidden`, `focusable=false`);
  con `label` es `role="img"`. Server-safe. No reemplaza al ícono pelado dentro de
  `Button`, `Badge`, `SidebarItem` o `EmptyState`, que ya lo dimensionan.
- **`Chart`** (`sebs7n-ui/chart`): `ChartContainer`, `ChartTooltip` +
  `ChartTooltipContent`, `ChartLegend` + `ChartLegendContent`, `useChart` y
  `useChartMotion` sobre **Recharts**, que entra como peer **opcional**
  (`recharts@^3.10`): solo lo instala la app que grafica, y ningún otro subpath lo
  importa. El contenedor pone `--color-<serie>` por config, en orden fijo, y viste
  grilla, ejes y anillos con los tokens. El gráfico lleva `responsive`; no hay
  `ResponsiveContainer`.
- **Paleta de gráficos** `chart-1…chart-5` (`--sf-chart-n`, también `bg-chart-n`):
  blue, amber (900 en claro, 600 en oscuro), pink, purple, green. Es el orden de
  cinco tonos Geist que pasa el validador de daltonismo (ΔE ≥ 8 entre adyacentes
  en deutan, protan y tritan) y el 3:1 contra la superficie. Una sexta serie no se
  inventa.
- **Tokens de profundidad** `shadow-card`, `shadow-card-hover`, `shadow-button` y
  `shadow-track`, en claro y en oscuro (en oscuro la profundidad la da un filo
  claro `inset`, porque negro sobre negro no existe). Utilidad `transition-surface`
  = `transition-control` + `translate`.
- Sitio: catálogo **Iconos** (`/docs/iconos`, los 1.848 de lucide con búsqueda; un
  clic copia el import), páginas de `Icon` y `Chart`, y transiciones entre páginas
  con `<ViewTransition>` (React 19.3 / Next 16, sin flag).

### Changed

- **Profundidad sutil, estilo Geist: se nota al tocar, no de lejos.** Lo que flota
  lleva `shadow-card` (Card `default`, Button `outline` y `secondary`, todos los
  controles de formulario vía `inputControlClassName`, Toggle, Kbd, Toolbar,
  ThemeSwitcher, Alert, Table, SidebarSearch, la barra mobile del AppShell). Lo
  sólido que se aprieta lleva `shadow-button` y se hunde 1px en `active` (Button
  `default`/`accent`/`destructive`, Checkbox y Radio marcados). Lo hundido lleva
  `shadow-track` (pistas de Switch, Slider, Progress y Meter; Card `subtle`, y con
  ella `EmptyState`). Card `interactive` sube 1px en hover. Deshabilitado = plano.
  `ghost` y `link` no cambian: en reposo no tienen superficie.
- **Alert:** la franja de color de las variantes es un pseudo-elemento (`before:`,
  píldora de 3px) y ya no un `box-shadow: inset`, para que `shadow-card` tenga
  lugar. Si una app pisaba la franja con un `shadow-[…]` propio, ahora la pisa con
  `before:bg-*`.
- `ComboboxEmpty` / `AutocompleteEmpty`: «Sin resultados» mide lo que un ítem
  (`h-8`), no tres filas, y va alineado a la izquierda como ellos.
- `cn()` conoce las sombras nuevas: `shadow-card` y `shadow-menu` en el mismo
  `className` se resuelven como conflicto, gana la última.

### Fixed

- Sitio: el botón de copiar de los bloques de código vivía `absolute` sobre un
  `<pre>` con scroll, así que un comando largo pasaba por debajo y el hover
  translúcido lo dejaba ver; además no estaba centrado. Ahora va al lado del
  `<pre>`, en flex. Las cards de «Los que más se usan» miden lo mismo entre sí.
- Sitio: Next 16.3 generaba `AGENTS.md` y `CLAUDE.md` en cada `next dev`;
  `agentRules: false`.


## [0.6.1] - 2026-09-24

### Fixed

- **El workflow de release no podía publicar.** `test/build.test.ts` hacía
  destructuring de array sobre la salida de `npm pack --json`, que cambió de
  forma: array de paquetes hasta npm 11.9, mapa por nombre
  (`{ "sebs7n-ui": { … } }`) desde npm 12. El job de release hace
  `npm install -g npm@latest`, así que corre con una npm distinta de la del
  runner y de la de desarrollo: el test pasaba en CI y reventaba en el publish.
  Ahora acepta las tres formas y falla con un mensaje que lo dice si aparece una
  cuarta. Verificado corriendo el test con npm 11.9 y con npm 12.1. No cambia
  nada del paquete publicado.

## [0.6.0] - 2026-09-23

Los tres agujeros que mostró el `LabelsProvider` al usarse por primera vez en una
app traducida de verdad. Ninguno se veía desde adentro del paquete.

### Added

- **Los labels que se pegan a un dato aceptan una plantilla, no solo un
  prefijo.** `combobox.remove` del `LabelsProvider` y las props `removeLabel` de
  `Tag` y `ComboboxChip` armaban el nombre del botón como «Quitar» + «Chile».
  Eso funciona en español, inglés y portugués, y en ningún idioma donde el verbo
  no vaya adelante: en alemán es «Chile entfernen» y no hay prefijo que lo arme.
  Ahora los tres aceptan `string | ((name: string) => string)`, que es lo que ya
  hacía `labels.page` de `Pagination`. El string sigue andando igual: no rompe
  nada. Son los únicos tres labels del paquete que se concatenan con un dato.

### Changed

- **`LabelsProvider` memoiza contra el contenido y no contra la identidad de
  `value`.** Memoizar contra la identidad era correcto y no se notaba con el
  ejemplo del README, que usa una constante de módulo; pero el caso de uso del
  provider es i18n, donde el objeto lo arma un componente (`t("close")` por
  clave) y es nuevo en cada render. Sin `useMemo` del lado del llamador, cada
  render del layout re-renderizaba a todos los consumidores del contexto, o sea
  a toda la app. Ahora compara los 24 textos con `Object.is` —0,6 µs medidos—
  y, si dicen lo mismo, conserva la identidad anterior. Quien usa el provider no
  tiene por qué conocer su implementación para que su app no se arrastre. El
  `useMemo` del llamador sigue siendo válido y ahorra la comparación.

### Fixed

- **`PageHeader` ya no manda un `aria-label` en español a una app traducida.**
  `breadcrumbLabel` tenía default `"Migas de pan"` y `PageHeader` era Server
  Component, así que no había forma de que el `LabelsProvider` lo alcanzara: en
  una app trilingüe, 18 de 22 pantallas dejaban el nombre del `<nav>` en español
  en los tres idiomas y nadie se enteraba, porque un `aria-label` mal no se ve.
  Ahora el `<nav>` de las migas es un subcomponente de cliente interno que lee el
  provider (`pageHeader.breadcrumb`, grupo nuevo de `Labels`), y `breadcrumbLabel`
  quedó como override de una pantalla, sin default. **`PageHeader` sigue siendo
  Server Component** —un Server Component puede renderizar uno de cliente; lo que
  no puede es llamar un hook— y sigue en la lista de los dieciséis.
- **Migas envueltas en `<Breadcrumb>` adentro de `PageHeader`: dos landmarks
  anidados.** La prop `breadcrumb` es un `ReactNode` y lo natural es pasarle un
  `<Breadcrumb>`, que ya es un `<nav aria-label>`: quedaban dos entradas de
  navegación para la misma lista. `ReactNode` no se puede tipar más finito, así
  que en desarrollo se avisa por consola una vez, igual que con los diálogos sin
  nombre.

## [0.5.1] - 2026-09-23

### Fixed

- **Los sourcemaps que estrenó la 0.5.0 apuntaban a archivos que no existen.**
  `dist/*.js.map` referenciaba `../../src/*.tsx`, y `src/` no viaja en el
  tarball: en cada corrida de tests de una app consumidora, Vitest escupía un
  `Sourcemap for … points to missing source files` por módulo —78 líneas de ruido
  en una app real— y el stack trace no mejoraba igual. Ahora el fuente va adentro
  del mapa (`inlineSources`), así que funcionan de verdad. El tarball pasa de 118
  a 258 KB comprimido; los `.map` no entran en el bundle de la app.

## [0.5.0] - 2026-09-23

Una auditoría completa de la 0.4.0 —arquitectura, accesibilidad, rendimiento, API
y documentación— ejecutada de punta a punta. No hay componentes nuevos: hay bugs
arreglados, contraste que ahora llega a AA, la mitad del JS de las páginas de
documentación, y 181 tests más.

Lo que conviene mirar antes de actualizar está en **Breaking**, al final.

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
- **`sebs7n-ui/lib/contrast`**: `contrastRatio`, `luminanceOfHex`,
  `luminanceOfOklch` y `flattenAlpha`, que hasta ahora vivían adentro de `test/`.
  Cada app puede testear su propia marca —que el texto sobre `brand-700` llegue a
  4,5:1— en vez de confiar en que las cuatro marcas de ejemplo del paquete
  alcancen. Hay un ejemplo de test en la página de Theming. Puro, sin
  dependencias y sin `"use client"`.
- **Los 83 `*Props` que faltaban.** `dialog`, `sheet`, `drawer`, `tabs`,
  `select`, `popover`, `tooltip`, `toolbar`, `navigation-menu` y los tres menús
  no exportaban **ninguno** de sus tipos de props: eran 85 declarados y no
  exportados sobre 156. Quien envuelve un `DialogContent` en su propio componente
  ahora puede nombrar sus props. `InsetProps`, que estaba tres veces con el mismo
  nombre, pasa a `MenuInsetProps` en `variants/menu.ts`; `CellProps` de `table` se
  parte en `TableHeadProps` y `TableCellProps`.
- **`lib/schema` y `lib/render` salen por el barrel.** `form.tsx` ya los
  documentaba como públicos. Con ellos van `badgeDotColor`, `TagVariantProps` y
  las constantes nuevas de `variants/input.ts` y `variants/overlay.ts`.
- **`variants/overlay.ts`**: `backdropClassName`, `modalPopupClassName`,
  `modalFooterClassName`, `overlayCloseClassName` y `floatingPopupClassName`.
  Más `menuLabelClassName` y `menuSeparatorClassName` en `variants/menu.ts`, e
  `inputControlClassName`, `inputSizeClassName`, `inputDisabledClassName` e
  `inputInvalidClassName` en `variants/input.ts`. Sin cambio de API: son los
  mismos strings que estaban copiados entre dos y ocho veces.
- **`WithClassName<P>`** en `lib/utils.ts`, por las 110 copias de
  `Omit<P, "className"> & { className?: string }`. Existe porque Base UI tipa
  `className` como `string | ((state) => string)` y acá se estrecha a `string`.
- Las props más importantes de Base UI aparecen en la tabla del componente que
  las recibe: `open`, `defaultOpen`, `onOpenChange`, `modal`, `initialFocus`,
  `finalFocus`, `value`, `onValueChange`, `keepMounted`, `loopFocus` y el resto,
  con una sola descripción compartida. Un `<Dialog>` salía con **cero** props
  documentadas.

### Changed

- **El `@source` del `dist` lo pone el paquete.** `theme.css` trae
  `@source "../../dist"`, así que la app ya no escribe ninguna ruta a
  `node_modules`. Olvidarla —o errarle— dejaba la app entera sin estilo sin un
  solo warning. Se documenta `@source not` como opt-in para achicar el CSS.
  **Si tu `globals.css` ya tiene el `@source` a mano, sacalo**: duplicado no
  rompe, pero no hace falta.
- **`Badge` y `Separator` dejan de ser componentes de cliente.** No tenían estado
  ni handlers: arrastraban `"use client"` por transitividad, porque uno usaba el
  hook `useRender` de Base UI y el otro el primitivo `Separator`, que trae su
  propio `'use client'`. `Badge` pasa a `renderElement` de `lib/render.ts` —que
  existe exactamente para esto y cuyo docstring ya lo pedía— y `Separator` a un
  `<div role="separator" aria-orientation>` propio. El DOM que sale es idéntico
  al anterior, atributo por atributo. Pasan de 14 a **16** los componentes
  usables en un Server Component. Medido con esbuild resolviendo Base UI:
  `Badge` 15,18 → 13,59 KB gz y `Separator` 14,42 → 9,88 KB gz cuando se importan
  sueltos; en una página RSC que solo los use, el ahorro es todo el JS. Los dos
  recortan su API: ver **Breaking**.
- **El pulso del `Skeleton` deja de repintar.** `@keyframes skeleton` animaba
  `background-color`, o sea interpolación de color en el hilo principal y un
  repintado por frame durante toda la carga —justo cuando el hilo está ocupado—.
  Ahora `animate-skeleton` es una utilidad que pone una capa de `gray-200` con
  `opacity` animada encima del `gray-100`, que el compositor resuelve sin
  repintar. Se ve igual: componer `gray-200` con alfa *t* sobre `gray-100` da la
  misma mezcla sRGB que interpolar de un color al otro, y con
  `prefers-reduced-motion` queda en `gray-100` como antes.
- La X de `Dialog`, `Sheet` y `Drawer` lleva el nombre en `aria-label` en vez de
  un `<span class="sr-only">`.
- `AlertDialogAction` y `AlertDialogCancel` aceptan solo los tamaños con texto:
  sus botones nunca son de ícono.
- **README: 814 → 664 líneas.** Se fueron las 273 de NavigationMenu, «Combobox y
  Autocomplete» y «Shell de dashboard», que repetían lo que el sitio muestra con
  demo en vivo y tabla de props generada. Quedan como **Recetas** las 92 líneas
  que el sitio no puede mostrar: el colapsado con cookie y ⌘B, el `pathname` que
  cierra el Sheet, el atajo que registra la app, el `keepMounted` para el crawler
  y el Combobox contra el servidor. Arriba, badges (npm, CI, licencia) e índice.
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
- **Las props heredadas que la doc describe salen en la tabla** del sitio,
  marcadas «heredada de Base UI»: 19 descripciones escritas a mano no se
  mostraban en ninguna parte. El generador ahora falla si `meta.mjs` nombra una
  prop que no existe.
- **La tabla de subpaths se genera** desde `package.json#exports` (`npm run
  subpaths`). Estaba a mano en dos archivos que se contradecían y a los dos les
  faltaban entry points.
- **El build cuelga de `prepack`, no de `prepare`.** `npm install` en el repo
  corría `tsc`, así que un error de tipos hacía fallar el **install**, no el
  build. `prepack` lo corre igual `npm pack` y `npm publish`, que es donde hace
  falta. En CI el job de `size` ahora pide `npm run build` explícito.

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
- **`exports` que no resolvían.** `sebs7n-ui/tokens/*.json` caía en el comodín
  `./*` y apuntaba a un archivo inexistente; ahora tiene su patrón propio. Y
  `src/lib/shell-context.ts` —interno— era alcanzable por
  `sebs7n-ui/lib/shell-context`: se muda a `src/internal/`, que ningún patrón de
  `exports` alcanza.
- **`Button variant="destructive"` abajo de AA** (WCAG 1.4.3). Claro en reposo
  daba 4,36:1; oscuro en hover 2,99:1 y en active **1,81:1**. Los tres estados
  pasan a blanco puro sobre rojos que oscurecen en los dos temas: 4,75 / 6,65 /
  10,70 en claro y 4,79 / 6,65 / 10,70 en oscuro.
- **Placeholders a `gray-900`** (WCAG 1.4.3): en claro `gray-700` daba 3,23:1;
  ahora 8,45:1 en claro y 7,57:1 en oscuro. Toca `Input`, `Textarea`,
  `SelectTrigger`, `Combobox`, `Autocomplete` y `ToolbarInput`.
- **Atajos de menú de `DropdownMenu`, `ContextMenu` y `Menubar`** de `gray-700` a
  `gray-900`: en claro pasan de 3,23:1 sobre el popup y 2,71:1 sobre el ítem
  resaltado a 8,45:1 y 7,09:1. Son contenido, no decoración.
- **El contorno de Checkbox, Radio, Switch y Toggle sin marcar a `gray-700`**
  (WCAG 1.4.11, 3:1): Checkbox y Radio pasan de 1,66/2,06 a 3,23/6,12; Switch y
  Toggle apagados, de 1,20/1,46 a lo mismo. En el Switch además arregla que el
  pulgar blanco era invisible contra su propia pista (1,20:1 → 3,23:1). El borde
  del `Input` se deja como está y la decisión queda escrita en
  `accesibilidad.md`.
- **El borde de foco de los campos se ve en claro** (WCAG 2.4.11): de 1,78:1 a
  4,12:1. En oscuro se queda donde estaba, que ya daba 5,51.
- **`TabsContent` no mostraba el foco** al llegar por Tab: tenía `outline-none`
  sin reemplazo (WCAG 2.4.7).
- **Anillo de foco en los popups de `Popover`, `HoverCard` y `NavigationMenu`**:
  sin nada tabulable adentro, Base UI enfoca el popup y con `outline-none` no se
  veía nada (WCAG 2.4.7).
- **Objetivos táctiles de 24×24** (WCAG 2.5.8): el botón de quitar de `Tag` y de
  `ComboboxChip` suman área con un `::after` sin cambiar el dibujo (16→24 y
  20→28), y el link de `Breadcrumb` pasa de 32×16 a 32×24.
- **El nombre accesible de un ítem de menú con atajo** salía «Guardar⌘S» de
  corrido. Ahora lleva una coma `sr-only`, como `SidebarItemBadge`: «Guardar, ⌘S».
  En `DropdownMenu`, `ContextMenu` y `Menubar`.
- **`ComboboxChip` reimplementaba `Tag`** y las dos copias ya habían quedado
  distintas: el botón de quitar medía `size-5` contra `size-4`, el hover era
  `gray-alpha-200` contra `gray-alpha-300` y el aire a la derecha del texto era
  la mitad. Ahora sale de `tagVariants({ removable: true })` y
  `tagRemoveClassName.md`. Cambia el dibujo del botón de quitar: ver **Breaking**.
- **`data-slot` duplicados con significado distinto.** `dialog-close`,
  `sheet-close` y `drawer-close` nombraban el wrapper y la X de arriba a la
  derecha, y `combobox-input` estaba en `ComboboxInput` y en `ComboboxChipsInput`.
  Ahora cada uno nombra una sola cosa, y se sacan doce `data-slot` puestos en
  `*.Root` de Base UI que no renderizan elemento, así que nunca llegaban al DOM.
  Los nombres nuevos están en **Breaking**.
- **`PROP_DESCRIPTIONS` no se usaba nunca.** El generador del sitio encadenaba el
  diccionario con `??`, pero la descripción del JSDoc es siempre un string —`""`
  cuando no hay—, así que la cadena cortaba en el primer eslabón. Efecto:
  **254 de 440 filas de props salían con la celda «Descripción» vacía**, 195 de
  ellas `className`, que tenía el texto escrito a dos archivos de distancia.
- El JSDoc del `.d.ts` de Base UI se colaba **en inglés** en catorce filas de una
  doc en castellano («CSS class applied to the element…»). Ahora solo se toma el
  JSDoc de lo declarado en `src/`.
- La tabla de props imprimía `boolean` para uniones que no lo son: `initialFocus`
  es `boolean | RefObject<HTMLElement> | ((…) => …)` y salía como un simple
  `boolean`.
- **Links rotos del sitio:** `llms.txt` mandaba a `/registry` y `/registry.md`,
  que no existen (lo que se sirve es `/r/registry.json`), y tres demos linkeaban
  rutas inventadas. Hay un test que recorre las dos superficies.
- **Siete casts sin explicación**: tres se van porque no hacían falta —el
  `data-active` de `SidebarItem` ya lo emitía `state`— y los otros cuatro quedan
  con el porqué escrito.
- **El import de React** no iba primero en seis archivos, y `textarea`, `badge` y
  `separator` usaban `React.ComponentProps` sin importar React.

### Removed

- **`sebs7n-ui/styles.css`, la hoja precompilada** (70 KB, el 15 % del tarball).
  El propio README desaconsejaba usarla y ninguna de las cuatro apps lo hacía:
  cargada junto a la hoja de la app quedaban dos capas de utilidades, y la que
  gana es la declarada último y no la más específica, así que un `hidden lg:block`
  de la app perdía contra el `hidden` del paquete. Desde que `theme.css` trae su
  propio `@source`, no tenía ninguna razón de existir. Se van con ella el script
  `build:css`, `src/styles/build.css` y las devDependencies `tailwindcss` y
  `@tailwindcss/cli`, que solo servían para eso. Si la importabas, la migración
  está en **Breaking**.

### Docs

- **El modo oscuro es solo por la clase `.dark`.** No lo decía en ningún lado, y
  con `attribute="data-theme"` en `next-themes` el botón de tema parece andar y
  los colores no cambian. Queda escrito en Theming y en el README, con las líneas
  para quien no usa `next-themes`.
- **Verificar la instalación** arranca con un check binario: un `<Button>` tiene
  que verse con fondo negro y texto blanco. Antes había que leer si una clase
  compila y comparar dos negros en devtools. De paso, el paso del tema oscuro
  citaba «la 2.0», una versión que no existe.
- `geist` es peer **opcional**, no "no declarado"; y el paso de verificación de
  la instalación usaba `bg-blue-500`, que sí compila (Geist tiene escala `blue`).
- El ejemplo del layout raíz del README importa por subpath, con el bloque de
  ESLint `no-restricted-imports` para las apps.
- Sección **Idioma** en el README y en `instalacion.md`.
- Los errores de formulario se escriben siempre con `match` o `validate`: el
  mensaje del navegador sale en el idioma del navegador, no en el de la página.
  La demo `Valores` del sitio lo muestra.
- **RTL: LTR only, y dicho**, con la lista de lo que asume dirección física y el
  camino de migración si algún día hace falta.
- **`accesibilidad.md` reescrita**: cinco líneas prometían de más. `gray-800` no
  es un color de texto (4,12:1 en claro, y no se usa como texto en ningún
  componente); el foco visible ahora dice "sin reemplazarlo" y nombra los casos;
  la reducción de movimiento dice la verdad —el reset global cubre todo y las
  que tienen recorrido suman `motion-reduce`—; y `aria-invalid` sincroniza el
  estilo con la semántica pero no es garantía por sí solo.
- **Los tokens semánticos de shadcn** (`--color-card`, `--color-muted`,
  `--color-primary`, …) se documentan como **alias de compatibilidad**: 0 usos en
  `src/` y 0 menciones en la doc hacían dudar si eran restos. Se quedan porque el
  registry funciona y un componente pegado de shadcn los usa; los pares se
  recalcularon y todos pasan AA. Y se dice lo que faltaba: **no van en código
  nuevo**.
- Nota en Tokens sobre el formato de `geist.json`: es propio, no W3C DTCG, y solo
  tiene color —tipografía, radios y sombras se parsean del CSS—. Es a propósito
  mientras el único consumidor sea este repo.
- `Select` necesita `items` para que el trigger muestre la etiqueta y no el
  `value` crudo: documentado y aplicado en las tres demos.
- La doc de teclado de `Tabs` decía que las flechas activan al pasar; la
  activación es manual (Enter o Espacio), que es el patrón de APG para paneles
  caros.
- `Table` no virtualiza (hasta ~500 filas; más, `Pagination` o virtualización
  afuera) y `Combobox`/`Autocomplete` filtran en memoria y sin debounce.
- `related` de `meta.mjs` es **direccional** a propósito, y queda dicho; lo que
  sí se verifica es que todo slug apunte a un componente que existe.
- Docblocks que habían quedado viejos: `variants/menu.ts` (son seis componentes,
  no dos), `field.tsx` (también se enganchan `NumberField`, `OTPField`, `Slider`
  y `CheckboxGroup`), `variants/tag.ts` (ahora sí `ComboboxChip` es el mismo
  objeto) y `button.tsx` («como antes» no era un porqué).
- Queda anotado para la próxima major que `ellipsisLabel`, `breadcrumbLabel` y
  `removeLabel` tendrían que pasar a un objeto `labels`.
- Se sacan las referencias a versiones que nunca existieron (1.2, 1.3.0, 1.4).

Y una revisión de coherencia, página por página contra el código. **Veinte
afirmaciones que el código desmiente**, las tres que más importan:

- **Un `Button disabled` SÍ sale del orden de tabulación.** La doc decía lo
  contrario «porque Base UI usa `data-disabled`, no el atributo nativo». Con
  `nativeButton` (el default) y sin `focusableWhenDisabled`, Base UI escribe
  **además** el `disabled` nativo: `<button … tabindex="0" disabled="">`.
- **`Select` no emite `aria-activedescendant`** —ese es el mecanismo del
  `Combobox`—, y su placeholder es `gray-900` desde esta versión, no `gray-700`.
- **Son cuatro variables de marca, no tres**: faltaba `--brand-contrast`. La
  corrección llegó a las páginas y no a la portada, que seguía diciendo «tres».

El resto: `linkVariants` no usa la marca (`theming.md` lo listaba), `reglas.md`
contaba 5 componentes sin estado cuando son 16 y se contradecía con
`instalacion.md`, el barrel son 42 módulos `"use client"` y no «~30», el ejemplo
del layout raíz de `instalacion.md` importaba del barrel —justo lo que esa página
desaconseja—, el truco de `: Labels` no marca nada si se escribe
`{ ...defaultLabels, … }`, `Separator` vertical ya se estira solo, `Breadcrumb`
tiene una segunda condición de colapso que no estaba escrita, `Pagination
boundaries={0}` se sube a 1, el `Toggle` es un chip de filtro y no un botón de
negrita, `rounded-full` no es «solo Badge, avatares y pill», `gray-800` faltaba
como excepción en Tokens, y dos comentarios citaban archivos y versiones que ya
no existen.

### Tests

- De **388 a 569** en el paquete (52 archivos) y de **33 a 113** en el sitio.
- `test/contrast.test.ts` pasa de 12 a 62 pares: los grises de texto sobre los
  tres fondos, el `Badge` en las paletas fijas, el anillo de foco de las cuatro
  marcas y todo lo corregido en esta versión. Sigue leyendo los hexadecimales de
  `colors.css` y `theme.css`, no una copia. Los deshabilitados quedan exentos y
  el archivo dice por qué.
- `test/nombres-accesibles.test.tsx` verifica los tipos con `@ts-expect-error`:
  si alguien afloja uno, falla el `typecheck`.
- `test/api-publica.test.ts`: ningún `*Props` sin exportar, ningún nombre
  repetido entre componentes, y nada de `lib/` ni `variants/` afuera del barrel.
- En el sitio, ninguna prop propia puede quedar sin descripción, y las heredadas
  sin texto se cuentan y avisan. `npm run generate` imprime el conteo en cada
  corrida.
- `test/imports.test.ts`: React primero y `React.` importado donde se usa.
- `test/render.test.tsx`: la precedencia que promete el docblock de
  `renderElement`, que se probaba solo de rebote.
- `test/components/dropdown-menu.test.tsx`: submenú, casilla, radio y atajo, que
  no tenían ninguno.
- `test/components/sub-partes.test.tsx`: las trece piezas exportadas sin un solo
  test, y la rama sin `enableSystem` de `theme-switcher`.
- `combobox.test.tsx` deja de ser flaky: el servidor simulado pasa de un
  `setTimeout(…, 20)` a una promesa que resuelve el test.
- `Toaster` tenía un smoke test que pasaba aunque no renderizara nada.

### Breaking

- **Los nombres accesibles que el sistema puede exigir, los exige.** Es el cambio
  que más se va a notar al actualizar, porque lo tira el compilador. `Button` con
  un `size` de ícono escrito literal (`icon-sm`, `icon-md`, `icon-lg`) pide
  `aria-label` o `aria-labelledby`; `Progress` y `Meter` piden `label`,
  `aria-label` o `aria-labelledby`; `AvatarImage` pide `alt` (aunque sea `""`);
  `ToolbarGroup` pide `aria-label`. `ButtonProps` es genérico en el `size` para
  que la exigencia no rompa a quien envuelve el botón y ya pasa el nombre bien.
  *Qué vas a ver:* en `<Button size="icon-sm" />`, un `TS2322: Type
  '{ size: "icon-sm"; }' is not assignable to type 'IntrinsicAttributes &
  ButtonProps<"icon-sm">'. Property '"aria-labelledby"' is missing`; en
  `<AvatarImage src="…" />`, un `TS2741: Property 'alt' is missing`. Cuidado con
  el mensaje: el compilador nombra `aria-labelledby` porque es el último miembro
  de la unión, pero `aria-label` alcanza igual. *Migración:* agregá el nombre
  donde el compilador lo pida. Si ya está en los hijos o en un envoltorio,
  escribilo igual en el `aria-label` del `Button`, que es el que termina en el
  DOM.
- **`sebs7n-ui/styles.css` ya no existe.** Rompe a quien la importara: el subpath
  no resuelve. *Migración:* la instalación normal, `@import "tailwindcss"` y
  después `@import "sebs7n-ui/theme.css"`. Como `theme.css` ahora trae su propio
  `@source` al `dist`, no hace falta nada más —y las utilidades dejan de venir
  duplicadas, que era el bug que traía la hoja—.
- **`render` de `Badge` acepta un elemento, ya no una función.** Salió del hook
  `useRender` de Base UI para poder renderizarse en el servidor. *Migración:*
  pasá el elemento en vez de la función: `render={<a href="/planes" />}`.
- **`Separator` ya no acepta las props propias del primitivo de Base UI.** Ahora
  es un `<div role="separator" aria-orientation>` del paquete, también para salir
  del cliente. El DOM que emite es idéntico al anterior, atributo por atributo,
  así que solo rompe si le pasabas algo que entendía únicamente el primitivo.
  *Migración:* sacá esas props; `className`, `orientation` y el resto de lo que
  documenta el componente siguen andando igual.
- **`data-slot` renombrados y sacados.** La X de arriba a la derecha de `Dialog`,
  `Sheet` y `Drawer` pasa a `dialog-close-button`, `sheet-close-button` y
  `drawer-close-button` —`*-close` queda para el wrapper, que es lo que siempre
  nombró—, y el `combobox-input` de `ComboboxChipsInput` pasa a
  `combobox-chips-input`. Además se sacan doce `data-slot` que estaban en `*.Root`
  de Base UI. *Migración:* si tenés CSS, tests o selectores de e2e apuntando a
  `[data-slot="dialog-close"]` para la X, o a `[data-slot="combobox-input"]`
  dentro de un combobox de chips, actualizá el nombre. Los doce de `*.Root` no
  hacía falta migrarlos: nunca llegaron al DOM.
- **El botón de quitar del `ComboboxChip` se ve 4px más chico** (`size-5` →
  `size-4`), porque el chip dejó de tener su propia copia y sale de `Tag`. El área
  de toque sigue arriba de los 24×24 de WCAG 2.5.8. *Migración:* ninguna, salvo
  que tengas capturas de referencia que comparar.

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

[Unreleased]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.6.1...HEAD
[0.6.1]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.3.3...v0.4.0
[0.3.3]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/sebafermanelli/sebs7n-ui/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/sebafermanelli/sebs7n-ui/releases/tag/v0.1.1
