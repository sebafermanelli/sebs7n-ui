"use client"

import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { List, ListRow } from "sebs7n-ui/list-row"
import { StackedMeter, type StackedMeterSegment } from "sebs7n-ui/meter"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { StatGrid, type StatGridItem } from "sebs7n-ui/stat-grid"
import { WidgetCard } from "sebs7n-ui/widget-card"

import { PlanCard } from "../_components/plan-card"
import { SERVICE_STATUS } from "../_components/status"
import { BILLING, limitsFor, monthlyCost, PLANS, spentSoFar } from "../_data/costs"
import { useProject } from "../_state/project-context"

const dollars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const COLORS: StackedMeterSegment["color"][] = ["blue", "teal", "purple", "amber", "green"]

export default function CostsPage() {
  const { project, services, deployments, loading } = useProject()
  const spent = services.reduce((sum, s) => sum + spentSoFar(s), 0)
  const estimate = services.reduce((sum, s) => sum + monthlyCost(s), 0)
  const left = BILLING.budget - estimate
  const billed = services.filter((s) => spentSoFar(s) > 0)
  const items: StatGridItem[] = [
    { label: "Consumo del mes", value: dollars.format(spent), hint: `Al día ${BILLING.elapsedDays} de ${BILLING.days}` },
    { label: "Estimado a fin de mes", value: dollars.format(estimate), hint: "Con lo que corre hoy" },
    {
      label: "Presupuesto",
      value: dollars.format(BILLING.budget),
      badge: left >= 0 ? { text: `Sobran ${dollars.format(left)}`, color: "green" } : { text: `Se pasa ${dollars.format(-left)}`, color: "red" },
      hint: "Tope mensual del proyecto",
    },
  ]
  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Estado y costos</PageHeaderTitle>
        <PageHeaderDescription>Lo que consume {project.name} este mes y cuánto le queda del plan.</PageHeaderDescription>
      </PageHeader>

      <PlanCard limits={limitsFor(services, deployments)} services={services.length} />

      <StatGrid items={items} loading={loading} />

      <WidgetCard subtitle={`${dollars.format(spent)} de ${dollars.format(BILLING.budget)} de presupuesto`} title="Consumo por servicio">
        {billed.length === 0 ? (
          <p className="text-callout text-label-secondary">Ningún servicio consumió nada este mes.</p>
        ) : (
          <StackedMeter
            aria-label="Consumo por servicio"
            format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
            legend
            locale="es-AR"
            max={BILLING.budget}
            segments={billed.map((service, index) => ({ label: service.name, value: spentSoFar(service), color: COLORS[index % COLORS.length] }))}
          />
        )}
      </WidgetCard>

      <WidgetCard subtitle="Instancias por el precio de su plan" title="Detalle por servicio">
        <List aria-label="Costo de cada servicio">
          {services.map((service) => (
            <ListRow
              description={`${PLANS[service.plan].label} · ${service.instances} × ${dollars.format(PLANS[service.plan].price)} · ${SERVICE_STATUS[service.status].label}`}
              key={service.id}
              title={service.name}
              trailing={<span className="tabular-nums">{`${dollars.format(monthlyCost(service))}/mes`}</span>}
            />
          ))}
        </List>
      </WidgetCard>
    </AppShellContent>
  )
}
