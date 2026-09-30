# sebs7n-ui

[![npm](https://img.shields.io/npm/v/sebs7n-ui?logo=npm&color=0a0a0a)](https://www.npmjs.com/package/sebs7n-ui)
[![CI](https://github.com/sebafermanelli/sebs7n-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/sebafermanelli/sebs7n-ui/actions/workflows/ci.yml)
[![licencia MIT](https://img.shields.io/npm/l/sebs7n-ui?color=0a0a0a)](./LICENSE)

Design system para React con el lenguaje visual de **iCloud web** sobre las primitivas de
**shadcn/ui `base-nova`** (Base UI): componentes accesibles, tokens de Tailwind v4 y cuatro
variables CSS para el color de marca, en una sola dependencia.

**Documentación, demos y props de cada componente:
[ui.sebastianfermanelli.com](https://ui.sebastianfermanelli.com)** (también como markdown y `llms.txt`).

## Instalación

```bash
npm install sebs7n-ui @base-ui/react next-themes sonner
```

Peers: `react` y `react-dom` `^19.2.0`, `@base-ui/react` `>=1.8.0 <1.9.0` (acotado: `Field` usa sus `internals`), `next-themes` `^0.4.6` y
`sonner` `^2.0.7`. Opcionales, solo para su subpath: `recharts` `^3.10.0` (`chart`), `@dnd-kit/core`
`^6.3.1`, `@dnd-kit/sortable` `^10.0.0` y `@dnd-kit/utilities` `^3.2.2` (`sortable-list`,
`sortable-grid`) y `embla-carousel-react` `^8.6.0` (`carousel`). Tailwind CSS v4, solo ESM.

## CSS y fuentes

En `globals.css`, en este orden, con las **cuatro variables de marca**:

```css
@import "tailwindcss";
@import "sebs7n-ui/theme.css";

:root {
  --brand-base: oklch(0.573 0.214 258);      /* acento en claro */
  --brand-base-dark: oklch(0.573 0.214 258); /* acento en oscuro; por defecto, igual a la base */
  --brand-contrast: #fff;                    /* texto sobre el acento; #000 si el acento es claro */
  --brand-contrast-dark: #fff;               /* por defecto, igual a --brand-contrast */
}
```

No hace falta `@source`: lo trae `theme.css`. El texto sobre `brand-700` tiene que llegar a 4,5:1.

La fuente es **Inter** y la carga la app. Con Next, la variable tiene que llamarse `--font-inter`;
el modo oscuro es la clase `.dark` en `<html>` (`next-themes` con `attribute="class"`):

```tsx
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sebs7n-ui/sonner"
import { TooltipProvider } from "sebs7n-ui/tooltip"
import "./globals.css"

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

Fuera de Next: `npm install @fontsource-variable/inter` e `import "@fontsource-variable/inter"` una vez en el entry.

## Imports por componente

Importá por subpath (`import { Button } from "sebs7n-ui/button"`). El barrel arrastra todos los
módulos `"use client"` a la página, sobre todo desde el layout raíz.

<!-- subpaths: generado por scripts/gen-subpaths.mjs -->

| Subpath | Qué trae |
|---|---|
| `sebs7n-ui` | El barrel: 69 de los 102 componentes (`auth-layout` · `calendar-view` · `carousel` · `chart` · `copy-button` · `count-badge` · `country-picker` · `data-table` · `date-time-picker` · `disclosure` · `drop-target` · `drop-zone` · `file-grid` · `footer` · `input-group` · `list-index` · `marquee` · `multi-select` · `navbar-link` · `password-input` · `phone-input` · `rating` · `resizable` · `search-field` · `sidebar-toggle` · `sortable-grid` · `sortable-list` · `split-view` · `stepper` · `tags-input` · `time-picker` · `timeline` · `tree` solo por subpath), las variantes y `cn`. Ver la nota de abajo antes de usarlo. |
| `sebs7n-ui/<componente>` | 102, en kebab-case: `accordion` · `ai-button` · `alert` · `alert-dialog` · `app-shell` · `app-shell-content` · `auth-layout` · `autocomplete` · `avatar` · `badge` · `breadcrumb` · `button` · `calendar` · `calendar-view` · `card` · `carousel` · `chart` · `chat` · `checkbox` · `checkbox-group` · `collapsible` · `color-picker` · `combobox` · `command` · `context-menu` · `copy-button` · `count-badge` · `country-picker` · `data-table` · `date-picker` · `date-time-picker` · `dialog` · `disclosure` · `drawer` · `drop-target` · `drop-zone` · `dropdown-menu` · `empty-state` · `field` · `fieldset` · `file-grid` · `footer` · `form` · `hover-card` · `icon` · `input` · `input-group` · `kbd` · `label` · `list-index` · `list-row` · `marquee` · `menubar` · `meter` · `multi-select` · `navbar` · `navbar-link` · `navigation-menu` · `number-field` · `otp-field` · `page-header` · `pagination` · `password-input` · `phone-input` · `popover` · `progress` · `radio-group` · `rating` · `resizable` · `scroll-area` · `search-field` · `select` · `separator` · `sheet` · `sidebar` · `sidebar-toggle` · `skeleton` · `slider` · `sonner` · `sortable-grid` · `sortable-list` · `spinner` · `split-view` · `stat` · `stepper` · `switch` · `table` · `tabs` · `tag` · `tags-input` · `text-link` · `textarea` · `theme-switcher` · `time-picker` · `timeline` · `toggle` · `toggle-group` · `toolbar` · `tooltip` · `tree` · `user-menu` · `widget-card` |
| `sebs7n-ui/variants/<nombre>` | Clases sin `"use client"`: `badge` · `button` · `card` · `command` · `input` · `link` · `menu` · `navbar-link` · `overlay` · `segmented` · `selection` · `sidebar` · `slider` · `tag` · `toggle` |
| `sebs7n-ui/lib/<nombre>` | Funciones puras: `color` · `contrast` · `countries` · `dates` · `pagination` · `phone` · `render` · `schema` · `utils` |
| `sebs7n-ui/labels` | `LabelsProvider`, `useLabels` y `defaultLabels`: los textos internos, para traducirlos. |
| `sebs7n-ui/tokens/<archivo>.json` | Los tokens en crudo: `brands` · `geist` |
| `sebs7n-ui/theme.css` | Los tokens y el `@source` del `dist`. Es el único import obligatorio. |

<!-- /subpaths -->

## Licencia

[MIT](LICENSE).
