La paleta, los radios y las sombras por defecto de Tailwind están **reseteados**: `bg-blue-50` o `shadow-md` no compilan. Solo existen los tokens del paquete.

La paleta vive en `tokens/geist.json` y se compila a `src/styles/colors.css` con `npm run tokens`; un test falla si el CSS quedó desactualizado. Las superficies, la tipografía, los radios y las sombras viven directo en `theme.css`. Las tablas de esta página se generan de esos archivos: si cambia un valor, cambia la página.

## Superficies

Desde 2.0 las superficies son las de iCloud web: **grises opacos en capas**, cada uno con su valor claro y oscuro. Los componentes ya los traen; la app los usa para lo propio.

{{fondos}}

**La regla:** la página es `bg-background`; lo que flota encima (menú, popover, diálogo) es `bg-surface` con `shadow-menu`; la columna del sidebar es `bg-surface-secondary`, las barras `bg-surface-bar` y `bg-surface-header`, un grupo plano `bg-grouped`. Los rellenos neutros son `bg-fill-1/2/3`, las líneas `border-separator` y `border-separator-strong`, y el texto `text-label`, `text-label-secondary`, `text-label-tertiary`. Sobre el wallpaper (`AppShell ambient`) hay dos materiales con blur: `material-translucent` para las barras y `material-translucent-body` para el cuerpo de las cards y el sidebar; con menos transparencia o más contraste son opacos.

`bg-background-100` y `bg-background-200` son de la escala de Geist: quedan para la app, pero ningún componente los usa desde 2.0.

## Color

La paleta de Geist queda para la app (los componentes usan las superficies y los `label` de arriba). Diez pasos por familia, de `100` (el más claro en tema claro) a `1000`. La convención de Geist: **100–400 son fondos, 500–700 son bordes y elementos, 800–1000 son texto**. El contraste de `gray-900` sobre cualquier fondo de la misma familia llega a AA.

**`gray-800` es la excepción y no se usa como texto**: sobre la superficie clara da 4,12:1, abajo del 4,5 de WCAG 1.4.3. Los componentes usan `text-label-secondary` para el texto tenue; en la paleta, el paso de texto tenue es `gray-900` (8,45:1 en claro, 7,57:1 en oscuro).

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

**No los uses en código nuevo.** Los componentes del paquete no los tocan: usan `bg-surface`, `text-label-secondary`, `border-separator`. Dos vocabularios para lo mismo es justo lo que no queremos, así que el segundo es una compuerta de entrada, no una opción.

## Tipografía

La fuente es **Inter** (la carga la app, ver [Instalación](/docs/instalacion)) con la escala de iCloud: base 17, pasos de 11 a 28 y 48 para el título grande. Son roles con nombre, no tamaños: `cn()` los entiende como tamaño de fuente, así que conviven con un color (`text-label-secondary`).

{{tipografia}}

| Rol | Para qué |
|---|---|
| `text-large-title` | El título de una página. |
| `text-title-1/2/3` | Títulos de modal, de lista o widget, de grupo o diálogo. |
| `text-headline` | El título de una fila (17/600). |
| `text-body` | Lo que se lee: párrafos, el nombre en una fila de lista. |
| `text-subheadline` | Ítems del sidebar, mensajes del chat. |
| `text-callout` | El chrome: menús, campos, botones, metadatos. |
| `text-footnote` · `text-caption` | Snippets, badges, contadores, pie legal. |
| `text-mono-body` · `text-mono-callout` | Código, IDs, atajos. La mono es la del sistema. |

### Fuente de titulares

`font-display` es la fuente de los titulares. Desde 3.0 la usan los componentes que tienen un titular: `PageHeader`, `SectionHeader`, el título de `Card`, de `Dialog`, `AlertDialog`, `Sheet`, `Drawer` y `Popover`, `EmptyState`, `AuthLayout` y `DocumentSheet`. **El paquete no carga ninguna fuente**: la elige la app y la declara en la variable `--font-heading`; sin ella, `font-display` cae en la sans (Inter) y no cambia nada.

```tsx
// app/layout.tsx
import { Inter, Source_Serif_4 } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const heading = Source_Serif_4({ subsets: ["latin"], variable: "--font-heading" })

<html className={`${inter.variable} ${heading.variable}`} lang="es">
```

