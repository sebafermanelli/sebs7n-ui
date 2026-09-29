La paleta, los radios y las sombras por defecto de Tailwind están **reseteados**: `bg-blue-50` o `shadow-md` no compilan. Solo existen los tokens del paquete.

Los valores viven en `tokens/geist.json` y se compilan a `src/styles/colors.css` con `npm run tokens`; un test falla si el CSS quedó desactualizado. Las tablas de esta página se generan de esos mismos archivos.

`geist.json` está en un **formato propio**, no en W3C DTCG: es un objeto `{ light, dark }` con `familia → paso → hex`, sin `$value` ni `$type`. Y solo tiene color: la tipografía, los radios y las sombras viven directo en `theme.css`, y las tablas de abajo salen de parsear ese CSS. Es a propósito mientras el único consumidor sea este repo — el JSON existe para generar `colors.css` y para que el sitio dibuje la paleta, no para intercambiar tokens con nadie. El día que haya un Figma o un Style Dictionary del otro lado, el formato a adoptar es DTCG y la migración empieza por sacar la tipografía del CSS.

## Fondos: página, superficie y banda

Son tres roles distintos y cada uno tiene su token. Elegir mal se nota sobre todo en oscuro, donde la página es negro puro:

{{fondos}}

**La regla (2.0, iCloud):** la página es `bg-background`; lo que flota encima (menú, popover, diálogo) es `bg-surface` con `shadow-menu`; la columna del sidebar es `bg-surface-secondary`, las barras `bg-surface-bar`, las cards `bg-grouped`. Los rellenos neutros son `bg-fill-1/2/3`, las líneas `border-separator` y los textos `text-label`, `text-label-secondary` y `text-label-tertiary`. No hay vidrio: el único material translúcido es `material-translucent`, para lo que va sobre un wallpaper.

Los valores de oscuro son los de vercel.com medidos con `getComputedStyle` (contact/sales, 2026-09-22): `--ds-background-100: hsla(0,0%,4%)` = `#0a0a0a` para las superficies y `--ds-background-200: hsla(0,0%,0%)` = `#000` para la página. `background-200` es siempre el tono que **no** es el de la página: en claro baja a `#fafafa`, en oscuro no puede bajar de `#000` y sube a `#0a0a0a`. Por eso en oscuro coincide con `background-100`: Geist tiene dos fondos por tema, no tres.

## Color

Diez pasos por familia, de `100` (el más claro en tema claro) a `1000`. La convención de Geist: **100–400 son fondos, 500–700 son bordes y elementos, 800–1000 son texto**. El contraste de `gray-900` sobre cualquier fondo de la misma familia llega a AA.

**`gray-800` es la excepción y no se usa como texto**: sobre la superficie clara da 4,12:1, abajo del 4,5 de WCAG 1.4.3. El paso de texto tenue de este sistema es `gray-900` (8,45:1 en claro, 7,57:1 en oscuro). Está en [Accesibilidad](/docs/accesibilidad).

{{colores}}

`brand` no está en la tabla porque no tiene valores fijos: se deriva de las cuatro variables de la app. Ver [Theming](/docs/theming).

## Alias de compatibilidad con shadcn

`theme.css` define además el vocabulario semántico de shadcn, apuntando a los tokens de arriba:

| Alias | Apunta a | Su `-foreground` |
|---|---|---|
| `--color-foreground` | `gray-1000` | — |
| `--color-card` | `background-100` | `gray-1000` |
| `--color-popover` | `background-100` | `gray-1000` |
| `--color-muted` | `gray-100` | `gray-900` |
| `--color-primary` | `gray-1000` | `background-100` |
| `--color-secondary` | `gray-100` | `gray-1000` |
| `--color-accent` | `gray-200` | `gray-1000` |
| `--color-destructive` | `red-800` | `#fff` |
| `--color-border` | `gray-400` | — |
| `--color-input` | `gray-400` | — |
| `--color-ring` | `brand-700` | — |

