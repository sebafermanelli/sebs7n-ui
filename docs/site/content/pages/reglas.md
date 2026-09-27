Las decisiones que no se ven en una tabla de props. Cada una existe porque romperla se nota.

## Jerarquía

**Un solo acento sólido por pantalla.** `Button variant="accent"` para la acción principal; el CTA por defecto es el negro (`variant="default"`). Dos acentos compitiendo no son dos acciones importantes: son ninguna. Los estados prendidos —un `Checkbox` marcado, un `Switch`, el relleno de un `Slider`— llevan el brand y no cuentan: dicen «esto está activo», no «apretá acá».

**El botón es una cápsula.** `shape="pill"` le suma un escalón de padding horizontal (`sm` 20px, `md` 24px, `lg` 28px) y es para los CTA de un hero. `shape="rect"` devuelve el rectángulo (`rounded-control`) para donde una cápsula no entra: una celda de tabla densa, un botón a todo el ancho de un formulario angosto. **Una sola forma por pantalla:** dos formas de botón juntas se leen como un descuido, no como una jerarquía.

**`variant="destructive"` solo cuando la acción borra algo**, y siempre detrás de un `AlertDialog`.

## Material

**Nunca vidrio sobre vidrio.** Lo que flota lleva `glass`; lo que vive **adentro** de algo que flota lleva `glass-control`, que es alfa sin blur. No es solo estética: un elemento con `backdrop-filter` se vuelve la raíz del fondo de sus hijos, así que un segundo vidrio adentro desenfoca lo que pintó el primero y no la página. Cuesta lo mismo de pintar y no muestra nada.

| Es | Lleva |
|---|---|
| Una superficie que flota: Card, Popover, menú, Table | `glass` |
| Lo más grande que flota: Dialog, Sheet, Drawer, Sidebar, Navbar | `glass glass-thick` |
| Una lámina: un chip flotante | `glass glass-thin` |
| Lo que vive adentro de una superficie: Input, Button `outline`, Checkbox vacío, Alert | `glass-control` |
| Cromo: Toolbar, Navbar despegada | `glass` + `glass-rim` |
| Una zona hundida: `Card subtle`, `thead`, `EmptyState` | `bg-gray-alpha-100` |

**Las curvas son concéntricas.** Cuando algo redondeado vive cerca del borde de otra cosa redondeada, su radio es el de afuera menos la distancia que los separa. Un diálogo de 26px con un ítem a 8px del borde pide un ítem de 18px: con uno de 10 se ve una caja cuadrada metida en una redondeada. Los menús ya lo hacen solos (el panel mide el radio del ítem más su `p-1`). Importa cuando el padding es menor que el radio; con un padding de 24px en un diálogo de 26, no.

**El grosor sigue al tamaño.** Una superficie grande con el blur de un tooltip se ve como un papel de calcar; un tooltip con el de un diálogo, como un bloque.

**El color va en capa sólida.** Un botón de acción, un Badge `solid`, un Tooltip no son traslúcidos: el color que tiene que leerse igual en cualquier pantalla no puede depender de lo que pase por debajo.

**Cápsulas, no botones sueltos.** En el cromo, las acciones hermanas comparten una cápsula (`Toolbar`) con un separador fino entre grupos, en vez de un borde por botón.

**Blur solo en superficies.** Es lo caro de pintar. Unas pocas por pantalla; una grilla de 200 tarjetas de vidrio se nota al scrollear.

## Etiquetas

**Badge informa, Tag es un dato.** El `Badge` cuenta un estado que calculó el sistema y que el usuario no eligió ni puede sacar: «Pagada», «Vencida», «Admin». El `Tag` es algo que el usuario puso —un filtro aplicado, una etiqueta, un destinatario— y por eso trae el botón de quitar, con nombre accesible («Quitar Chile»). **Si tiene ×, es Tag; si no se puede sacar, es Badge.**

Comparten forma y paleta a propósito: el sistema tiene una sola forma de etiqueta y lo que cambia es qué significa, no el radio. Dentro de un `Combobox` múltiple ya está `ComboboxChip`, conectado al estado del combobox: ahí no va `Tag`. Y si al hacer click en el cuerpo de la etiqueta se filtra, eso es un `Toggle`.

