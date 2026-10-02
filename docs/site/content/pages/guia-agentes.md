Esta guía es para quien arma una app con sebs7n-ui, persona o agente. Son las reglas **del sistema**: valen para cualquier pantalla. Las de cada componente (props, teclado, cuándo sí y cuándo no) están en su página, y hay dos ejemplos completos para copiar: el [template de dashboard](/templates/dashboard) para una app y el [template de landing](/templates/landing) para una landing.

Si sos un agente: leé esta guía antes de escribir la primera pantalla y elegí el template: **una landing o una página de marketing se arma como el de landing; una app de trabajo (sidebar, tablas, formularios), como el de dashboard**. Copiá la estructura y cambiá solo los datos y los textos. Ante una duda entre dos componentes, la sección [Elegir componente](#elegir-componente) decide.

## La referencia

**iCloud web (icloud.com), no el macOS nativo.** Los valores están medidos en claro y en oscuro. Lo que iCloud no tiene (Switch, Tooltip, toasts, Tree, Stepper) se deriva de sus tokens. No se inventan estilos: si algo no existe en el paquete, se arma con sus tokens y sus componentes.

## Reglas de sistema

### Un solo acento sólido por pantalla

`Button` por defecto es el primario, en el acento, y va **uno** por pantalla: la acción principal («Nueva factura»). El resto, `secondary` (gris) o `plain` (texto en el acento). Los estados prendidos (Checkbox, Switch, Toggle) llevan el acento y no cuentan. `destructive` solo si borra, y siempre detrás de un `AlertDialog`.

### Tamaños

Una sola escala para campos y botones: `sm` 28 · `md` 36 · `lg` 40 (botones de ícono 28 · 36 · 40), texto de 14.

- **`md` es el de una app**: contenido, formularios, diálogos. Es el default: no hace falta escribirlo.
- **`sm` en barras**: toolbars, la barra de una tabla, paginación, filtros sobre una lista.
- **`lg`** solo en pantallas de entrada (login) o una acción aislada muy importante.
- El tamaño se elige **una vez por formulario**, no por campo. No hay una variable global de densidad: rompe el objetivo táctil.
- Usá los defaults del paquete. Si un tamaño no queda bien, el problema es de la composición, no se corrige forzando `size` en cada componente.

### Radios

Sin cápsulas. `rounded-control` 8 (botones, controles, ítem de menú), `rounded-field` / `rounded-item` 10 (campos, filas), `rounded-surface` / `rounded-panel` 11 (cards, diálogos), `rounded-menu` 12 (menús, popovers), `rounded-tag` 4. **Curvas concéntricas:** radio interior = exterior − distancia (menú 12 con padding 5 → ítems 8).

### Superficies

Opacas y en capas. Si **es** la página, `bg-background`; si flota sobre ella, `bg-surface` + `shadow-menu` / `shadow-modal`. Sidebar `bg-surface-secondary` con borde `separator-strong`; barra global `bg-surface-header`; toolbar `bg-surface-bar`; card = cuerpo `bg-surface` + `shadow-widget` y cabecera `bg-surface-bar`; zona hundida `bg-fill-1` / `bg-grouped`; tooltip `bg-tooltip`. Hover y selección neutra con `fill-1/2/3`. En oscuro la página es `#1C1C1E`, no negro. Casi siempre esto ya lo pone el componente: no le agregues fondos ni bordes a `Card`, `Sidebar` o `AppShell`.

**Translucidez solo sobre el wallpaper** (`AppShell ambient`): barras y `Toolbar` en `material-translucent`; cuerpo de `Card`, `WidgetCard` y `Sidebar` en `material-translucent-body`. Menús, diálogos y campos siguen opacos. Dentro de una app de trabajo, todo opaco.

### Selección

El resaltado de menús y el ítem activo del sidebar van en **gris** (`fill-2`, `fill-1`). El acento sólido es solo para la fila elegida de una lista o tabla **con foco**; sin foco, la fila elegida vuelve a gris.

### Tipografía

Por roles, como iCloud: `text-large-title` 48 (el título de la página), `title-1/2/3` 28/21/19, `headline` y `body` 17, `subheadline` 15, `callout` 14 (el cromo: barras, menús, tablas), `footnote` 12, `caption` 11. Un `<h1>` por página, que pone `PageHeaderTitle`.

### Color del texto

Texto con `label` / `label-secondary` (≥ 4,5:1). `label-tertiary` no es para texto chico: solo glifos, deshabilitados y texto grande. `gray-800` no va como texto. Un solo vocabulario: los tokens del paquete, no los alias de shadcn (`--color-card`, `--color-muted`…).

### Links

Un link con forma de botón o de card: `buttonVariants()` / `cardVariants()` sobre `<a>` o `<Link>`. **Nunca** `render` de un `Button` para un link (Base UI le pone `role="button"`). Un link de texto: `linkVariants` (`inline`, `subtle`, `row`, `accent`). Una acción que abre un panel no es un link: es un `<button>`, aunque se vea como link. Un link que solo aparece en hover no existe en un celular.

## Elegir componente

| Si necesitás | Usá |
|---|---|
| Informar algo que calculó el sistema | `Badge` |
| Un dato que puso el usuario y puede sacar | `Tag` (tiene ×) |
| Navegar | `NavigationMenu`, `SidebarItem`, links |
| Ejecutar una acción desde un menú | `DropdownMenu` |
| Una tarea corta | `Dialog` |
| Confirmar algo irreversible | `AlertDialog` |
| Un panel lateral (detalle, filtros) | `Sheet` |
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

Debajo de 640 px, como iOS: el popover de **contenido** (`Popover`, `DatePicker`, `ColorPicker`) pasa solo a una hoja de abajo; los **menús** (`DropdownMenu`, `Select`, `Combobox`…) siguen anclados. Ningún popup se sale de la pantalla.

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

- Métricas: `Stat` dentro de `Card`, en `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`.
- Tablero: `WidgetCard` en `grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]` (el gráfico ancho, la lista angosta).
- Listado: `DataTable` con `filter`, `pageSize={10}`, columnas `sortable`, las numéricas con `numeric`, el filtro de estado en `toolbar` (tamaño `sm`) y `empty` con un `EmptyState variant="plain"`.
- Detalle: un `Sheet` controlado por la página (el id elegido, no el objeto), con datos, `Timeline` y las acciones al pie.
- Configuración: `Tabs`; un `Form` por pestaña con «Guardar cambios», salvo los `Switch`, que aplican al instante.

**Estados:**

- Cargando: `Skeleton` del mismo alto que lo que va a llegar (la pantalla no salta), o la prop `loading` (`DataTable`).
- Vacío: `EmptyState` con una acción («Limpiar filtros»).
- Acción reversible: `toast` con «Deshacer». Acción irreversible: `AlertDialog`, sin deshacer.
- Alta: `toast.success` con el nombre de lo creado.

**Lo pesado, diferido:** un gráfico (Recharts) se carga con `React.lazy` y se monta después de hidratar, con un `Skeleton` mientras llega. `next/dynamic` agrega un preload al HTML y no ahorra nada.

**A 390 px:** nada de scroll horizontal; las barras de filtros pasan a columna (`flex-col sm:flex-row`), los campos a ancho completo (`w-full sm:w-48`), y las fechas y montos de una lista angosta en formato corto.

## Anatomía de una landing

Así está armado el [template de landing](/templates/landing): es el default para landings y páginas de marketing.

```
div.bg-ambient[data-ambient]         el wallpaper: barra y cards pasan solas a translúcidas
├── Navbar                           marca, links a anclas, una CTA en gris
├── main  max-w-[1080px] gap-24      una columna centrada, mucho aire entre secciones
│   ├── Hero                         el único <h1> (text-large-title) y la acción primaria
│   ├── Logos                        Marquee
│   ├── Beneficios #beneficios       Card en grilla 1/2/3
│   ├── Precios #precios             ToggleGroup mensual/anual, 3 planes; el recomendado con el acento
│   ├── Testimonios                  Card con <blockquote>
│   ├── Preguntas #preguntas         Accordion
│   └── Cierre #registro             la acción del hero, otra vez
└── Footer
```

- **Un acento por pantalla:** en una página que se recorre con scroll, la regla es por lo que se ve a la vez. La CTA del hero, el plan recomendado y el cierre van en el acento porque nunca comparten pantalla; la CTA de la barra y las secundarias, en gris.
- Cada sección abre con un `<h2>` en `text-title-1` y una bajada en `text-body text-label-secondary`, centrados.
- Las secciones con ancla llevan `scroll-mt-20`: si no, el título queda debajo de la barra.
- Server Components: cliente solo lo que cambia con un click (el toggle de precios). Una landing tiene que ser liviana.
- Todo el texto en un solo archivo de datos: adaptar la landing es cambiar ese archivo.
- A 390 px: el grupo de CTA pasa a columna (`flex-col sm:flex-row`), las grillas a una columna.

## Los templates

- [Template de dashboard](/templates/dashboard): una app de trabajo (Inicio, Facturas, Clientes, Configuración). Para agentes, con el código: `/templates/dashboard.md`. Para copiarlo: `npx shadcn@latest add https://ui.sebastianfermanelli.com/r/dashboard.json`.
- [Template de landing](/templates/landing): el default para landings. Para agentes: `/templates/landing.md`. Para copiarlo: `npx shadcn@latest add https://ui.sebastianfermanelli.com/r/landing.json`.

En los dos: cambiá los datos (`_data/`) y los textos, no la estructura.
