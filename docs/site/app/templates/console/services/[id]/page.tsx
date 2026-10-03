"use client"

import { RotateCwIcon, TerminalIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "sebs7n-ui/alert"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "sebs7n-ui/combobox"
import { EmptyState } from "sebs7n-ui/empty-state"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "sebs7n-ui/input-group"
import { Meter } from "sebs7n-ui/meter"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { Slider } from "sebs7n-ui/slider"
import { SettingsGrid, SettingsSection } from "sebs7n-ui/settings-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { TagsInput } from "sebs7n-ui/tags-input"
import { TextLink } from "sebs7n-ui/text-link"
import { Timeline, TimelineItem } from "sebs7n-ui/timeline"
import { buttonVariants } from "sebs7n-ui/variants/button"
import { WidgetCard } from "sebs7n-ui/widget-card"
import { toast } from "sonner"

import { ServiceMetrics } from "../../_components/service-metrics"
import { SERVICE_STATUS } from "../../_components/status"
import { columnsFor, eventsFor, instanceUsage } from "../../_data/derive"
import { REGIONS, type Service } from "../../_data/mock"
import { CONSOLE_PATH, LOGS_PATH } from "../../_lib/routes"
import { isDomain, MAX_INSTANCES, type ServiceSettings } from "../../_state/mutations"
import { useProject } from "../../_state/project-context"

const PLANS = {
  starter: "Starter · 0,5 vCPU · 512 MB",
  standard: "Standard · 1 vCPU · 2 GB",
  pro: "Pro · 2 vCPU · 4 GB"
}

// Las clases escritas enteras: Tailwind no ve una armada con `${}`. Las instancias se reparten parejas, sin huérfana.
const USAGE_COLUMNS = {
  1: "@3xl:grid-cols-1",
  2: "@3xl:grid-cols-2",
  3: "@3xl:grid-cols-3",
  4: "@3xl:grid-cols-4"
} as const

/** Lo que pasa con el servicio y conviene saber antes de mirar las curvas: un aviso, no una métrica más. */
function healthNotice(service: Service) {
  if (service.status === "failed")
    return {
      variant: "error" as const,
      title: "No responde al healthcheck",
      text: "El último despliegue no llegó a estar en vivo."
    }
  if (service.status === "running" && (service.cpu >= 65 || service.memory >= 70)) {
    return {
      variant: "warning" as const,
      title: "Servicio degradado",
      text: `${service.cpu >= 65 ? `CPU en ${service.cpu} %` : `Memoria en ${service.memory} %`}: conviene subir el máximo de instancias.`
    }
  }
  return null
}

function SettingsForm({ service }: { service: Service }) {
  const { settingsOf, updateSettings } = useProject()
  const saved = settingsOf(service)
  const [draft, setDraft] = useState<ServiceSettings>(saved)
  const [plan, setPlan] = useState<string>(service.plan)
  const [verified, setVerified] = useState(false)
  const domainInvalid = !isDomain(draft.domain)
  const set = (patch: Partial<ServiceSettings>) => setDraft((previous) => ({ ...previous, ...patch }))

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (domainInvalid) return
        updateSettings(service, draft)
        toast.success(`${service.name}: entre ${draft.minInstances} y ${draft.maxInstances} instancias, plan ${plan}`)
      }}
    >
      <SettingsGrid>
        <SettingsSection description="Cuántas instancias corren y con qué recursos." title="Escala y plan">
          <Slider
            label="Autoscaling: mínimo y máximo de instancias"
            marks={[0, 5, MAX_INSTANCES]}
            max={MAX_INSTANCES}
            min={0}
            minStepsBetweenValues={1}
            onValueChange={(value) =>
              set({
                minInstances: value[0] ?? 0,
                maxInstances: value[1] ?? MAX_INSTANCES
              })
            }
            value={[draft.minInstances, draft.maxInstances]}
          />
          <p className="text-callout text-label-secondary" role="status">
            {`Entre ${draft.minInstances} y ${draft.maxInstances} instancias, según la CPU. Con mínimo 0 el servicio puede quedar detenido.`}
          </p>
          <Field>
            <FieldLabel>Plan</FieldLabel>
            <Select items={PLANS} onValueChange={(value) => value && setPlan(value as string)} value={plan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLANS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </SettingsSection>

        <SettingsSection description="Dónde corre y con qué dirección se llega." title="Región y dominio">
          <Field>
            <FieldLabel>Región</FieldLabel>
            <Combobox items={REGIONS} onValueChange={(value) => value && set({ region: value })} value={draft.region}>
              <ComboboxInput placeholder="Elegí una región" />
              <ComboboxContent>
                <ComboboxEmpty />
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
          <Field invalid={domainInvalid}>
            <FieldLabel>Dominio propio</FieldLabel>
            <InputGroup>
              <InputGroupAddon>https://</InputGroupAddon>
              <InputGroupInput
                aria-invalid={domainInvalid || undefined}
                inputMode="url"
                onChange={(event) => {
                  setVerified(false)
                  set({ domain: event.target.value.trim().toLowerCase() })
                }}
                placeholder="app.acme.com"
                value={draft.domain}
              />
              <InputGroupButton
                disabled={draft.domain === "" || domainInvalid}
                onClick={() => {
                  setVerified(true)
                  toast.success(`${draft.domain} apunta a ${service.url}.`)
                }}
                variant="ghost"
              >
                {verified ? "Verificado" : "Verificar"}
              </InputGroupButton>
            </InputGroup>
            <FieldDescription>Sin protocolo ni ruta. Hay que apuntar un CNAME a {service.url === "—" ? "la dirección del servicio" : service.url}.</FieldDescription>
            {domainInvalid && <FieldError match>Escribí un dominio como app.acme.com.</FieldError>}
          </Field>
        </SettingsSection>

        <SettingsSection description="Ordenan los servicios en los reportes." title="Etiquetas" wide>
          <Field>
            <FieldLabel>Etiquetas del servicio</FieldLabel>
            <TagsInput addOnBlur max={8} onValueChange={(labels) => set({ labels })} placeholder="Ej. pagos, crítico" value={draft.labels} />
            <FieldDescription>Se agregan con Enter o coma y ordenan los servicios en los reportes.</FieldDescription>
          </Field>
        </SettingsSection>
      </SettingsGrid>

      <div className="flex justify-end">
        <Button disabled={domainInvalid} type="submit">
          Aplicar cambios
        </Button>
      </div>
    </form>
  )
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { services, deployments } = useProject()
  const service = services.find((s) => s.id === id)

  if (!service) {
    return (
      <AppShellContent>
        <EmptyState
          action={
            <Link className={buttonVariants()} href={CONSOLE_PATH}>
              Volver a Servicios
            </Link>
          }
          description="Puede que no exista en este proyecto."
          title="No encontramos ese servicio"
        />
      </AppShellContent>
    )
  }

  const status = SERVICE_STATUS[service.status]
  const stopped = service.status === "stopped"
  const notice = healthNotice(service)
  const usage = instanceUsage(service)

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>{service.name}</PageHeaderTitle>
        <PageHeaderDescription>
          {service.kind} · {service.url}
        </PageHeaderDescription>
        <PageHeaderActions>
          <Badge color={status.color}>{status.label}</Badge>
          <Link className={buttonVariants({ variant: "secondary" })} href={`${LOGS_PATH}?service=${service.name}`}>
            <TerminalIcon />
            Ver logs
          </Link>
          <Button disabled={stopped} onClick={() => toast.success(`Reiniciando ${service.name}`)}>
            <RotateCwIcon />
            Reiniciar
          </Button>
        </PageHeaderActions>
      </PageHeader>

      {notice && (
        <Alert variant={notice.variant}>
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>
            {notice.text}{" "}
            <TextLink render={<Link href={`${LOGS_PATH}?service=${service.name}`} />} trailing="chevron">
              Ver los logs
            </TextLink>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="metrics">
        {/* Sin los 8 px que la línea de las pestañas se saca de cada lado: acá queda a ras del contenido. */}
        <TabsList className="mx-0 w-full">
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent className="flex flex-col gap-4 pt-4" value="metrics">
          <ServiceMetrics service={service} />
          <WidgetCard subtitle="Cada instancia, sobre su tope" title="Uso por instancia">
            {stopped ? (
              <p className="text-callout text-label-secondary">El servicio está detenido: no hay instancias corriendo.</p>
            ) : (
              <div className={`grid grid-cols-1 gap-x-8 gap-y-5 ${USAGE_COLUMNS[columnsFor(usage.length)]}`}>
                {usage.map((instance) => (
                  <div className="flex flex-col gap-3" key={instance.name}>
                    <span className="font-mono text-callout text-label">{instance.name}</span>
                    <Meter aria-label={`CPU de ${instance.name}`} label="CPU" max={100} showValue value={instance.cpu} />
                    <Meter aria-label={`Memoria de ${instance.name}`} label="Memoria" max={100} showValue value={instance.memory} />
                  </div>
                ))}
              </div>
            )}
          </WidgetCard>
        </TabsContent>

        <TabsContent className="pt-4" value="events">
          <WidgetCard subtitle="Despliegues y cambios de este servicio" title="Eventos">
            <Timeline aria-label="Eventos del servicio">
              {eventsFor(service, deployments).map((event, index) => (
                <TimelineItem description={event.description} dot={event.dot} key={index} time={event.time} title={event.title} />
              ))}
            </Timeline>
          </WidgetCard>
        </TabsContent>

        <TabsContent className="pt-4" value="settings">
          <SettingsForm key={service.id} service={service} />
        </TabsContent>
      </Tabs>
    </AppShellContent>
  )
}
