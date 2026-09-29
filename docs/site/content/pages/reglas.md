Las decisiones que no se ven en una tabla de props. Cada una existe porque romperla se nota.

## Jerarquía

**Un solo acento sólido por pantalla.** El `Button` por defecto es el primario de iCloud, el acento sólido: va en la acción principal, y las demás son `secondary` (gris) o `plain` (texto de acento). Dos acentos compitiendo no son dos acciones importantes: son ninguna. Los estados prendidos —un `Checkbox` marcado, un `Switch`, un `Toggle`— llevan el brand y no cuentan: dicen «esto está activo», no «apretá acá».

**Sin cápsulas.** Desde 2.0 nada es una píldora: botones y controles con radio 8, campos e ítems de lista con 10, cards y diálogos con 11, menús y popovers con 12 (los de iCloud).

**`variant="destructive"` solo cuando la acción borra algo**, y siempre detrás de un `AlertDialog`.

## Superficies

**Opaco en capas, como iCloud.** Desde 2.0 no hay vidrio: la página es `bg-background`, el sidebar `surface-secondary`, las barras `surface-bar` (toolbar) y `surface-header` (barra global), lo que flota —menú, popover, diálogo, toast— `bg-surface` con su sombra. El gris de hover y de selección neutra sale de `fill-1/2/3`.

| Es | Lleva |
|---|---|
| La página, el contenido de una lista o un detalle | `bg-background` |
| La columna del sidebar | `bg-surface-secondary` + borde derecho `separator-strong` |
| La barra global (`Navbar`, `AppShell header`, la barra del teléfono) | `bg-surface-header` + borde abajo `separator-strong` |
| La toolbar de una app (`Toolbar`) | `bg-surface-bar` + separador abajo |
| Menú, Select, Combobox, Popover, HoverCard, Dialog, Sheet, toast | `bg-surface` + `shadow-menu` / `shadow-modal` |
| Un widget (`Card`) | cuerpo `bg-surface` + `shadow-widget`, cabecera `bg-surface-bar` |
| Una zona hundida: `Card subtle`, la card inline, el `EmptyState` | `bg-fill-1` / `bg-grouped` |
| El tooltip | `bg-tooltip` (gris oscuro en los dos temas) |

**Un solo material translúcido**: `material-translucent`, y solo donde iCloud lo usa —la barra global y el header de un widget **sobre el wallpaper** (`AppShell ambient`), el popover de acceso rápido—. Con `prefers-reduced-transparency` o más contraste vuelve a ser opaco. Adentro de una app todo es opaco.

**Las curvas son concéntricas.** Cuando algo redondeado vive cerca del borde de otra cosa redondeada, su radio es el de afuera menos la distancia que los separa: el menú de 12 con 5 de padding lleva ítems de 8 (la cabecera de cuenta del `UserMenu`, 7). Importa cuando el padding es menor que el radio.

**A ras, no flotando.** El sidebar va pegado arriba, a la izquierda y abajo; la barra global y la toolbar, a todo el ancho. Las acciones hermanas de una barra se separan con un `ToolbarSeparator` fino, no con un borde por botón.

## Etiquetas

**Badge informa, Tag es un dato.** El `Badge` cuenta un estado que calculó el sistema y que el usuario no eligió ni puede sacar: «Pagada», «Vencida», «Admin». El `Tag` es algo que el usuario puso —un filtro aplicado, una etiqueta, un destinatario— y por eso trae el botón de quitar, con nombre accesible («Quitar Chile»). **Si tiene ×, es Tag; si no se puede sacar, es Badge.**

Comparten forma y paleta a propósito: el sistema tiene una sola forma de etiqueta y lo que cambia es qué significa, no el radio. Dentro de un `Combobox` múltiple ya está `ComboboxChip`, conectado al estado del combobox: ahí no va `Tag`. Y si al hacer click en el cuerpo de la etiqueta se filtra, eso es un `Toggle`.

## Links

**Links con forma de botón o card:** `buttonVariants()` / `cardVariants()` sobre `<a>` o `<Link>`. **No uses `render` para links:** Base UI les pone `role="button"` y dejan de ser links para un lector de pantalla.

**Links de texto:** `linkVariants({ variant })`.

| Variante | Cuándo |
|---|---|
| `inline` | Dentro de una frase. Subrayado siempre: una línea tenue que se refuerza en hover. |
| `subtle` | Suelto y secundario. Sin subrayado en reposo; en hover sube a `label` y aparece la línea. |
| `row` | El nombre clickeable de una fila de tabla. |

Traen `rounded-sm`, `transition-control`, `focus-visible:focus-ring` y `underline-offset-4`: no los repitas en el llamador. `icon: true` alinea una flecha con el texto.

**Un link que solo se revela en hover no existe en un celular.** Si es la acción principal de la sección, va `inline`.

## Menús y navegación

**`Tabs` es la barra de Settings de iCloud.** La `line` (el default) va en 17, con el subrayado de 1px del ancho del texto sobre la línea base: es la navegación de una página. `segmented` es el control de Calendar (pista de 28, segmento de 24 que se eleva) para cambiar de vista adentro de algo. `ThemeSwitcher` es el segmentado con íconos: los dos salen de `sebs7n-ui/variants/segmented`.

