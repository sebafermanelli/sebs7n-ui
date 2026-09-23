# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: SemVer 2.0.0.

## [Unreleased]

## [0.1.1] - 2026-09-23

### Changed

- `Sheet` va de punta a punta: se le sacaron las esquinas redondeadas de los
  cuatro lados. Un radio contra el borde de la pantalla se lee como un recorte
  mal hecho.
- `TabsTrigger` deja de pintar una pastilla gris en hover: una pestaña no es un
  botón, así que al pasar por encima solo se aclara el texto. La pestaña activa
  la sigue marcando la línea de abajo, y el pseudo-elemento queda solo para el
  anillo de foco.

## [0.1.0] - 2026-09-22

Primera versión pública de `sebs7n-ui`: un design system para React que pone
**Geist** —el lenguaje visual de Vercel— sobre las primitivas de **shadcn/ui
`base-nova`** (Base UI), empaquetado como una sola dependencia.

### Added

- **37 componentes** accesibles sobre Base UI, cada uno con su propio entry
  point (`sebs7n-ui/<componente>`), más el barrel `sebs7n-ui`. Primitivas de
  formulario (Input, Textarea, Label, Select, Checkbox, RadioGroup, Switch,
  Toggle, ToggleGroup, Combobox, Autocomplete), superposiciones (Dialog,
  AlertDialog, Sheet, Popover, Tooltip, DropdownMenu, Toaster), navegación
  (NavigationMenu, Tabs, Sidebar, UserMenu, ThemeSwitcher) y contenido (Card,
  Table, Badge, Avatar, Alert, Separator, Skeleton, Stat, Kbd, EmptyState,
  PageHeader, Button), más el shell de aplicación (`AppShell`,
  `AppShellContent`).
- **Tokens de Geist** como variables CSS y utilidades de Tailwind v4, sin
  `tailwind.config`: 9 escalas de 10 pasos (`gray`, `gray-alpha`, `blue`, `red`,
  `amber`, `green`, `teal`, `purple`, `pink`) en claro y oscuro, radios, sombras
  (`tooltip`, `menu`, `modal`), anillo de foco y foco de inputs.
- **Color de marca en tres variables CSS.** La app define `--brand-base`,
  `--brand-base-dark` y `--brand-contrast-dark`; de ahí sale la escala
  `brand-100..1000` con color relativo de CSS y el `--brand-contrast` del texto
  sobre `brand-700`. `tokens/brands.json` trae cuatro marcas de ejemplo (`teal`,
  `terracotta`, `emerald`, `blue`) y no hace falta tocarlo.
- **Escala tipográfica con corrección óptica.** `text-heading-*`, `text-copy-*`,
  `text-label-*` y `text-button-*`; el peso de los `heading` baja a medida que
  sube el tamaño (72 → 400 … 16 → 600, 14 → 600) en lugar de quedar fijo en 600,
  que es lo que se mide en vercel.com. Requiere Geist como fuente variable
  (rango `100 900`).
- **Semántica de fondos en tres roles, tres tokens.** `--sf-background` es la
  página, `--sf-background-100` la superficie que flota sobre ella (input, popup,
  card, sheet) y `--sf-background-200` el fondo sutil o banda (sidebar,
  `thead`/`tfoot`, `EmptyState`). En oscuro las superficies son `#0a0a0a` sobre
  una página `#000000`, así que se despegan.
- **Variantes exportadas aparte** para componer sin montar el componente:
  `buttonVariants`, `badgeVariants`, `cardVariants`, `linkVariants`,
  `toggleVariants`, `sidebarItemVariants`, `menuItemClassName` /
  `menuPopupClassName` e `inputShell*ClassName`, en `sebs7n-ui/variants/*`.
  `linkVariants` cubre los links de texto (`inline`, `subtle`, `row`), que no
  tienen forma de botón.
- **`NavigationMenu`** sobre `@base-ui/react/navigation-menu`: navegación de
  sitio con paneles animados, con `keepMounted` para que los links estén en el
  HTML del server y un crawler los vea.
- **Server Components por defecto.** `"use client"` solo donde hace falta
  estado; el resto (variantes, `AppShellContent`, `lib/utils`) sirve en el
  server. Los entry points por módulo dejan que Next pode el bundle cliente.
- **Contraste AA verificado por tests**, no a ojo: se calcula con la fórmula de
  WCAG 2.1 sobre `tokens/geist.json` y falla si un par cruza 4,5:1. También hay
  tests de tokens, de tipografía, de los componentes, del build y del contenido
  del tarball.
- **`test/despersonalizacion.test.ts`**: falla si el nombre de una de las
  aplicaciones privadas vuelve a entrar en `src/`, `tokens/`, `README.md` o
  `package.json`.
- **Sitio de documentación** (`docs/site`) con las demos ejecutables de cada
  componente, la tabla de props generada desde el TypeScript, una superficie
  para agentes (`.md` por página, `llms.txt`, `llms-full.txt`) y una registry
  con formato shadcn para sacar un componente y editarlo (`shadcn add <url>`).
- Metadata de publicación: `license` MIT + `LICENSE`, `keywords`, `author`,
  `repository`, `homepage`, `bugs` y `publishConfig.access: public`.

### Known issues

- **i18n pendiente.** Los textos de interfaz vienen en español y se ajustan
  componente por componente con la prop `labels` (`Combobox`, `Autocomplete`,
  `ThemeSwitcher`, `UserMenu`, `AppShell`). No hay todavía un mecanismo global —un
  provider de locale o un diccionario único—, así que una app en otro idioma
  tiene que pasar `labels` en cada punto de uso.
- Todavía no está publicado en npm: se distribuye como tarball (`npm pack`) o
  desde GitHub.
