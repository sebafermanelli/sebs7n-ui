"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { Card, CardContent } from "sebs7n-ui/card"
import { EmptyState } from "sebs7n-ui/empty-state"
import { Meter } from "sebs7n-ui/meter"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Tree, type TreeNode } from "sebs7n-ui/tree"
import { WidgetCard } from "sebs7n-ui/widget-card"

import { PLANS } from "../_data/costs"
import { instanceUsage } from "../_data/derive"
import { parseNodeId, projectNodeId, resourceTree, type ResourceRef } from "../_data/resources"
import { SERVICE_STATUS } from "../_components/status"
import { servicePath } from "../_lib/routes"
import { useProject } from "../_state/project-context"

/** Lo que tarda en «traer» las instancias de un servicio al abrirlo. */
const LOAD_MS = 450

// Recursos: proyecto › servicio › instancia, como un explorador. Las instancias se piden al abrir el servicio
// (`onLoadChildren`), igual que en una consola de verdad. Elegir un nodo muestra su detalle a la derecha.
export default function ResourcesPage() {
  const router = useRouter()
  const { project, projects, allServices, setProjectId } = useProject()
  const [selected, setSelected] = useState<string | null>(projectNodeId(project.id))
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(new Set())
  const items = useMemo(() => resourceTree(projects, allServices, loaded), [projects, allServices, loaded])
  const ref = selected ? parseNodeId(selected) : null

  const open = (node: TreeNode) => {
    const target = parseNodeId(node.id)
    if (target?.kind !== "service") return
    setProjectId(target.projectId)
    router.push(servicePath(target.serviceId))
  }

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Recursos</PageHeaderTitle>
        <PageHeaderDescription>Todo lo que corre en la cuenta, de proyecto a instancia. Abrí un servicio para ver sus instancias; Enter lo abre en su detalle.</PageHeaderDescription>
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <CardContent>
            <Tree
              aria-label="Recursos de la cuenta"
              columns={[{ header: "Tipo", width: 150 }, { header: "Detalle", width: 100, numeric: true }]}
              defaultExpanded={[projectNodeId(project.id)]}
              items={items}
              nameHeader="Nombre"
              onLoadChildren={async (node) => {
                await new Promise((resolve) => setTimeout(resolve, LOAD_MS))
                setLoaded((previous) => new Set([...previous, node.id]))
              }}
              onOpen={open}
              onSelectedChange={(id) => setSelected(id)}
              selected={selected ?? undefined}
            />
          </CardContent>
        </Card>
        <ResourceDetail onSwitchProject={setProjectId} reference={ref} />
      </div>
    </AppShellContent>
  )
}

function ResourceDetail({ reference, onSwitchProject }: { reference: ResourceRef | null; onSwitchProject: (projectId: string) => void }) {
  const { project, projects, allServices } = useProject()
  const router = useRouter()

  if (!reference) {
    return (
      <Card>
        <CardContent>
          <EmptyState description="Elegí un proyecto, un servicio o una instancia del árbol." title="Ningún recurso elegido" variant="plain" />
        </CardContent>
      </Card>
    )
  }

  const owner = projects.find((p) => p.id === reference.projectId)
  if (reference.kind === "project" && owner) {
    const count = allServices.filter((s) => s.projectId === owner.id).length
    return (
      <WidgetCard subtitle={`Región ${owner.region}`} title={owner.name}>
        <div className="flex flex-col items-start gap-3">
        <p className="text-callout text-label-secondary">{`${count} ${count === 1 ? "servicio" : "servicios"}`}</p>
        {owner.id === project.id ? <Badge color="green">Proyecto activo</Badge> : <Button onClick={() => onSwitchProject(owner.id)} variant="secondary">Cambiar a este proyecto</Button>}
        </div>
      </WidgetCard>
    )
  }

  const service = allServices.find((s) => s.projectId === reference.projectId && s.id === (reference.kind === "project" ? "" : reference.serviceId))
  if (!service) return null
  const status = SERVICE_STATUS[service.status]

  if (reference.kind === "instance") {
    const usage = instanceUsage(service).find((u) => u.name === reference.name)
    return (
      <WidgetCard subtitle={`Instancia de ${service.name}`} title={reference.name}>
        {usage ? (
          <div className="flex flex-col gap-4">
            <Meter aria-label={`CPU de ${usage.name}`} label="CPU" max={100} showValue value={usage.cpu} />
            <Meter aria-label={`Memoria de ${usage.name}`} label="Memoria" max={100} showValue value={usage.memory} />
          </div>
        ) : null}
      </WidgetCard>
    )
  }

  const here = service.projectId === project.id
  return (
    <WidgetCard subtitle={service.kind} title={service.name}>
      <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={status.color}>{status.label}</Badge>
        <span className="text-callout text-label-secondary">
          {service.region} · plan {PLANS[service.plan].label} · {service.instances} {service.instances === 1 ? "instancia" : "instancias"}
        </span>
      </div>
      <Button
        onClick={() => {
          if (!here) onSwitchProject(service.projectId)
          router.push(servicePath(service.id))
        }}
        variant="secondary"
      >
        {here ? "Ver detalle" : "Abrir en su proyecto"}
      </Button>
      </div>
    </WidgetCard>
  )
}

