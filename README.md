# sebs7n-ui

Design system para React: **Geist** —el lenguaje visual de Vercel— sobre las
primitivas de **shadcn/ui `base-nova`** (Base UI), empaquetado como una sola
dependencia.

Nació de unificar cuatro aplicaciones reales que compartían componentes copiados
y pegados: mismos neutros, misma tipografía, mismos radios y sombras, mismos
estados de foco. Lo único que cambia entre productos es el color de marca, que
son **cuatro variables CSS**.

- 58 componentes accesibles sobre Base UI, cada uno con su entry point.
- Tokens de color, tipografía, radios y sombras como variables CSS y utilidades
  de Tailwind v4 — sin `tailwind.config`.
- Server Components donde no hace falta estado; `"use client"` solo donde sí.
- Contraste AA verificado por tests, no a ojo.

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

`geist` está declarado como peer **opcional** —npm no se queja si no lo
instalás—, pero va en el mismo comando: los tokens de tipografía leen
`--font-geist-sans` y `--font-geist-mono`, que define la app en el layout raíz.

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

> Existe también `@import "sebs7n-ui/styles.css"` (la hoja precompilada), pero con
> dos hojas de utilidades un `hidden lg:block` de la app pierde contra el
> `hidden` del paquete. Es una cosa o la otra, y la recomendada es la de arriba.

### 2. Layout raíz

`GeistSans.variable` y `GeistMono.variable` (de `geist/font/*`) en `<html>`, el
`ThemeProvider` de `next-themes` con `attribute="class"`, y `TooltipProvider` +
`<Toaster />` de `sebs7n-ui`.

```tsx
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import { ThemeProvider } from "next-themes"
// Por subpath, no por el barrel: el layout raíz envuelve TODAS las páginas, así
// que un `from "sebs7n-ui"` acá le suma los 58 componentes a cada una.
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
| `sebs7n-ui` | El barrel: los 58 componentes, las variantes y `cn`. Ver la nota de abajo antes de usarlo. |
| `sebs7n-ui/<componente>` | 58, en kebab-case: `accordion` · `alert` · `alert-dialog` · `app-shell` · `app-shell-content` · `autocomplete` · `avatar` · `badge` · `breadcrumb` · `button` · `card` · `checkbox` · `checkbox-group` · `collapsible` · `combobox` · `context-menu` · `dialog` · `drawer` · `dropdown-menu` · `empty-state` · `field` · `fieldset` · `form` · `hover-card` · `input` · `kbd` · `label` · `menubar` · `meter` · `navigation-menu` · `number-field` · `otp-field` · `page-header` · `pagination` · `popover` · `progress` · `radio-group` · `scroll-area` · `select` · `separator` · `sheet` · `sidebar` · `skeleton` · `slider` · `sonner` · `spinner` · `stat` · `switch` · `table` · `tabs` · `tag` · `textarea` · `theme-switcher` · `toggle` · `toggle-group` · `toolbar` · `tooltip` · `user-menu` |
| `sebs7n-ui/variants/<nombre>` | Clases sin `"use client"`: `badge` · `button` · `card` · `input` · `link` · `menu` · `sidebar` · `tag` · `toggle` |
| `sebs7n-ui/lib/<nombre>` | Funciones puras: `pagination` · `render` · `schema` · `utils` |
| `sebs7n-ui/labels` | `LabelsProvider`, `useLabels` y `defaultLabels`: los textos internos, para traducirlos. |
| `sebs7n-ui/tokens/<archivo>.json` | Los tokens en crudo: `brands` · `geist` |
| `sebs7n-ui/theme.css` | Los tokens y el `@source` del `dist`. Es el único import obligatorio. |
| `sebs7n-ui/styles.css` | La hoja precompilada. Alternativa a `theme.css`, no complemento. |

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
                "Importá por subpath: sebs7n-ui/button, sebs7n-ui/card, sebs7n-ui/lib/utils. El barrel arrastra los 58 componentes a la página.",
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
`emerald`, `blue`) que usan el playground y los tests de contraste. **Son solo
demos del sistema**: una app real no las usa ni edita ese archivo.

### Claro y oscuro

Por clase (`.dark` en `<html>`), vía `next-themes` con `attribute="class"`.
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
- **`NavigationMenu` si los ítems navegan, `DropdownMenu` si ejecutan algo.**
  Ver [NavigationMenu](#navigationmenu).
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

`Breadcrumb`, `Pagination`, `Tag` y `PageHeader` no leen del provider: leerlo
pide un contexto de React y eso los convertiría en componentes de cliente, y los
cuatro se pueden renderizar hoy en un Server Component. Sus textos se pasan por
prop, como venían (`ellipsisLabel`, `removeLabel`, `breadcrumbLabel`, `labels`,
`aria-label`).

El `lang` del `<html>` es de la app, y no es opcional: cambia la pronunciación
del lector de pantalla.

---

## NavigationMenu

La navegación de un sitio cuando un grupo de páginas no entra como links
sueltos: el "mega menú". Un trigger despliega un panel donde cada ítem es un
link con título, una línea de descripción y un ícono opcional.

```tsx
import NextLink from "next/link"
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport,
} from "sebs7n-ui/navigation-menu"

