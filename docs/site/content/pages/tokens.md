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

`font-display` es la fuente de los titulares de una landing (el `<h1>` del hero, `SectionHeader`, el título de `DocumentSheet`). **El paquete no carga ninguna fuente**: la elige la app y la declara en la variable `--font-heading`; sin ella, `font-display` cae en Inter y no cambia nada.

```tsx
// app/layout.tsx
import { Inter, Source_Serif_4 } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const heading = Source_Serif_4({ subsets: ["latin"], variable: "--font-heading" })

<html className={`${inter.variable} ${heading.variable}`} lang="es">
```

Va junto a un rol (`font-display text-title-1`): cambia la familia, el rol pone tamaño y peso.

Las clases de Geist (`text-copy-*`, `text-label-<n>`, `text-heading-*`, `text-button-*`) **siguen andando** y `cn()` las sigue fusionando, pero están obsoletas: el paquete ya no las usa y se van en 3.0.

## Radios

{{radios}}

Los de arriba son los que usan los componentes, con las medidas de iCloud: `rounded-control` (8) en botones, toggles y el segmentado; `rounded-field` (10) en campos; `rounded-item` (10) en ítems del sidebar y filas; `rounded-surface` (11) en la Card; `rounded-panel` (11) en diálogos y hojas; `rounded-menu` (12) en menús, popovers y el toast, con `rounded-menu-item` (8) adentro. **Nada es cápsula** salvo lo que es redondo de verdad (avatar, Switch, el contador).

El resto de la tabla (`xs` a `4xl`) es la escala de Tailwind. Ningún componente la usa: queda para el código de la app.

## Sombras

{{sombras}}

Las de menú, modal y tooltip traen el filo de 1 px (`hairline`) que en iCloud hace de borde. No hay sombras decorativas: una sombra dice «esto flota» (menú, diálogo), «esto es un widget» o «este segmento está elegido». Botones, campos, casillas y pistas son planos.

## Foco y movimiento

| Utilidad | Dónde |
|---|---|
| `focus-visible:focus-ring` | Controles: botones, ítems de menú, tabs, toggles. Anillo **interior** de 3 px en el color de foco (`--sf-focus`: la marca), compuesto con la sombra del elemento. |
| `focus-visible:focus-ring-inverse` | Lo mismo sobre un fondo de color (botón de acento, casilla marcada). |
| `focus:focus-border` | Campos: Input, Textarea, Select, Combobox. El mismo anillo interior, también con el puntero, y el campo pierde el relleno (la búsqueda de iCloud). |
| `focus:focus-border-error` | Lo mismo, en rojo, cuando el campo tiene `aria-invalid`. |
| `transition-control` | 150 ms, `ease`, solo color / fondo / borde / sombra / opacidad. |
| `transition-thumb` | El pulgar de `Slider` y `Switch`. |
| `animate-skeleton` | El brillo que cruza el `Skeleton`, quieto con movimiento reducido. |

Todas las animaciones pasan por `motion-reduce`, además del reset global del paquete.
