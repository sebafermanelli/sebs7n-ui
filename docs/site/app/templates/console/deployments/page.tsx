"use client"

import { CalendarClockIcon, CopyIcon, RotateCcwIcon, XIcon } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "sebs7n-ui/alert"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "sebs7n-ui/context-menu"
import { EmptyState } from "sebs7n-ui/empty-state"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "sebs7n-ui/hover-card"
import { List, ListRow } from "sebs7n-ui/list-row"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Progress } from "sebs7n-ui/progress"
import { Spinner } from "sebs7n-ui/spinner"
import { SplitView, SplitViewBack, SplitViewDetail, SplitViewList, useSplitView, type SplitViewPane } from "sebs7n-ui/split-view"
import { Stepper } from "sebs7n-ui/stepper"
import { Switch } from "sebs7n-ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { toast } from "sonner"

import { DeploymentLog } from "../_components/deployment-log"
import { DEPLOY_STATUS } from "../_components/status"
import { buildProgress, pipelineOf, PIPELINE } from "../_data/derive"
import type { Deployment } from "../_data/mock"
import { servicePath } from "../_lib/routes"
import { useProject } from "../_state/project-context"

// Programar pesa por el calendario: se pide recién la primera vez que se abre.
const ScheduleDeployDialog = dynamic(() => import("../_components/schedule-deploy-dialog"), { ssr: false })

const DOT = { live: "green", building: "amber", failed: "red", superseded: "gray" } as const

const dayTime = (iso: string) => new Date(iso).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

function Rows({ deployments, selected, onSelect }: { deployments: Deployment[]; selected: string; onSelect: (id: string) => void }) {
  const { setPane } = useSplitView()
  return (
    <List aria-label="Despliegues" className="p-2.5">
      {deployments.map((d) => (
        <ListRow
          description={`${d.service} · ${d.commit} · ${d.startedAt}`}
          dot={DOT[d.status]}
          key={d.id}
          onClick={() => {
            onSelect(d.id)
            setPane("detail")
          }}
          selected={selected === d.id}
          title={
            <Tooltip>
              <TooltipTrigger render={<span className="block truncate" />}>{d.message}</TooltipTrigger>
              <TooltipContent>{d.message}</TooltipContent>
            </Tooltip>
          }
        />
      ))}
    </List>
  )
}

/** La acción que corresponde a cada estado: reintentar lo fallido, revertir lo reemplazado, cancelar lo que compila. */
function useDeployActions(deployment: Deployment) {
  return {
    cancel: () => toast("Despliegue cancelado"),
    retry: () => toast.success(`Reintentando ${deployment.commit}`),
    revert: () => toast.success(`Revirtiendo a ${deployment.commit}`),
    copy: () => {
      void navigator.clipboard?.writeText(deployment.commit)
      toast.success("Commit copiado")
    },
  }
}

