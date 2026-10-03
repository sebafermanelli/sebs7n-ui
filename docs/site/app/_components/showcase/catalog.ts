/** Las cuatro pantallas de ejemplo, en el orden del selector. */
export const SHOWCASES = [
  { id: "home", label: "Inicio" },
  { id: "files", label: "Archivos" },
  { id: "settings", label: "Ajustes" },
  { id: "mail", label: "Correo" }
] as const

export type ShowcaseId = (typeof SHOWCASES)[number]["id"]

/**
 * Un componente (o hook) del paquete que usa una pantalla. De este dato salen los links de «Cómo se arma»
 * (`/docs/components/<slug>`) y lo que verifica `test/playground-defaults.test.ts`: que el subpath exista en
 * `exports`, que el nombre esté exportado y que la página del componente esté en el sitio.
 */
export type Pieza = { name: string; from: string; slug: string }

export type Receta = {
  /** Lo que usa la pantalla, en el orden en que aparece. */
  piezas: Pieza[]
  /** La composición principal, lista para copiar: un `.tsx` corto. Sus imports de `sebs7n-ui/*` se verifican. */
  code: string
  /** Las reglas por defecto que la pantalla ilustra. */
  reglas: string[]
}

const HOME = `import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { useWidgetLayout } from "sebs7n-ui/lib/widget-layout"
import { MetricChart } from "sebs7n-ui/metric-chart"
import { PageHeader, PageHeaderActions, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Sparkline } from "sebs7n-ui/sparkline"
import { StatGrid } from "sebs7n-ui/stat-grid"
import { WidgetBoard, WidgetBoardEditButton } from "sebs7n-ui/widget-board"

// Cada widget: id estable, título y la card. El orden y los visibles se guardan solos.
const widgets = [{ id: "invoices", title: "Facturas", render: () => <InvoicesCard /> }]

export default function Home() {
  const layout = useWidgetLayout({ storageKey: "home:widgets", widgets })
  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Inicio</PageHeaderTitle>
        <PageHeaderActions>
          <WidgetBoardEditButton layout={layout} />
          <Button>Nueva factura</Button>
        </PageHeaderActions>
      </PageHeader>
      <StatGrid
        items={[
          { label: "Facturado", value: "$ 4,8 M", delta: "+12,4 %", trend: "up", chart: <MetricChart aria-label="Facturado" data={serie} /> },
          { label: "Cobrado", value: "91,6 %", chart: <Sparkline values={[70, 76, 74, 82, 88, 91.6]} /> }
        ]}
      />
      <WidgetBoard layout={layout} />
    </AppShellContent>
  )
}
`

const FILES = `import { BulkActionsBar } from "sebs7n-ui/bulk-actions-bar"
import { Button } from "sebs7n-ui/button"
import { FileGrid } from "sebs7n-ui/file-grid"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { SearchField } from "sebs7n-ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"

// Todo de la barra va en sm. Con una selección, sus acciones ocupan el lugar de la vista.
<FilterBar
  role="search"
  search={<SearchField aria-label="Buscar" onValueChange={setQuery} size="sm" value={query} />}
  filters={
    <Select items={TYPES} onValueChange={setType} value={type}>
      <SelectTrigger aria-label="Tipo" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{/* SelectItem por tipo */}</SelectContent>
    </Select>
  }
  actions={
    selected.length > 0 ? (
      <BulkActionsBar count={selected.length} onClear={() => setSelected([])}>
        <Button size="sm" variant="secondary">Descargar</Button>
      </BulkActionsBar>
    ) : (
      <ToggleGroup aria-label="Vista" onValueChange={(v) => setView(v[0])} size="sm" value={[view]}>
        <ToggleGroupItem value="grid">Íconos</ToggleGroupItem>
        <ToggleGroupItem value="list">Lista</ToggleGroupItem>
      </ToggleGroup>
    )
  }
/>
<FileGrid aria-label="Archivos" items={items} onSelectedChange={setSelected} selected={selected} selectionMode="multiple" />
`

const SETTINGS = `import { Meter } from "sebs7n-ui/meter"
import { PageHeader, PageHeaderTitle } from "sebs7n-ui/page-header"
import { SettingsGrid, SettingsSection } from "sebs7n-ui/settings-section"
import { Card } from "sebs7n-ui/card"
import { PromoCard, PromoCardLink } from "sebs7n-ui/widget-card"

<PageHeader>
  <PageHeaderTitle>Ajustes</PageHeaderTitle>
</PageHeader>

<div className="grid gap-5 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
  <PromoCard chip="12 de 15 usuarios" title="Plan Pro">
    <PromoCardLink render={<a href="/plan" />}>Cambiar de plan</PromoCardLink>
  </PromoCard>
  <Card className="flex flex-col gap-4 p-6">
    <Meter label="Cupo de facturas" max={500} showValue value={412} />
    <Meter label="Usuarios" max={15} showValue value={12} />
  </Card>
</div>

{/* Una columna; dos desde 48 rem del contenido. Las cabeceras de una fila quedan alineadas. */}
<SettingsGrid>
  <SettingsSection description="Razón social y contacto." title="Cuenta">{/* filas */}</SettingsSection>
  <SettingsSection description="Qué recibe el cliente." title="Envío">{/* filas */}</SettingsSection>
</SettingsGrid>
`

