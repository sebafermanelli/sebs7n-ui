La 2.0 cambia el lenguaje visual entero: de las superficies de vidrio y las cápsulas de la 1.x al de **iCloud web**. Superficies opacas en capas de gris, Inter con una escala de base 17, radios de 8 a 12 sin cápsula, foco interior, barras fijas a todo el ancho. La API es casi la misma: lo que se rompe es sobre todo **visual**, y lo que hay que tocar en el código de la app está acá, componente por componente. Todos los «antes» son contra la **1.13.1**. El detalle completo está en el [Changelog](/docs/changelog).

## En dos minutos

```bash
pnpm add sebs7n-ui@^2
pnpm remove geist
```

Sin tocar nada más la app compila, pero se ve con `system-ui` (falta Inter) y lo propio que usaba vidrio queda sin fondo. Con los tres primeros pasos de la [lista del final](#lista-para-migrar-una-app) ya se ve bien; el resto es revisar pantallas.

## Inter

`geist` deja de ser peer. `--font-sans` lee `--font-inter` (con `"Inter Variable"`, `"Inter"` y `system-ui` de respaldo) y la mono es la del sistema.

Con Next:

```tsx
// app/layout.tsx
import { Inter } from "next/font/google"

// La variable tiene que llamarse `--font-inter`: es la que lee `--font-sans`.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
```

Fuera de Next, `@fontsource-variable/inter` una vez en el entry; registra `"Inter Variable"`, que ya está en la lista:

```ts
import "@fontsource-variable/inter"
```

Sacá `GeistSans.variable` / `GeistMono.variable` del `<html>` y el `import "geist/font/…"`.

## Tokens

### Tipografía

Los componentes dejan las clases de Geist por **roles** con la escala de iCloud. Las de Geist (`text-copy-*`, `text-label-<n>`, `text-heading-*`, `text-button-*`) siguen andando en 2.x, pero están obsoletas y se van en 3.0.

| rol | px / peso | para qué |
|---|---|---|
| `text-large-title` | 48 / 600 | título grande de página |
| `text-title-1` | 28 / 600 | título de modal, de detalle |
| `text-title-2` | 21 / 600 | título de lista, de widget |
| `text-title-3` | 19 / 600 | título de grupo, de diálogo |
| `text-headline` | 17 / 600 | título de una fila |
| `text-body` | 17 / 400 | lo que se lee: párrafos, el nombre en una fila |
| `text-subheadline` | 15 / 400 | ítems del sidebar |
| `text-callout` | 14 / 400 | el chrome: menús, campos, botones, metadatos |
| `text-footnote` | 12 / 400 | snippets, badges |
| `text-caption` | 11 / 400 | contadores, pie legal |
| `text-mono-body` · `text-mono-callout` | 14 · 12 | código, atajos |

La regla para pasar las de Geist: **la prosa a `text-body` (17), el chrome a `text-callout` (14), los metadatos a `text-footnote` (12)**.

| Geist | 2.0 |
|---|---|
| `text-heading-64/48/40` | `text-large-title` |
| `text-heading-32` | `text-title-1` |
| `text-heading-24` | `text-title-2` |
| `text-heading-20` | `text-title-3` |
| `text-heading-16` | `text-headline` |
| `text-copy-18`, `text-copy-16` | `text-body` |
| `text-copy-14`, `text-copy-13`, `text-label-14`, `text-label-13` | `text-callout` |
| `text-button-14` | `text-callout font-medium` |
| `text-label-12` | `text-footnote` |
| `text-copy-13-mono`, `text-label-13-mono` | `text-mono-body` o `text-mono-callout` |

### Radios

| token | 1.13.1 | 2.0 | qué |
|---|---|---|---|
| `--radius-control` | 10 | **8** | botones, toggles, segmentado |
| `--radius-field` | 9999 (cápsula) | **10** | campos |
| `--radius-surface` | 20 | **11** | cards |
| `--radius-panel` | 26 | **11** | diálogos, hojas |
| `--radius-item` | — | 10 | ítems del sidebar, filas |
| `--radius-menu` | — | 12 | menús, popovers, toast |
| `--radius-menu-item` | — | 8 | ítem de menú |
| `--radius-tag` | — | 4 | badge, tag, kbd |

Sin cápsula: un `rounded-full` propio en un botón o un campo queda distinto a los del paquete. Usá `rounded-control` o `rounded-field`.

### Superficies

El vidrio se va. Una clase que ya no existe **no falla**: el elemento queda sin fondo. Buscá en la app `glass`, `sheen`, `thumb-lens` y `shadow-button`.

| 1.13.1 | 2.0 |
|---|---|
| `glass`, `glass glass-thick` (popover, modal, card propia) | `bg-surface shadow-menu` / `bg-surface shadow-modal` |
| `glass` en una barra o un sidebar propio | `bg-surface-bar`, `bg-surface-header`, `bg-surface-secondary` |
| `glass-control` (campo, chip propio) | `bg-fill-1` |
| `glass-dense`, un grupo | `bg-grouped` |
| `glass-rim`, `sheen`, `thumb-lens` | nada: la sombra ya trae el filo |
| vidrio sobre un wallpaper | `material-translucent` (barras) · `material-translucent-body` (cards, sidebar) |
| `shadow-button`, `shadow-button-accent`, `shadow-chip`, `shadow-track` | nada: los controles son planos |
| `text-gray-1000` · `text-gray-900` · `text-gray-700` | `text-label` · `text-label-secondary` · `text-label-tertiary` |
| `bg-gray-alpha-100/200/300` | `bg-fill-1/2/3` |
| `border-gray-alpha-400` | `border-separator` |

La paleta de Geist sigue disponible: lo de la derecha es lo que usan los componentes y lo que conviene para que la app no desentone. **La página oscura pasa de `#000` a `#1C1C1E`.** Las variables `--glass`, `--glass-tint` y `--sf-glass-*` ya no existen: si las pisabas en `:root`, borralas.

### Foco y selección

- `focus-ring` es un anillo **interior** de 3 px (antes por fuera, 2 + 2). Un `outline` propio al lado se ve distinto; usá `focus-visible:focus-ring`. Sobre un fondo de marca, `focus-ring-inverse`.
- El resaltado de menús y el activo del sidebar son **grises** (`fill-2`, `fill-1`), no el tinte de marca. El acento sólido queda para la fila elegida de una lista con foco.

### Alturas

Una sola escala para campos y botones:

| tamaño | 1.13.1 | 2.0 | con el dedo |
|---|---|---|---|
| `sm` | 32 | **28** | 36 (campos) · 44 (botones) |
| `md` | 40 | **36** | 44 |
| `lg` | 48 | **40** | 44 |
| `icon-sm` · `icon-md` · `icon-lg` | 32 · 40 · 48 | **28 · 36 · 40** | 44 |

Texto 14 e íconos 16 en los tres (el `lg` ya no sube de tamaño de letra). **El `lg` es el que más cambia**: un CTA grande, un campo alineado con una imagen o una fila de alto fijo cambian de alto. Un botón al lado de un campo lleva el mismo `size`. Deshabilitado es opacidad .4 en todos.

## Componentes

### Button

| 1.13.1 | 2.0 |
|---|---|
| `default` (negro) | `default` = **acento sólido** |
| `accent` | `default` (`accent` es alias obsoleto) |
| `outline` | **no existe** → `secondary` |
| `secondary` | `secondary` (gris) |
| `ghost` | `ghost` (texto `label`) |
| `destructive` (rojo sólido) | `destructive` = **gris con texto rojo** |
| — | `plain` (texto semibold en el acento) |
| — | `destructive-plain` (texto rojo, sin fondo) |

```tsx
// Antes
<Button variant="outline">Cancelar</Button>
<Button variant="accent">Guardar</Button>
<Button>Exportar</Button>

// Después
<Button variant="secondary">Cancelar</Button>
<Button>Guardar</Button>
<Button variant="plain">Exportar</Button>
```

`shape` se fue: borrá `shape="pill"` y `shape="rect"`. El botón tiene una sola forma, el rectángulo de radio 8; si un CTA de hero necesitaba más aire, `className="px-6"`.

Si en una pantalla convivían `default` (negro) y `accent`, ahora son dos acentos: el que no es la acción principal pasa a `secondary` o `plain`. El negro a propósito: `className="bg-label text-surface hover:bg-label/85"`.

### Tabs

El default pasa de `segmented` a **`line`** (la línea de Ajustes: 17 px, subrayado de 1 px, 60 de alto).

```tsx
// Antes: sin variant era el segmentado
<TabsList>…</TabsList>

// Después: para seguir con el segmentado
<TabsList variant="segmented">…</TabsList>
```

La lista ya no lleva `group/tabs-list`: un estilo propio con `group-data-[variant=line]/tabs-list:` pasa a `in-data-[variant=line]:`.

### ToggleGroup y Toggle

`ToggleGroup` es el **segmentado** (pista gris, segmentos del mismo ancho, el prendido en acento sólido) y ya no envuelve en varias filas. Para filtros sueltos que envuelven:

```tsx
// Antes
<ToggleGroup multiple>{estados.map((e) => <ToggleGroupItem key={e} value={e}>{e}</ToggleGroupItem>)}</ToggleGroup>

// Después
<div className="flex flex-wrap gap-2">
  {estados.map((e) => <Toggle key={e} pressed={activos.has(e)} onPressedChange={() => alternar(e)}>{e}</Toggle>)}
</div>
```

`Toggle` suelto es un token gris sin borde que pasa al acento sólido prendido (antes borde punteado).

### Card

La Card es el **widget de iCloud**: cuerpo `surface` con sombra, la cabecera es una franja de otro tono, el pie ya no tiene línea.

```tsx
// Antes
<Card>
  <CardHeader>
    <CardTitle>Facturación</CardTitle>
    <CardDescription>Septiembre</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter><Button variant="outline">Ver todo</Button></CardFooter>
</Card>

// Después
<Card>
  <CardHeader icon={<ReceiptIcon />}>
    <CardTitle>Facturación</CardTitle>
    <CardDescription>Septiembre</CardDescription>
    <CardAction><Button variant="plain" size="sm">Ver todo</Button></CardAction>
  </CardHeader>
  <CardContent>
    <CardRow title="Emitidas" description="12 comprobantes" trailing="$ 1.284.000" />
  </CardContent>
</Card>
```

Para el grupo plano de antes, `variant="subtle"` o `className="bg-grouped shadow-none"`. `WidgetCard` (nuevo) arma todo esto de una con props.

### Table

La tabla es la **lista de Drive**: sin caja, filas de 41 (antes 48), celdas con 10 de padding, la primera en 17 y el resto en 14 gris, selección redondeada. Es `border-separate` y el fondo de hover y selección vive en las celdas:

```tsx
// Antes: el borde y el fondo en la fila
<TableRow className="border-b hover:bg-gray-alpha-100">…</TableRow>

// Después: en las celdas
<TableRow className="[&>td]:border-b hover:[&>td]:bg-fill-1">…</TableRow>
```

Grupos: **un `TableBody` por grupo**, cada uno con su `TableGroupHeader`, que exige `colSpan`:

```tsx
<Table aria-label="Facturas">
  <TableHeader>…</TableHeader>
  {grupos.map((grupo) => (
    <TableBody key={grupo.estado}>
      <TableGroupHeader colSpan={4} count={`${grupo.filas.length} facturas`}>
        {grupo.estado}
      </TableGroupHeader>
      {grupo.filas.map((fila) => <TableRow key={fila.id}>…</TableRow>)}
    </TableBody>
  ))}
</Table>
```

Para orden, búsqueda, páginas y selección ya armados: `DataTable` (`sebs7n-ui/data-table`).

### AlertDialog

La alerta de iCloud: 450 px, **todo centrado**, dos botones iguales a todo el ancho (con tres o más, apilados). El comportamiento del botón por defecto cambia:

| | 1.13.1 | 2.0 |
|---|---|---|
| con `AlertDialogAction variant="destructive"` | acción en rojo sólido, foco de Base UI | **«Cancelar» en el acento y con el foco**; la acción, gris con texto rojo |
| sin destructiva | acción negra | acción en el acento **y con el foco** (Return la dispara) |

```tsx
<AlertDialogContent>
  <AlertDialogIcon><TrashIcon strokeWidth={1.5} /></AlertDialogIcon>
  <AlertDialogHeader>
    <AlertDialogTitle>¿Anular la factura 0012?</AlertDialogTitle>
    <AlertDialogDescription>No se puede deshacer.</AlertDialogDescription>
  </AlertDialogHeader>
  <AlertDialogFooter>
    <AlertDialogCancel>Cancelar</AlertDialogCancel>
    <AlertDialogAction variant="destructive">Anular</AlertDialogAction>
  </AlertDialogFooter>
</AlertDialogContent>
```

Lo destructivo lo detecta `AlertDialogAction variant="destructive"`: un `<Button variant="destructive">` suelto en el pie no cambia ni el foco ni el acento. `AlertDialogIcon` es opcional. Para textos largos, `AlertDialogDescription align="start"`.

**Dialog** lleva la X arriba a la izquierda y el título centrado; el pie, a la derecha y sin línea. **Sheet** y **Drawer** son opacos, con radio 11 en las esquinas de adentro.

### Navbar, Sidebar y AppShell

No hay más flotantes. `variant="floating"` (el default de Sidebar y AppShell en 1.x) no existe; `variant="bar"` se acepta sin efecto y se va en 3.0.

```tsx
// Antes
<AppShell variant="floating" sidebar={<Sidebar variant="floating">…</Sidebar>}>

// Después
<AppShell header={<BarraGlobal />} sidebar={<Sidebar>…</Sidebar>}>
```

- **Sidebar**: lista de fuentes a ras, ítems 32 en 15 px, ícono en el acento, activo gris. Secciones que se abren y cierran con `SidebarGroup collapsible`, y el «+» de una sección con `SidebarGroupAction` (exige `aria-label`).
- **Navbar**: barra fija de 44 a todo el ancho, **translúcida con desenfoque desde arriba** (el contenido pasa por abajo, como en la home de iCloud; antes transparente hasta scrollear). Con menos transparencia es opaca. `useNavbar().floating` ya no existe.
- **La barra de `AppShell`** (`header` y la del teléfono) es **opaca**, como en Mail o Drive.
- **AppShell**: `header` (nuevo) es la barra global arriba de todo; en el teléfono la barra mide 44.
- `Sidebar` y `Navbar` ya no ponen `data-variant`: un estilo propio colgado de `[data-variant=floating]` pasa a `data-slot`.

### Toolbar

`variant="bar"` es el default: a todo el ancho, 44, con borde abajo (antes una cápsula de vidrio del ancho del contenido). `glass` es alias de `bar`; `plain` sigue igual. Los botones de la toolbar son `plain` (glifo en el acento).

```tsx
// Antes: la cápsula flotante
<Toolbar aria-label="Acciones">…</Toolbar>

// Después: igual en el código; si querías la fila sin barra
<Toolbar aria-label="Acciones" variant="plain">…</Toolbar>
```

### Badge y Tag

Etiquetas **sólidas y rectangulares** (radio 4, antes cápsula con borde), de 20 / 16 (antes 24 / 20). El default pasa de `subtle` a `solid`; `subtle` se acepta y dibuja lo mismo. `Badge variant="count"` (nuevo) es el contador circular de iCloud.

```tsx
// Antes: tenue por defecto
<Badge color="green">Pagada</Badge>

// Después: lleno (misma línea de código); el negro invertido de antes
<Badge className="bg-gray-1000 text-background-100">Borrador</Badge>
```

### Slider

Pista de 2 px en el color del texto, perilla de 14 con borde y centro de la superficie (antes pista de 4/6 en la marca y perilla blanca de 16/20). El foco va por fuera. Si armabas un slider propio con `sliderThumbClassName`, ahora escala la perilla de 14.

### Checkbox, Radio y Switch

Marcados sin borde ni sombra, deshabilitados a .4. `Checkbox shape="circle"` (nuevo) es el check de Recordatorios, de 22. El Switch lleva el foco por fuera de la pista.

### Tooltip

Gris oscuro en los dos temas (`bg-tooltip`), 12 px, radio 6, sin flecha. Antes era negro en claro y blanco en oscuro, de 13. La API no cambia.

### Command

Nuevo en 2.0: la búsqueda de iCloud (un campo de búsqueda y resultados como filas de menú), no una paleta de Spotlight. Si la app tenía una paleta propia:

```tsx
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "sebs7n-ui/command"

<CommandDialog open={abierto} onOpenChange={setAbierto}>
  <CommandInput placeholder="Buscar facturas" />
  <CommandList>
    <CommandGroup heading="Clientes">
      <CommandItem value="acme" keywords={["30-71234567-8"]} description="12 facturas" onSelect={abrir}>
        Acme S.A.
      </CommandItem>
    </CommandGroup>
  </CommandList>
  <CommandEmpty />
</CommandDialog>
```

`CommandEmpty` va al lado de `CommandList`, no adentro. Tab sale del campo (no hay autocompletado en línea).

### Menús, Select y Combobox

Sin cambios de API. Ítems de 30 (antes 32), resaltado gris, el tilde en un círculo de acento a la derecha, `inset` alinea con los ítems con ícono (`pl-9`), destructivo en rojo, deshabilitado al 30 %. `Select` abre con `alignItemWithTrigger` (la opción elegida sobre el campo): para el de 1.x, `alignItemWithTrigger={false}`. Nuevo: `external` en un ítem pone ↗ y el texto en el acento.

### Otros

- **Accordion/Collapsible**: filas de 44, chevron › que gira a ⌄.
- **Skeleton**: brillo que cruza; `animate-skeleton` ya no pone `position: relative`.
- **Avatar**: `sm` pasa a 28; `xl` (80) es nuevo; el fallback es un monograma gris.
- **NumberField** mide lo que el número: `className="w-full"` para el ancho entero.
- **Calendar**: días de 28 (40 con el dedo).

## Solo por subpath

Todo lo que estaba en el barrel en 1.13.1 sigue ahí. Los componentes nuevos grandes van **solo por su ruta** (el barrel tiene un tope de 55 kB gzip):

| Componente | Import |
|---|---|
| `Chart` (como en 1.x, por el peer `recharts`) | `sebs7n-ui/chart` |
| `Tree` | `sebs7n-ui/tree` |
| `SplitView` | `sebs7n-ui/split-view` |
| `FileGrid` | `sebs7n-ui/file-grid` |
| `CalendarView` | `sebs7n-ui/calendar-view` |
| `Stepper` | `sebs7n-ui/stepper` |
| `DataTable` | `sebs7n-ui/data-table` |
| `InputGroup` | `sebs7n-ui/input-group` |
| `MultiSelect` | `sebs7n-ui/multi-select` |
| `Timeline` | `sebs7n-ui/timeline` |
| `Resizable` | `sebs7n-ui/resizable` |

`import { Tree } from "sebs7n-ui"` no compila.

## Nombres accesibles obligatorios

El tipo exige el nombre; sin él no compila:

| Componente | Qué pide |
|---|---|
| `Tree`, `FileGrid`, `StackedMeter`, `DataTable`, `Timeline` | `aria-label` o `aria-labelledby` |
| `SidebarGroupAction` | `aria-label` («Nueva carpeta») |
| `TableGroupHeader` | `colSpan` (las columnas de la tabla) |
| Button de solo ícono, `ToolbarButton`, `Progress` y `Meter` sin `label` | como en 1.x |

## Lista para migrar una app

Sin codemod: una pasada con el buscador del editor y una recorrida por las pantallas.

1. `pnpm add sebs7n-ui@^2`, `pnpm remove geist`, cargar Inter con `variable: "--font-inter"`.
2. Buscar `glass`, `sheen`, `thumb-lens`, `shadow-button`, `shadow-chip`, `shadow-track`, `--glass` y reemplazar con la tabla de [Superficies](#superficies).
3. Buscar `variant="outline"` → `"secondary"` y `variant="floating"` → borrarlo. `variant="accent"` → sin `variant`.
4. `<TabsList>` sin `variant` que tenía que ser segmentado → `variant="segmented"`.
5. `<ToggleGroup>` que envolvía filtros → `Toggle` sueltos en un `flex-wrap`.
6. `size="lg"` en botones y campos: mirar el alto (48 → 40).
7. Tablas: bordes y fondos del `<tr>` a las celdas; grupos en un `TableBody` cada uno.
8. Alertas destructivas: que la acción sea `AlertDialogAction variant="destructive"`.
9. `rounded-full` propio en botones o campos → `rounded-control` / `rounded-field`.
10. `text-copy-*`, `text-label-<n>`, `text-heading-*`, `text-button-*` → roles (no rompe hoy; se va en 3.0).
11. `useNavbar().floating`, `[data-variant=floating]` → borrar o pasar a `data-slot`.
12. Recorrer en claro y oscuro: la página, un menú abierto, un diálogo, un formulario, una tabla y el sidebar. Tabular una pantalla: el foco es el anillo interior de 3 px.