function DeploymentDetail({ deployment }: { deployment: Deployment }) {
  const [follow, setFollow] = useState(true)
  const act = useDeployActions(deployment)
  const status = DEPLOY_STATUS[deployment.status]
  const pipeline = pipelineOf(deployment)
  const failure = deployment.logs.find((line) => line.level === "error")
  // El paso en curso lleva un spinner en lugar del número: no se lee como «pendiente».
  const steps = pipeline.steps.map((step, index) => (deployment.status === "building" && index === pipeline.current ? { ...step, icon: <Spinner size="sm" /> } : step))

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      <SplitViewBack>Despliegues</SplitViewBack>
      <ContextMenu>
        <ContextMenuTrigger className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Tooltip>
              <TooltipTrigger render={<h3 className="truncate text-title-2" />}>{deployment.message}</TooltipTrigger>
              <TooltipContent>{deployment.message}</TooltipContent>
            </Tooltip>
            <p className="text-callout text-label-secondary">
              <Link className="underline-offset-2 hover:underline" href={servicePath(deployment.service)}>
                {deployment.service}
              </Link>
              {" · "}
              <HoverCard>
                <HoverCardTrigger className="font-mono underline-offset-2 hover:underline" render={<button type="button" />}>
                  {deployment.commit}
                </HoverCardTrigger>
                <HoverCardContent>
                  <span className="text-headline text-label">{deployment.message}</span>
                  <span className="text-callout text-label-secondary">
                    <span className="font-mono">{deployment.commit}</span> · {deployment.author}
                  </span>
                  <span className="text-callout text-label-secondary">{deployment.startedAt}</span>
                </HoverCardContent>
              </HoverCard>
              {" · "}
              {deployment.author} · {deployment.duration}
            </p>
          </div>
          <Badge color={status.color}>{status.label}</Badge>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {deployment.status === "failed" && <ContextMenuItem onClick={act.retry}>Reintentar</ContextMenuItem>}
          {deployment.status === "superseded" && <ContextMenuItem onClick={act.revert}>Revertir a este</ContextMenuItem>}
          {deployment.status === "building" && <ContextMenuItem onClick={act.cancel}>Cancelar</ContextMenuItem>}
          <ContextMenuItem onClick={act.copy}>
            <CopyIcon />
            Copiar commit
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem render={<Link href={servicePath(deployment.service)} />}>Ver servicio</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {deployment.status === "failed" && (
        <Alert variant="error">
          <AlertTitle>El despliegue falló en «{PIPELINE[pipeline.current]}»</AlertTitle>
          <AlertDescription>{failure ? failure.message : "No dejó un error en el log."}</AlertDescription>
        </Alert>
      )}
      {deployment.status === "building" && <Progress label={`${PIPELINE[pipeline.current]} · en curso`} showValue value={buildProgress(deployment)} />}

      <Stepper aria-label="Pipeline del despliegue" current={pipeline.current} steps={steps} />
      <div className="flex flex-wrap gap-2">
        {deployment.status === "building" && (
          <Button onClick={act.cancel} size="sm" variant="secondary">
            <XIcon />
            Cancelar
          </Button>
        )}
        {deployment.status === "failed" && (
          <Button onClick={act.retry} size="sm">
            <RotateCcwIcon />
            Reintentar
          </Button>
        )}
        {deployment.status === "superseded" && (
          <Button onClick={act.revert} size="sm" variant="secondary">
            Revertir a este
          </Button>
        )}
      </div>
      {deployment.status === "building" && (
        <label className="flex items-center gap-2 text-callout text-label-secondary">
          <Switch checked={follow} onCheckedChange={setFollow} />
          Seguir el log en vivo
        </label>
      )}
      <DeploymentLog deployment={deployment} follow={follow && deployment.status === "building"} key={deployment.id} />
    </div>
  )
}

export default function DeploymentsPage() {
  const { project, services, deployments, scheduled, cancelScheduled } = useProject()
  const [selectedId, setSelectedId] = useState<string>("")
  const [pane, setPane] = useState<SplitViewPane>("list")
  const [scheduling, setScheduling] = useState(false)
  const [scheduleUsed, setScheduleUsed] = useState(false)
  // Al cambiar de proyecto, el elegido pasa a ser el primero de la lista nueva.
  useEffect(() => {
    setSelectedId("")
  }, [project.id])
  const selected = deployments.find((d) => d.id === selectedId) ?? deployments[0]

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Despliegues</PageHeaderTitle>
        <PageHeaderDescription>Cada push compila y publica un servicio. Elegí uno para ver su log.</PageHeaderDescription>
        <PageHeaderActions>
          <Button
            disabled={services.length === 0}
            onClick={() => {
              setScheduleUsed(true)
              setScheduling(true)
            }}
            variant="secondary"
          >
            <CalendarClockIcon />
            Programar despliegue
          </Button>
        </PageHeaderActions>
      </PageHeader>

      {scheduled.length > 0 && (
        <List aria-label="Despliegues programados">
          {scheduled.map((item) => (
            <ListRow
              description={`${item.commit} · ${dayTime(item.at)}`}
              dot="blue"
              key={item.id}
              title={`${item.service} · programado`}
              trailing={
                <Button aria-label={`Cancelar el despliegue programado de ${item.service}`} onClick={() => cancelScheduled(item.id)} size="icon-sm" variant="ghost">
                  <XIcon />
                </Button>
              }
            />
          ))}
        </List>
      )}

      {deployments.length === 0 ? (
        <EmptyState description="Cuando hagas el primer push, o programes uno, aparece acá con su log." title="Todavía no hay despliegues" />
      ) : (
        <div className="h-[520px] w-full overflow-hidden rounded-surface border border-separator-strong">
          <SplitView onPaneChange={setPane} pane={pane}>
            <SplitViewList aria-label="Lista de despliegues">
              <Rows deployments={deployments} onSelect={setSelectedId} selected={selected?.id ?? ""} />
            </SplitViewList>
            <SplitViewDetail aria-label="Detalle del despliegue">{selected && <DeploymentDetail deployment={selected} key={selected.id} />}</SplitViewDetail>
          </SplitView>
        </div>
      )}
      {scheduleUsed && <ScheduleDeployDialog onOpenChange={setScheduling} open={scheduling} />}
    </AppShellContent>
  )
}
