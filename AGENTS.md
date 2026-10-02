# sebs7n-ui — reglas para agentes y mantenedores

Reglas generales del paquete y convenciones del repo. Lo de un componente puntual (teclado,
accesibilidad, reglas de uso) vive en `docs/site/content/meta.mjs` y sale en su página del sitio.
Este archivo no viaja en el tarball (`files` de `package.json`). Cómo correr los tests, describir
props y probar el registry: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Diseño

Las reglas de diseño son **las mismas para quien mantiene el paquete y para quien lo usa**, así que
viven en un solo lugar: [`docs/site/content/pages/guia-agentes.md`](docs/site/content/pages/guia-agentes.md).
De ahí salen la página `/docs/guia-agentes`, la primera entrada de `llms.txt` y `agents/guia.md` del
tarball. Una regla de diseño nueva o cambiada se escribe ahí.

@docs/site/content/pages/guia-agentes.md

Qué test cubre cada regla:

| Regla | Test |
|---|---|
| Selección en gris; acento solo con foco | `test/selection.test.ts` |
| Escala de alturas `sm`/`md`/`lg` | `test/densidad-controles.test.ts` |
| Popups contenidos y hoja en el teléfono | `test/components/popups-mobile.test.tsx` |
| Contraste de los tokens de texto | `test/contrast.test.ts` |

Solo para quien construye componentes:

- **Un popup nuevo con Positioner** hace lo mismo que los demás: `collisionPadding={8}`,
  `max-w-(--available-width)` y `max-h-(--available-height)` en la superficie, y al costado
  (`side="right"`) sin lugar cae arriba o abajo (`internal/collision.ts`). Si es de contenido, se
  adapta a la hoja de abajo en el teléfono con `internal/adaptive-popover.tsx`.
- **La escala tipográfica de Geist** sigue en el CSS hasta 3.0 y ningún componente la usa: lo
  nuevo va con los roles de iCloud.

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
- **Base UI internals:** los controles propios se registran en `Field`/`Form` con
  `internal/field-control.ts`, que usa `@base-ui/react/internals/*` (no documentados). Por eso el peer
  está acotado a la menor probada (`>=1.8.0 <1.9.0`) y `test/base-ui-internals.test.tsx` lo
  verifica: al subir Base UI, correr los tests y recién ahí abrir el rango a la nueva menor.
- **Barrel ≤ 60 kB gzip** (`.size-limit.js`, `npm run size`), ya en su tope; `button` por subpath
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
