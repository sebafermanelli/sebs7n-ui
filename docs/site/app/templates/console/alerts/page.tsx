"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"
import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { Card, CardContent } from "sebs7n-ui/card"
import { CheckboxGroup, CheckboxGroupItem } from "sebs7n-ui/checkbox-group"
import { Field, FieldDescription } from "sebs7n-ui/field"
import { Fieldset, FieldsetLegend } from "sebs7n-ui/fieldset"
import { List, ListRow } from "sebs7n-ui/list-row"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Skeleton } from "sebs7n-ui/skeleton"
import { WidgetCard } from "sebs7n-ui/widget-card"
import { toast } from "sonner"

import { calendarEvents } from "../_data/calendar"
import { NOW_ISO } from "../_data/derive"
import { ALERT_CHANNELS, ALERT_RULES, type AlertRuleId } from "../_state/mutations"
import { useProject } from "../_state/project-context"
import { MaintenanceDialog } from "../_components/maintenance-dialog"

// El calendario es de lo más pesado de la sección: se pide por separado y deja un esqueleto del alto final.
const CalendarView = dynamic(() => import("sebs7n-ui/calendar-view").then((module) => module.CalendarView), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
})

const NOW = new Date(NOW_ISO)
const dayTime = (iso: string) => new Date(iso).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

export default function AlertsPage() {
  const { project, alertRules, setAlertRules, maintenance, removeMaintenance, scheduled } = useProject()
  const [channels, setChannels] = useState<string[]>(["email"])
  const [creating, setCreating] = useState(false)
  const events = useMemo(() => calendarEvents(maintenance, scheduled), [maintenance, scheduled])

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Alertas y mantenimiento</PageHeaderTitle>
        <PageHeaderDescription>Qué avisa {project.name}, por dónde y cuándo no debería avisar.</PageHeaderDescription>
        <PageHeaderActions>
          <Button onClick={() => setCreating(true)}>
            <PlusIcon />
            Ventana de mantenimiento
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-2">
        <Card>
          <CardContent>
            <Fieldset className="flex flex-col gap-3">
              <FieldsetLegend>Reglas de alerta</FieldsetLegend>
              <Field name="rules">
                <CheckboxGroup onValueChange={(value) => setAlertRules(value as AlertRuleId[])} value={alertRules}>
                  {ALERT_RULES.map((rule) => (
                    <CheckboxGroupItem description={rule.description} key={rule.id} value={rule.id}>
                      {rule.label}
                    </CheckboxGroupItem>
                  ))}
                </CheckboxGroup>
                <FieldDescription>Lo que se apaga acá deja de aparecer también en las notificaciones.</FieldDescription>
              </Field>
            </Fieldset>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Fieldset className="flex flex-col gap-3">
              <FieldsetLegend>Canales</FieldsetLegend>
              <Field name="channels">
                <CheckboxGroup onValueChange={setChannels} value={channels}>
                  {ALERT_CHANNELS.map((channel) => (
                    <CheckboxGroupItem key={channel.id} value={channel.id}>
                      {channel.label}
                    </CheckboxGroupItem>
                  ))}
                </CheckboxGroup>
                <FieldDescription>{channels.length === 0 ? "Sin canales, las alertas solo se ven en la consola." : "Las alertas llegan por todos los canales tildados."}</FieldDescription>
              </Field>
            </Fieldset>
          </CardContent>
        </Card>
      </div>

      <WidgetCard subtitle="En ámbar, las ventanas; en azul, los despliegues programados" title="Calendario">
        <div className="flex flex-col gap-6">
        <CalendarView aria-label="Mantenimiento y despliegues programados" className="w-full" defaultDate={NOW} events={events} locale="es-AR" now={NOW} />
        {maintenance.length === 0 ? (
          <p className="text-callout text-label-secondary">No hay ventanas de mantenimiento agendadas.</p>
        ) : (
          <List aria-label="Ventanas de mantenimiento">
            {maintenance.map((window) => (
              <ListRow
                description={`${dayTime(window.start)} a ${dayTime(window.end)}`}
                dot="amber"
                key={window.id}
                title={window.title}
                trailing={
                  <Button
                    aria-label={`Quitar la ventana ${window.title}`}
                    onClick={() => {
                      removeMaintenance(window.id)
                      toast(`${window.title} quitada`)
                    }}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Trash2Icon />
                  </Button>
                }
              />
            ))}
          </List>
        )}
        </div>
      </WidgetCard>
      <MaintenanceDialog onOpenChange={setCreating} open={creating} />
    </AppShellContent>
  )
}