const MAIL = `import { BulkActionsBar } from "sebs7n-ui/bulk-actions-bar"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { List, ListRow } from "sebs7n-ui/list-row"
import { SearchField } from "sebs7n-ui/search-field"
import { SplitView, SplitViewDetail, SplitViewList, SplitViewSidebar } from "sebs7n-ui/split-view"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"

// Tres paneles con ancho; con poco, uno por vez. Lo decide el ancho de la caja, no el de la ventana.
<SplitView onPaneChange={setPane} pane={pane}>
  <SplitViewSidebar aria-label="Buzones">{/* Sidebar */}</SplitViewSidebar>
  <SplitViewList aria-label="Mensajes">
    <FilterBar
      role="search"
      search={<SearchField aria-label="Buscar" onValueChange={setQuery} size="sm" value={query} />}
      filters={
        <ToggleGroup aria-label="Mostrar" onValueChange={(v) => setFilter(v[0])} size="sm" value={[filter]}>
          <ToggleGroupItem value="all">Todos</ToggleGroupItem>
          <ToggleGroupItem value="unread">Sin leer</ToggleGroupItem>
        </ToggleGroup>
      }
      actions={marked.length > 0 ? <BulkActionsBar count={marked.length} onClear={() => setMarked([])} /> : undefined}
    />
    <List aria-label="Mensajes">
      <ListRow description={subject} onClick={open} selected={current === id} title={from} trailing={time} />
    </List>
  </SplitViewList>
  <SplitViewDetail aria-label="Mensaje">{/* el mensaje */}</SplitViewDetail>
</SplitView>
`

const SHELL = `import { AiButton, AiIcon } from "sebs7n-ui/ai-button"
import { AppShell } from "sebs7n-ui/app-shell"
import { Chat, ChatInput, ChatMessages } from "sebs7n-ui/chat"
import { CommandPalette } from "sebs7n-ui/command-palette"
import { useKeySequence } from "sebs7n-ui/lib/use-key-sequence"
import { NotificationsPopover } from "sebs7n-ui/notifications-popover"
import { ShortcutsDialog } from "sebs7n-ui/shortcuts-dialog"

// Los atajos globales los registra la app: ningún componente escucha el teclado.
useKeySequence({ "?": () => setHelp(true), "g i": () => go("/inicio") })

<AppShell
  ambient
  header={
    <>
      <span className="font-medium">Facturación</span>
      <div className="ml-auto flex items-center gap-1">
        <AiButton aria-expanded={open} onClick={() => setOpen(!open)} size="sm">
          <AiIcon />
          Preguntar a la IA
        </AiButton>
        <NotificationsPopover items={items} onReadChange={setRead} read={read} />
      </div>
    </>
  }
  sidebar={<AppSidebar />}
  // El panel empuja el contenido en vez de taparlo; < lg pasa a ser una hoja. Solo se monta abierto.
  aside={<Assistant />}
  asideLabel="Asistente"
  asideOpen={open}
  onAsideOpenChange={setOpen}
>
  {children}
</AppShell>
<CommandPalette groups={groups} onOpenChange={setPaletteOpen} open={paletteOpen} />
<ShortcutsDialog onOpenChange={setHelp} open={help} shortcuts={SHORTCUTS} />
`

