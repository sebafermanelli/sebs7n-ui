"use client"

import {
  ClockIcon,
  DownloadIcon,
  EllipsisIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
  FolderPlusIcon,
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
  ShareIcon,
  Trash2Icon,
  UploadIcon,
  UsersIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { AppShell } from "sebs7n-ui/app-shell"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "sebs7n-ui/breadcrumb"
import { Button } from "sebs7n-ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "sebs7n-ui/context-menu"
import { FileGrid, type FileGridItem } from "sebs7n-ui/file-grid"
import { Kbd } from "sebs7n-ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarItemBadge,
  SidebarSearch,
} from "sebs7n-ui/sidebar"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "sebs7n-ui/toolbar"
import { Tree, type TreeNode } from "sebs7n-ui/tree"

import { AppIcon, ToolButton } from "./parts"

// Miniaturas generadas acá (sin imágenes externas): una hoja con una franja de color y renglones.
const hoja = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80"><rect width="60" height="80" fill="#fff"/><rect x="8" y="10" width="30" height="6" fill="${color}"/><g fill="#c7c7cc"><rect x="8" y="26" width="44" height="3"/><rect x="8" y="34" width="44" height="3"/><rect x="8" y="42" width="36" height="3"/><rect x="8" y="58" width="20" height="3"/></g></svg>`
  )}`

const planilla = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="80" height="60" fill="#fff"/><rect width="80" height="10" fill="#34c759"/><g stroke="#d1d1d6"><path d="M0 22h80M0 34h80M0 46h80M26 10v50M53 10v50"/></g></svg>`
)}`

/** Las carpetas, con la ruta de cada una para las migas. */
const CARPETAS: TreeNode[] = [
  {
    id: "facturas",
    label: "Facturas",
    children: [
      {
        id: "facturas-2026",
        label: "2026",
        children: [
          { id: "septiembre", label: "Septiembre", children: [] },
          { id: "agosto", label: "Agosto", children: [] },
        ],
      },
      { id: "facturas-2025", label: "2025", children: [] },
    ],
  },
  { id: "recibos", label: "Recibos", children: [] },
  { id: "contratos", label: "Contratos", children: [] },
  { id: "proveedores", label: "Proveedores", children: [] },
]

function rutaDe(id: string, nodos: TreeNode[] = CARPETAS, arriba: TreeNode[] = []): TreeNode[] | null {
  for (const nodo of nodos) {
    const ruta = [...arriba, nodo]
    if (nodo.id === id) return ruta
    const abajo = rutaDe(id, nodo.children ?? [], ruta)
    if (abajo) return abajo
  }
  return null
}

const pdf = (id: string, name: string, kind: string, color = "#0071e3"): FileGridItem => ({
  id,
  name,
  kind,
  thumbnail: <img alt="" src={hoja(color)} />,
})

const ARCHIVOS: Record<string, FileGridItem[]> = {
  septiembre: [
    pdf("f-0012", "Factura 0012.pdf", "128 KB"),
    pdf("f-0013", "Factura 0013.pdf", "96 KB"),
    pdf("f-0014", "Factura 0014.pdf", "88 KB"),
    pdf("nc-0003", "Nota de crédito 0003.pdf", "54 KB", "#ff9f0a"),
    { id: "resumen", name: "Resumen de septiembre.xlsx", kind: "44 KB", thumbnail: <img alt="" src={planilla} /> },
    { id: "notas", name: "Notas de cobranza.txt", kind: "2 KB" },
  ],
  agosto: [pdf("f-0009", "Factura 0009.pdf", "112 KB"), pdf("f-0010", "Factura 0010.pdf", "92 KB"), pdf("f-0011", "Factura 0011.pdf", "70 KB")],
  recibos: [pdf("r-0101", "Recibo 0101.pdf", "40 KB", "#34c759"), pdf("r-0102", "Recibo 0102.pdf", "38 KB", "#34c759")],
  contratos: [pdf("c-acme", "Contrato de servicios.pdf", "1,5 MB", "#8e8e93")],
}

function contenidoDe(id: string): FileGridItem[] {
  const nodo = rutaDe(id)?.at(-1)
  const carpetas = (nodo?.children ?? [])
    .filter((hijo) => hijo.children)
    .map((hijo) => ({ id: hijo.id, name: String(hijo.label), kind: `${(ARCHIVOS[hijo.id] ?? []).length + (hijo.children?.length ?? 0)} ítems`, folder: true }))
  return [...carpetas, ...(ARCHIVOS[id] ?? [])]
}

const LISTA_COLUMNAS = [
  { header: "Tipo", width: 120 },
  { header: "Tamaño", width: 90, numeric: true },
]

/** iCloud Drive: la lista de fuentes, la barra con la vista y las acciones, las carpetas y los archivos. */
export function FilesShowcase() {
  const [carpeta, setCarpeta] = useState("septiembre")
  const [elegido, setElegido] = useState<string | null>("f-0013")
  const [vista, setVista] = useState<"grid" | "list">("grid")
  const ruta = rutaDe(carpeta) ?? []
  const items = useMemo(() => contenidoDe(carpeta), [carpeta])
  const abrir = (item: FileGridItem) => {
    if (item.folder) {
      setCarpeta(item.id)
      setElegido(null)
    }
  }
  const nombreElegido = items.find((item) => item.id === elegido)?.name

  const sidebar = (
    <Sidebar>
      <SidebarHeader>
        <SidebarSearch placeholder="Buscar en Archivos" />
      </SidebarHeader>
      <SidebarContent aria-label="Ubicaciones">
        <SidebarGroup>
          <SidebarGroupLabel>Archivos</SidebarGroupLabel>
          <SidebarItem icon={<ClockIcon />} render={<button className="text-start" type="button" />}>
            Recientes
          </SidebarItem>
          <SidebarItem active icon={<FolderIcon />} render={<button className="text-start" type="button" />}>
            Mis archivos
          </SidebarItem>
          <SidebarItem icon={<UsersIcon />} render={<button className="text-start" type="button" />}>
            Compartidos
            <SidebarItemBadge label="3 nuevos">3</SidebarItemBadge>
          </SidebarItem>
          <SidebarItem icon={<Trash2Icon />} render={<button className="text-start" type="button" />}>
            Papelera
            <SidebarItemBadge>12</SidebarItemBadge>
          </SidebarItem>
        </SidebarGroup>
        <SidebarGroup collapsible>
          <SidebarGroupLabel>Favoritos</SidebarGroupLabel>
          <SidebarGroupAction aria-label="Agregar a favoritos" />
          <SidebarItem icon={<FileTextIcon />} render={<button className="text-start" type="button" />}>
            Facturas
          </SidebarItem>
          <SidebarItem icon={<FileSpreadsheetIcon />} render={<button className="text-start" type="button" />}>
            Informes
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )

  return (
    <AppShell
      // El alto del marco (`--showcase-height`, lo pone `index.tsx`): el shell se mide con él.
      className="[--app-shell-height:var(--showcase-height)]"
      header={
        <span className="flex items-center gap-2 text-headline text-label">
          <AppIcon fill="blue" icon={FolderIcon} size="sm" />
          Archivos
        </span>
      }
      mainId="muestra-archivos"
      mobileBar={<span className="text-headline text-label">Archivos</span>}
      sidebar={sidebar}
    >
      {/* El alto de la columna menos la barra (44): la grilla scrollea adentro y la barra queda fija. */}
      <div className="@container flex h-[calc(var(--app-shell-height)-2.75rem)] min-h-0 flex-col">
        <Toolbar aria-label="Acciones de archivos">
          <ToggleGroup
            aria-label="Vista"
            className="gap-0.5"
            onValueChange={(valor) => valor[0] && setVista(valor[0] as "grid" | "list")}
            value={[vista]}
          >
            <ToolbarButton aria-label="Íconos" render={<ToggleGroupItem value="grid" />}>
              <LayoutGridIcon />
            </ToolbarButton>
            <ToolbarButton aria-label="Lista" render={<ToggleGroupItem value="list" />}>
              <ListIcon />
            </ToolbarButton>
          </ToggleGroup>
          <ToolbarSeparator />
          <ToolbarGroup aria-label="Selección" className="mx-auto flex items-center gap-1.5">
            <ToolButton disabled={!elegido} icon={ShareIcon} label="Compartir" />
            <ToolButton disabled={!elegido} icon={DownloadIcon} label="Descargar" />
            <ToolButton disabled={!elegido} icon={Trash2Icon} label="Eliminar" />
          </ToolbarGroup>
          <ToolButton icon={SearchIcon} label="Buscar" shortcut={<Kbd>⌘F</Kbd>} />
          <ToolButton icon={FolderPlusIcon} label="Nueva carpeta" />
          <ToolButton icon={UploadIcon} label="Subir archivos" />
        </Toolbar>

        <div className="flex min-h-0 flex-1">
          <div className="hidden w-60 shrink-0 overflow-y-auto border-e border-separator p-2 @3xl:block">
            <Tree
              aria-label="Carpetas"
              defaultExpanded={["facturas", "facturas-2026"]}
              items={CARPETAS}
              onSelectedChange={(id) => {
                if (!id) return
                setCarpeta(id)
                setElegido(null)
              }}
              selected={carpeta}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            <div className="flex flex-col gap-1">
              <Breadcrumb aria-label="Ruta de la carpeta">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<button className="text-start" type="button" />}>Mis archivos</BreadcrumbLink>
                  </BreadcrumbItem>
                  {ruta.map((nodo, indice) => (
                    <BreadcrumbItem key={nodo.id}>
                      {indice === ruta.length - 1 ? (
                        <BreadcrumbPage>{nodo.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink onClick={() => setCarpeta(nodo.id)} render={<button className="text-start" type="button" />}>
                          {nodo.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <h3 className="text-title-1 text-label">{ruta.at(-1)?.label}</h3>
              <p className="text-callout text-label-secondary">{items.length} ítems · 1,2 GB disponibles</p>
            </div>

            <ContextMenu>
              <ContextMenuTrigger className="w-full" focusable={false}>
                {vista === "grid" ? (
                  <FileGrid
                    actions={(item) => (
                      <Button aria-label={`Acciones de ${item.name}`} className="rounded-full bg-surface shadow-thumbnail" size="icon-sm" variant="plain">
                        <EllipsisIcon />
                      </Button>
                    )}
                    aria-label={`Archivos de ${ruta.at(-1)?.label ?? ""}`}
                    items={items}
                    onOpen={abrir}
                    onSelectedChange={setElegido}
                    selected={elegido}
                  />
                ) : (
                  <Tree
                    aria-label={`Archivos de ${ruta.at(-1)?.label ?? ""}`}
                    columns={LISTA_COLUMNAS}
                    items={items.map((item) => ({
                      id: item.id,
                      label: item.name,
                      children: item.folder ? [] : undefined,
                      columns: [item.folder ? "Carpeta" : item.name.split(".").at(-1)?.toUpperCase(), item.folder ? "—" : item.kind],
                    }))}
                    nameHeader="Nombre"
                    onOpen={(nodo) => abrir({ id: nodo.id, name: String(nodo.label), folder: nodo.children !== undefined })}
                    onSelectedChange={setElegido}
                    selected={elegido}
                  />
                )}
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem disabled={!nombreElegido}>Abrir</ContextMenuItem>
                <ContextMenuItem disabled={!nombreElegido}>
                  Descargar
                  <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem disabled={!nombreElegido}>Compartir…</ContextMenuItem>
                <ContextMenuItem disabled={!nombreElegido}>Cambiar el nombre</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem disabled={!nombreElegido} variant="destructive">
                  Eliminar
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
