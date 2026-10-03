"use client"

import { ActivityIcon, CircleAlertIcon, CpuIcon, RocketIcon, WalletIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "sebs7n-ui/badge"
import type { WidgetDef } from "sebs7n-ui/lib/widget-layout"
import { List, ListRow } from "sebs7n-ui/list-row"
import { Meter } from "sebs7n-ui/meter"
import { Skeleton } from "sebs7n-ui/skeleton"
import { Sparkline } from "sebs7n-ui/sparkline"
import { StatGrid } from "sebs7n-ui/stat-grid"
import { linkVariants } from "sebs7n-ui/variants/link"
import { WidgetCard } from "sebs7n-ui/widget-card"

import { BILLING, monthlyCost, spentSoFar } from "../_data/costs"
import { halfChange, projectSeries } from "../_data/derive"
import type { Deployment, Service } from "../_data/mock"
import { COSTS_PATH, DEPLOYMENTS_PATH, servicePath } from "../_lib/routes"
import { DEPLOY_STATUS, SERVICE_STATUS } from "./status"

const dollars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

/** La clave del panel de Resumen: una por proyecto, porque cada uno tiene sus servicios y sus widgets. */
export const consoleWidgetsKey = (projectId: string) => `console:${projectId}:overview-widgets`

/** Los despliegues recientes del proyecto, los más nuevos primero (el mock ya viene en ese orden). */
export const RECENT_DEPLOYMENTS = 4

const trendOf = (values: number[], goodWhenUp: boolean) => {
  const change = halfChange(values)
  if (change == null) return {}
  const rounded = Math.round(Math.abs(change) * 10) / 10
  if (rounded === 0) return { delta: "= 0 %", trend: "neutral" as const }
  return { delta: `${change > 0 ? "↗" : "↘"} ${rounded.toLocaleString("es-AR")} %`, trend: change > 0 === goodWhenUp ? ("up" as const) : ("down" as const) }
}

type Input = { services: Service[]; deployments: Deployment[]; loading: boolean }

/**
 * Los widgets del Resumen, en su orden original: CPU, requests, servicios con errores y costo del mes (`sm`, una
 * columna de cuatro) y los despliegues recientes (`lg`, el ancho entero). Las cifras salen de los servicios del
 * proyecto activo, con la misma serie que la lista (`seriesFor`).
 */
export function useConsoleWidgets({ services, deployments, loading }: Input): WidgetDef[] {
  const running = services.filter((service) => service.status === "running")
  const cpu = projectSeries(services, "cpu")
  const requests = projectSeries(services, "requests")
  const failed = services.filter((service) => service.status === "failed")
  const spent = services.reduce((sum, service) => sum + spentSoFar(service), 0)
  const estimate = services.reduce((sum, service) => sum + monthlyCost(service), 0)
  const recent = deployments.slice(0, RECENT_DEPLOYMENTS)

  return [
    {
      id: "cpu",
      title: "CPU del proyecto",
      description: "El promedio de los servicios que corren.",
      icon: <CpuIcon />,
      preview: <Sparkline values={cpu} />,
      render: () => (
        <StatGrid
          columns={1}
          items={[
            {
              id: "cpu",
              label: "CPU del proyecto",
              value: cpu.length ? `${cpu.at(-1)} %` : "—",
              ...trendOf(cpu, false),
              hint: `Promedio de ${running.length} ${running.length === 1 ? "servicio" : "servicios"} en ejecución`,
              chart: cpu.length ? <Sparkline className="h-14" values={cpu} /> : undefined,
            },
          ]}
          loading={loading}
        />
      ),
    },
    {
      id: "requests",
      title: "Requests por minuto",
      description: "La suma de todos los servicios.",
      icon: <ActivityIcon />,
      preview: <Sparkline values={requests} />,
      render: () => (
        <StatGrid
          columns={1}
          items={[
            {
              id: "requests",
              label: "Requests por minuto",
              value: requests.length ? String(requests.at(-1)) : "—",
              ...trendOf(requests, true),
              hint: "Sumando los servicios en ejecución",
              chart: requests.length ? <Sparkline className="h-14" values={requests} /> : undefined,
            },
          ]}
          loading={loading}
        />
      ),
    },
    {
      id: "errors",
      title: "Servicios con errores",
      description: "Los que están en estado «Con error» ahora.",
      icon: <CircleAlertIcon />,
      preview: <span className="text-footnote text-label">{failed.length === 0 ? "Todo en orden" : `${failed.length} con error`}</span>,
      render: () => (
        <WidgetCard subtitle={`${failed.length} de ${services.length}`} title="Servicios con errores">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : failed.length === 0 ? (
            <p className="text-callout text-label-secondary">Ningún servicio con errores.</p>
          ) : (
            <List aria-label="Servicios con errores">
              {failed.map((service) => (
                <ListRow
                  description={SERVICE_STATUS[service.status].label}
                  dot="red"
                  key={service.id}
                  title={
                    <Link className={linkVariants({ variant: "accent" })} href={servicePath(service.id)}>
                      {service.name}
                    </Link>
                  }
                />
              ))}
            </List>
          )}
        </WidgetCard>
      ),
    },
    {
      id: "cost",
      title: "Costo del mes",
      description: "Lo consumido contra el presupuesto.",
      icon: <WalletIcon />,
      preview: <Meter aria-label="Consumo del mes" max={BILLING.budget} size="sm" value={spent} />,
      render: () => (
        <WidgetCard subtitle={`Al día ${BILLING.elapsedDays} de ${BILLING.days}`} title="Costo del mes">
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-title-2 text-label tabular-nums">{dollars.format(spent)}</p>
              <Meter label="Del presupuesto" locale="es-AR" max={BILLING.budget} showValue value={spent} />
              <p className="text-callout text-label-secondary">{`Estimado a fin de mes: ${dollars.format(estimate)} de ${dollars.format(BILLING.budget)}.`}</p>
              <Link className={linkVariants({ variant: "accent" })} href={COSTS_PATH}>
                Ver costos
              </Link>
            </div>
          )}
        </WidgetCard>
      ),
    },
    {
      id: "deployments",
      title: "Despliegues recientes",
      size: "lg",
      description: "Los últimos despliegues, con su estado.",
      icon: <RocketIcon />,
      preview: <span className="truncate text-footnote text-label">{recent[0] ? `${recent[0].service} · ${recent[0].message}` : "Sin despliegues"}</span>,
      render: () => (
        <WidgetCard subtitle="Los más nuevos primero" title="Despliegues recientes">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : recent.length === 0 ? (
            <p className="text-callout text-label-secondary">Todavía no hay despliegues.</p>
          ) : (
            <List aria-label="Despliegues recientes">
              {recent.map((deployment) => (
                <ListRow
                  description={`${deployment.message} · ${deployment.startedAt}`}
                  key={deployment.id}
                  title={`${deployment.service} · ${deployment.commit}`}
                  trailing={<Badge color={DEPLOY_STATUS[deployment.status].color}>{DEPLOY_STATUS[deployment.status].label}</Badge>}
                />
              ))}
            </List>
          )}
          <Link className={linkVariants({ variant: "accent" })} href={DEPLOYMENTS_PATH}>
            Ver todos los despliegues
          </Link>
        </WidgetCard>
      ),
    },
  ]
}
