Es parte del contrato del paquete, no un extra. Lo que sigue es lo que el paquete **garantiza** y lo que le queda a la app.

## Lo que garantiza el paquete

### Contraste

No es una revisión a ojo. `test/contrast.test.ts` recalcula 62 pares leyendo los hexadecimales de `colors.css` y `theme.css` —no una copia—, así que si alguien retoca un token cambia el número que se verifica. `test/brand-contrast.test.ts` hace lo mismo en OKLCH con las marcas de ejemplo.

La función que usan los dos sale publicada en `sebs7n-ui/lib/contrast`: tu app puede escribir el mismo test para **su** marca, que es la única que el paquete no puede cubrir. El ejemplo está en [Theming](/docs/theming).

Qué cubre esa tabla:

| Par | Umbral |
|---|---|
| `gray-900` y `gray-1000` como texto, sobre los tres fondos | 4,5:1 (1.4.3) |
| Placeholder de los campos | 4,5:1 |
| Atajos de menú, sobre el popup y sobre el ítem resaltado | 4,5:1 |
| `Button variant="destructive"`, en reposo, hover y active | 4,5:1 |
| `Badge subtle` en las ocho paletas fijas, y `Badge solid` gris | 4,5:1 |
| Contorno de Checkbox, Radio, Switch y Toggle sin marcar | 3:1 (1.4.11) |
| Borde del campo enfocado | 3:1 (2.4.11) |
| Anillo de foco en las cuatro marcas de ejemplo | 3:1 |

Los grises que el paquete usa como **texto** son dos, y estos son los números sobre la superficie:

| Texto | Claro | Oscuro |
|---|---|---|
| `gray-1000` (cuerpo) | 17,93:1 | 16,91:1 |
| `gray-900` (secundario, placeholder, atajos) | 8,45:1 | 7,57:1 |

`gray-800` **no es un color de texto**: en claro da 4,12:1 y no llega a AA, y no se usa como texto en ninguno de los 58 componentes. `gray-700` y abajo son bordes y estados deshabilitados.

**Los deshabilitados están exentos** (1.4.3 y 1.4.11 eximen a los componentes inactivos), y es deliberado: un control apagado tiene que verse apagado, y subirlo a 4,5:1 lo volvería indistinguible de uno que anda.

**El borde del `Input` se queda en `gray-400`** (1,20:1), y es la única excepción escrita del sistema. Lo que identifica a un campo de texto no es su contorno sino su superficie —`background-100` contra el fondo de página— más su etiqueta, que es obligatoria. Checkbox, Radio, Switch y Toggle sí subieron a `gray-700`, porque ahí el contorno es lo único que hay: sin él no hay control, hay un hueco.

### Foco visible siempre

Ningún componente saca el anillo de foco sin reemplazarlo. `focus-visible:focus-ring` en los controles, `focus:focus-border` en los campos, y el anillo usa `brand-700`. El reset define además un `:focus-visible` por defecto, así que un `<a>` suelto de la app tampoco queda sin foco.

Los popups que pueden recibir el foco ellos mismos —Popover, HoverCard y NavigationMenu cuando no tienen nada tabulable adentro, y el panel de `Tabs`— también lo muestran. Es el caso que más fácil se cuela: el foco existe, el teclado funciona, y en la pantalla no se ve nada.

El borde del campo enfocado llega a 3:1 en los dos temas. El halo de 4px que lo acompaña es énfasis, no el indicador.

### Objetivos táctiles

Todo lo que se toca llega a 24×24 CSS px de **área** (WCAG 2.5.8), que no es lo mismo que de dibujo. Los controles chicos —el quitar de un `Tag` o de un `ComboboxChip`, un Checkbox, un Radio— mantienen su tamaño visual y agrandan el área con un `::after` de `-inset-1` o `-inset-2`. Agrandar el dibujo cambiaría la densidad de toda la pantalla para arreglar el dedo de nadie.

### Semántica antes que estilo

| Componente | Qué emite |
|---|---|
| `NavigationMenu` | `<nav>` + `<ul>` + `<a>` |
| `DropdownMenu` | `role="menu"` / `role="menuitem"`, recorrido por flechas |
| `Tabs` | `role="tablist"` / `tab` / `tabpanel` con `aria-controls` |
| `Switch` | `role="switch"` con `aria-checked` |
| `Table` | `<table>` nativa |
| `AlertDialog` | `role="alertdialog"` |
| `SidebarContent` | `<nav aria-label="Navegación principal">` |

