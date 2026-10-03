Esta guía es para quien arma una app con sebs7n-ui, persona o agente. Son las reglas **del sistema**: valen para cualquier pantalla. Las de cada componente (props, teclado, cuándo sí y cuándo no) están en su página, y hay dos ejemplos completos para copiar: el [template de dashboard](/templates/dashboard) para una app y el [template de landing](/templates/landing) para una landing.

Si sos un agente: leé esta guía antes de escribir la primera pantalla y elegí el template: **una landing o una página de marketing se arma como el de landing; una app de trabajo (sidebar, tablas, formularios), como el de dashboard**. Copiá la estructura y cambiá solo los datos y los textos. Ante una duda entre dos componentes, la sección [Elegir componente](#elegir-componente) decide.

## La referencia

**iCloud web (icloud.com), no el macOS nativo.** Los valores están medidos en claro y en oscuro. Lo que iCloud no tiene (Switch, Tooltip, toasts, Tree, Stepper) se deriva de sus tokens. No se inventan estilos: si algo no existe en el paquete, se arma con sus tokens y sus componentes.

El [Playground](/docs/playground) es la referencia viva de los defaults: si cambia un default, se actualiza ahí. Muestra cuatro pantallas dentro de un `AppShell` (con el panel del asistente, ⌘K y los atajos), y cada una trae su «Cómo se arma» con los componentes que usa, el código para copiar y las reglas que ilustra.

## Reglas de sistema

### Un solo acento sólido por pantalla

`Button` por defecto es el primario, en el acento, y va **uno** por pantalla: la acción principal («Nueva factura»). El resto, `secondary` (gris) o `plain` (texto en el acento). Los estados prendidos de Checkbox y Switch llevan el acento y no cuentan; el de `Toggle` y `ToggleGroup` es neutro (gris, semibold). `destructive` solo si borra, y siempre detrás de un `AlertDialog`.

### Tamaños

Una sola escala para campos y botones: `sm` 28 · `md` 36 · `lg` 40 (botones de ícono 28 · 36 · 40), texto de 14.

- **`md` es el de una app**: contenido, formularios, diálogos. Es el default: no hace falta escribirlo.
- **`sm` en barras**: toolbars, la barra de una tabla, paginación, filtros sobre una lista.
  - **Una barra de filtros, entera en `sm`**: la búsqueda (`SearchField`), los selectores (`Select`, `MultiSelect`, `DatePicker`), el `ToggleGroup` y los botones de la barra (`Pausar`, `Exportar`, `Columnas`). Mezclar `sm` y `md` en la misma fila deja los controles a distinta altura. Vale igual en un dashboard, en una consola y en la portada de un blog: que la lista sea «contenido» no la hace una excepción.
  - Lo que **no** es parte de la barra queda en `md`: la acción primaria de la página («Nueva factura», «Nuevo servicio»), los botones de un formulario y de un diálogo.
- **`lg`** solo en pantallas de entrada (login) o una acción aislada muy importante.
- El tamaño se elige **una vez por formulario**, no por campo. No hay una variable global de densidad: rompe el objetivo táctil.
- Usá los defaults del paquete. Si un tamaño no queda bien, el problema es de la composición, no se corrige forzando `size` en cada componente.

### Radios

Sin cápsulas. `rounded-control` 8 (botones, controles, ítem de menú), `rounded-field` / `rounded-item` 10 (campos, filas), `rounded-surface` / `rounded-panel` 11 (cards, diálogos), `rounded-menu` 12 (menús, popovers), `rounded-tag` 4. **Curvas concéntricas:** radio interior = exterior − distancia (menú 12 con padding 5 → ítems 8).

### Superficies

Opacas y en capas. Si **es** la página, `bg-background`; si flota sobre ella, `bg-surface` + `shadow-menu` / `shadow-modal`. Sidebar `bg-surface-secondary` con borde `separator-strong`; barra global `bg-surface-header`; toolbar `bg-surface-bar`; card = cuerpo `bg-surface` + `shadow-widget` y cabecera `bg-surface-bar`; zona hundida `bg-fill-1` / `bg-grouped`; tooltip `bg-tooltip`. Hover y selección neutra con `fill-1/2/3`. En oscuro la página es `#1C1C1E`, no negro. Casi siempre esto ya lo pone el componente: no le agregues fondos ni bordes a `Card`, `Sidebar` o `AppShell`.

**Translucidez solo sobre el wallpaper** (`AppShell ambient`): barras y `Toolbar` en `material-translucent`; cuerpo de `Card`, `WidgetCard` y `Sidebar` en `material-translucent-body`. Menús, diálogos y campos siguen opacos. Dentro de una app de trabajo, todo opaco.

### Selección

El resaltado de menús, el ítem activo del sidebar y el elegido de un `Toggle`/`ToggleGroup` van en **gris** (`fill-2`, `fill-1`, `fill-3` o la pastilla del segmentado). El acento sólido es solo para la fila elegida de una lista o tabla **con foco**; sin foco, la fila elegida vuelve a gris.

### Tipografía

Por roles, como iCloud: `text-large-title` 48 (el título de la página), `title-1/2/3` 28/21/19, `headline` y `body` 17, `subheadline` 15, `callout` 14 (el cromo: barras, menús, tablas), `footnote` 12, `caption` 11. Un `<h1>` por página, que pone `PageHeaderTitle`.

### Color del texto

Texto con `label` / `label-secondary` (≥ 4,5:1). `label-tertiary` no es para texto chico: solo glifos, deshabilitados y texto grande. `gray-800` no va como texto. Un solo vocabulario: los tokens del paquete, no los alias de shadcn (`--color-card`, `--color-muted`…).

### Links

Un link con forma de botón o de card: `buttonVariants()` / `cardVariants()` sobre `<a>` o `<Link>`. **Nunca** `render` de un `Button` para un link (Base UI le pone `role="button"`). Un link de texto: `linkVariants` (`inline`, `subtle`, `row`, `accent`). Una acción que abre un panel no es un link: es un `<button>`, aunque se vea como link. Un link que solo aparece en hover no existe en un celular.

### Layout por ancho del contenido, no de la ventana

Dentro de un `AppShell`, el layout responde al ancho del contenido (container queries `@md:`, `@lg:`…), no al de la ventana: así un panel lateral abierto no rompe las grillas. Los breakpoints de viewport quedan para pantallas completas (landing, blog, login, navbar). Ejemplo: `<div className="grid grid-cols-1 gap-4 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">` en vez de `lg:grid-cols-…`. `AppShell` ya declara el `main` como contenedor (`@container/main`) y `AppShellContent` también (`@container`); `CardGrid`, `StatGrid`, `SettingsGrid`, `FilterBar` y `PageHeader` miden a su propio contenedor, así que andan igual fuera del shell. Umbrales del sistema: `@lg` (32 rem) pasa a 2 columnas, `@3xl` (48 rem) a 3 o a Configuración en 2, `@4xl` (56 rem) a 4 o a un tablero `2fr/1fr`; el panel de widgets editable (`WidgetBoard`) usa 1 columna, 2 desde `@xl` (36 rem) y 4 desde `@4xl`.

### Cards en fila: alineadas, siempre

Cards que se leen juntas van en `CardGrid`: comparten filas (subgrid), así que **la cabecera más alta fija la de todas, y lo mismo el cuerpo y el pie**. Una cabecera más baja que la de al lado, o un pie que no cae a la misma altura que el vecino, es un error. Si una card de la fila no tiene cabecera, ninguna la lleva; y una card sin cuerpo no lleva cabecera (quedaría la franja del cuerpo vacía): título y texto van en `CardContent`. Y sin huérfanas: una fila va toda en paralelo o toda apilada, nunca «2 arriba y 1 abajo» (`CardGrid` elige las columnas por la cantidad de hijos —`columns` es el máximo—: 2 cards en una grilla de 3 van en 2 columnas, 4 en una de 3 van 2 + 2, 5 con máximo 4 van 3 + 2—).

### Una barra de filtros, un solo tamaño

`FilterBar` pone su `size` (`sm` por defecto) a todos sus controles —búsqueda, `Select`, `ToggleGroup`, fechas, botones—: no se repite `size="sm"` en cada uno. Un control con su `size` propio gana, y lo que se abre desde la barra (popover, diálogo, hoja) vuelve a su tamaño de siempre.

### Tablas apiladas, cards link y 5 métricas

`Table stacked` apila las filas en el teléfono con el fondo de selección en la **fila** (no en cada celda), `TableCell stacked="full"|"corner"` ubica la celda principal y las acciones; en la fila elegida con foco, un link o un `text-label*` pasa solo a `on-selection`. `Card render={<Link … />}` hace una card que es un link entero y `Card span={2}` una card ancha en una `CardGrid` (la grilla cuenta por columnas ocupadas). `StatGrid` con 5 métricas va 1 columna, 3 + 2 llenando el ancho desde 48 rem y una sola fila desde 72 rem. `NumberField fullWidth` ocupa todo el ancho de su caja.

### Aparecer sin perder contraste

Una animación de aparición (al entrar en pantalla, en una landing) **no baja la opacidad del texto**: un fade deja el texto por debajo de contraste AA mientras aparece. Se anima solo el desplazamiento (`translate`) o el texto aparece ya a opacidad 1 y se anima su contenedor sin texto; con `prefers-reduced-motion: reduce`, sin movimiento. El paquete no trae un `Reveal`: si la app lo arma, que sea así.

### Un link con margen

`TextLink` respeta los márgenes verticales de la app (`mt-4`, `my-2`): con uno pasa a `inline-block`; en texto corrido, sin margen, sigue en línea.

### El usuario acomoda su espacio

El sidebar y el panel lateral se redimensionan y se colapsan por defecto y recuerdan su ancho; en teléfono pasan a capas (Sheet/hoja) porque no entra todo. En `AppShell` el borde del sidebar y el del panel se arrastran (con teclado: flechas, Inicio/Fin, Enter y doble clic), el sidebar pliega al riel por debajo de 140 px, y `sidebarStorageKey` / `asideStorageKey` (una clave propia por app o template) guardan lo acomodado. No se apaga con `sidebarResizable={false}` salvo que haya una razón; y si los ítems no tienen ícono, `sidebarCollapsible={false}` en vez de un riel vacío. El panel nunca deja al contenido bajo 480 px: si no entra, pasa a hoja.

Un asistente o panel de ayuda que acompaña el trabajo va acoplado al costado (`AppShell` aside) y empuja el contenido; un diálogo o Sheet modal solo cuando hay que decidir algo antes de seguir. El botón que lo abre vive en la barra global, a la derecha.

## Elegir componente

| Si necesitás | Usá |
|---|---|
| Informar algo que calculó el sistema | `Badge` |
| Un dato que puso el usuario y puede sacar | `Tag` (tiene ×) |
| Navegar | `NavigationMenu`, `SidebarItem`, links |
| Ejecutar una acción desde un menú | `DropdownMenu` |
| Una tarea corta | `Dialog` |
| Confirmar algo irreversible | `AlertDialog` |
| Un asistente o panel de ayuda que acompaña el trabajo | `AppShell` con `aside` (acoplado, empuja el contenido) |
| Un panel lateral de detalle o filtros que hay que decidir | `Sheet` |
| Algo interactivo anclado a un botón | `Popover` |
| Una línea de ayuda | `Tooltip` |
| Confirmar que algo pasó | `toast()` |
| Avisar algo que sigue siendo verdad | `Alert` |
| Elegir de hasta ~8 opciones fijas | `Select` |
| Elegir un valor de una lista larga | `Combobox` |
| Texto libre con sugerencias | `Autocomplete` |
| 2 a 5 opciones visibles | `RadioGroup` |
| Filtro de selección única con pocas opciones (hasta ~4 y que entren en 390 px) | `ToggleGroup` |
| Filtro de selección única con más opciones | `Select` |
| Un ajuste que se aplica al instante | `Switch` |
| Un ajuste que se aplica al apretar «Guardar» | `Checkbox` |
| Una tabla con orden, búsqueda, páginas o selección | `DataTable` |
| Una lista de filas con título, detalle y valor | `List` + `ListRow` |
| Un número clave | `Stat` dentro de una `Card` |
| Un bloque con título en un tablero | `WidgetCard` |
| Varias cards en fila (planes, beneficios, testimonios, una galería) | `Card` dentro de `CardGrid` |
| Pantalla de Configuración (grupos de campos) | `SettingsSection` dentro de `SettingsGrid` |
| Elegir entre tabla, tarjetas o calendario y qué columnas se ven | `ListViewProvider` + `ListViewControls` (`sebs7n-ui/list-view`) en las `actions` de la `FilterBar`, `ListViewContent` para el cuerpo |
| Filtros que no entran en una fila en el teléfono | `FilterDisclosure` (`sebs7n-ui/filter-disclosure`) en el slot `filters` de la `FilterBar` |
| Buscar contra el servidor sin una consulta por tecla | `SearchField` con `onSearch` (retraso `debounceMs`, 300 ms) |
| La barra «Cambios sin guardar» / «Descartar» / «Guardar» de una pantalla de Configuración | `SaveBar` (`sebs7n-ui/save-bar`), fija abajo y a todo el ancho |
| Alta o edición de algo desde su lista (`?new` / `?edit=<id>`) | `EntityOverlay` (`sebs7n-ui/entity-overlay`): `dialog` para el alta, `sheet` para la edición, con confirmación de cambios sin guardar |
| «Limpiar filtros» en el vacío de una lista filtrada | `EmptyFiltersAction` (`sebs7n-ui/empty-filters-action`) como `action` del `EmptyState` |
| Eventos con fecha en un teléfono, donde un mes no entra | `CalendarAgenda` (`sebs7n-ui/calendar-agenda`) por debajo de `@2xl` y `CalendarView` desde ahí |
| Nada que mostrar | `EmptyState`, con una sola acción para salir del vacío |
| Esperando datos | `Skeleton` del alto final, o `loading` del componente |

Un filtro de selección única nunca se arma con botones sueltos.

## Formularios

- `Form` + un `Field` por campo con su `name`. `Form` valida solo lo registrado como `Field`: un `required` fuera de un `Field` deja de validarse sin avisar.
- Etiqueta con `FieldLabel` (y `required` si hace falta), ayuda con `FieldDescription`.
- Errores con `FieldError match="valueMissing"` (y `rangeUnderflow`, `typeMismatch`…) con el texto en español: sin `match`, sale el mensaje nativo en el idioma del navegador. Un `FieldError` sin `match` junto a uno con `match` duplica el mensaje.
- Los errores del servidor: `errors={{ campo: "mensaje" }}` en `Form`.
- Nunca un `toast` para un error de validación: el error va en su campo.

## Popups en pantalla angosta

Debajo de 640 px, como iOS: el popover de **contenido** (`Popover`, `DatePicker`, `ColorPicker`) pasa solo a una hoja de abajo; los **menús** (`DropdownMenu`, `Select`, `Combobox`…) siguen anclados. Ningún popup se sale de la pantalla. Para adaptar el contenido de un `Popover` a la hoja (sin margen propio, alto completo) se usa `usePopoverSheet()` (`sebs7n-ui/popover`), que dice si está en modo hoja; `PopoverContent` acepta `collisionPadding` (8 px por defecto) para el margen contra los bordes del viewport.

Un `Sheet` lateral abierto avisa en `<html data-sheet-open="right|left">` y el `Toaster` se corre solo para no tapar su pie: junto al panel en pantalla ancha y por encima del pie en el teléfono. En el teléfono el `Sheet` derecho ocupa todo el ancho (`w-full`) y desde 640 px, 3/4 con tope de 24 rem. No hace falta ningún ajuste en la app.

En la barra compacta del teléfono (la que solo muestra el nombre y el avatar) un template lleva la vuelta como un botón de ícono con nombre accesible («Volver a Templates»); no se esconde la salida.

## Trampas de Base UI

- Los triggers van con `render={<Button … />}`, no con `asChild`.
- `DropdownMenuLabel` va dentro de `DropdownMenuGroup`.
- `NavigationMenuViewport` una sola vez.
- `AlertDialogAction` no cierra sola (para poder mostrar `loading`): cerrala vos.
- `Select` necesita `items` (`{ valor: "Etiqueta" }`) para que el trigger muestre la etiqueta y no el valor.

## Lo que el paquete no hace, a propósito

Guardar el colapsado del sidebar, registrar atajos de teclado, crecer el `Textarea`, validar formularios (lo hace la app con `Form`), persistir datos. Es de la app.

## Lo que le queda a la app

El texto de los `aria-label`, `Label` o `Field` de cada campo; el mensaje de error con `match` o `validate`; un `<h1>` por página; `lang` en `<html>`; escuchar los atajos; `role="status"` en avisos por acción; tarjetas interactivas como `<a>` o `<button>`; nunca el color como único dato; zoom 200 % y 320 px de ancho sin scroll horizontal.

## Anatomía de una app

Así está armado el [template de dashboard](/templates/dashboard). Para una app nueva, copiá esta estructura.

**El layout** (una vez para todas las secciones):

- `AppShell` con `header` (la barra global de escritorio: nombre de la app a la izquierda, `UserMenu` a la derecha), `mobileBar` (la del teléfono: nombre y avatar), `sidebar` y `pathname` (con `usePathname()`, para cerrar el menú del teléfono al navegar).
- `Sidebar` con `SidebarItem render={<Link href=… />}` y `active` según la ruta; un `SidebarItemBadge` para un contador; Configuración abajo, en un `SidebarGroup className="mt-auto"`.
- El estado que comparten las secciones, en un provider dentro del layout: navegar no lo remonta.
- El tema no va aparte: `UserMenu` ya trae la fila de tema.

**Cada página:**

```
AppShellContent                      ancho máximo, márgenes y gap-6
├── PageHeader
│   ├── PageHeaderTitle              el <h1>
│   ├── PageHeaderDescription        una línea
│   └── PageHeaderActions            la acción principal (el único acento)
└── el contenido, en bloques separados por el gap-6
```

**Bloques de contenido:**

- Métricas: `StatGrid` (un `Stat` dentro de `Card` cada uno; 1, 2 o 4 columnas según el ancho del contenedor). Si el usuario arma su pantalla, cada métrica es un widget del panel editable.
- Tablero: un panel de widgets que el usuario edita (`WidgetBoard`, receta abajo): el gráfico ancho es un widget `md` y la lista angosta uno `sm`. Un tablero fijo, sin edición, es `WidgetCard` en una grilla por container query (`grid grid-cols-1 gap-4 @4xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]`).
- Listado: `DataTable` con `filter`, `pageSize={10}`, columnas `sortable`, las numéricas con `numeric`, el filtro de estado en `toolbar` (tamaño `sm`) y `empty` con un `EmptyState variant="plain"`.
- Detalle: un `Sheet` controlado por la página (el id elegido, no el objeto), con datos, `Timeline` y las acciones al pie.
- Configuración: `Tabs`; un `Form` por pestaña con «Guardar cambios», salvo los `Switch`, que aplican al instante.
- **Configuración = secciones (`SettingsSection`) en cards, 2 columnas desde `lg` y 1 en el teléfono (`SettingsGrid`); no una columna angosta de campos.** Cada sección trae título y descripción en la cabecera y los campos a lo ancho de la card; lo que necesita el ancho (una zona de arrastre, una lista) lleva `wide`. La barra «Cambios sin guardar» / «Descartar» / «Guardar» va a todo el ancho del contenido, fija abajo.

**Estados:**

- Cargando: `Skeleton` del mismo alto que lo que va a llegar (la pantalla no salta), o la prop `loading` (`DataTable`).
- Vacío: `EmptyState` con una acción («Limpiar filtros»).
- Acción reversible: `toast` con «Deshacer». Acción irreversible: `AlertDialog`, sin deshacer.
- Alta: `toast.success` con el nombre de lo creado.

**Lo pesado, diferido:** un gráfico (Recharts) se carga con `React.lazy` y se monta después de hidratar, con un `Skeleton` mientras llega. `next/dynamic` agrega un preload al HTML y no ahorra nada.

**A 390 px:** nada de scroll horizontal; las barras de filtros pasan a columna (`flex-col sm:flex-row`), los campos a ancho completo (`w-full sm:w-48`), y las fechas y montos de una lista angosta en formato corto.

## Recetas

### Panel de widgets editable

La pantalla de inicio de iCloud, para cualquier app: widgets que el usuario ordena, saca y agrega, y que quedan guardados. La implementan el Inicio del [template de dashboard](/templates/dashboard) y el Resumen de la [consola](/templates/console). Se arma con tres piezas de `sebs7n-ui`, sin escribir arrastre ni persistencia:

- `useWidgetLayout({ storageKey, widgets })` (`sebs7n-ui/lib/widget-layout`): el estado (qué se ve y en qué orden, edición, catálogo, avisos).
- `WidgetBoard` (`sebs7n-ui/widget-board`): la grilla.
- `WidgetBoardEditButton`: el «Editar» / «Listo» de la cabecera.

```tsx
const widgets: WidgetDef[] = [
  { id: "billed", title: "Facturado", size: "sm", description: "Lo emitido en el mes.", preview: <Sparkline values={series} />, render: () => <StatGrid columns={1} items={[billed]} /> },
  { id: "collections", title: "Facturado y cobrado", size: "md", render: () => <CollectionsWidget /> },
]
const layout = useWidgetLayout({ storageKey: "app:home:widgets", widgets })
// …
<PageHeaderActions>
  <WidgetBoardEditButton layout={layout} />   {/* secundario */}
  <Button>Nueva factura</Button>              {/* el único acento */}
</PageHeaderActions>
<WidgetBoard layout={layout} />
```

**El modelo.** Cada widget es `{ id, title, size?, description?, preview?, icon?, render }`. `id` estable y en inglés (es lo que se guarda); `render` devuelve la card y se llama en cada render, así lee de la pantalla (el store, los filtros) sin pasar por el modelo; `description` y `preview` (un `Sparkline`, una cifra) son lo que se ve en el catálogo. `size` son las columnas de una grilla de 4: `sm` 1, `md` 2, `lg` 4; por container query la grilla pasa a 2 columnas desde 36 rem de ancho del contenedor y a 1 por debajo de eso (con el panel del asistente abierto, el contenido se angosta y la grilla se reacomoda sola; no hay `sm:`/`lg:` de ventana). Las cards de una fila quedan alineadas: la card llena el alto de su celda. Una métrica con `StatGrid` va con `columns={1}`.

**La edición.**

- **Editar / Listo:** el botón de la cabecera, secundario (el acento es de la acción primaria). Anuncia «Modo edición…» en una región `status`.
- **Mover:** los widgets tiemblan (no con `prefers-reduced-motion`: ahí un contorno punteado). Se reordenan arrastrando la card entera o con el teclado: Espacio toma, flechas mueven, Espacio suelta, Escape cancela, todo anunciado en español.
- **Sacar:** un «−» en cada widget, con el nombre en su `aria-label` («Sacar Clientes»). El foco pasa al «−» que queda y no se pierde.
- **Agregar:** «Agregar widget» abre un `Popover` (en el teléfono, la hoja de abajo) con los widgets que no están en pantalla, cada uno con su descripción y vista previa. Elegir uno lo suma al final y el foco va a su «−».
- **Restablecer:** vuelve al orden original (deshabilitado, pero enfocable, si ya lo es).
- **Vacío:** sin widgets en pantalla hay un `EmptyState` con «Agregar widget» y «Restablecer».

**Persistencia.** El orden y los widgets visibles se guardan en `localStorage` con `useStoredState`: el HTML del servidor muestra el orden original y se adopta lo guardado después de montar. Un ID guardado que ya no existe se descarta. Si el panel depende de un proyecto o una cuenta, la clave lleva su id (`console:${project.id}:overview-widgets`): al cambiarla se carga el panel del otro.

**Carga diferida (presupuesto de JS).** Sin editar, `WidgetBoard` es una grilla estática: no trae `@dnd-kit`. El arrastre, la barra de edición y el catálogo viven en otro módulo que se pide con `React.lazy` la primera vez que se aprieta «Editar» (no `next/dynamic`: no entra al HTML del servidor); mientras llega se ve la misma grilla, sin saltos. Una vez cargado queda montado. Los peers `@dnd-kit/*` son opcionales: hacen falta solo si se usa este componente. El estado que el widget necesita conservar al editar (el período elegido en una métrica) vive en la pantalla, no en la card: al pasar a edición las cards se montan de nuevo.

**Con el panel lateral.** Nada cambia: la grilla mide el contenedor. Un clic en «Agregar widget» o «Restablecer» no saca de la edición; un clic en un espacio vacío, Escape o «Listo» sí.

### Card de plan con uso

El bloque de plan de Ajustes de iCloud: una `PromoCard` con el plan y, al lado, una `Card` con un `Meter` por cupo usado. Lo implementan Configuración › Facturación del dashboard (facturas, usuarios y espacio) y Estado y costos de la consola (cómputo, ancho de banda y almacenamiento).

```tsx
<div className="grid gap-5 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
  <PromoCard chip="4 de 5 usuarios" title="Plan Pro">
    <PromoCardLink render={<button type="button" />}>Cambiar de plan</PromoCardLink>
  </PromoCard>
  <Card className="flex flex-col justify-between gap-5 p-6">
    <h3 className="text-title-2 text-label">Uso del plan</h3>
    <Meter label="Cupo de facturas" max={12} showValue value={9} />
    <Meter format={{ style: "unit", unit: "gigabyte" }} label="Espacio" max={10} showValue value={2.9} />
  </Card>
</div>
```

Una sola `PromoCard` por pantalla. Es un `Meter` (un valor que sube y baja dentro de un rango), no un `Progress`. «Cambiar de plan» es el link de la promo, no un botón con acento. Cada `Meter` lleva `label`; las cifras salen de los datos de la app, no de números sueltos. Las unidades van por `format` (`Intl.NumberFormat`). Si el bloque se repite en muchas pantallas de una app, extraelo a un componente propio con las cifras como props.

## Anatomía de una landing

Así está armado el [template de landing](/templates/landing): es el default para landings y páginas de marketing.

```
div.bg-ambient[data-ambient]         el wallpaper: barra y cards pasan solas a translúcidas
├── Navbar                           marca, links a anclas, una CTA en gris
├── main  max-w-[1080px] gap-24      una columna centrada, mucho aire entre secciones
│   ├── Hero                         el único <h1> (text-large-title) y la acción primaria
│   ├── Logos                        Marquee pauseControl="press" (tocar pausa y reanuda)
│   ├── Beneficios #beneficios       Card en grilla 1/2/3
│   ├── Precios #precios             ToggleGroup mensual/anual, 3 planes; el recomendado con el acento
│   ├── Testimonios                  Marquee variant="cards": cards con <blockquote>, alineadas
│   ├── Preguntas #preguntas         Accordion
│   └── Cierre #registro             la acción del hero, otra vez
└── Footer
```

- **Un acento por pantalla:** en una página que se recorre con scroll, la regla es por lo que se ve a la vez. La CTA del hero, el plan recomendado y el cierre van en el acento porque nunca comparten pantalla; la CTA de la barra y las secundarias, en gris.
- Cada sección abre con un `<h2>` en `text-title-1` y una bajada en `text-body text-label-secondary`, centrados.
- Las secciones con ancla llevan `scroll-mt-20`: si no, el título queda debajo de la barra.
- Server Components: cliente solo lo que cambia con un click (el toggle de precios). Una landing tiene que ser liviana.
- Lo que se mueve solo (`Marquee`) tiene que poder pausarse: en una landing, `pauseControl="press"` (tocar la franja pausa y reanuda; el botón queda para teclado). Nunca sin pausa.
- Todo el texto en un solo archivo de datos: adaptar la landing es cambiar ese archivo.
- A 390 px: el grupo de CTA pasa a columna (`flex-col sm:flex-row`), las grillas a una columna.

**El propio sitio de sebs7n-ui sigue esta receta.** La home (`/`) y `/templates` comparten con la landing de referencia: la barra (marca con la versión en `Badge`, `NavigationMenu` con paneles, búsqueda ⌘K, GitHub, `ThemeSwitcher` diferido y «Empezar» en gris; en el teléfono, un `Drawer`), el hero centrado con el único acento primario, `SectionHeader` en cada sección, el ancho de 1080 px, el `scroll-mt-20` de las anclas, el wallpaper y el pie con grupos de links. Lo propio del sitio es el contenido (versión, instalación, «Por qué existe», componentes destacados, cifras de `site.json`, sección para agentes). El patrón (menú, tema y hoja del teléfono con `next/dynamic` y `ssr: false`) está copiado en `docs/site/app/_components`, no extraído al paquete: depende de los datos de navegación de cada sitio. `test/home-structure.test.ts` fija lo que comparten.

## Los templates

- [Template de dashboard](/templates/dashboard): una app de trabajo (Inicio, Facturas, Clientes, Configuración). Para agentes, con el código: `/templates/dashboard.md`. Para copiarlo: `npx shadcn@latest add https://ui.sebastianfermanelli.com/r/dashboard.json`.
- [Template de landing](/templates/landing): el default para landings. Para agentes: `/templates/landing.md`. Para copiarlo: `npx shadcn@latest add https://ui.sebastianfermanelli.com/r/landing.json`.

En los dos: cambiá los datos (`_data/`) y los textos, no la estructura.