export const RECETAS: Record<ShowcaseId, Receta> = {
  home: {
    piezas: [
      { name: "PageHeader", from: "sebs7n-ui/page-header", slug: "page-header" },
      { name: "StatGrid", from: "sebs7n-ui/stat-grid", slug: "stat-grid" },
      { name: "MetricChart", from: "sebs7n-ui/metric-chart", slug: "metric-chart" },
      { name: "Sparkline", from: "sebs7n-ui/sparkline", slug: "sparkline" },
      { name: "WidgetBoard", from: "sebs7n-ui/widget-board", slug: "widget-board" },
      { name: "WidgetCard", from: "sebs7n-ui/widget-card", slug: "widget-card" },
      { name: "AppShellContent", from: "sebs7n-ui/app-shell-content", slug: "app-shell-content" }
    ],
    code: HOME,
    reglas: [
      "Un solo botón primario: «Nueva factura». «Editar» es secundario.",
      "Métricas y widgets miden el ancho del contenido (container queries): 1 columna, 2 desde @xl, 4 desde @4xl.",
      "El orden y los widgets visibles se guardan solos; el arrastre se carga recién al apretar «Editar»."
    ]
  },
  files: {
    piezas: [
      { name: "FilterBar", from: "sebs7n-ui/filter-bar", slug: "filter-bar" },
      { name: "SearchField", from: "sebs7n-ui/search-field", slug: "search-field" },
      { name: "Select", from: "sebs7n-ui/select", slug: "select" },
      { name: "ToggleGroup", from: "sebs7n-ui/toggle-group", slug: "toggle-group" },
      { name: "BulkActionsBar", from: "sebs7n-ui/bulk-actions-bar", slug: "bulk-actions-bar" },
      { name: "FileGrid", from: "sebs7n-ui/file-grid", slug: "file-grid" },
      { name: "SplitView", from: "sebs7n-ui/split-view", slug: "split-view" }
    ],
    code: FILES,
    reglas: [
      "Las barras de filtros van en sm: búsqueda, Select y ToggleGroup del mismo tamaño.",
      "La selección es gris y la BulkActionsBar toma el lugar de la vista mientras hay elegidos.",
      "Los paneles se acomodan al ancho de su caja: tres, dos o uno por vez."
    ]
  },
  settings: {
    piezas: [
      { name: "SettingsGrid", from: "sebs7n-ui/settings-section", slug: "settings-section" },
      { name: "SettingsSection", from: "sebs7n-ui/settings-section", slug: "settings-section" },
      { name: "PromoCard", from: "sebs7n-ui/widget-card", slug: "widget-card" },
      { name: "Meter", from: "sebs7n-ui/meter", slug: "meter" },
      { name: "PageHeader", from: "sebs7n-ui/page-header", slug: "page-header" },
      { name: "Card", from: "sebs7n-ui/card", slug: "card" }
    ],
    code: SETTINGS,
    reglas: [
      "Configuración en SettingsSection dentro de una SettingsGrid: una columna y dos desde 48 rem del contenido.",
      "El plan es una PromoCard y, al lado, el uso con Meter: cifras reales, un Meter por cupo.",
      "Un solo botón primario («Guardar cambios»); lo demás son filas."
    ]
  },
  mail: {
    piezas: [
      { name: "SplitView", from: "sebs7n-ui/split-view", slug: "split-view" },
      { name: "FilterBar", from: "sebs7n-ui/filter-bar", slug: "filter-bar" },
      { name: "SearchField", from: "sebs7n-ui/search-field", slug: "search-field" },
      { name: "ToggleGroup", from: "sebs7n-ui/toggle-group", slug: "toggle-group" },
      { name: "BulkActionsBar", from: "sebs7n-ui/bulk-actions-bar", slug: "bulk-actions-bar" },
      { name: "ListRow", from: "sebs7n-ui/list-row", slug: "list-row" }
    ],
    code: MAIL,
    reglas: [
      "La lista lleva su FilterBar en sm; «Seleccionar» pasa las filas a marcarse y muestra la BulkActionsBar.",
      "SplitView decide cuántos paneles caben por el ancho de su caja, no por el de la ventana.",
      "La fila elegida es gris; el acento queda para el foco y las acciones primarias."
    ]
  }
}

/** El marco de las cuatro pantallas: el `AppShell` con el panel del asistente, los avisos, ⌘K y los atajos. */
export const RECETA_MARCO: Receta = {
  piezas: [
    { name: "AppShell", from: "sebs7n-ui/app-shell", slug: "app-shell" },
    { name: "Chat", from: "sebs7n-ui/chat", slug: "chat" },
    { name: "AiButton", from: "sebs7n-ui/ai-button", slug: "ai-button" },
    { name: "NotificationsPopover", from: "sebs7n-ui/notifications-popover", slug: "notifications-popover" },
    { name: "CommandPalette", from: "sebs7n-ui/command-palette", slug: "command-palette" },
    { name: "ShortcutsDialog", from: "sebs7n-ui/shortcuts-dialog", slug: "shortcuts-dialog" },
    { name: "useKeySequence", from: "sebs7n-ui/lib/use-key-sequence", slug: "shortcuts-dialog" }
  ],
  code: SHELL,
  reglas: [
    "El panel lateral es parte del AppShell: empuja el contenido, no lo tapa, y se monta solo abierto.",
    "Todo el layout de adentro responde al ancho del contenido (@container), así un panel abierto lo achica como un teléfono.",
    "Los atajos (⌘K, ?, g + letra) los registra la app con useKeySequence: ningún componente escucha el teclado."
  ]
}

/** Los umbrales de container query de Tailwind (rem × 16): lo que el indicador del ancho nombra. */
export const UMBRALES = [
  ["@xs", 320],
  ["@sm", 384],
  ["@md", 448],
  ["@lg", 512],
  ["@xl", 576],
  ["@2xl", 672],
  ["@3xl", 768],
  ["@4xl", 896],
  ["@5xl", 1024]
] as const

/** El umbral más alto que el ancho alcanza, o `null` si no llega a `@xs`. */
export function umbralDe(ancho: number): string | null {
  return [...UMBRALES].reverse().find(([, px]) => ancho >= px)?.[0] ?? null
}
