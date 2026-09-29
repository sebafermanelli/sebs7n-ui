# sebs7n-ui — reglas para agentes y mantenedores

Reglas generales del paquete y convenciones del repo. Lo de un componente puntual (teclado,
accesibilidad, reglas de uso) vive en `docs/site/content/meta.mjs` y sale en su página del sitio.
Este archivo no viaja en el tarball (`files` de `package.json`). Cómo correr los tests, describir
props y probar el registry: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Diseño

**Referencia: iCloud web (icloud.com), no el macOS nativo.** Valores medidos en claro y oscuro. Lo
que iCloud no tiene (Switch, Tooltip, toasts, Tree, Stepper…) se deriva de sus tokens.

- **Un solo acento sólido por pantalla.** `Button` por defecto = primario (acento); el resto
  `secondary` (gris) o `plain` (texto de acento). Los estados prendidos (Checkbox, Switch, Toggle)
  llevan brand y no cuentan. `destructive` solo si borra, siempre detrás de un `AlertDialog`.
- **Radios, sin cápsulas:** `rounded-control` 8 (botones, controles, ítem de menú), `rounded-field`
  / `rounded-item` 10 (campos, filas), `rounded-surface` / `rounded-panel` 11 (cards, diálogos),
  `rounded-menu` 12 (menús, popovers), `rounded-tag` 4. **Curvas concéntricas:** radio interior =
  exterior − distancia (menú 12 con padding 5 → ítems 8).
- **Superficies opacas en capas.** Si **es** la página, `bg-background`; si flota sobre ella,
  `bg-surface` + `shadow-menu` / `shadow-modal`. Sidebar `bg-surface-secondary` + borde
  `separator-strong`; barra global `bg-surface-header`; toolbar `bg-surface-bar`; card = cuerpo
  `bg-surface` + `shadow-widget`, cabecera `bg-surface-bar`; zona hundida `bg-fill-1` / `bg-grouped`;
  tooltip `bg-tooltip`. Hover y selección neutra: `fill-1/2/3`. Oscuro: página `#1C1C1E`, no negro.
- **Translucidez solo sobre el wallpaper** (`AppShell ambient`): barras y `Toolbar` con
  `material-translucent`; cuerpo de `Card`, `WidgetCard` y `Sidebar` con `material-translucent-body`.
  Menús, diálogos y campos siguen opacos. `prefers-reduced-transparency` / `prefers-contrast: more`
  vuelven a opaco solos. Dentro de una app, todo opaco.
- **Selección:** resaltado de menús y activo del sidebar en **gris** (`fill-2`, `fill-1`); el acento
  sólido solo para la fila elegida de una lista con foco (`text-on-selection`,
  `selectionSecondaryClassName`). Lo cubre `test/selection.test.ts`.
- **Alturas:** una escala para campos y botones, `sm` 28 · `md` 36 · `lg` 40 (íconos 28 · 36 · 40),
  texto 14. El tamaño se elige una vez por formulario; `md` es el de una app. Sin variable global
  de densidad (rompe el target táctil). Lo cubre `test/densidad-controles.test.ts`.
- **Tipografía:** roles de iCloud (`text-large-title` 48, `title-1/2/3` 28/21/19, `headline` y
  `body` 17, `subheadline` 15, `callout` 14 para el cromo, `footnote` 12, `caption` 11). La escala
  de Geist sigue en el CSS hasta 3.0 y ningún componente la usa.
- **Tokens de contraste:** texto con `label` / `label-secondary` (≥ 4,5:1). `label-tertiary` no es
  texto chico (3,69:1 en claro): solo glifos, deshabilitados y texto grande. `gray-800` no va como
  texto. **Un solo vocabulario:** en código nuevo, los tokens del paquete, no los alias de shadcn
  (`--color-card`, `--color-muted`…) ni `bg-background-100/200`.
- **Links:** con forma de botón/card, `buttonVariants()` / `cardVariants()` sobre `<a>`/`<Link>`;
  nunca `render` para links (Base UI pone `role="button"`). Texto: `linkVariants` `inline` /
  `subtle` / `row`. Un link que solo aparece en hover no existe en un celular.
- **Elegir componente:** Badge informa (lo calculó el sistema), Tag es un dato (tiene ×).
  `NavigationMenu` si navega, `DropdownMenu` si ejecuta. Dialog (tarea corta) · AlertDialog
  (irreversible) · Sheet (panel lateral) · Popover (interactivo anclado) · Tooltip (una línea) ·
  `toast()` (confirmación) · `Alert` (sigue siendo verdad). Select ≤ ~8 fijas · Combobox (valor de
  la lista) · Autocomplete (texto libre) · RadioGroup 2–5 visibles.
- **Trampas de Base UI:** triggers con `render={<Button … />}`, no `asChild`. `DropdownMenuLabel`
  dentro de `DropdownMenuGroup`. `NavigationMenuViewport` una sola vez. `AlertDialogAction` no
  cierra sola (para poder mostrar `loading`).
- **Lo que el paquete no hace, a propósito:** guardar el colapsado del sidebar, registrar atajos,
  crecer el `Textarea`, validar formularios. Es de la app.

## Accesibilidad: lo que el paquete garantiza y cómo se prueba