**`NavigationMenu` si los ítems navegan, `DropdownMenu` si ejecutan algo.** No es cosmético: `DropdownMenu` emite `role="menu"` / `role="menuitem"`, atrapa el foco y se recorre con las flechas, así que un lector anuncia «menú, 3 elementos» en vez de una lista de links, y el modo de navegación por links no los ve. El menú de idioma y el de usuario siguen siendo `DropdownMenu` (cambian el estado, no la página).

**`DropdownMenuLabel` va dentro de `DropdownMenuGroup`.** Suelto, Base UI tira la página abajo.

**`NavigationMenuViewport` va una sola vez**, hermano de la lista: el panel es uno para todos los ítems.

## Superposiciones

**Los triggers usan `render={<Button … />}`, no `asChild`.** Vale para Dialog, Popover, Tooltip, DropdownMenu y Sheet.

**Dialog vs AlertDialog vs Sheet vs Popover vs Tooltip:**

| Uso | Componente |
|---|---|
| Una tarea corta sin perder el contexto | `Dialog` |
| Confirmar algo que no se puede deshacer | `AlertDialog` |
| Un panel lateral: filtros, un formulario largo | `Sheet` |
| Contenido interactivo anclado a un control | `Popover` |
| Una línea de texto que aclara un control | `Tooltip` |
| Confirmar que algo salió bien | `toast()` |
| Algo que sigue siendo verdad en la página | `Alert` |

**`AlertDialogAction` no cierra sola** — a propósito, para poder mostrar `loading` mientras corre la acción. O controlás `open` y cerrás al terminar, o la envolvés: `<AlertDialogClose render={<AlertDialogAction variant="destructive" />}>Eliminar</AlertDialogClose>`. `AlertDialogCancel` sí cierra.

## Formularios

**El tamaño se elige una vez por formulario**, no por campo: `md` (36px, el botón de un modal de iCloud) es el de una app.

**Select, Combobox o Autocomplete:**

| Situación | Componente |
|---|---|
| Hasta ~8 opciones fijas | `Select` |
| Muchas opciones, el valor tiene que ser una de ellas | `Combobox` |
| Muchas opciones, se acepta texto libre | `Autocomplete` |
| 2 a 5 opciones, todas visibles | `RadioGroup` |
| Una opción con efecto inmediato | `Switch` |
| Varias opciones no excluyentes | `Checkbox` |

## Fondos

| Token | Rol |
|---|---|
| `bg-background` | **La página.** `body` y la raíz del `AppShell`. Con wallpaper, `bg-ambient`. |
| `bg-surface` | **Lo que flota**: menú, popover, diálogo, toast, el cuerpo de un widget. |
| `bg-fill-1` | **La zona hundida** y el hover: `Card subtle`, la fila con el puntero. |

La regla: si el elemento **es** la página, `bg-background`; si flota **sobre** ella, `bg-surface` con su sombra. `bg-background-100` y `bg-background-200` son de la escala de Geist, obsoleta desde 2.0: ningún componente los escribe.

## Server Components

No llevan `"use client"` y se pueden usar desde un Server Component:

- **Los catorce módulos de `sebs7n-ui/variants/*`**, sin excepción: `badge`, `button`, `card`, `command`, `input`, `link`, `menu`, `overlay`, `segmented`, `selection`, `sidebar`, `slider`, `tag` y `toggle`. Ninguno lleva `"use client"`, y todos salen también por el barrel.
- **Los veinte componentes sin estado**: `Alert`, `AppShellContent`, `Badge`, `Breadcrumb`, `Card`, `EmptyState`, `Kbd`, `Label`, `ListRow` (con `List` y `ListSection`), `PageHeader`, `Pagination`, `Separator`, `Skeleton`, `Spinner`, `Stat`, `Table`, `Tag`, `TextLink`, `Timeline` y `WidgetCard`. Los otros 59 módulos son `"use client"`, que es lo que corresponde: un `DropdownMenu` necesita estado.

`PageHeader` está en esa lista aunque el `<nav>` de sus migas lea el `LabelsProvider`: ese `<nav>` es un subcomponente de cliente interno, y un Server Component puede renderizar uno de cliente. Lo que no puede es llamar un hook, y `PageHeader` no llama ninguno. Es la forma de que un texto salga traducido sin que el llamador tenga que acordarse de pasarlo.


## Tipografía

**Los roles de iCloud, no tamaños sueltos.** `text-large-title` (48) para el título de una página, `text-title-1/2/3` (28, 21, 19) para títulos, `text-headline` (17/600) y `text-body` (17) para el contenido, `text-subheadline` (15) para el sidebar, `text-callout` (14) para el cromo —menús, campos, botones, metadatos— y `text-footnote` (12) / `text-caption` (11) para lo chico. La escala de Geist (`text-heading-*`, `text-copy-*`, `text-label-*`) sigue en el CSS hasta 3.0, pero ningún componente la usa.

## Lo que no hace el paquete, y es a propósito

| No hace | Por qué |
|---|---|
| Guardar el estado de colapsado del sidebar | La app decide dónde vive. Con una cookie el server ya renderiza el ancho correcto y no hay salto. |
| Registrar atajos de teclado | `shortcut` y `DropdownMenuShortcut` solo muestran y anuncian. Escuchar la tecla es de la app. |
| Cerrar el `AlertDialogAction` | Para poder mostrar `loading`. |
| Crecer solo el `Textarea` | Necesita JS que mida; no vale el peso en el bundle de todos. |
| Una variable global de densidad | Reducir la altura de todos los controles a la vez rompe el tamaño mínimo de target en mobile. |
| Validar formularios | Es de la app. El paquete solo lee `aria-invalid`. |
