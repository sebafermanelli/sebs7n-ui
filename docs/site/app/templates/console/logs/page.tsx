"use client"

import { DownloadIcon, PauseIcon, PlayIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { EmptyState } from "sebs7n-ui/empty-state"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { LogViewer, type LogLine } from "sebs7n-ui/log-viewer"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "sebs7n-ui/resizable"
import { SearchField } from "sebs7n-ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { Toolbar, ToolbarButton } from "sebs7n-ui/toolbar"

import { LogLineDetail } from "../_components/log-line-detail"
import { initialRuntimeLogs, runtimeLine, type RuntimeLine } from "../_data/derive"
import type { LogLevel } from "../_data/mock"
import { useNarrow } from "../_lib/use-narrow"
import { useProject } from "../_state/project-context"

const KEEP = 500

// `useSearchParams` (el servicio que viene en `?service=`) pide un Suspense para poder prerenderizar.
export default function LogsPage() {
  return (
    <Suspense>
      <Logs />
    </Suspense>
  )
}

function Logs() {
  const { project, services } = useProject()
  const preset = useSearchParams().get("service")
  const narrow = useNarrow()
  const [lines, setLines] = useState<RuntimeLine[]>(() => initialRuntimeLogs(services))
  const counter = useRef(lines.length)
  const [paused, setPaused] = useState(false)
  const [query, setQuery] = useState("")
  const [level, setLevel] = useState<string[]>(["all"])
  const [service, setService] = useState(preset ?? "all")
  const [pickedId, setPickedId] = useState<number | null>(null)

  // Cambiar de proyecto trae el log de ese proyecto: no se mezclan servicios de uno y otro.
  useEffect(() => {
    const initial = initialRuntimeLogs(services)
    setLines(initial)
    counter.current = initial.length
    setPickedId(null)
    setService(preset ?? "all")
  }, [project.id, services, preset])

  // La cola en vivo: una línea por segundo, y se corta sola si el visor está en pausa o no hay servicios.
  useEffect(() => {
    if (paused || services.length === 0) return
    const timer = setInterval(() => {
      const next = runtimeLine(services, counter.current++)
      setLines((previous) => [...previous, next].slice(-KEEP))
    }, 1000)
    return () => clearInterval(timer)
  }, [paused, services])

  const shown = useMemo(
    () =>
      lines.filter(
        (line) =>
          (level[0] === "all" || line.level === (level[0] as LogLevel)) &&
          (service === "all" || line.service === service) &&
          line.message.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [lines, level, service, query]
  )
  const viewerLines = useMemo<LogLine[]>(() => shown.map((line) => ({ id: line.id, time: line.time, level: line.level, source: line.service, message: line.message })), [shown])
  const picked = lines.find((line) => line.id === pickedId) ?? null

  const items = { all: "Todos los servicios", ...Object.fromEntries(services.map((s) => [s.name, s.name])) }

  // Un clic en una línea la elige: el visor del paquete no sabe de selección, así que se la busca por su posición.
  const pick = (event: MouseEvent<HTMLDivElement>) => {
    const row = (event.target as HTMLElement).closest('[data-slot="log-line"]')
    if (!row) return
    const index = [...event.currentTarget.querySelectorAll('[data-slot="log-line"]')].indexOf(row)
    const line = shown[index]
    if (line) setPickedId(line.id)
  }

  const download = () => {
    const text = shown.map((line) => `${line.time} ${line.service} ${line.level} ${line.message}`).join("\n")
    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    link.download = `${project.name}-logs.txt`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const pickLastError = () => {
    const last = [...shown].reverse().find((line) => line.level === "error")
    if (last) setPickedId(last.id)
  }

  return (
    <AppShellContent size="full">
      <PageHeader>
        <PageHeaderTitle>Logs</PageHeaderTitle>
        <PageHeaderDescription>Lo que escriben los servicios de {project.name}, en vivo.</PageHeaderDescription>
      </PageHeader>
      {services.length === 0 ? (
        <EmptyState description="Cuando haya un servicio corriendo, sus logs aparecen acá." title="Todavía no hay logs" />
      ) : (
        <>
          <FilterBar
            actions={
              <Toolbar aria-label="Acciones del log" variant="plain">
                <ToolbarButton onClick={() => setPaused((previous) => !previous)} render={<Button size="sm" variant="secondary" />}>
                  {paused ? <PlayIcon /> : <PauseIcon />}
                  {paused ? "Reanudar" : "Pausar"}
                </ToolbarButton>
                <ToolbarButton onClick={download} render={<Button size="sm" variant="secondary" />}>
                  <DownloadIcon />
                  Descargar
                </ToolbarButton>
              </Toolbar>
            }
            filters={
              <>
                <Select items={items} onValueChange={(value) => value && setService(value as string)} value={service}>
                  <SelectTrigger aria-label="Servicio" className="w-full @xl:w-48" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(items).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ToggleGroup aria-label="Nivel" size="sm" onValueChange={(value) => value.length > 0 && setLevel(value)} value={level}>
                  <ToggleGroupItem value="all">Todos</ToggleGroupItem>
                  <ToggleGroupItem value="warn">Avisos</ToggleGroupItem>
                  <ToggleGroupItem value="error">Errores</ToggleGroupItem>
                </ToggleGroup>
              </>
            }
            search={<SearchField aria-label="Buscar en los logs" size="sm" onValueChange={setQuery} placeholder="Buscar en los logs" value={query} />}
          />
          {/* El visor y el detalle de la línea, con la línea del medio para repartir el ancho (en el teléfono, el alto). */}
          <div className="h-[calc(100dvh-26rem)] min-h-96 w-full overflow-hidden rounded-surface border border-separator-strong">
            <ResizablePanelGroup key={narrow ? "vertical" : "horizontal"} orientation={narrow ? "vertical" : "horizontal"}>
              <ResizablePanel defaultSize={narrow ? 60 : 68} minSize={30}>
                <LogViewer
                  aria-label="Logs de los servicios"
                  className="h-full rounded-none border-0"
                  emptyMessage="Ninguna línea coincide con los filtros."
                  follow={!paused}
                  lines={viewerLines}
                  onClick={pick}
                  variant="terminal"
                />
              </ResizablePanel>
              <ResizableHandle aria-label={narrow ? "Alto del detalle de la línea" : "Ancho del detalle de la línea"} withHandle />
              <ResizablePanel aria-label="Detalle de la línea" defaultSize={narrow ? 40 : 32} minSize={20}>
                <LogLineDetail
                  line={picked}
                  lines={lines}
                  onFilterService={setService}
                  onPickLastError={pickLastError}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          <p className="text-callout text-label-secondary">
            <span role="status">{paused ? "En pausa" : "En vivo"}</span> · {shown.length} de {lines.length} líneas
          </p>
        </>
      )}
    </AppShellContent>
  )
}