Elegir mal cambia lo que anuncia un lector de pantalla. El caso más común: **si los ítems navegan es `NavigationMenu`, si ejecutan algo es `DropdownMenu`**. Un `role="menu"` con links adentro desaparece del modo de navegación por links.

### Nombres accesibles que exige el tipo

Lo que se puede verificar en TypeScript se verifica ahí, no en esta página: una regla que vive solo en la documentación se cumple mientras alguien se acuerde.

| Componente | Qué pide |
|---|---|
| `Button` con `size="icon-sm"` / `"icon-md"` / `"icon-lg"` | `aria-label` o `aria-labelledby` |
| `Progress` y `Meter` | `label` visible, `aria-label` o `aria-labelledby` |
| `AvatarImage` | `alt`, incluso `""` |
| `ToolbarGroup` | `aria-label` o `aria-labelledby` |

Dos casos donde el nombre ya está y el tipo lo pide igual, porque ningún tipo puede mirar adentro de `children`: cuando lo pone un texto `sr-only`, y cuando lo pone un envoltorio (`<DropdownMenuTrigger aria-label="Menú" render={<Button size="icon-sm" />} />`). En los dos se escribe en el `aria-label` del `Button`, que es el que termina en el DOM.

`DialogContent`, `SheetContent` y `DrawerContent` no se pueden tipar —el título es un hijo—, así que avisan por consola **en desarrollo** si se montan sin `aria-labelledby` ni `aria-label`. En producción el aviso no existe.

### Teclado

Los flotantes abren con Enter / Espacio / flechas, Escape cierra y **devuelve el foco al trigger**, y el fondo queda inerte mientras están abiertos. `AppShell` trae un link «Ir al contenido» que apunta al `<main>` y es la primera parada de tabulación de toda la app.

### Estado anunciado

- `SidebarItem active` pone `aria-current="page"`.
- `SidebarItemBadge` acepta `label` para que el contador se lea con contexto: «Clientes, 3 pendientes».
- `SidebarSearch shortcut` emite `aria-keyshortcuts`.
- `Button loading` pone `aria-busy` y `aria-disabled` en vez de sacar el botón del foco.
- `ComboboxStatus` es una región `aria-live` que anuncia «Buscando…» sin robar el foco.

### Movimiento

Todas pasan por el reset global de `base.css`, que baja cualquier `animation-duration` y `transition-duration` a 0,01 ms cuando el sistema pide menos movimiento. Las que además tienen un recorrido —la franja de `Progress` indeterminada, el deslizamiento del `Drawer`, la entrada del `Sheet`— suman su propia regla `motion-reduce`, porque congelar un recorrido a mitad de camino es peor que no hacerlo: `Progress` pasa a pista llena en gris y las hojas aparecen en lugar de deslizarse.

### Errores de formulario

**Escribí siempre el mensaje**, con `match` o con `validate`:

```tsx
<Field name="razonSocial">
  <FieldLabel required>Razón social</FieldLabel>
  <Input required />
  <FieldError match="valueMissing">Falta la razón social</FieldError>
</Field>
```

El mensaje del navegador sale en el idioma **del navegador**, no en el de la página: un formulario en español puede terminar diciendo «Please fill out this field». Es el error más fácil de no ver, porque en la máquina de quien lo programó el navegador está en español.

`Field` arma solo el `aria-describedby` y pone `aria-invalid` cuando corresponde. Ese `aria-invalid` es lo que sincroniza el estilo con la semántica —el borde rojo sale de ahí, no de una clase de color—, pero **no es garantía de accesibilidad por sí solo**: un campo inválido y bien pintado sigue sin servir si el mensaje no dice qué arreglar, o si sale en otro idioma. Nunca uses una clase de color para marcar un error: el estilo y la semántica tienen que venir del mismo atributo o se desincronizan.

Al enviar, `Form` mueve el foco al primer campo inválido y ahí se anuncia el nombre del campo y su error. Con `validationMode="onChange"` eso no pasa —el error aparece con el foco ya adentro—: para ese caso `FieldError` tiene `alert`, que le pone `role="alert"`. Es opt-in porque `role="alert"` interrumpe, y en el camino de enviar duplicaría el anuncio.

### Idioma

