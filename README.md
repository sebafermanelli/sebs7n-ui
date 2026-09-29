# sebs7n-ui

[![npm](https://img.shields.io/npm/v/sebs7n-ui?logo=npm&color=0a0a0a)](https://www.npmjs.com/package/sebs7n-ui)
[![CI](https://github.com/sebafermanelli/sebs7n-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/sebafermanelli/sebs7n-ui/actions/workflows/ci.yml)
[![licencia MIT](https://img.shields.io/npm/l/sebs7n-ui?color=0a0a0a)](./LICENSE)

Design system para React con el lenguaje visual de **iCloud web** —superficies
opacas en capas de gris, Inter, radios chicos, barras fijas— sobre las
primitivas de **shadcn/ui `base-nova`** (Base UI), empaquetado como una sola
dependencia.

Nació de unificar cuatro aplicaciones reales que compartían componentes copiados
y pegados: mismos neutros, misma tipografía, mismos radios y sombras, mismos
estados de foco. Lo único que cambia entre productos es el color de marca, que
son **cuatro variables CSS**.

- 80 componentes accesibles sobre Base UI, cada uno con su entry point.
- Tokens de superficies, color, tipografía, radios y sombras como variables CSS y utilidades
  de Tailwind v4 — sin `tailwind.config`.
- Server Components donde no hace falta estado; `"use client"` solo donde sí.
- Contraste AA verificado por tests, no a ojo.

**El detalle de cada componente vive en
[ui.sebastianfermanelli.com](https://ui.sebastianfermanelli.com)** —80 páginas con
demos en vivo, la tabla de props generada del TypeScript y las reglas de uso— y no
se duplica acá. Cada página se sirve también como markdown y hay un `llms.txt`
para agentes. Para levantarlo local, `cd docs/site && npm run dev`.

## 2.0

La 2.0 (sin publicar todavía; el borrador está en el [CHANGELOG](./CHANGELOG.md))
cambia el lenguaje visual de la 1.x —vidrio y cápsulas— por el de iCloud web:

- **Inter** en vez de Geist (`geist` deja de ser peer) y roles tipográficos con
  la escala de iCloud: base 17, el chrome en 14.
- **Sin vidrio:** superficies opacas (`bg-surface`, `bg-fill-1/2/3`,
  `text-label*`); `glass*`, `sheen` y `shadow-button*` ya no existen.
- **Radios de 8 a 12, sin cápsula**, y una escala de alturas de 28 / 36 / 40.
- **Foco interior** de 3 px y selección gris en menús y sidebar.
- Button con las variantes de iCloud (`outline` se va, `default` es el acento),
  Tabs con la línea por defecto, Card como widget, Table como la lista de
  Drive, AlertDialog centrado con el botón seguro en el acento, navegación sin
  flotantes.
- Componentes nuevos: `Command`, `TextLink`, `ListRow`, `WidgetCard`,
  `StackedMeter`, y solo por subpath `Tree`, `SplitView`, `FileGrid`,
  `CalendarView`, `Stepper`, `DataTable`, `InputGroup`, `MultiSelect`,
  `Timeline` y `Resizable` (la tabla de [Imports por componente](#imports-por-componente)
  dice cuáles no están en el barrel).

**Guía de migración, componente por componente:
[ui.sebastianfermanelli.com/docs/migrating-to-2](https://ui.sebastianfermanelli.com/docs/migrating-to-2).**

## Índice

- [2.0](#20) — qué cambia y la guía de migración
- [Instalación](#instalación) · [CSS](#1-css) · [Layout raíz](#2-layout-raíz) · [Usar](#3-usar)
- [Compatibilidad](#compatibilidad)
- [Imports por componente](#imports-por-componente) — la tabla de subpaths y por qué no usar el barrel
- [Tokens](#tokens) — fondos, color, tipografía, radios, sombras
- [Theming](#theming) — las cuatro variables de marca, claro y oscuro
- [Reglas de uso](#reglas-de-uso)
- [Accesibilidad](#accesibilidad)
- [Idioma](#idioma)
- [Recetas](#recetas) — lo que resuelve la app, no el paquete
- [Desarrollo](#desarrollo) · [Sitio de documentación](#sitio-de-documentación) · [Versionado](#versionado)
- [Pedí un componente o reportá un bug](#pedí-un-componente-o-reportá-un-bug)

---

## Instalación

Está publicado en npm como [`sebs7n-ui`](https://www.npmjs.com/package/sebs7n-ui),
público y MIT.

```bash
pnpm add sebs7n-ui @base-ui/react next-themes sonner
```

```bash
npm install sebs7n-ui @base-ui/react next-themes sonner
```

Las `peerDependencies` las instala la app, para que haya **una sola copia** de
React y de Base UI:

| Peer | Rango |
|---|---|
| `react` · `react-dom` | `^19.2.0` |
| `@base-ui/react` | `^1.8.0` |
| `next-themes` | `^0.4.6` |
| `sonner` | `^2.0.7` |
| `recharts` (opcional) | `^3.10.0` |

La fuente es **Inter**, y la carga la app: el paquete no la trae ni la declara
como peer (desde 2.0, `geist` tampoco). `--font-sans` lee `--font-inter`, que define el layout raíz (ver
abajo); sin ella todo cae en `system-ui`. La mono es la del sistema (SF Mono,
Consolas): no hay nada que cargar.

`recharts` también es peer **opcional**, pero al revés: solo lo instala la app que
usa `sebs7n-ui/chart`. Ningún otro subpath del paquete lo importa, y `Chart` **no
está en el barrel** por eso mismo: `from "sebs7n-ui"` no lo trae.

### 1. CSS

En `globals.css`, **en este orden**:

```css
@import "tailwindcss";
@import "sebs7n-ui/theme.css";

:root {
  --brand-base: oklch(0.573 0.214 258);
  --brand-base-dark: oklch(0.573 0.214 258);
  --brand-contrast: #fff;
  --brand-contrast-dark: #fff;
}
```

Eso es todo: **no hace falta ningún `@source`**. El `@source "../../dist"` lo
trae el propio `theme.css`, y Tailwind v4 lo resuelve relativo a ese archivo
aunque venga de `node_modules`.

Si querés achicar el CSS final, podés excluir lo que tu app no usa. Esto falla
ruidosamente —el componente se ve sin estilo—, al revés que olvidarse el
`@source`:

```css
@source not "../../node_modules/sebs7n-ui/dist/components/combobox.js";
```

Los caros son `combobox`, `autocomplete`, los tres menús, `drawer` y `user-menu`.

### 2. Layout raíz

Inter con `next/font/google` y su `.variable` en `<html>`, el `ThemeProvider` de
`next-themes` con `attribute="class"`, y `TooltipProvider` + `<Toaster />` de
`sebs7n-ui`.

```tsx
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
// Por subpath, no por el barrel: el layout raíz envuelve TODAS las páginas, así
// que un `from "sebs7n-ui"` acá le suma los 60 componentes a cada una.
import { Toaster } from "sebs7n-ui/sonner"
import { TooltipProvider } from "sebs7n-ui/tooltip"
import "./globals.css"

// La variable tiene que llamarse `--font-inter`: es la que lee `--font-sans`.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Fuera de Next, o si preferís servirla vos, `@fontsource-variable/inter`: se
importa una vez y la fuente queda registrada como `"Inter Variable"`, que
`--font-sans` ya tiene en la lista, así que no hace falta definir `--font-inter`.

```bash
npm install @fontsource-variable/inter
```

```ts
// En el entry de la app (main.tsx, _app.tsx), una sola vez.
import "@fontsource-variable/inter"
```

### 3. Usar

```tsx
import { Button } from "sebs7n-ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "sebs7n-ui/card"

export function Panel() {
  return (
    <Card>
      <CardHeader><CardTitle>Facturas</CardTitle></CardHeader>
      <CardContent>
        <Button>Nueva factura</Button>
      </CardContent>
    </Card>
  )
}
```

## Compatibilidad

| | Versión |
|---|---|
| React | 19.2+ (Server Components y `"use client"`) |
| Next.js | 15 o 16, App Router (Turbopack o webpack) |
| Tailwind CSS | **v4** — tokens por `@theme`, sin `tailwind.config.js` |
| Base UI | `@base-ui/react` 1.8+ |
| TypeScript | `moduleResolution: "bundler"` (o `node16` / `nodenext`) |
| Módulos | Solo ESM |

Los componentes no dependen de Next: funcionan en cualquier bundler que entienda
`exports` y la directiva `"use client"`. Lo único específico de Next en los
ejemplos es `next/link` y `next/navigation`.

## Imports por componente

Cada módulo tiene su entry point. **En páginas de marketing o landing, importá
por subpath**; el barrel queda para dashboards, que igual usan casi todo.

```tsx
import { Button } from "sebs7n-ui/button"
import { Card, CardContent } from "sebs7n-ui/card"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { buttonVariants } from "sebs7n-ui/variants/button" // sin "use client"
import { cn } from "sebs7n-ui/lib/utils"
```

<!-- subpaths: generado por scripts/gen-subpaths.mjs -->

| Subpath | Qué trae |
|---|---|
| `sebs7n-ui` | El barrel: 69 de los 80 componentes (`calendar-view` · `chart` · `data-table` · `file-grid` · `input-group` · `multi-select` · `resizable` · `split-view` · `stepper` · `timeline` · `tree` solo por subpath), las variantes y `cn`. Ver la nota de abajo antes de usarlo. |
| `sebs7n-ui/<componente>` | 80, en kebab-case: `accordion` · `ai-button` · `alert` · `alert-dialog` · `app-shell` · `app-shell-content` · `autocomplete` · `avatar` · `badge` · `breadcrumb` · `button` · `calendar` · `calendar-view` · `card` · `chart` · `chat` · `checkbox` · `checkbox-group` · `collapsible` · `color-picker` · `combobox` · `command` · `context-menu` · `data-table` · `date-picker` · `dialog` · `drawer` · `dropdown-menu` · `empty-state` · `field` · `fieldset` · `file-grid` · `form` · `hover-card` · `icon` · `input` · `input-group` · `kbd` · `label` · `list-row` · `menubar` · `meter` · `multi-select` · `navbar` · `navigation-menu` · `number-field` · `otp-field` · `page-header` · `pagination` · `popover` · `progress` · `radio-group` · `resizable` · `scroll-area` · `select` · `separator` · `sheet` · `sidebar` · `skeleton` · `slider` · `sonner` · `spinner` · `split-view` · `stat` · `stepper` · `switch` · `table` · `tabs` · `tag` · `text-link` · `textarea` · `theme-switcher` · `timeline` · `toggle` · `toggle-group` · `toolbar` · `tooltip` · `tree` · `user-menu` · `widget-card` |
| `sebs7n-ui/variants/<nombre>` | Clases sin `"use client"`: `badge` · `button` · `card` · `command` · `input` · `link` · `menu` · `overlay` · `segmented` · `selection` · `sidebar` · `slider` · `tag` · `toggle` |
| `sebs7n-ui/lib/<nombre>` | Funciones puras: `color` · `contrast` · `dates` · `pagination` · `render` · `schema` · `utils` |
| `sebs7n-ui/labels` | `LabelsProvider`, `useLabels` y `defaultLabels`: los textos internos, para traducirlos. |
| `sebs7n-ui/tokens/<archivo>.json` | Los tokens en crudo: `brands` · `geist` |
| `sebs7n-ui/theme.css` | Los tokens y el `@source` del `dist`. Es el único import obligatorio. |

<!-- /subpaths -->

Por qué: el barrel hace `export *` de 69 módulos, 49 con `"use client"`. Next no puede
podar referencias cliente a través de ese barrel (tampoco con
`optimizePackageImports`), así que una página con `Button` + `Card` +
`ThemeSwitcher` se lleva también Sonner, Sidebar, Select, AlertDialog, etc.
Medido en Next 16.3 (Turbopack) con esa página, en 1.x: **297,5 KB → 234,8 KB** de JS
cliente gzip (−21 %). No mezcles barrel y subpaths en la misma página: el barrel
vuelve a traer todo.

Donde más caro sale es en el **layout raíz**, que envuelve todas las páginas: un
`from "sebs7n-ui"` ahí le suma el paquete entero hasta a la landing. Por eso el
ejemplo del layout de arriba importa `sebs7n-ui/sonner` y `sebs7n-ui/tooltip`.

El barrel sigue existiendo —hoy es la única forma de llegar a `cn` sin conocer
la ruta— así que si tu app ya lo tiene, la regla se pone en el linter y no en la
memoria:

```js
// eslint.config.mjs
export default [
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "sebs7n-ui",
              message:
                "Importá por subpath: sebs7n-ui/button, sebs7n-ui/card, sebs7n-ui/lib/utils. El barrel arrastra los 69 módulos a la página.",
            },
          ],
        },
      ],
    },
  },
]
```

## Tokens

La paleta, los radios y las sombras por defecto de Tailwind están **reseteados**:
`bg-blue-50` o `shadow-md` no compilan. Solo existen los tokens del paquete.

| Grupo | Tokens |
|---|---|
| Superficies | `bg-background` (la página), `bg-surface` (lo que flota), `bg-surface-secondary` (sidebar), `bg-surface-bar` y `bg-surface-header` (barras), `bg-grouped`, `bg-fill-{1,2,3}`, `border-separator`, `border-separator-strong`, `text-label`, `text-label-{secondary,tertiary,quaternary}`, `material-translucent` y `material-translucent-body` (los de blur, solo sobre el wallpaper) |
| Color | `gray`, `gray-alpha`, `brand`, `blue`, `red`, `amber`, `green`, `teal`, `purple`, `pink` en pasos 100–1000 (la paleta de Geist, para la app) y `brand-contrast` |
| Tipografía | Roles con la escala de iCloud: `text-large-title` (48), `text-title-{1,2,3}` (28, 21, 19), `text-headline` y `text-body` (17), `text-subheadline` (15), `text-callout` (14), `text-footnote` (12), `text-caption` (11), `text-mono-{body,callout}`. Los de Geist (`text-heading-*`, `text-copy-*`, `text-label-<n>`, `text-button-*`) siguen andando pero están obsoletos desde 2.0 |
| Radios | `rounded-control` (8), `rounded-field` y `rounded-item` (10), `rounded-surface` y `rounded-panel` (11), `rounded-menu` (12), `rounded-menu-item` (8), `rounded-tag` (4) |
| Sombras | `shadow-menu`, `shadow-modal`, `shadow-tooltip`, `shadow-widget`, `shadow-segment`, `shadow-badge`, `shadow-thumbnail` |
| Foco | `focus-visible:focus-ring`, `focus-visible:focus-ring-inverse`, `focus:focus-border` |
| Movimiento | `transition-control`, `animate-skeleton` |

La paleta vive en `tokens/geist.json` y se compila a `src/styles/colors.css` con
`npm run tokens`; un test falla si el CSS quedó desactualizado. Las superficies,
la tipografía, los radios y las sombras viven en `src/styles/theme.css`. Las
tablas con los valores claro y oscuro están en la página
[Tokens](https://ui.sebastianfermanelli.com/docs/tokens).

**La regla de las superficies:** si el elemento **es** la página, `bg-background`;
si flota **sobre** ella, `bg-surface` con su sombra. En oscuro la página es
`#1C1C1E`, no negro.

**Tipografía.** La prosa va en `text-body` (17), el chrome —menús, campos,
botones, metadatos— en `text-callout` (14). Los títulos llevan el peso en el rol
y no se pisan con `font-*`. `cn()` los entiende como tamaño de fuente, así que
conviven con un color (`text-label-secondary`). Inter tiene que ser la **fuente
variable**; con una estática los pesos intermedios se redondean.

## Theming

### Color de marca

Una app define **cuatro variables** y nada más. No hay que tocar ningún archivo
del paquete:

```css
:root {
  --brand-base: oklch(0.55 0.16 35);        /* acento en claro */
  --brand-base-dark: oklch(0.55 0.16 35);   /* acento en oscuro; por defecto, igual a la base */
  --brand-contrast: #fff;                   /* texto sobre el acento en claro; por defecto #fff */
  --brand-contrast-dark: #fff;              /* texto sobre el acento en oscuro; por defecto, igual a --brand-contrast */
}
```

De ahí el paquete deriva la escala `brand-100…1000` y `brand-contrast`. Las dos
de contraste vienen en `#fff` por defecto y `--brand-contrast-dark` cae en
`--brand-contrast` si no se declara, así que con un acento oscuro alcanza con las
dos primeras. La regla es una sola: **el texto sobre `brand-700` tiene que llegar
a 4,5:1**. Si el acento es claro, `--brand-contrast: #000`.

`tokens/brands.json` trae cuatro marcas de ejemplo (`teal`, `terracotta`,
`emerald`, `blue`) que usan las demos del sitio y los tests de contraste. **Son solo
demos del sistema**: una app real no las usa ni edita ese archivo.

### Claro y oscuro

**Solo por la clase `.dark` en `<html>`.** No hay `data-theme` ni regla de
`prefers-color-scheme`: la única definición es
`@custom-variant dark (&:where(.dark, .dark *))`. Con `next-themes` eso sale de
`attribute="class"`; con `attribute="data-theme"` el botón parece andar y los
colores no cambian. Sin `next-themes`, la clase la pone la app
(`document.documentElement.classList.toggle("dark", oscuro)`).

`ThemeSwitcher` es para fuera de un menú (header público, ajustes); dentro de un
`DropdownMenu` propio, `ThemeMenuRadio`. Sin `enableSystem` no muestran la
opción "Sistema".

## Reglas de uso

- **Un solo acento por pantalla:** el `Button` por defecto (`<Button>`, sin
  `variant`) es el primario de iCloud, el acento sólido, y va en la acción
  principal; las demás son `secondary` (gris) o `plain` (texto de acento).
  `variant="accent"` quedó como alias obsoleto de `default`.
- **Sin cápsulas desde 2.0.** El botón tiene una sola forma, el rectángulo de
  iCloud (radio 8); la prop `shape` se fue.
- **Links con forma de botón o card:** `buttonVariants()` / `cardVariants()`
  sobre `<a>` o `<Link>`. No uses `render` para links: Base UI les pone
  `role="button"`.
- **Breadcrumb: `<nav>` + `<ol>`, y el último no es link.** Los separadores los
  pone `BreadcrumbList` (decorativos, `aria-hidden`), los links son
  `linkVariants({ variant: "subtle" })` y el nivel actual es un `BreadcrumbPage`
  con `aria-current="page"`. Dentro de `PageHeader` va `BreadcrumbList` **suelto**:
  el `<nav>` ya lo pone la prop `breadcrumb`. De cuatro niveles para arriba,
  `maxItems={4}` colapsa el medio en un «…» con nombre accesible.
- **Paginación: links si la página está en la URL.**
  `render={(page) => <Link href={`?page=${page}`} />}` emite `<a>` de verdad —el
  crawler los ve, se abren en una pestaña nueva—; `onPageChange` (botones) solo
  para una lista que se pagina sin cambiar de URL. Qué números mostrar sale de
  `paginationRange` (`sebs7n-ui/lib/pagination`), que es pura: si necesitás el
  mismo cálculo en otro lado, llamala en vez de copiarla.
- **Links de texto:** `linkVariants({ variant })` — `inline` dentro de una frase
  (subrayado siempre, línea tenue que se refuerza en hover), `subtle` suelto y
  secundario (sin subrayado en reposo; en hover sube a `gray-1000` y aparece la
  línea) y `row` para el nombre clickeable de una fila. Traen `rounded-sm`,
  `transition-control`, `focus-visible:focus-ring` y `underline-offset-4`: no los
  repitas en el llamador. `icon: true` alinea una flecha con el texto. Un link
  que solo se revela en hover no existe en un celular: si es la acción principal
  de la sección, va `inline`.
- **Badge informa, Tag es un dato.** El `Badge` cuenta un estado que calculó el
  sistema y que el usuario no eligió ni puede sacar («Pagada», «Vencida»,
  «Admin»). El `Tag` es algo que el usuario puso —un filtro aplicado, una
  etiqueta, un destinatario— y por eso trae el botón de quitar, con nombre
  accesible («Quitar Chile»). **Si tiene ×, es Tag; si no se puede sacar, es
  Badge.** Comparten forma y paleta a propósito: el sistema tiene una sola forma
  de etiqueta, lo que cambia es qué significa. Dentro de un `Combobox` múltiple
  ya está `ComboboxChip`: ahí no va `Tag`.
- **Un solo Spinner.** `Button loading` usa el mismo `Spinner` del paquete: no
  metas un ícono que gire adentro de un botón. Suelto lleva `label` solo si es
  él quien anuncia la espera; si el contenedor ya tiene `aria-busy`, va sin
  nombre (`aria-hidden`). Con `prefers-reduced-motion` se queda quieto, no
  desaparece.
- **`DropdownMenuLabel` va dentro de `DropdownMenuGroup`.** Suelto, Base UI tira
  la página abajo.
- **`NavigationMenu` si los ítems navegan, `DropdownMenu` si ejecutan algo.** No
  es cosmético: `DropdownMenu` emite `role="menu"` / `role="menuitem"`, y el modo
  de navegación por links de un lector de pantalla no ve esos ítems.
  Ver la página de **NavigationMenu** del sitio de documentación.
- **Los triggers** (Dialog, Popover, Tooltip, DropdownMenu, Sheet) usan
  `render={<Button … />}`, no `asChild`.
- `buttonVariants`, `badgeVariants`, `cardVariants`, `linkVariants`,
  `toggleVariants` y `sidebarItemVariants` no tienen `"use client"`: se pueden
  llamar desde un Server Component. `Kbd`, `PageHeader`, `EmptyState`, `Stat`,
  `Spinner` y `AppShellContent` tampoco.

## Accesibilidad

Es parte del contrato del paquete, no un extra:

- **Contraste.** El texto sobre el acento llega a AA 4,5:1 en claro y en oscuro;
  un test recalcula el ratio desde OKLCH y falla si una marca no da.
- **Foco visible siempre.** Ningún componente saca el anillo de foco:
  `focus-visible:focus-ring` en los controles, `focus:focus-border` en los
  campos: un anillo interior de 3 px en la marca. Switch y Slider lo llevan por
  fuera.
- **Semántica antes que estilo.** `NavigationMenu` emite `<nav>` + `<ul>` + `<a>`;
  `DropdownMenu`, `role="menu"` / `role="menuitem"` con recorrido por flechas.
  Elegir mal cambia lo que anuncia un lector de pantalla.
- **Teclado.** Los flotantes abren con Enter/Espacio/flechas, Escape cierra y
  devuelve el foco al trigger. `AppShell` trae un link "Ir al contenido" que
  apunta al `<main>`.
- **Estado anunciado.** `SidebarItem active` pone `aria-current="page"`;
  `SidebarItemBadge` acepta `label` para que el contador se lea con contexto
  ("Clientes, 3 pendientes"); `SidebarSearch shortcut` emite `aria-keyshortcuts`.
- **Movimiento.** Todas pasan por el reset global de `base.css`; las que tienen
  un recorrido (la franja de `Progress`, el deslizamiento del `Drawer`) suman su
  propia regla `motion-reduce`.
- **Nombres accesibles que exige el tipo.** `Button size="icon-*"` pide
  `aria-label` o `aria-labelledby`; `Progress` y `Meter`, `label` o
  `aria-label`; `AvatarImage`, `alt` (aunque sea `""`); `ToolbarGroup`,
  `aria-label`. `DialogContent`, `SheetContent` y `DrawerContent` no se pueden
  tipar —el título es un hijo— y avisan por consola en desarrollo.
- **Objetivos táctiles.** Todo lo que se toca llega a 24×24 de área (WCAG
  2.5.8), con `::after` donde el dibujo es más chico.
- **`aria-invalid`** en el input sincroniza el estilo con la semántica —el borde
  rojo sale de ahí, no de una clase aparte—, pero no alcanza solo: el mensaje
  tiene que decir qué arreglar, y escribirlo con `match` o `validate`.
- **LTR only.** El paquete asume texto de izquierda a derecha. En RTL no se
  rompe: queda espejado. Está detallado en la página de Accesibilidad del sitio.

Todo esto, con los números medidos y las excepciones, en la página
**Accesibilidad** del sitio de documentación.

---

## Idioma

El sistema habla **español**: los textos que los componentes escriben solos
—«Cerrar», «Sin resultados», «Ir al contenido», «Buscando…»— están en español y
son el default.

Se traducen todos de una vez con un `LabelsProvider` arriba del árbol:

```tsx
import { LabelsProvider, defaultLabels, type Labels } from "sebs7n-ui/labels"

const en: Labels = {
  ...defaultLabels,
  dialog: { close: "Close" },
  sheet: { close: "Close" },
  drawer: { close: "Close" },
  combobox: { clear: "Clear", trigger: "Open list", loading: "Searching…", empty: "No results", remove: "Remove" },
  // …
}

export default function RootLayout({ children }) {
  return <LabelsProvider value={en}>{children}</LabelsProvider>
}
```

`defaultLabels` está tipado como `Labels` completo, así que anotar la traducción
con `: Labels` hace que TypeScript marque lo que falte en vez de que aparezca en
español en producción. Los providers anidados se suman, para una sección en otro
idioma sin repetir todo.

La prop `labels` de cada componente sigue existiendo y **le gana al provider**:
es para la excepción de una pantalla («Quitar del carrito» en vez de «Quitar»),
no para traducir.

El `value` se puede armar en el render, que es lo que pasa con i18n de verdad:

```tsx
const t = useTranslations("ui")
return <LabelsProvider value={{ dialog: { close: t("close") } }}>{children}</LabelsProvider>
```

**No hace falta `useMemo`.** El provider compara el contenido, no la identidad
del objeto: un `value` nuevo con los mismos textos no re-renderiza a ningún
consumidor. Son 24 comparaciones de strings —0,6 µs— contra re-renderizar todo
lo que lee el contexto, que es la app entera.

**Los labels que se pegan a un dato aceptan una función.** `combobox.remove` es
el prefijo de «Quitar Chile», y eso solo funciona donde el verbo va adelante; en
alemán es «Chile entfernen». Como plantilla sale en cualquier idioma, igual que
el `labels.page` de `Pagination`:

```tsx
combobox: { remove: (name) => `${name} entfernen` }
```

Vale lo mismo para las props `removeLabel` de `Tag` y `ComboboxChip`. El string
sigue andando igual: nadie que escriba en español tiene que escribir una
función. Una función sí conviene declararla a nivel de módulo o memoizarla: es
lo único de `Labels` que el provider compara por identidad.

`Breadcrumb`, `Pagination` y `Tag` no leen del provider: leerlo pide un contexto
de React y eso los convertiría en componentes de cliente, y los tres se pueden
renderizar hoy en un Server Component. Sus textos se pasan por prop, como venían
(`ellipsisLabel`, `removeLabel`, `labels`, `aria-label`).

`PageHeader` **sí** lo lee, sin dejar de ser Server Component: el `<nav>` de las
migas es un subcomponente de cliente interno, y `breadcrumbLabel` quedó como
override de una pantalla. Antes tenía default en español; un `aria-label` en el
idioma equivocado no se ve, así que nadie lo notaba.

El `lang` del `<html>` es de la app, y no es opcional: cambia la pronunciación
del lector de pantalla.

---

## Recetas

Lo que el paquete **no** resuelve porque no le corresponde, con la implementación
que vienen usando las apps.

Las piezas, sus props y sus reglas no están acá: están en las páginas de
`NavigationMenu`, `Combobox`, `Autocomplete`, `AppShell` y `Sidebar` del sitio de
documentación, con demo en vivo y la tabla de props sacada del TypeScript. Tener
las dos versiones garantizaba que una quedara vieja.

### Colapsar el sidebar y recordarlo

`Sidebar` recibe `collapsed`; **dónde vive ese booleano lo decide la app**. Con
una cookie el server ya renderiza el ancho correcto y no hay salto al hidratar:

```tsx
// layout.tsx (Server Component)
const defaultCollapsed = (await cookies()).get("sidebar")?.value === "collapsed"

// El hook del lado del cliente: cookie + ⌘B / Ctrl+B.
function useSidebarCollapsed(initial: boolean) {
  const [collapsed, setCollapsed] = useState(initial)
  const recordar = (next: boolean) => {
    document.cookie = `sidebar=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`
  }
  const set = useCallback((next: boolean) => {
    setCollapsed(next)
    recordar(next)
  }, [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "b" || !(event.metaKey || event.ctrlKey)) return
      // Dentro de un campo, ⌘B es negrita: no se lo robamos.
      if ((event.target as HTMLElement)?.closest("input, textarea, [contenteditable]")) return
      event.preventDefault()
      setCollapsed((prev) => {
        recordar(!prev)
        return !prev
      })
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
  return [collapsed, set] as const
}
```

El botón que lo alterna es de la app y necesita nombre y estado:
`<Button size="icon-sm" variant="ghost" aria-label="Colapsar sidebar" aria-pressed={collapsed} …>`.

### Cerrar el menú mobile al navegar

**Pasale `pathname={usePathname()}` a `AppShell`**: cualquier navegación —un link
del contenido, un `router.push`— cierra el `Sheet`. También se cierra al pasar a
≥ `lg` y al elegir un ítem del `UserMenu`. Para un caso propio,
`useAppShell().closeMobile({ focusMain: true })`.

### El atajo de la búsqueda

`SidebarSearch shortcut="⌘K"` **solo muestra el `Kbd` y lo anuncia**
(`aria-keyshortcuts`). Escuchar la tecla y abrir la paleta es de la app: el
paquete no registra atajos globales, porque dos componentes peleándose el mismo
`keydown` es un bug que no se ve hasta producción.

### Links del mega menú que vea un crawler

`NavigationMenuContent` no existe en el DOM hasta que el menú abre, así que un
crawler —que no pasa el mouse ni tabula— nunca ve esos links. Con `keepMounted`
quedan en el HTML del server, ocultos. Cuesta markup por panel; si el nav es el
link principal a esas páginas, se paga. Alcance: cubre el HTML del server y el
DOM hasta la primera apertura — al abrir, el contenido se muda al popup, que vive
en un portal sin `keepMounted`. Para el crawler da igual, porque no abre el menú.

### Combobox contra el servidor

El filtrado del `Combobox` es **en memoria y en cada tecla, sin debounce**, que
es lo correcto con una lista local: esperar se nota. Si los resultados vienen del
servidor, el debounce lo pone la app:

```tsx
<Combobox items={resultados} filter={null} onInputValueChange={(texto, detalles) => {
  if (detalles.reason === "item-press") return
  debounced(texto)
}}>
  <ComboboxInput placeholder="Buscar cliente" />
  <ComboboxContent>
    <ComboboxStatus loading={cargando} />
    <ComboboxEmpty>{cargando ? null : undefined}</ComboboxEmpty>
    <ComboboxList>{(c) => <ComboboxItem key={c.value} value={c}>{c.label}</ComboboxItem>}</ComboboxList>
  </ComboboxContent>
</Combobox>
```

---

## Desarrollo

```bash
npm install
npm test          # tokens, contraste, componentes y build
npm run typecheck
npm run tokens    # regenera src/styles/colors.css desde tokens/geist.json
npm run build     # dist/ (tsc)
```

## Sitio de documentación

Vive en `docs/site/` y es una app de Next 16 + Tailwind v4 que **usa el propio
design system**: es su mejor demo, y el lugar donde se prueba cada componente en
todos sus estados. Consume el paquete con `npm pack` y no desde npm, a propósito:
documenta el código de este repo, no la última versión publicada. Una app normal
sí instala desde npm.

```bash
cd docs/site
npm install
npm run dev      # http://localhost:4100
npm run build    # estático
npm test         # generador de props, .md por página, llms.txt y registry
```

Todo lo que se ve generado se genera: `npm run generate` (lo corren `predev`,
`prebuild` y `pretest`) escribe, desde el código del paquete:

| Qué | De dónde sale |
|---|---|
| Tabla de props de cada componente | El compilador de TypeScript sobre `src/components/*.tsx` (`docs/site/scripts/lib/props.mjs`) |
| Código de cada demo | El propio archivo de la demo, en `docs/site/app/_demos/` |
| Tablas de tokens | `tokens/geist.json`, `src/styles/theme.css` y `src/styles/reset.css` |
| Changelog | `CHANGELOG.md` de este repo |
| `public/docs/**.md`, `llms.txt`, `llms-full.txt` | El mismo modelo que rinden las páginas |
| `registry.json` y `public/r/*.json` | `src/`, reescribiendo los imports a los alias de shadcn |

Lo escrito a mano son las páginas de sistema (`docs/site/content/pages/`), la
metadata por componente (`docs/site/content/meta.mjs`: teclado, accesibilidad,
reglas de uso) y las demos.

### Desplegar

Es un proyecto de Vercel aparte, apuntando a la carpeta:

1. **New Project** → este repo → **Root Directory** = `docs/site`, con
   **Include files outside of the Root Directory** prendido (el build empaqueta
   el paquete desde la raíz).
2. **Settings → Domains** → agregar el subdominio de la documentación.

Framework preset **Next.js**, y los comandos por defecto alcanzan: `npm install`
y `npm run build`, que dispara `sync-ui` + `generate` en el `prebuild`.

## Versionado

SemVer 2.0.0. Para este paquete:

| Cambio | Salto |
|---|---|
| Fix visual o de comportamiento, sin API nueva | patch |
| Componente o prop nueva; cambio visual de tokens | minor |
| Prop que se saca o cambia de forma; cambio de nombre de un export | major |

Cada versión está en [`CHANGELOG.md`](CHANGELOG.md) siguiendo
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), y todo cambio
incompatible se explica ahí.

## Pedí un componente o reportá un bug

- [Reportar un bug](https://github.com/sebafermanelli/sebs7n-ui/issues/new?template=bug.yml)
- [Pedir un componente](https://github.com/sebafermanelli/sebs7n-ui/issues/new?template=component-request.yml) — los pedidos se votan con 👍 y se ven en [el tablero](https://ui.sebastianfermanelli.com/docs/requests)
- [Pedir una mejora](https://github.com/sebafermanelli/sebs7n-ui/issues/new?template=enhancement.yml)
- Preguntas y lo que armaste con esto: [Discussions](https://github.com/sebafermanelli/sebs7n-ui/discussions)

Desde cada página de componente del sitio, «Pedí una mejora» y «Reportá un bug» abren el formulario con el componente y la versión ya cargados.

## Licencia

[MIT](LICENSE).
