"use client"

import { HoverCardContent, HoverCardHeader } from "sebs7n-ui/hover-card"
import { Badge } from "sebs7n-ui/badge"

import type { Deployment, Service } from "../_data/mock"
import { PLANS } from "../_data/costs"
import { SERVICE_STATUS } from "./status"

// Lo que se ve al pasar el mouse por el nombre de un servicio. Todo esto está también en su detalle:
// en el teléfono y con teclado la tarjeta no aparece, y el link lleva al mismo lugar.
export function ServicePreview({ service, deployments }: { service: Service; deployments: Deployment[] }) {
  const last = deployments.find((d) => d.service === service.name)
  return (
    <HoverCardContent>
      <HoverCardHeader>
        <div className="flex min-w-0 flex-col">
          <span className="text-headline text-label">{service.name}</span>
          <span className="text-callout text-label-secondary">{service.kind}</span>
        </div>
        <Badge color={SERVICE_STATUS[service.status].color} size="sm">
          {SERVICE_STATUS[service.status].label}
        </Badge>
      </HoverCardHeader>
      <p className="text-callout text-label-secondary">
        {service.region} · plan {PLANS[service.plan].label} · {service.instances} {service.instances === 1 ? "instancia" : "instancias"}
      </p>
      {last ? (
        <p className="text-callout text-label">
          <span className="font-mono">{last.commit}</span> · {last.message}
          <span className="block text-label-secondary">
            {last.author} · {last.startedAt}
          </span>
        </p>
      ) : (
        <p className="text-callout text-label-secondary">Sin despliegues todavía.</p>
      )}
    </HoverCardContent>
  )
}