Va junto a un rol (`font-display text-title-1`): cambia la familia, el rol pone tamaño y peso. Abajo, en [Tipografía en uso](#tipografia-en-uso), se ve el mismo titular con Bitter cargada como lo haría una app.

### Escala display

Para el titular de una portada, cuatro roles fluidos con más contraste que `text-large-title` (48). Usan `--font-display` (la fuente de titulares de la app); los componentes de datos no los piden, se usan a mano donde la pantalla es expresiva.

| Rol | Tamaño | Para qué |
|---|---|---|
| `text-display` | `clamp(40px → 72px)`, interlineado 1,04 | El titular del hero. |
| `text-display-2` | `clamp(32px → 52px)`, 1,08 | Una sección grande. |
| `text-display-3` | `clamp(24px → 34px)`, 1,15 | Un titular de bloque. |
| `text-lead` | `clamp(17px → 21px)`, 1,5 (Inter) | La bajada bajo el titular. |

El énfasis dentro de un titular es de **color sólido o de peso, nunca un degradé**: `emphasis-accent` (el acento como texto, AA), `emphasis-strong` (700) y `emphasis-muted` (el resto de la frase en `label-secondary`).

### Movimiento

Todo lo que se mueve usa `ease-out-expo`, `cubic-bezier(0.16, 1, 0.3, 1)`: arranca rápido y frena largo, sin rebote. `transition-control` y `transition-surface` (180 ms), los overlays (200 ms, con escala de 97 a 100 %), el pulgar del Switch y el segmentado, y la entrada de `Reveal`. Con `prefers-reduced-motion` todo queda quieto.

### Neutros con tinte

Desde 3.0 los grises se inclinan hacia el matiz de la marca por defecto (croma 0,01). Los valores salen de `theme.css`; para apagarlo y para las garantías de contraste, ver [Theming](/docs/theming).

Las clases de Geist (`text-copy-*`, `text-label-<n>`, `text-heading-*`, `text-button-*`) **siguen andando** y `cn()` las sigue fusionando, pero están obsoletas: el paquete ya no las usa y se van en 4.0.

## Roles semánticos y paleta de datos

`success`, `warning`, `danger` e `info` son roles fijos, independientes de la marca (`bg-success-soft`, `text-danger-ink`, `bg-info`…): cada uno trae el relleno (`success`), la tinta de texto (`success-ink`, ≥ 4,5:1 sobre su tinte) y el tinte al 12 % (`success-soft`). Alert, Badge suave, Toast, Icon, `FieldError` y `SaveBar` los usan. Para series de un gráfico, `--color-data-1` a `--color-data-8` (alias `--color-chart-1` a `-8`): se distinguen con deuteranopía, protanopía y tritanopía, y llegan a 3:1 contra la página (`test/data-palette.test.ts`). El color nunca es el único dato: la leyenda lleva el nombre.

## Radios

{{radios}}

Los de arriba son los que usan los componentes, con las medidas de iCloud: `rounded-control` (8) en botones, toggles y el segmentado; `rounded-field` (10) en campos; `rounded-item` (10) en ítems del sidebar y filas; `rounded-surface` (11) en la Card; `rounded-panel` (11) en diálogos y hojas; `rounded-menu` (12) en menús, popovers y el toast, con `rounded-menu-item` (8) adentro. **Nada es cápsula** salvo lo que es redondo de verdad (avatar, Switch, el contador).

El resto de la tabla (`xs` a `4xl`) es la escala de Tailwind. Ningún componente la usa: queda para el código de la app.

## Sombras

{{sombras}}

Tres niveles de elevación, todos chicos (2.16): **reposo** (`shadow-widget`, la card: filo + 0 1 2 / 0 2 8), **flotante** (`shadow-menu` y `shadow-tooltip`: filo + 0 1 3 / 0 4 14) y **overlay** (`shadow-modal`, diálogo, hoja y toast: filo + 0 2 6 / 0 10 28, un nivel arriba del menú para que un menú sobre un diálogo se siga leyendo encima). Cada una es una capa de contacto más una de ambiente, de poco desplazamiento, y el filo de 1 px (`hairline`) hace el trabajo del borde; en oscuro la misma geometría con más alfa. No hay sombras decorativas: una sombra dice «esto flota» (menú, diálogo), «esto es un widget» o «este segmento está elegido». Botones, campos, casillas y pistas son planos.

## Foco y movimiento

| Utilidad | Dónde |
|---|---|
| `focus-visible:focus-ring` | Controles: botones, ítems de menú, tabs, toggles. Anillo **interior** de 3 px en el color de foco (`--sf-focus`: la marca), compuesto con la sombra del elemento. |
| `focus-visible:focus-ring-inverse` | Lo mismo sobre un fondo de color (botón de acento, casilla marcada). |
| `focus:focus-border` | Campos: Input, Textarea, Select, Combobox. El mismo anillo interior, también con el puntero, y el campo pierde el relleno (la búsqueda de iCloud). |
| `focus:focus-border-error` | Lo mismo, en rojo, cuando el campo tiene `aria-invalid`. |
| `transition-control` | 180 ms, `ease-out-expo`, solo color / fondo / borde / sombra / opacidad. |
| `transition-thumb` | El pulgar de `Slider` y `Switch`: 240 ms, `ease-out-expo`, sin rebote. |
| `animate-skeleton` | El brillo que cruza el `Skeleton`, quieto con movimiento reducido. |

Todas las animaciones pasan por `motion-reduce`, además del reset global del paquete.

## Tipografía en uso

El mismo titular, con la escala display y una fuente de titulares cargada como lo haría una app (Bitter en `--font-heading`; el sitio sigue en Inter y el paquete no trae fuentes).
