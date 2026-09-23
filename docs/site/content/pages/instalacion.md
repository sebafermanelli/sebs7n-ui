Una dependencia, un `@import` y tres variables de marca. No hay `tailwind.config.js` ni archivos copiados al repo de la app.

## Instalar

```bash
pnpm add sebs7n-ui @base-ui/react next-themes sonner geist
```

```bash
npm install sebs7n-ui @base-ui/react next-themes sonner geist
```

> **Todavía no está en npm.** Hasta que se publique, el paquete se distribuye como tarball: `npm pack` en el repo y `pnpm add ./sebs7n-ui-0.1.0.tgz`, o `pnpm add github:sebafermanelli/sebs7n-ui#v0.1.0`. Todo lo de abajo vale igual en los dos casos.

Las `peerDependencies` las instala la app, para que haya **una sola copia** de React y de Base UI:

| Peer | Rango |
|---|---|
| `react` · `react-dom` | `^19.2.0` |
| `@base-ui/react` | `^1.8.0` |
| `next-themes` | `^0.4.6` |
| `sonner` | `^2.0.7` |

## Compatibilidad

| | Versión |
|---|---|
| React | 19.2+ (Server Components y `"use client"`) |
| Next.js | 15 o 16, App Router (Turbopack o webpack) |
| Tailwind CSS | **v4** — tokens por `@theme`, sin `tailwind.config.js` |
| Base UI | `@base-ui/react` 1.8+ |
| TypeScript | `moduleResolution: "bundler"` (o `node16` / `nodenext`) |
| Módulos | Solo ESM |

Los componentes no dependen de Next: funcionan en cualquier bundler que entienda `exports` y la directiva `"use client"`. Lo único específico de Next en los ejemplos es `next/link` y `next/navigation`.

## 1. CSS

En `globals.css`, **en este orden**:

```css
@import "tailwindcss";
@import "sebs7n-ui/theme.css";
/* Las clases de los componentes las genera el Tailwind de la app, en una sola
   hoja ordenada. La ruta es relativa a ESTE archivo:
   app/globals.css → "../node_modules/…"; src/app/globals.css → "../../node_modules/…". */
@source "../node_modules/sebs7n-ui/dist";

:root {
  --brand-base: oklch(0.573 0.214 258);
  --brand-base-dark: oklch(0.573 0.214 258);
  --brand-contrast-dark: #fff;
}
```

> Existe también `@import "sebs7n-ui/styles.css"` (la hoja precompilada), pero con dos hojas de utilidades un `hidden lg:block` de la app pierde contra el `hidden` del paquete. **No combines `@source` con `@import "sebs7n-ui/styles.css"`**: es una cosa o la otra, y la recomendada es `@source`.

## 2. Layout raíz

`GeistSans.variable` y `GeistMono.variable` en `<html>`, el `ThemeProvider` de `next-themes` con `attribute="class"`, y `TooltipProvider` + `<Toaster />` de `sebs7n-ui`.

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

`suppressHydrationWarning` en `<html>` no es opcional: `next-themes` escribe la clase `dark` antes de hidratar y sin eso React avisa en cada carga.

Geist tiene que ser la **fuente variable** (rango `100 900`): la corrección óptica de los títulos usa pesos intermedios (450, 500, 550) que con una estática se redondean.

## 3. Usar

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

## Imports por componente

Cada módulo tiene su entry point. **En páginas de marketing o landing, importá por subpath**; el barrel queda para dashboards, que igual usan casi todo.

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
| `sebs7n-ui/variants/<nombre>` | `button`, `badge`, `card`, `link`, `menu`, `sidebar`, `input`, `toggle` |
| `sebs7n-ui/lib/<nombre>` | `utils` |

Por qué: el barrel hace `export *` de ~30 módulos `"use client"`. Next no puede podar referencias cliente a través de ese barrel (tampoco con `optimizePackageImports`), así que una página con `Button` + `Card` + `ThemeSwitcher` se lleva también Sonner, Sidebar, Select, AlertDialog y el resto. Medido en Next 16.3 (Turbopack) con esa página: **297,5 KB → 234,8 KB** de JS cliente gzip (−21 %).

No mezcles barrel y subpaths en la misma página: el barrel vuelve a traer todo.

## Verificar que quedó bien

1. `bg-blue-500` **no** tiene que compilar: la paleta de Tailwind está reseteada y solo existen los tokens del paquete.
2. En oscuro, un `Input` tiene que verse **más claro** que el fondo de la página (`#0a0a0a` sobre `#000`). Si son el mismo negro, falta la 2.0 o hay un parche viejo pisando `--sf-background-100`.
3. Tabulá: la primera parada de un `AppShell` es «Ir al contenido».