<NavigationMenu render={<div />}>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger active={enAlgunaDeEsasPaginas}>Productos</NavigationMenuTrigger>
      <NavigationMenuContent keepMounted className="sm:w-[32rem]">
        <ul className="grid gap-0.5 sm:grid-cols-2">
          {productos.map((p) => (
            <li key={p.href}>
              <NavigationMenuLink
                render={<NextLink href={p.href} />}
                title={p.nombre}
                description={p.bajada}
                icon={<p.Icono />}
              />
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>

    <NavigationMenuItem>
      <NavigationMenuLink render={<NextLink href="/blog" />}>Blog</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>

  {/* Una sola vez, hermano de la lista: el panel es uno para todos los ítems. */}
  <NavigationMenuViewport />
</NavigationMenu>
```

| Pieza | Qué hace |
|---|---|
| `NavigationMenu` | Root. Renderiza `<nav>`; adentro de un `<nav>` que ya existe, `render={<div />}` para no anidar dos landmarks. `delay`/`closeDelay` (50ms), `orientation`, `value`/`onValueChange` para manejarlo a mano. |
| `NavigationMenuList` · `NavigationMenuItem` | `<ul>` / `<li>`. La lista trae `flex items-center gap-2`. |
| `NavigationMenuTrigger` | Botón con el **cuerpo de un link de nav** (14px, peso 400, `gray-900` → `gray-1000`, sin fondo en ningún estado) y chevron que gira al abrir (`chevron={false}` lo saca). `active` lo marca cuando estás en alguna de las páginas del panel. |
| `NavigationMenuContent` | El contenido de ese ítem, que se mueve al panel. Varias columnas: ancho por `className` y una grilla adentro. `keepMounted` deja los links en el DOM cerrados. |
| `NavigationMenuLink` | El `<a>`. Con `title` arma la **tarjeta** del panel (ícono opcional + título + `description` de una línea, truncada); sin `title` pone solo radio, foco y `transition-control`, y manda el `className` — el modo para un link suelto de la barra. `render={<NextLink … />}` para navegación del lado del cliente. |
| `NavigationMenuViewport` | Portal + posicionador + superficie + viewport en una pieza. Va una sola vez, hermano de la lista. `align`, `side`, `sideOffset`, `container`, y `popupClassName`/`positionerClassName` para el ancho máximo. |
| `NavigationMenuPositioner` · `NavigationMenuPopup` | Las piezas sueltas, para armar el panel a mano (una flecha, otro contenedor). El 99% de las veces alcanza `NavigationMenuViewport`. |

**Cuándo `NavigationMenu` y cuándo `DropdownMenu`.** Si los ítems **navegan**,
`NavigationMenu`; si **ejecutan** algo sobre la página en la que estás,
`DropdownMenu`. No es cosmético: `DropdownMenu` emite `role="menu"` /
`role="menuitem"`, atrapa el foco y se recorre con las flechas como una barra de
aplicación, así que un lector de pantalla anuncia "menú, 3 elementos" en vez de
una lista de links, y el modo de navegación por links no los ve.
`NavigationMenu` es `<nav>` + `<ul>` + `<a>`, que es lo que son. El menú de
idioma y el de usuario siguen siendo `DropdownMenu` (cambian el estado, no la
página).

**`keepMounted` y el crawler.** Por defecto el contenido no existe en el DOM
hasta que el menú abre, así que un crawler —que no pasa el mouse ni tabula—
nunca ve esos links. `keepMounted` los deja en el HTML del server, ocultos.
Cuesta un poco de markup por panel; si el nav es el link principal a esas
páginas, se pone. Un test verifica que salen en `renderToString`. Alcance: cubre
el HTML del server y el DOM hasta la primera apertura. Al abrir, el contenido se
muda al popup —que vive en un portal sin `keepMounted`— y al cerrar se desmonta
con él. Para el crawler da igual, porque no abre el menú.

**Accesibilidad.** Abre con hover y con teclado (Enter, Espacio, flechas);
Escape cierra y devuelve el foco al trigger; `aria-expanded` y `aria-controls`
los pone Base UI. El movimiento pasa por `motion-reduce` además del reset global
del paquete. El trigger **no** lleva `aria-current`: no es un link y no es la
página actual — para eso está `active`, que solo lo pinta.

## Combobox y Autocomplete

Para pickers y buscadores (país, cliente, categoría, ciudad, dirección) usá
estos en vez de armar la lista a mano: el input tiene el cuerpo y los estados de
`Input` (tamaños `sm`/`md`/`lg`, foco, `aria-invalid`, `disabled`) y la lista es
la de `DropdownMenu`/`Select`.

```tsx
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "sebs7n-ui/combobox"

<Combobox items={countries} value={country} onValueChange={setCountry}>
  <ComboboxInput id="pais" placeholder="Elegí un país" />
  <ComboboxContent>
    <ComboboxEmpty />{/* "Sin resultados" */}
    <ComboboxList>
      {(c: string) => <ComboboxItem key={c} value={c}>{c}</ComboboxItem>}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

| Pieza | Qué hace |
|---|---|
| `Combobox` | Root de Base UI: `items`, `value`/`onValueChange`, `multiple`, `filter`, `itemToStringLabel` (objetos `{ value, label }` andan solos), `disabled`. |
| `ComboboxInput` | Input + limpiar + chevron. `size`, `showClear` (default sí, aparece con valor), `showTrigger` (default sí), `labels`, `groupClassName`. |
| `ComboboxContent` | Panel `menuPopupClassName`, al menos tan ancho como el input. `side`, `align`, `sideOffset`. |
| `ComboboxList` · `ComboboxItem` | Lista (función por ítem) e ítem `menuItemClassName` con check si está elegido. |
| `ComboboxGroup` · `ComboboxLabel` · `ComboboxCollection` · `ComboboxSeparator` | Grupos: `items={[{ value: "Europa", items: [...] }]}`, y dentro de cada `ComboboxGroup items={g.items}` un `ComboboxCollection`. |
| `ComboboxEmpty` | Se muestra solo con la lista vacía. Sin children: "Sin resultados"; `{null}` no muestra nada. |
| `ComboboxStatus` | Región `aria-live`. `loading` muestra la fila con spinner ("Buscando…", `labels.loading`). |
| `ComboboxChips` · `ComboboxChip` · `ComboboxChipsInput` · `ComboboxValue` | Múltiple: chips `Badge` subtle con botón "Quitar …" (`removeLabel`). |
| `useComboboxFilter` | `contains`/`startsWith` con locale, para filtrar a mano. |

**Búsqueda async** (clientes, direcciones): `filter={null}`, buscá en
`onInputValueChange` (salteá `reason === "item-press"`) y mientras carga
`<ComboboxStatus loading />` + `<ComboboxEmpty>{loading ? null : undefined}</ComboboxEmpty>`.
**Múltiple**: `multiple` y, en vez de `ComboboxInput`,
`<ComboboxChips><ComboboxValue>{(values) => <>{values.map((v) => <ComboboxChip key={v}>{v}</ComboboxChip>)}<ComboboxChipsInput /></>}</ComboboxValue></ComboboxChips>`.

**`Autocomplete`** (`sebs7n-ui/autocomplete`) es texto libre con sugerencias: el
valor es el texto (`value`/`onValueChange` son strings) y un texto que no está
en la lista vale. Mismas piezas con prefijo `Autocomplete`
(`AutocompleteInput` sin chevron por defecto, `AutocompleteItem` sin check).
Para ciudad o dirección donde se acepta cualquier cosa, `Autocomplete`; si el
valor tiene que ser uno de la lista, `Combobox`.

`disabled` va en el root (`<Combobox disabled>`) para bloquear todo; en el input
también apaga la superficie. `aria-invalid` va en el input.

**Lista a medida** (raro): `menuPopupClassName` y `menuItemClassName` (de
`sebs7n-ui` o `sebs7n-ui/variants/menu`) sobre primitivas de Base UI que pongan
`data-highlighted`; e `inputShellClassName` / `inputShellInputClassName` /
`inputShellButtonClassName` (`sebs7n-ui/variants/input`) para un control compuesto
con superficie de Input. Sin `"use client"`.

## Shell de dashboard

`AppShell` arma el layout de panel: sidebar sticky a todo el alto desde `lg` y,
debajo, una barra de 56px cuya hamburguesa abre el mismo sidebar en un `Sheet`.

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AppShell, AppShellContent, Badge, Button, DropdownMenuItem, Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupLabel, SidebarHeader, SidebarItem, SidebarItemBadge, SidebarSearch, UserMenu,
} from "sebs7n-ui"
import { LogOutIcon, PanelLeftIcon, ReceiptIcon, SettingsIcon, UsersIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

function PanelSidebar({ user, pending, collapsed }: { user: { name: string; email: string }; pending: number; collapsed: boolean }) {
  const pathname = usePathname()
  const item = (href: string, icon: React.ReactNode, label: React.ReactNode) => (
    <SidebarItem render={<Link href={href} />} icon={icon} active={pathname.startsWith(href)}>
      {label}
    </SidebarItem>
  )
  return (
    <Sidebar collapsed={collapsed}>
      <SidebarHeader>
        <div className="flex h-8 items-center gap-2 px-1">
          <Logo className="size-6" />
          <span className="text-label-14 font-medium group-data-collapsed/sidebar:hidden">Acme</span>
          <Badge size="sm" className="group-data-collapsed/sidebar:hidden">Admin</Badge>
        </div>
        {/* El atajo lo registra la app (useHotkey / keydown en window); shortcut solo lo muestra y lo anuncia. */}
        <SidebarSearch shortcut="⌘K" onClick={openCommandPalette} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operación</SidebarGroupLabel>
          {item("/panel/facturas", <ReceiptIcon />, "Facturas")}
          {item("/panel/clientes", <UsersIcon />, <>Clientes{pending > 0 && <SidebarItemBadge label={`${pending} pendientes`}>{pending}</SidebarItemBadge>}</>)}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu
          user={user}
          signOut={<DropdownMenuItem onClick={signOut}><LogOutIcon />Cerrar sesión</DropdownMenuItem>}
        >
          <DropdownMenuItem render={<Link href="/panel/ajustes" />}><SettingsIcon />Ajustes de cuenta</DropdownMenuItem>
        </UserMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function DashboardShell({ children, user, pending, defaultCollapsed }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useSidebarCollapsed(defaultCollapsed)
  return (
    <AppShell
      pathname={pathname}
      sidebar={<PanelSidebar user={user} pending={pending} collapsed={collapsed} />}
      mobileBar={<><Logo className="size-6" /><span className="ml-auto" /><UserMenu user={user} collapsed /></>}
    >
      <AppShellContent>
        <Button variant="ghost" size="icon-sm" className="hidden lg:inline-flex" aria-label="Colapsar sidebar"
          aria-pressed={collapsed} onClick={() => setCollapsed(!collapsed)}>
          <PanelLeftIcon />
        </Button>
        {children}
      </AppShellContent>
    </AppShell>
  )
}
```

**Colapsar el sidebar (receta de la app).** El paquete no guarda el estado: la
app decide dónde vive. Con una cookie el server ya renderiza el ancho correcto
(sin salto):

```tsx
// layout.tsx (Server Component): const defaultCollapsed = (await cookies()).get("sidebar")?.value === "collapsed"
function useSidebarCollapsed(initial: boolean) {
  const [collapsed, setCollapsed] = useState(initial)
  const set = useCallback((next: boolean) => {
    setCollapsed(next)
    document.cookie = `sidebar=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`
  }, [])
  useEffect(() => {
    // ⌘B / Ctrl+B, salvo que se esté escribiendo en un campo.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "b" || !(event.metaKey || event.ctrlKey)) return
      if ((event.target as HTMLElement)?.closest("input, textarea, [contenteditable]")) return
      event.preventDefault()
      setCollapsed((prev) => {
        const next = !prev
        document.cookie = `sidebar=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`
        return next
      })
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
  return [collapsed, set] as const
}
```

- `SidebarItem` es un `<a>`; con Next, `render={<Link href />}`. `active` pone
  `aria-current="page"`. Dentro del Sheet mobile, el click lo cierra (salvo
  ⌘/Ctrl/click del medio) y manda el foco al `main`.
- **Pasale `pathname={usePathname()}` a `AppShell`**: cualquier navegación (un
  link del contenido, un `router.push`) cierra el Sheet. También se cierra al
  pasar a ≥ lg y al elegir un ítem del `UserMenu`. Para un caso propio:
  `useAppShell().closeMobile({ focusMain: true })`.
- `SidebarItemBadge`: el lector lo lee separado ("Clientes, 3"); con
  `label="3 pendientes"` da contexto. Con el sidebar colapsado, un punto marca
  los contadores distintos de cero.
- `SidebarSearch` no registra ningún atajo: la app escucha ⌘K y abre su paleta.
  Con `shortcut="⌘K"` se muestra el `Kbd` y se anuncia `aria-keyshortcuts`; sin
  `shortcut`, nada.
- `<Sidebar collapsed>` deja solo los íconos (64px, sin animar el ancho) con
  tooltip del label; lo que sea texto del header se oculta con
  `group-data-collapsed/sidebar:hidden`. `UserMenu` toma el estado del sidebar:
  colapsado muestra solo el avatar.
- `UserMenu` agrega solo la fila "Tema" (`ThemeMenuRadio`: ítems `menuitemradio`
  que se recorren con las flechas y no cierran el menú). `signOut` es un
  `DropdownMenuItem` neutral, **no** `variant="destructive"`.
- **Usar `AppShellContent` como hijo directo de `AppShell`**: es el contenedor de
  página (`mx-auto w-full max-w-7xl`, `px-4 py-6 md:px-6 md:py-8`, columna con
  `gap-6`), así todas las pantallas tienen el mismo ancho. `size="wide"`
  (1600px) para tablas anchas, `size="full"` sin máximo. No tiene
  `"use client"`: `sebs7n-ui/app-shell-content` sirve en Server Components.
- `AppShell` usa `--app-shell-height` (100dvh); para embeberlo en una caja,
  `className="[--app-shell-height:720px]"`.
- Página: `PageHeader` (`PageHeaderTitle`, `PageHeaderDescription`,
  `PageHeaderActions`, prop `breadcrumb`), `Stat` para KPIs dentro de un `Card`,
  `EmptyState` para vacíos, `AlertDialog` para confirmar lo destructivo.
  `AlertDialogAction` no cierra sola: o controlás `open` (y cerrás al terminar,
  útil con `loading`), o sin controlar la envolvés:
  `<AlertDialogClose render={<AlertDialogAction variant="destructive" />}>Eliminar</AlertDialogClose>`.
  `AlertDialogCancel` ya cierra.

---

## Desarrollo

```bash
npm install
npm test          # tokens, contraste, componentes y build
npm run typecheck
npm run tokens    # regenera src/styles/colors.css desde tokens/geist.json
npm run build     # dist/ (tsc) + dist/styles.css (Tailwind)
```

Playground — todas las primitivas en todos sus estados, las cuatro marcas de
ejemplo, claro y oscuro:

```bash
cd playground && npm install && npm run dev   # http://localhost:4000
```

`npm run dev` empaqueta el paquete con `npm pack` y lo instala como tarball. Es a
propósito, y no es lo que hace una app: una app instala desde npm
(`pnpm add sebs7n-ui`). Acá se empaca el código local para probar los cambios sin
publicar, y con exactamente los archivos que salen en el tarball publicado.

## Sitio de documentación

Vive en `docs/site/` y es una app de Next 16 + Tailwind v4 que **usa el propio
design system**: es su mejor demo. Consume el paquete con `npm pack`, igual que el
playground y por la misma razón: documenta el código de este repo, no la última
versión publicada en npm. Una app normal instala desde npm.

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
