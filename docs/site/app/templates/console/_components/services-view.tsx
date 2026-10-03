"use client"

import { LayoutGridIcon, ListIcon, ListOrderedIcon, ServerOffIcon } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "sebs7n-ui/alert-dialog"
import { Badge } from "sebs7n-ui/badge"
import { BulkActionsBar } from "sebs7n-ui/bulk-actions-bar"
import { Button } from "sebs7n-ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardGrid, CardHeader, CardTitle } from "sebs7n-ui/card"
import { Checkbox } from "sebs7n-ui/checkbox"
import { DataTable, type DataTableColumn } from "sebs7n-ui/data-table"
import { EmptyState } from "sebs7n-ui/empty-state"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { HoverCard, HoverCardTrigger } from "sebs7n-ui/hover-card"
import { useStoredState } from "sebs7n-ui/lib/use-stored-state"
import { SearchField } from "sebs7n-ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { Skeleton } from "sebs7n-ui/skeleton"
import { Sparkline } from "sebs7n-ui/sparkline"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { linkVariants } from "sebs7n-ui/variants/link"
import { toast } from "sonner"

import { seriesFor } from "../_data/derive"
import type { Service, ServiceStatus } from "../_data/mock"
import { servicePath } from "../_lib/routes"
import { useProject } from "../_state/project-context"
import { ServiceContextMenu } from "./service-context-menu"
import { ServiceMenu, type ServiceActions } from "./service-menu"
import { ServicePreview } from "./service-preview"
import { SERVICE_STATUS } from "./status"

// El orden de arranque pesa por el arrastre: se pide recién la primera vez que se abre.
const StartupOrderPanel = dynamic(() => import("./startup-order-panel"), { ssr: false })

type View = "list" | "grid"
const isView = (value: unknown): value is View => value === "list" || value === "grid"

type StatusFilter = "all" | ServiceStatus
const STATUS_ITEMS: Record<StatusFilter, string> = { all: "Todos los estados", running: "En ejecución", building: "Compilando", failed: "Con error", stopped: "Detenido" }

const names = (services: Service[]) => (services.length === 1 ? services[0]!.name : `${services.length} servicios`)

/** El esqueleto de la lista mientras se trae el proyecto: del alto de las filas, así nada salta al llegar. */
function ServicesSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-2">
      <p className="sr-only" role="status">
        Cargando servicios…
      </p>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton className="h-12 w-full" key={index} />
      ))}
    </div>
  )
}

