# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: SemVer 2.0.0.

Mientras el paquete sea **0.x**, un minor puede traer cambios incompatibles: SemVer no protege
la versión cero y acá todavía se mueven APIs. Cuando eso pasa, la entrada va marcada
**Breaking** con qué se rompe y cómo se migra. De 1.0 en adelante, los incompatibles esperan al
major.

## [Unreleased]

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
