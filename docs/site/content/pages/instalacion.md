Una dependencia, un `@import` y cuatro variables de marca. No hay `tailwind.config.js` ni archivos copiados al repo de la app.

## Instalar

El paquete está publicado en npm como [`sebs7n-ui`](https://www.npmjs.com/package/sebs7n-ui): público y MIT.

```bash
pnpm add sebs7n-ui @base-ui/react next-themes sonner geist
```

```bash
npm install sebs7n-ui @base-ui/react next-themes sonner geist
```

```bash
bun add sebs7n-ui @base-ui/react next-themes sonner geist
```

Todo lo que va después de `sebs7n-ui` lo instala la app, no el paquete.

Las `peerDependencies` van así para que haya **una sola copia** de React y de Base UI en el árbol; dos copias de React rompen los hooks, y dos de Base UI rompen el foco de los popups:

| Peer | Rango |
|---|---|
| `react` · `react-dom` | `^19.2.0` |
| `@base-ui/react` | `^1.8.0` |
| `next-themes` | `^0.4.6` |
| `sonner` | `^2.0.7` |

`geist` está declarado como peer **opcional**, así que npm no se queja si no lo instalás, pero va en el mismo comando: los tokens de tipografía leen `--font-geist-sans` y `--font-geist-mono`, que define la app en el layout raíz. Si tu proyecto no es Next, cargá Geist variable por tu cuenta y definí esas dos variables.

El resto —`clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`— viaja como dependencia normal del paquete: no las instalás vos.

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

:root {
  --brand-base: oklch(0.573 0.214 258);
  --brand-base-dark: oklch(0.573 0.214 258);
  --brand-contrast: #fff;
  --brand-contrast-dark: #fff;
}
```

Eso es todo. `theme.css` trae los tokens (colores, tipografía, radios, sombras), el reset de la paleta y el `@source` que hace que el Tailwind de la app escanee el `dist/` del paquete y genere las utilidades que usan los componentes.

**No escribas vos el `@source`.** Antes esta página pedía un `@source "../node_modules/sebs7n-ui/dist"` con la ruta calculada a mano según dónde estuviera tu `globals.css`, y ese era el error de instalación más frecuente: si la ruta está mal, Tailwind **no avisa nada**. El build dice "Compiled", el CSS baja de 75 KB a 13 y la app entera queda sin estilo. Ahora el `@source` vive adentro del paquete, que es el único lugar donde la ruta siempre es la misma.

### Achicar el CSS: `@source not`

El `@source` del paquete escanea los 58 componentes, así que el CSS final trae utilidades de componentes que tu app no importa. Se pueden excluir uno por uno:

```css
@import "sebs7n-ui/theme.css";
@source not "../../node_modules/sebs7n-ui/dist/components/combobox.js";
@source not "../../node_modules/sebs7n-ui/dist/components/drawer.js";
```

Los caros son `combobox`, `autocomplete`, los tres menús, `drawer` y `user-menu`. Esto es opt-in a propósito: equivocarse acá falla **ruidosamente** —el componente aparece sin estilo la primera vez que lo usás—, al revés que olvidarse el `@source`. Y ojo con las cadenas: `user-menu` arrastra avatar, dropdown-menu, theme-switcher y tooltip.

### Por qué no `styles.css`

El paquete también exporta `sebs7n-ui/styles.css`, la hoja precompilada. Con dos hojas de utilidades cargadas, un `hidden lg:block` de la app pierde contra el `hidden` del paquete, porque gana la que se declaró último y no la más específica. **Es una cosa o la otra, nunca las dos**, y la recomendada es la de arriba: una sola hoja, en el orden que Tailwind sabe resolver.

`styles.css` queda para el caso en que el bundler de la app no corre Tailwind, o no puede escanear `node_modules`. Trae los tokens y solo las utilidades que usan los componentes; no trae el preflight de Tailwind, así que el reset base sigue siendo responsabilidad de la app.

### Las cuatro variables de marca

`--brand-base`, `--brand-base-dark`, `--brand-contrast` y `--brand-contrast-dark` son lo único que cambia entre productos: de ahí sale la escala `brand-100…1000`. Las dos de contraste vienen en `#fff` por defecto, y `--brand-contrast-dark` cae en `--brand-contrast` si no se declara, así que con un acento oscuro alcanza con las dos primeras. El detalle de cómo se deriva, el requisito de contraste y el modo oscuro están en [Theming](/docs/theming).

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

`geist/font/*` define `--font-geist-sans` y `--font-geist-mono` en la clase que devuelve `.variable`; los tokens `--font-sans` y `--font-mono` del paquete las leen de ahí. Sin esas clases en `<html>`, todo cae al `ui-sans-serif` del sistema.

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

{{subpaths}}

Por qué: el barrel hace `export *` de ~30 módulos `"use client"`. Next no puede podar referencias cliente a través de ese barrel (tampoco con `optimizePackageImports`), así que una página con `Button` + `Card` + `ThemeSwitcher` se lleva también Sonner, Sidebar, Select, AlertDialog y el resto. Medido en Next 16.3 (Turbopack) con esa página: **297,5 KB → 234,8 KB** de JS cliente gzip (−21 %).

No mezcles barrel y subpaths en la misma página: el barrel vuelve a traer todo.

## Verificar que quedó bien

1. `bg-slate-500` **no** tiene que compilar: la paleta de Tailwind está reseteada y solo existen los tokens del paquete. Ojo con el ejemplo: `bg-blue-500` **sí** compila, porque Geist tiene su propia escala `blue` en pasos 100–1000. Lo que no existe son las escalas de Tailwind que el paquete no repone (`slate`, `zinc`, `sky`…) ni los pasos que Geist no tiene (`bg-blue-50`).
2. En oscuro, un `Input` tiene que verse **más claro** que el fondo de la página (`#0a0a0a` sobre `#000`). Si son el mismo negro, falta la 2.0 o hay un parche viejo pisando `--sf-background-100`.
3. Tabulá: la primera parada de un `AppShell` es «Ir al contenido».