Los textos que los componentes escriben solos están en español y se traducen todos de una vez con un `LabelsProvider`, que se importa de `sebs7n-ui/labels`. Está explicado en [Instalación](/docs/instalacion#idioma).

Hasta 0.4.0 tres de esos textos —el «Cerrar» de `Dialog`, `Sheet` y `Drawer`— no se podían cambiar de ninguna forma. Ahora tienen `labels={{ close }}` además del provider.

`lang` en el `<html>` sigue siendo de la app, y no es opcional: cambia la pronunciación del lector de pantalla.

### Dirección del texto: **LTR only**

El paquete asume texto de izquierda a derecha. En un idioma RTL (árabe, hebreo, persa) **no se rompe, pero queda espejado al revés**: los componentes siguen funcionando con teclado y lector de pantalla, y lo que falla es dónde cae cada cosa.

Qué asume dirección física hoy:

- **Posición de los flotantes**: `align`/`side` de Select, DropdownMenu, ContextMenu, Menubar, Popover y Combobox salen de props `"start"`/`"end"` de Base UI —esas sí son lógicas—, pero los `alignOffset` y los `translate-x` de las animaciones están escritos en píxeles físicos.
- **La X de cierre** de Dialog, Sheet y Drawer va en `right-4`.
- **El lado del `Sheet` y del `Drawer`**: `side="right"` es literalmente la derecha de la pantalla, no el final de la línea.
- **Sangrías y rellenos** de los ítems con ícono o con indicador: `pl-*` / `pr-*` en menús, `Select`, `Combobox`, `Table` y `Sidebar`.
- **`Sonner`** posiciona por esquina física.

Los únicos dos lugares que ya usan el eje lógico son los submenús de `Menubar` y `ContextMenu`, con `side="inline-end"`.

El camino si algún día hace falta: migrar a utilidades lógicas (`end-4` en vez de `right-4`, `border-e` en vez de `border-r`, `ms-auto` en vez de `ml-auto`, `ps-*`/`pe-*` en vez de `pl-*`/`pr-*`), re-exportar el `DirectionProvider` de Base UI y agregar `dir="rtl"` a los tests. Son 89 clases físicas en 26 archivos; no es difícil, es largo, y hacerlo a medias es peor que no hacerlo porque deja la pantalla mezclada.

## Lo que le queda a la app

El paquete no puede resolver esto, y es donde se rompe la accesibilidad en la práctica:

1. **El texto de los `aria-label`.** El tipo obliga a que estén; que digan algo útil es de la app. «Cerrar» sirve, «botón» no. Un `Tooltip` **no** reemplaza al nombre: en un celular no existe.
2. **`Label` asociado a cada campo**, con `htmlFor`/`id`, o directamente `Field`, que lo resuelve solo. Un `placeholder` no es una etiqueta: desaparece al escribir.
3. **El texto del mensaje de error**, escrito con `match` o `validate`.
4. **Un solo `<h1>` por página** (`PageHeaderTitle`) y los `<h2>`/`<h3>` en orden, sin saltarse niveles.
5. **`lang` en `<html>`.** Si la app está en español, `lang="es"`: cambia la pronunciación del lector.
6. **Los atajos de teclado.** `SidebarSearch shortcut="⌘K"` y `DropdownMenuShortcut` solo **muestran** y anuncian el atajo; escucharlo es de la app.
7. **`role="status"` en los avisos que aparecen por una acción.** Un `Alert` que aparece solo no se anuncia.
8. **Una tarjeta interactiva tiene que ser un `<a>` o un `<button>`.** `Card interactive` solo agrega los estilos.
9. **El color nunca solo.** Un `Badge` verde tiene que decir «Pagado»; un `Stat` con `trend="up"` tiene que traer el signo en el número.
10. **Zoom al 200 % y ancho de 320 px** sin scroll horizontal. Los componentes no lo impiden; los layouts a mano, sí.

## Probarlo en cinco minutos

1. **Tabulá la pantalla entera** sin tocar el mouse. Si el foco desaparece o salta a algo que no ves, hay un bug.
2. **Escape** en cada flotante: tiene que cerrar y devolver el foco al trigger.
3. **Zoom al 200 %.**
4. **VoiceOver (⌘F5) en el formulario principal.** Cada campo tiene que anunciar su nombre, su estado y su error.
5. **Modo oscuro**: el contraste no es el mismo y los grises tenues son lo primero que se cae.