| Garantía | Cómo se verifica |
|---|---|
| Contraste AA: 62+ pares (texto, placeholder, atajos, selección, tooltip, acento como texto y glifo, `destructive`, Badge/Tag sólidos, contornos 3:1, foco 3:1) en claro y oscuro y con las marcas de ejemplo | `test/contrast.test.ts` (lee los hex de `colors.css` / `theme.css`), `test/brand-contrast.test.ts` (OKLCH). Función pública: `sebs7n-ui/lib/contrast` |
| Material translúcido compuesto sobre los tonos del wallpaper ≥ 4,5:1 y respaldo opaco | `test/contrast.test.ts`, `test/surfaces.test.ts` |
| Foco visible siempre: `focus-visible:focus-ring` (anillo interior 3 px en la marca), `focus:focus-border` en campos; Switch/Slider por fuera; popups enfocables también | `test/variants.test.ts`, tests de componentes (`test/components/`) |
| Nombres accesibles exigidos por tipo: `Button size="icon-*"`, `Progress`/`Meter`, `AvatarImage alt`, `ToolbarGroup`, `Tree`, `FileGrid`, `StackedMeter`, `DataTable`, `Timeline`, `SidebarGroupAction`, `TableGroupHeader colSpan` | `test/nombres-accesibles.test.tsx` (`@ts-expect-error`). Dialog/Sheet/Drawer sin título avisan por consola en desarrollo |
| Objetivos táctiles de 24×24 de área (WCAG 2.5.8), con `::after` si el dibujo es más chico | `test/variants.test.ts`, `test/surfaces.test.ts`, tests de `tag`, `combobox`, `pagination`… |
| Semántica: NavigationMenu `<nav><ul><a>`, DropdownMenu `role="menu"`, Tabs `tablist`, Switch `role="switch"`, Table nativa, AlertDialog `alertdialog`, SidebarContent `<nav>` | tests de componentes (`test/components/`) |
| Teclado: los flotantes abren con Enter/Espacio/flechas, Escape cierra y devuelve el foco; `AppShell` trae «Ir al contenido» | tests de componentes |
| Estado anunciado (`aria-current`, `aria-keyshortcuts`, `aria-busy`, `ComboboxStatus` live) y movimiento reducido (reset de `base.css` + `motion-reduce` en los recorridos) | tests de componentes |
| Errores: el estilo sale de `aria-invalid`, nunca de una clase de color; `Form` enfoca el primer inválido; `FieldError alert` para `onChange` | tests de `field` / `form` |
| Textos internos traducibles con `LabelsProvider` | `test/labels.test.tsx` |

Los deshabilitados están exentos de contraste a propósito. **LTR only:** en RTL no se rompe, queda
espejado (≈ 90 clases físicas; migrar a utilidades lógicas es todo o nada).

Le queda a la app: el texto de los `aria-label`, `Label` o `Field` en cada campo, el mensaje de
error con `match`/`validate`, un `<h1>` por página, `lang` en `<html>`, escuchar los atajos,
`role="status"` en avisos por acción, tarjetas interactivas como `<a>`/`<button>`, nunca color solo,
zoom 200 % y 320 px sin scroll horizontal.

## Convenciones del repo

- **Componentes solo por subpath:** los pesados y `chart` quedan fuera del barrel; la lista es
  `SOLO_SUBPATH` en `test/solo-subpath.test.ts` (más `lib/countries` y `lib/phone` en
  `test/api-publica.test.ts`). Componente nuevo y grande → a esa lista.
- **Peers opcionales:** `recharts` (`chart`), `@dnd-kit/core` + `sortable` + `utilities`
  (`sortable-list`, `sortable-grid`) y `embla-carousel-react` (`carousel`) están en
  `peerDependenciesMeta` como `optional`; solo los importa su subpath, nunca el barrel.
- **Barrel ≤ 56 kB gzip** (`.size-limit.js`, `npm run size`), ya en su tope; `button` por subpath
  ≤ 12,5 kB. Todo salto se explica en el PR, y subir el umbral lo aprueba Sebastián.
- **Server Components:** sin `"use client"` donde no hay estado; `variants/*` nunca lo lleva.
- **Labels:** todo texto interno pasa por `Labels` / `LabelsProvider` (español por defecto); la prop
  `labels` del componente le gana al provider, y una clave en `undefined` no pisa el default
  (`defined()` de `internal/`). **Grupos nuevos, opcionales:** con el barrel en su tope, los textos
  de un componente solo por subpath no van a `defaultLabels`: el grupo (o la clave) es opcional en
  `Labels` y el default vive en el componente (`carouselLabels`, `dropZoneLabels`,
  `sortableLabels`, `calendarViewDayLabels`…), que mezcla `{ ...locales, ...useLabels().grupo,
  ...defined(labels) }`.
- **Props que son uniones** (`Tree`, `FileGrid` por `selectionMode`): para envolverlas,
  `DistributiveOmit<Props, "…">` (exportado de `lib/utils`), no `Omit`, que aplana la unión.
- **Idioma:** texto visible en español; identificadores, rutas, archivos, ids y código nuevo en
  inglés. Comentarios en español rioplatense, explicando el porqué.
- **Demos, docs y tests genéricos:** vocabulario de facturación (facturas, clientes, equipos), sin
  contenido de ninguna app (`test/despersonalizacion.test.ts`).
- **Lo generado se genera:** `colors.css` (`npm run tokens`), la tabla de subpaths del README
  (`npm run subpaths`), y en el sitio props, `.md`, `llms.txt` y registry (`npm run generate`).
  Componente nuevo = entrada en `docs/site/content/meta.mjs` + demo en `docs/site/app/_demos/`.
- **Lo nuevo o repetido en una app se crea acá** y la app lo consume del paquete.
- **TDD:** test primero, rojo, después el código. Antes de decir «listo»: `npm test`,
  `npm run typecheck`, `npm run build`, `npm run size`, y en `docs/site` `npm test` y `npm run build`.
- **Commits:** Conventional Commits en español (`feat(drawer): …`), uno por unidad lógica.
  SemVer 2.0.0. `CHANGELOG.md` = una línea por versión.
- **Nunca push, merge a `main` ni `npm publish` sin que Sebastián lo pida.**