**Existen para que un componente pegado de shadcn se vea bien sin tocarlo**, que es el caso real: el registry (`shadcn add`) funciona y tarde o temprano alguien copia un bloque de shadcn.io a una app que ya usa este paquete. Sin los alias, ese bloque saldría sin color; con ellos sale en la paleta de Geist. Los pares resuelven a combinaciones que pasan AA: `primary` 17,9:1 claro y 16,9:1 oscuro, `muted-foreground` sobre `muted` 7,55 y 6,66, `destructive` 4,75 y 4,79.

**No los uses en código nuevo.** Los componentes del paquete no los tocan: usan `bg-surface`, `text-label-secondary`, `border-separator`. Dos vocabularios para lo mismo es exactamente lo que las [reglas](/docs/reglas) dicen que no queremos, así que el segundo es una compuerta de entrada, no una opción.

## Tipografía

Las utilidades de Geist. `cn()` las entiende como tamaño de fuente, así que conviven con `text-gray-900`.

{{tipografia}}

**Los `heading` llevan el peso corregido ópticamente**, no 600 fijo. Un mismo peso no se ve igual a 14px que a 64px: cuanto más grande el cuerpo, más gruesos se leen los trazos, y 600 a 64px sale plomizo. Los números salen de medir vercel.com (computed style, 2026-09-22); los pasos que no aparecían ahí se interpolan en la misma curva.

**No lo pises con `font-semibold`**: para eso está el paso de arriba de la escala. Y necesita Geist como fuente variable (rango `100 900`); con una estática los pesos intermedios se redondean y la corrección se pierde.

Cuándo usar cada familia:

| Familia | Para qué |
|---|---|
| `heading-*` | Títulos. Peso óptico, tracking negativo. |
| `copy-*` | Párrafos y texto corrido. Interlineado holgado. |
| `label-*` | Etiquetas, celdas, metadatos. Interlineado ajustado, peso 400. |
| `button-*` | Texto dentro de controles. Peso 500. |
| `*-mono` | Código, IDs, importes. Geist Mono. |

## Radios

{{radios}}

Los componentes usan los cuatro primeros. `rounded-field` (cápsula) es el de los campos; `rounded-control` (10px), el de ítems de menú y de sidebar; `rounded-surface` (20px), el de lo que flota: Card, Alert, Table, Popover, Toast; `rounded-panel` (26px), el de lo más grande: Dialog, Drawer, la Navbar despegada. `rounded-full` es la forma de lo que es redondo por definición —avatares, puntos, pulgares, pistas— y de las cápsulas: `Button`, `Badge`, `Tag`, `Toggle`, `Toolbar`, `ThemeSwitcher` y la pista de `Tabs`.

El resto de la tabla es la escala de Tailwind con los valores de Geist. Ningún componente la usa: queda para el código de la app.

## Sombras

{{sombras}}

Las tres terminan en un anillo de 1px que en oscuro reemplaza al borde. No hay sombras decorativas: una sombra en este sistema significa «esto flota», y solo flotan los tres tipos de superficie de arriba.

## Foco y movimiento

| Utilidad | Dónde |
|---|---|
| `focus-visible:focus-ring` | Controles: botones, ítems de menú, tabs, toggles. Anillo de 2px en `brand-700` con hueco. |
| `focus:focus-border` | Campos: Input, Textarea, Select, Combobox. Tiñe el borde con `brand-700` y, si se llegó con el teclado, agrega un halo de 4px. |
| `focus:focus-border-error` | Lo mismo, en rojo, cuando el campo tiene `aria-invalid`. |
| `transition-control` | 150 ms, `ease`, solo color / fondo / borde / sombra / opacidad. |
| `transition-thumb` | 280 ms con un rebote corto: el pulgar de `Slider` y `Switch`. |
| `thumb-lens` | El pulgar mientras se lo arrastra: transparente, con el canto especular. |
| `animate-skeleton` | El latido del `Skeleton`. |

Todas las animaciones pasan por `motion-reduce`, además del reset global del paquete.
