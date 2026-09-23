# sebs7n-ui

Design system para React: **Geist** —el lenguaje visual de Vercel— sobre las
primitivas de **shadcn/ui `base-nova`** (Base UI), empaquetado como una sola
dependencia.

Nació de unificar cuatro aplicaciones reales que compartían componentes copiados
y pegados: mismos neutros, misma tipografía, mismos radios y sombras, mismos
estados de foco. Lo único que cambia entre productos es el color de marca, que
son **tres variables CSS**.

- ~30 componentes accesibles sobre Base UI, cada uno con su entry point.
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

`geist` no es un peer declarado, pero va en el mismo comando: los tokens de
tipografía leen `--font-geist-sans` y `--font-geist-mono`, que define la app en
el layout raíz.

### 1. CSS

En `globals.css`, **en este orden**:

```css
@import "tailwindcss";
@import "sebs7n-ui/theme.css";
/* Las clases de los componentes las genera el Tailwind de la app, en una sola
   hoja ordenada. La ruta es relativa a ESTE archivo:
   app/globals.css → "../node_modules/…"; src/app/globals.css → "../../node_modules/…". */
@source "../../node_modules/sebs7n-ui/dist";

:root {
  --brand-base: oklch(0.573 0.214 258);
  --brand-base-dark: oklch(0.573 0.214 258);
  --brand-contrast-dark: #fff;
}
```

> Existe también `@import "sebs7n-ui/styles.css"` (la hoja precompilada), pero con
> dos hojas de utilidades un `hidden lg:block` de la app pierde contra el
> `hidden` del paquete. **No combines `@source` con `@import "sebs7n-ui/styles.css"`**:
> es una cosa o la otra, y la recomendada es `@source`.

### 2. Layout raíz

`GeistSans.variable` y `GeistMono.variable` (de `geist/font/*`) en `<html>`, el
`ThemeProvider` de `next-themes` con `attribute="class"`, y `TooltipProvider` +
`<Toaster />` de `sebs7n-ui`.

```tsx
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import { Toaster, TooltipProvider } from "sebs7n-ui"
import { ThemeProvider } from "next-themes"
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

| Subpath | Archivo |
|---|---|
| `sebs7n-ui/<componente>` | `src/components/<componente>.tsx` (kebab-case: `alert-dialog`, `app-shell`, `user-menu`, …) |
| `sebs7n-ui/variants/<nombre>` | `src/variants/<nombre>.ts` (`button`, `badge`, `card`, `link`, `menu`, `sidebar`, `input`, `toggle`) |
| `sebs7n-ui/lib/<nombre>` | `src/lib/<nombre>.ts` (`utils`, `render`, `pagination`) |

Por qué: el barrel hace `export *` de ~30 módulos `"use client"`. Next no puede
podar referencias cliente a través de ese barrel (tampoco con
`optimizePackageImports`), así que una página con `Button` + `Card` +
`ThemeSwitcher` se lleva también Sonner, Sidebar, Select, AlertDialog, etc.
Medido en Next 16.3 (Turbopack) con esa página: **297,5 KB → 234,8 KB** de JS
cliente gzip (−21 %). No mezcles barrel y subpaths en la misma página: el barrel
vuelve a traer todo.

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
así que conviven con `text-gray-900`. Desde 1.4 los `heading` llevan el peso
**corregido ópticamente**, no 600 fijo: 72/64 → 400, 56/48/40 → 450, 32/24 →
500, 20 → 550, 16/14 → 600. No lo pises con `font-semibold`: para eso está el
paso de arriba de la escala. Necesita Geist como **fuente variable** (rango
`100 900`); con una estática los pesos intermedios se redondean y la corrección
se pierde.

## Theming

### Color de marca

Una app define **tres variables** y nada más. No hay que tocar ningún archivo del
paquete:

```css
:root {
  --brand-base: oklch(0.55 0.16 35);        /* acento en claro */
  --brand-base-dark: oklch(0.55 0.16 35);   /* acento en oscuro; por defecto, igual a la base */
  --brand-contrast-dark: #fff;              /* texto sobre el acento en oscuro */
}
```

De ahí el paquete deriva la escala `brand-100…1000` y `brand-contrast`. La regla
es una sola: **el texto sobre `brand-700` tiene que llegar a 4,5:1**. Si el
acento es claro, `--brand-contrast-dark: #000`.

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
  un descuido, no como una jerarquía. Sin `shape`, `buttonVariants` emite
  exactamente lo mismo que en 1.3.0.
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
- **Movimiento.** Todas las animaciones pasan por `motion-reduce`, además del
  reset global del paquete.
- **`aria-invalid`** en el input es lo único que hace falta para el estado de
  error: el estilo sale de ahí, no de una clase aparte.

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
