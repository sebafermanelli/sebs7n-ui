import type { BadgeProps } from "sebs7n-ui/badge"

import type { DeployStatus, ServiceStatus } from "../_data/mock"

export const SERVICE_STATUS: Record<ServiceStatus, { label: string; color: BadgeProps["color"] }> = {
  running: { label: "En ejecución", color: "green" },
  building: { label: "Compilando", color: "amber" },
  failed: { label: "Con error", color: "red" },
  stopped: { label: "Detenido", color: "gray" },
}

export const DEPLOY_STATUS: Record<DeployStatus, { label: string; color: BadgeProps["color"] }> = {
  live: { label: "En vivo", color: "green" },
  building: { label: "Compilando", color: "amber" },
  failed: { label: "Falló", color: "red" },
  superseded: { label: "Reemplazado", color: "gray" },
}
