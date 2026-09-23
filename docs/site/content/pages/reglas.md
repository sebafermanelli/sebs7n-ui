Las decisiones que no se ven en una tabla de props. Cada una existe porque romperla se nota.

## Jerarquía

**Un solo acento por pantalla.** `Button variant="accent"` o `Switch variant="accent"` para la acción principal; el CTA por defecto es el negro (`variant="default"`). Dos acentos compitiendo no son dos acciones importantes: son ninguna.

**`shape="pill"` solo en los CTA de un hero o de una sección de marketing.** Es `rounded-full` con un escalón más de padding horizontal (`sm` 20px, `md` 24px, `lg` 28px). **Nunca en el chrome de una app** —nav, tablas, formularios, diálogos—: dos formas de botón en la misma pantalla se leen como un descuido, no como una jerarquía. En `icon-*` se ignora, que ya es cuadrado con su propio radio.

**`variant="destructive"` solo cuando la acción borra algo**, y siempre detrás de un `AlertDialog`.

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
| `bg-background` | **La página.** `body` y la raíz del `AppShell`. |
| `bg-background-100` | **La superficie**: lo que flota sobre la página. |
| `bg-background-200` | **El fondo sutil / banda**: Sidebar, `thead`, `Card subtle`, `EmptyState`. |

La regla: si el elemento **es** la página, `bg-background`; si flota **sobre** ella, `bg-background-100`.

## Server Components

No llevan `"use client"` y se pueden usar desde un Server Component:

- Las variantes: `buttonVariants`, `badgeVariants`, `cardVariants`, `linkVariants`, `toggleVariants`, `sidebarItemVariants`, y las clases de `menu` e `input`.
- Los componentes sin estado: `Kbd`, `PageHeader`, `EmptyState`, `Stat` y `AppShellContent`.

Todo lo demás es `"use client"`, que es lo que corresponde: un `DropdownMenu` necesita estado.

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
