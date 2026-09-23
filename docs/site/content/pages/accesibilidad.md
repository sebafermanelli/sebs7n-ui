Es parte del contrato del paquete, no un extra. Lo que sigue es lo que el paquete **garantiza** y lo que le queda a la app.

## Lo que garantiza el paquete

### Contraste

El texto sobre el acento llega a AA 4,5:1 en claro y en oscuro. No es una revisión a ojo: un test recalcula el ratio desde OKLCH para cada marca de ejemplo y falla si una no da.

La escala de grises también está medida. En oscuro, sobre la superficie `#0a0a0a`:

| Texto | Ratio |
|---|---|
| `gray-1000` `#ededed` (cuerpo) | 16,91:1 |
| `gray-900` `#a0a0a0` (secundario) | 7,57:1 |
| `gray-800` `#7d7d7d` (el más tenue que se usa como texto) | 4,81:1 |

`gray-700` y abajo no son colores de texto: son bordes y placeholders.

### Foco visible siempre

Ningún componente saca el anillo de foco. `focus-visible:focus-ring` en los controles, `focus:focus-border` en los campos, y el anillo usa `brand-700`. El reset también define un `:focus-visible` por defecto para todo lo que no sea del paquete, así que un `<a>` suelto de la app tampoco queda sin foco.

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

### Teclado

Los flotantes abren con Enter / Espacio / flechas, Escape cierra y **devuelve el foco al trigger**, y el fondo queda inerte mientras están abiertos. `AppShell` trae un link «Ir al contenido» que apunta al `<main>` y es la primera parada de tabulación de toda la app.

### Estado anunciado

- `SidebarItem active` pone `aria-current="page"`.
- `SidebarItemBadge` acepta `label` para que el contador se lea con contexto: «Clientes, 3 pendientes».
- `SidebarSearch shortcut` emite `aria-keyshortcuts`.
- `Button loading` pone `aria-busy` y `aria-disabled` en vez de sacar el botón del foco.
- `ComboboxStatus` es una región `aria-live` que anuncia «Buscando…» sin robar el foco.

### Movimiento

Todas las animaciones pasan por `motion-reduce`, además del reset global del paquete, que baja cualquier `animation-duration` y `transition-duration` a 0,01 ms cuando el sistema pide menos movimiento.

### Errores de formulario

**`aria-invalid` en el campo es lo único que hace falta**: el borde rojo y el anillo de error salen de ahí, no de una clase aparte. Nunca uses una clase de color para marcar un error: el estilo y la semántica tienen que venir del mismo atributo o se desincronizan.

## Lo que le queda a la app

El paquete no puede resolver esto, y es donde se rompe la accesibilidad en la práctica:

1. **Nombre accesible de los botones de ícono.** `size="icon-*"` no tiene texto: va `aria-label`. Un `Tooltip` **no** sirve como nombre — en un celular no existe.
2. **`Label` asociado a cada campo**, con `htmlFor`/`id`. Un `placeholder` no es una etiqueta: desaparece al escribir.
3. **El mensaje de error referenciado** con `aria-describedby`, para que se lea al enfocar el campo.
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