## Links

**Links con forma de botón o card:** `buttonVariants()` / `cardVariants()` sobre `<a>` o `<Link>`. **No uses `render` para links:** Base UI les pone `role="button"` y dejan de ser links para un lector de pantalla.

**Links de texto:** `linkVariants({ variant })`.

| Variante | Cuándo |
|---|---|
| `inline` | Dentro de una frase. Subrayado siempre: una línea tenue que se refuerza en hover. |
| `subtle` | Suelto y secundario. Sin subrayado en reposo; en hover sube a `gray-1000` y aparece la línea. |
| `row` | El nombre clickeable de una fila de tabla. |

Traen `rounded-sm`, `transition-control`, `focus-visible:focus-ring` y `underline-offset-4`: no los repitas en el llamador. `icon: true` alinea una flecha con el texto.

**Un link que solo se revela en hover no existe en un celular.** Si es la acción principal de la sección, va `inline`.

## Menús y navegación

**`Tabs` es una pista segmentada.** La pestaña activa es una pastilla que se desliza. `ThemeSwitcher` es el mismo control con íconos: los dos salen de `sebs7n-ui/variants/segmented`, que también sirve para armar uno propio. `<TabsList variant="line">` es la de Geist —a todo el ancho, con la línea abajo— para la navegación de una página entera, donde una cápsula de 800px de ancho no es un control.

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

**El tamaño se elige una vez por formulario**, no por campo: `md` (40px) es el de una app.

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
| `bg-background` | **La página.** `body` y la raíz del `AppShell`. Con luz ambiente, `bg-ambient`. |
| `glass` | **La superficie**: lo que flota sobre la página. |
| `bg-gray-alpha-100` | **La zona hundida**: `thead`, `Card subtle`, `EmptyState`. |

La regla: si el elemento **es** la página, `bg-background`; si flota **sobre** ella, `glass`. `bg-background-100` y `bg-background-200` siguen existiendo como tokens, pero ningún componente los escribe: un fondo opaco adentro de un vidrio es un parche.

## Server Components

No llevan `"use client"` y se pueden usar desde un Server Component:

- **Los once módulos de `sebs7n-ui/variants/*`**, sin excepción: `badge`, `button`, `card`, `input`, `link`, `menu`, `overlay`, `segmented`, `sidebar`, `tag` y `toggle`. Ninguno lleva `"use client"`, y todos salen también por el barrel.
- **Los dieciséis componentes sin estado**: `Alert`, `AppShellContent`, `Badge`, `Breadcrumb`, `Card`, `EmptyState`, `Kbd`, `Label`, `PageHeader`, `Pagination`, `Separator`, `Skeleton`, `Spinner`, `Stat`, `Table` y `Tag`. Los otros 42 son `"use client"`, que es lo que corresponde: un `DropdownMenu` necesita estado.

`PageHeader` está en esa lista aunque el `<nav>` de sus migas lea el `LabelsProvider`: ese `<nav>` es un subcomponente de cliente interno, y un Server Component puede renderizar uno de cliente. Lo que no puede es llamar un hook, y `PageHeader` no llama ninguno. Es la forma de que un texto salga traducido sin que el llamador tenga que acordarse de pasarlo.


## Tipografía

**No pises el peso de un `heading` con `font-semibold`.** Los `heading` llevan la corrección óptica del peso; para más presencia está el paso de arriba de la escala.

## Lo que no hace el paquete, y es a propósito

| No hace | Por qué |
|---|---|
| Guardar el estado de colapsado del sidebar | La app decide dónde vive. Con una cookie el server ya renderiza el ancho correcto y no hay salto. |
| Registrar atajos de teclado | `shortcut` y `DropdownMenuShortcut` solo muestran y anuncian. Escuchar la tecla es de la app. |
| Cerrar el `AlertDialogAction` | Para poder mostrar `loading`. |
| Crecer solo el `Textarea` | Necesita JS que mida; no vale el peso en el bundle de todos. |
| Una variable global de densidad | Reducir la altura de todos los controles a la vez rompe el tamaño mínimo de target en mobile. |
| Validar formularios | Es de la app. El paquete solo lee `aria-invalid`. |