// Servicios en lista o en cuadrícula, con la misma selección y las mismas acciones. La vista elegida se
// recuerda (`useStoredState`): arranca en lista, que es lo que sabe el servidor, y pasa a la guardada al hidratar.
export function ServicesView() {
  const { services, deployments, loading, setServicesStatus, removeServices, restoreServices, setNewServiceOpen } = useProject()
  const [view, setView] = useStoredState<View>("sebs7n-ui:console:services-view", "list", isView)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [selected, setSelected] = useState<string[]>([])
  const [toDelete, setToDelete] = useState<Service[] | null>(null)
  const [orderOpen, setOrderOpen] = useState(false)

  const needle = query.trim().toLocaleLowerCase("es")
  const shown = services.filter((s) => (status === "all" || s.status === status) && (!needle || `${s.name} ${s.kind} ${s.url}`.toLocaleLowerCase("es").includes(needle)))
  const filtering = needle !== "" || status !== "all"
  // Si un servicio se elimina o cambia de proyecto, su selección no queda colgada.
  const chosen = services.filter((s) => selected.includes(s.id))

  const actions: ServiceActions = {
    restart: (items) => toast.success(`Reiniciando ${names(items)}`),
    pause: (items) => {
      const previous = setServicesStatus(items.map((s) => s.id), "stopped")
      toast(`${names(items)} en pausa`, { action: { label: "Deshacer", onClick: () => restoreServices(previous) } })
    },
    resume: (items) => {
      const previous = setServicesStatus(items.map((s) => s.id), "running")
      toast.success(`${names(items)} en ejecución`, { action: { label: "Deshacer", onClick: () => restoreServices(previous) } })
    },
    askDelete: setToDelete,
  }

  const confirmDelete = () => {
    if (!toDelete) return
    const removed = removeServices(toDelete.map((s) => s.id))
    setSelected((previous) => previous.filter((id) => !removed.some((s) => s.id === id)))
    toast(`${names(removed)} eliminado`, { action: { label: "Deshacer", onClick: () => restoreServices(removed) } })
    setToDelete(null)
  }

  const columns: DataTableColumn<Service>[] = [
    {
      id: "name",
      header: "Servicio",
      value: (row) => row.name,
      cell: (row) => (
        <HoverCard>
          <HoverCardTrigger className={linkVariants({ variant: "row" })} render={<Link href={servicePath(row.id)} />}>
            {row.name}
          </HoverCardTrigger>
          <ServicePreview deployments={deployments} service={row} />
        </HoverCard>
      ),
      sortable: true,
    },
    { id: "kind", header: "Tipo", value: (row) => row.kind },
    {
      id: "status",
      header: "Estado",
      value: (row) => SERVICE_STATUS[row.status].label,
      cell: (row) => (
        <Badge color={SERVICE_STATUS[row.status].color} size="sm">
          {SERVICE_STATUS[row.status].label}
        </Badge>
      ),
      className: "w-36",
    },
    { id: "instances", header: "Instancias", value: (row) => row.instances, numeric: true, sortable: true, className: "w-28" },
    {
      id: "cpu",
      header: "CPU",
      value: (row) => row.cpu,
      cell: (row) => (
        <span className="flex items-center justify-end gap-3">
          {row.status === "running" && <Sparkline className="hidden h-5 w-16 text-brand-900 @4xl:block" values={seriesFor(row, "cpu")} />}
          <span className="tabular-nums">{row.cpu} %</span>
        </span>
      ),
      numeric: true,
      sortable: true,
      className: "w-40",
    },
    { id: "actions", header: <span className="sr-only">Acciones</span>, cell: (row) => <ServiceMenu actions={actions} service={row} />, className: "w-12" },
  ]

  const toggleCard = (id: string, checked: boolean) => setSelected((previous) => (checked ? [...previous, id] : previous.filter((x) => x !== id)))

  const clearFilters = () => {
    setQuery("")
    setStatus("all")
  }

  return (
    <>
      <FilterBar
        actions={
          chosen.length > 0 ? (
            // Con selección, las acciones masivas ocupan el lugar de las de siempre; «Limpiar selección» las apaga.
            <BulkActionsBar count={chosen.length} labels={{ selectedOne: "{count} seleccionado", selectedOther: "{count} seleccionados" }} onClear={() => setSelected([])}>
              <Button onClick={() => actions.pause(chosen.filter((s) => s.status !== "stopped"))} size="sm" variant="secondary">
                Pausar
              </Button>
              <Button onClick={() => actions.resume(chosen.filter((s) => s.status === "stopped"))} size="sm" variant="secondary">
                Reanudar
              </Button>
              <Button onClick={() => actions.askDelete(chosen)} size="sm" variant="destructive">
                Eliminar
              </Button>
            </BulkActionsBar>
          ) : (
            <Button
              disabled={services.length < 2}
              onClick={() => setOrderOpen((open) => !open)}
              size="sm"
              variant="secondary"
            >
              <ListOrderedIcon />
              Orden de arranque
            </Button>
          )
        }
        filters={
          <>
            <Select items={STATUS_ITEMS} onValueChange={(value) => value && setStatus(value as StatusFilter)} value={status}>
              <SelectTrigger aria-label="Estado" className="w-full @xl:w-48" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ToggleGroup aria-label="Vista" size="sm" onValueChange={(value) => value[0] && setView(value[0] as View)} value={[view]}>
              <ToggleGroupItem aria-label="Lista" value="list">
                <ListIcon />
              </ToggleGroupItem>
              <ToggleGroupItem aria-label="Cuadrícula" value="grid">
                <LayoutGridIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </>
        }
        search={<SearchField aria-label="Buscar servicios" size="sm" onValueChange={setQuery} placeholder="Buscar servicios" value={query} />}
      />

      {orderOpen && <StartupOrderPanel onClose={() => setOrderOpen(false)} />}

      {loading ? (
        <ServicesSkeleton />
      ) : shown.length === 0 ? (
        <EmptyState
          action={
            filtering ? (
              <Button onClick={clearFilters} variant="secondary">
                Limpiar filtros
              </Button>
            ) : (
              <Button onClick={() => setNewServiceOpen(true)} variant="secondary">
                Nuevo servicio
              </Button>
            )
          }
          description={filtering ? "Revisá cómo está escrito el nombre o probá con otro estado." : "Creá el primero y se despliega desde su repositorio."}
          icon={<ServerOffIcon />}
          title={filtering ? "Ningún servicio coincide con el filtro" : "Todavía no hay servicios"}
        />
      ) : view === "list" ? (
        <DataTable
          aria-label="Servicios"
          columns={columns}
          data={shown}
          getRowId={(row) => row.id}
          getRowLabel={(row) => row.name}
          locale="es-AR"
          onSelectedChange={setSelected}
          selectable
          selected={selected}
        />
      ) : (
        // `CardGrid` alinea la cabecera, el cuerpo y el pie de las cards de una fila aunque una tenga más texto.
        <CardGrid>
          {shown.map((service) => (
            <Card key={service.id} selected={selected.includes(service.id)}>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <Checkbox aria-label={`Seleccionar ${service.name}`} checked={selected.includes(service.id)} onCheckedChange={(checked) => toggleCard(service.id, checked === true)} />
                    {service.name}
                  </span>
                </CardTitle>
                <CardDescription>{service.kind}</CardDescription>
                <CardAction>
                  <ServiceMenu actions={actions} service={service} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <ServiceContextMenu actions={actions} className="flex flex-col gap-3" service={service}>
                  <div className="flex items-center justify-between gap-2">
                    <Badge color={SERVICE_STATUS[service.status].color} size="sm">
                      {SERVICE_STATUS[service.status].label}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger render={<span className="min-w-0 truncate text-callout text-label-secondary" />}>{service.url}</TooltipTrigger>
                      <TooltipContent>{service.url}</TooltipContent>
                    </Tooltip>
                  </div>
                  {service.status === "running" ? <Sparkline className="h-10 w-full text-brand-900" values={seriesFor(service, "cpu")} /> : <div className="h-10" />}
                </ServiceContextMenu>
              </CardContent>
              <CardFooter>
                <span className="text-callout text-label-secondary">{`${service.instances} inst. · CPU ${service.cpu} %`}</span>
                <Link className={linkVariants({ variant: "accent" })} href={servicePath(service.id)}>
                  Ver detalle
                </Link>
              </CardFooter>
            </Card>
          ))}
        </CardGrid>
      )}

      <AlertDialog onOpenChange={(open) => !open && setToDelete(null)} open={toDelete !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{toDelete ? `¿Eliminar ${names(toDelete)}?` : "¿Eliminar?"}</AlertDialogTitle>
            <AlertDialogDescription>Se detienen las instancias y se borra su configuración. Desde el aviso que aparece abajo podés deshacerlo unos segundos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} variant="destructive">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
