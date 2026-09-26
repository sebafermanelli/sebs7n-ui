# sebs7n-ui

[![npm](https://img.shields.io/npm/v/sebs7n-ui?logo=npm&color=0a0a0a)](https://www.npmjs.com/package/sebs7n-ui)
[![CI](https://github.com/sebafermanelli/sebs7n-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/sebafermanelli/sebs7n-ui/actions/workflows/ci.yml)
[![licencia MIT](https://img.shields.io/npm/l/sebs7n-ui?color=0a0a0a)](./LICENSE)

Design system para React: **Geist** —el lenguaje visual de Vercel— sobre las
primitivas de **shadcn/ui `base-nova`** (Base UI), empaquetado como una sola
dependencia.

Nació de unificar cuatro aplicaciones reales que compartían componentes copiados
y pegados: mismos neutros, misma tipografía, mismos radios y sombras, mismos
estados de foco. Lo único que cambia entre productos es el color de marca, que
son **cuatro variables CSS**.

- 60 componentes accesibles sobre Base UI, cada uno con su entry point.
- Tokens de color, tipografía, radios y sombras como variables CSS y utilidades
  de Tailwind v4 — sin `tailwind.config`.
- Server Components donde no hace falta estado; `"use client"` solo donde sí.
- Contraste AA verificado por tests, no a ojo.

**El detalle de cada componente vive en
[ui.sebastianfermanelli.com](https://ui.sebastianfermanelli.com)** —60 páginas con
demos en vivo, la tabla de props generada del TypeScript y las reglas de uso— y no
se duplica acá. Cada página se sirve también como markdown y hay un `llms.txt`
para agentes. Para levantarlo local, `cd docs/site && npm run dev`.

## Índice

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

---

## Instalación

Está publicado en npm como [`sebs7n-ui`](https://www.npmjs.com/package/sebs7n-ui),
público y MIT.

```bash
pnpm add sebs7n-ui @base-ui/react next-themes sonner geist
```

```bash
npm install sebs7n-ui @base-ui/react next-themes sonner geist
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

`geist` está declarado como peer **opcional** —npm no se queja si no lo
instalás—, pero va en el mismo comando: los tokens de tipografía leen
`--font-geist-sans` y `--font-geist-mono`, que define la app en el layout raíz.

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

`GeistSans.variable` y `GeistMono.variable` (de `geist/font/*`) en `<html>`, el
`ThemeProvider` de `next-themes` con `attribute="class"`, y `TooltipProvider` +
`<Toaster />` de `sebs7n-ui`.

```tsx
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import { ThemeProvider } from "next-themes"
// Por subpath, no por el barrel: el layout raíz envuelve TODAS las páginas, así
// que un `from "sebs7n-ui"` acá le suma los 60 componentes a cada una.
import { Toaster } from "sebs7n-ui/sonner"
import { TooltipProvider } from "sebs7n-ui/tooltip"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
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

`geist/font/mono` precarga `GeistMono-Variable.woff2` en **cada ruta**: **71,4 KB**
que compiten por el ancho de banda de la primera pantalla. Vale la pena si la app
muestra código o tablas de números; si el mono aparece en dos o tres etiquetas
—un id, una fecha, un `404`—, declaralo con `next/font/local` y `preload: false`,
así se descarga recién cuando aparece el primer elemento que lo usa:

```tsx
const geistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
  // `geist/font/mono` lo trae en `false`, así el fallback queda sin `size-adjust`
  // y el swap salta. Next solo ofrece Arial y Times New Roman como base: ninguna
  // es monoespaciada, pero Arial acerca más que nada.
  adjustFontFallback: "Arial",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
})
```

`GeistSans` no necesita nada: `geist/font/sans` no desactiva `adjustFontFallback`,
así que Next ya le calcula el `size-adjust` del fallback.

### 3. Usar

```tsx
import { Button } from "sebs7n-ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "sebs7n-ui/card"

export function Panel() {
  return (
    <Card>
      <CardHeader><CardTitle>Facturas</CardTitle></CardHeader>
      <CardContent>
        <Button variant="accent">Nueva factura</Button>
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
| `sebs7n-ui` | El barrel: los 60 componentes, las variantes y `cn`. Ver la nota de abajo antes de usarlo. |
| `sebs7n-ui/<componente>` | 60, en kebab-case: `accordion` · `alert` · `alert-dialog` · `app-shell` · `app-shell-content` · `autocomplete` · `avatar` · `badge` · `breadcrumb` · `button` · `card` · `chart` · `checkbox` · `checkbox-group` · `collapsible` · `combobox` · `context-menu` · `dialog` · `drawer` · `dropdown-menu` · `empty-state` · `field` · `fieldset` · `form` · `hover-card` · `icon` · `input` · `kbd` · `label` · `menubar` · `meter` · `navigation-menu` · `number-field` · `otp-field` · `page-header` · `pagination` · `popover` · `progress` · `radio-group` · `scroll-area` · `select` · `separator` · `sheet` · `sidebar` · `skeleton` · `slider` · `sonner` · `spinner` · `stat` · `switch` · `table` · `tabs` · `tag` · `textarea` · `theme-switcher` · `toggle` · `toggle-group` · `toolbar` · `tooltip` · `user-menu` |
| `sebs7n-ui/variants/<nombre>` | Clases sin `"use client"`: `badge` · `button` · `card` · `input` · `link` · `menu` · `overlay` · `sidebar` · `tag` · `toggle` |
| `sebs7n-ui/lib/<nombre>` | Funciones puras: `contrast` · `pagination` · `render` · `schema` · `utils` |
| `sebs7n-ui/labels` | `LabelsProvider`, `useLabels` y `defaultLabels`: los textos internos, para traducirlos. |
| `sebs7n-ui/tokens/<archivo>.json` | Los tokens en crudo: `brands` · `geist` |
| `sebs7n-ui/theme.css` | Los tokens y el `@source` del `dist`. Es el único import obligatorio. |

<!-- /subpaths -->

Por qué: el barrel hace `export *` de ~30 módulos `"use client"`. Next no puede
podar referencias cliente a través de ese barrel (tampoco con
`optimizePackageImports`), así que una página con `Button` + `Card` +
`ThemeSwitcher` se lleva también Sonner, Sidebar, Select, AlertDialog, etc.
Medido en Next 16.3 (Turbopack) con esa página: **297,5 KB → 234,8 KB** de JS
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
                "Importá por subpath: sebs7n-ui/button, sebs7n-ui/card, sebs7n-ui/lib/utils. El barrel arrastra los 60 componentes a la página.",
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
| Color | `gray`, `gray-alpha`, `brand`, `blue`, `red`, `amber`, `green`, `teal`, `purple`, `pink` en pasos 100–1000, más `background`, `background-100`, `background-200` y `brand-contrast` |
| Tipografía | Utilidades de Geist: `text-heading-{72…14}`, `text-copy-{24…13}`, `text-label-{20…12}`, `text-button-{16,14,12}` y las variantes `-mono` |
| Sombras | `shadow-tooltip`, `shadow-menu`, `shadow-modal` |
| Foco | `focus-visible:focus-ring`, `focus:focus-border` |
| Movimiento | `transition-control`, `animate-skeleton` |

Los valores viven en `tokens/geist.json` y se compilan a
`src/styles/colors.css` con `npm run tokens`; un test falla si el CSS quedó
desactualizado.

**Fondos: página, superficie y banda.** Son tres roles distintos y cada uno
tiene su token. Elegir mal se nota sobre todo en oscuro, donde la página es
negro puro:

| Token | Rol | Claro | Oscuro |
|---|---|---|---|
| `bg-background` | **La página.** `body` (ya lo pone el paquete) y la raíz del `AppShell`. | `#ffffff` | `#000000` |
| `bg-background-100` | **La superficie**: lo que flota sobre la página. Input, Select, Textarea, popup de menú, Popover, Dialog, Sheet, Card, Alert, Toast, barra mobile del shell. | `#ffffff` | `#0a0a0a` |
| `bg-background-200` | **El fondo sutil / banda**: Sidebar, `thead`/`tfoot` de Table, `Card variant="subtle"`, `EmptyState`. | `#fafafa` | `#0a0a0a` |

La regla: si el elemento **es** la página, `bg-background`; si flota **sobre**
ella, `bg-background-100`.

Los valores de oscuro son los de vercel.com medidos con `getComputedStyle`
(contact/sales, 2026-09-22): `--ds-background-100: hsla(0,0%,4%)` = `#0a0a0a`
para las superficies y `--ds-background-200: hsla(0,0%,0%)` = `#000` para la
página — su `body` computa `rgb(0,0,0)` y un `input`, `rgb(10,10,10)`.
`background-200` es siempre el tono que **no** es el de la página: en claro
baja a `#fafafa`, en oscuro no puede bajar de `#000` y sube a `#0a0a0a`. Por eso
en oscuro coincide con `background-100`: Geist tiene dos fondos por tema, no
tres, y el tercero —la página— es `--sf-background`, que vive en
`src/styles/theme.css` porque no es un primitivo de Geist.

**Tipografía.** `cn()` entiende las utilidades de Geist como tamaño de fuente,
así que conviven con `text-gray-900`. Los `heading` llevan el peso **corregido
ópticamente**, no 600 fijo: un mismo peso no se ve igual a 14px que a 64px, y 600
a 64px sale plomizo. Los números son los medidos en vercel.com: 72/64 → 400, 56/48/40 → 450, 32/24 →
500, 20 → 550, 16/14 → 600. No lo pises con `font-semibold`: para eso está el
paso de arriba de la escala. Necesita Geist como **fuente variable** (rango
`100 900`); con una estática los pesos intermedios se redondean y la corrección
se pierde.

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

- **Un solo acento por pantalla:** `Button variant="accent"` o
  `Switch variant="accent"` para la acción principal; el CTA por defecto es el
  negro (`variant="default"`).
- **`shape="pill"` solo en los CTA de un hero o de una sección de marketing.**
  `rounded-full` con un escalón más de padding horizontal (`sm` 20px, `md` 24px,
  `lg` 28px), con cualquier variante y tamaño; en `icon-*` se ignora, que ya es
  cuadrado con su propio radio. **Nunca en el chrome de una app** —nav, tablas,
  formularios, diálogos—. Dos formas de botón en la misma pantalla se leen como
  un descuido, no como una jerarquía. `shape` es opcional y su default no agrega
  ninguna clase: sin pasarlo, `buttonVariants` emite exactamente la misma cadena
  que antes de que la variante existiera, y hay un test que compara la cadena
  entera.
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
  campos. El anillo usa `brand-700`.
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

## Licencia

[MIT](LICENSE).
