import { BILLING, monthlyCost } from "./costs"
import { runtimeLine } from "./derive"
import type { Deployment, Project, Service } from "./mock"

export interface AssistantContext {
  project: Project
  services: Service[]
  deployments: Deployment[]
}

export const SUGGESTIONS = ["¿Qué despliegue falló?", "¿Cómo están los servicios?", "Mostrame los últimos errores", "¿Cuánto vamos a gastar?"]

const plain = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")

const has = (text: string, words: string[]) => words.some((word) => text.includes(word))

const STATUS = { running: "en ejecución", building: "compilando", failed: "con error", stopped: "detenido" } as const

/**
 * La respuesta simulada del asistente: reglas sobre lo que hay en pantalla, sin modelo ni red. La misma
 * pregunta da siempre la misma respuesta, así el servidor y el cliente coinciden y se puede probar.
 */
export function answerFor(question: string, { project, services, deployments }: AssistantContext): string {
  const q = plain(question)
  if (services.length === 0) return `${project.name} todavía no tiene servicios. Creá el primero desde «Nuevo servicio» y te cuento cómo le va.`

  if (has(q, ["fall", "roto", "rompi"])) {
    const failed = deployments.filter((d) => d.status === "failed")
    if (failed.length === 0) return "No hay despliegues fallidos en este proyecto."
    return failed
      .map((d) => {
        const error = d.logs.find((line) => line.level === "error")
        return `${d.service} (${d.commit}, ${d.startedAt}): ${error ? error.message : "falló sin dejar un error en el log"}.`
      })
      .join("\n")
  }

  if (has(q, ["error", "log", "problema"])) {
    const errors = Array.from({ length: 120 }, (_, index) => runtimeLine(services, index)).filter((line) => line.level === "error")
    const last = errors.slice(-3)
    if (last.length === 0) return "No hay errores en las últimas 120 líneas de log."
    return `${errors.length} errores en las últimas 120 líneas. Los últimos:\n${last.map((line) => `${line.time} ${line.service}: ${line.message}`).join("\n")}`
  }

  if (has(q, ["gast", "cost", "plata", "presupuesto", "cuanto"])) {
    const estimate = services.reduce((sum, s) => sum + monthlyCost(s), 0)
    const left = BILLING.budget - estimate
    return `El estimado a fin de mes es US$ ${estimate} sobre un presupuesto de US$ ${BILLING.budget}: ${left >= 0 ? `sobran US$ ${left}` : `se pasa por US$ ${-left}`}.`
  }

  if (has(q, ["servicio", "estado", "como", "salud", "corre"])) {
    const lines = services.map((s) => `${s.name}: ${STATUS[s.status]}${s.status === "running" ? ` (CPU ${s.cpu} %, memoria ${s.memory} %)` : ""}`)
    return `${services.length} servicios en ${project.name}.\n${lines.join("\n")}`
  }

  return "Puedo contarte de despliegues fallidos, del estado de los servicios, de los últimos errores o de lo que vas a gastar. Probá con una de esas preguntas."
}
