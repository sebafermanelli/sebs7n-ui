import type { AlertRuleId } from "../_state/mutations"
import type { Deployment, Service } from "./mock"

export interface ConsoleNotification {
  id: string
  title: string
  description: string
  time: string
  level: "error" | "warn"
}

const ALL_RULES: readonly AlertRuleId[] = ["deploy-failed", "service-down", "cpu-high", "memory-high"]

/** Los avisos salen de lo que ya está en pantalla: despliegues fallidos, servicios caídos y uso alto. */
export function notificationsFor(services: Service[], deployments: Deployment[], rules: readonly AlertRuleId[] = ALL_RULES): ConsoleNotification[] {
  const on = (rule: AlertRuleId) => rules.includes(rule)
  const failedDeploys = deployments
    .filter((d) => on("deploy-failed") && d.status === "failed")
    .map<ConsoleNotification>((d) => ({ id: `deploy-${d.id}`, title: "Despliegue fallido", description: `${d.service} · ${d.commit}`, time: d.startedAt, level: "error" }))
  const down = services
    .filter((s) => on("service-down") && s.status === "failed")
    .map<ConsoleNotification>((s) => ({ id: `down-${s.id}`, title: "Servicio con error", description: `${s.name} no responde al healthcheck`, time: "Ahora", level: "error" }))
  const usage = services
    .filter((s) => s.status === "running" && ((on("cpu-high") && s.cpu >= 65) || (on("memory-high") && s.memory >= 70)))
    .map<ConsoleNotification>((s) => ({
      id: `usage-${s.id}`,
      title: on("cpu-high") && s.cpu >= 65 ? "CPU alta" : "Memoria alta",
      description: `${s.name} · ${on("cpu-high") && s.cpu >= 65 ? `CPU ${s.cpu} %` : `memoria ${s.memory} %`}`,
      time: "Últimos 15 min",
      level: "warn",
    }))
  return [...failedDeploys, ...down, ...usage]
}
