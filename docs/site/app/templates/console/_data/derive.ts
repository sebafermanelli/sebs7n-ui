import type { StepperStep } from "sebs7n-ui/stepper"

import type { BadgeColor } from "./badge-color"
import type { Deployment, LogLevel, LogLine, Service } from "./mock"

/** Un generador determinista: el mismo servicio da siempre la misma curva, en el servidor y en el cliente. */
function seeded(seed: string) {
  let state = [...seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

export type Metric = "cpu" | "memory" | "requests"

/** Las últimas 24 mediciones de un servicio, la última igual a lo que dice la lista. */
export function seriesFor(service: Service, metric: Metric): number[] {
  const next = seeded(`${service.id}:${service.projectId}:${metric}`)
  const last = metric === "cpu" ? service.cpu : metric === "memory" ? service.memory : service.instances * 140
  const scale = metric === "requests" ? 120 : 14
  const points = Array.from({ length: 23 }, () => Math.max(0, last + (next() - 0.5) * scale))
  return [...points, last]
}

/**
 * La serie de todo el proyecto: la CPU es el promedio de los servicios que corren y los requests, la suma. Es la
 * misma de cada servicio (`seriesFor`), así la cifra del panel coincide con la de la lista. Sin servicios, `[]`.
 */
export function projectSeries(services: Service[], metric: "cpu" | "requests"): number[] {
  const running = services.filter((service) => service.status === "running")
  if (running.length === 0) return []
  const all = running.map((service) => seriesFor(service, metric))
  return all[0]!.map((_, index) => {
    const sum = all.reduce((total, series) => total + series[index]!, 0)
    return Math.round(metric === "cpu" ? sum / running.length : sum)
  })
}

/** Los rangos de las métricas del servicio: cuántos puntos y cada cuántos minutos se mide. */
export type MetricRange = "1h" | "6h" | "24h"
export const METRIC_RANGES: { id: MetricRange; label: string; long: string; points: number; stepMinutes: number }[] = [
  { id: "1h", label: "1 h", long: "Última hora", points: 60, stepMinutes: 1 },
  { id: "6h", label: "6 h", long: "Últimas 6 horas", points: 72, stepMinutes: 5 },
  { id: "24h", label: "24 h", long: "Últimas 24 horas", points: 96, stepMinutes: 15 },
]

// La hora «de ahora» de la maqueta, fija: el render no lee el reloj, así el servidor y el cliente dibujan lo mismo.
const NOW_MINUTES = 14 * 60 + 30

/**
 * Una serie larga y con forma de caminata (cada punto vuelve despacio hacia el promedio y se
 * aleja un poco al azar), con el rótulo de hora de cada medición. Termina en lo que dice la lista.
 * Determinista: sale del id del servicio y de la métrica.
 */
export function rangeSeriesFor(service: Service, metric: Metric, range: MetricRange): { label: string; value: number }[] {
  const config = METRIC_RANGES.find((item) => item.id === range)!
  const next = seeded(`${service.id}:${service.projectId}:${metric}:${range}`)
  const last = metric === "cpu" ? service.cpu : metric === "memory" ? service.memory : service.instances * 140
  const mean = metric === "memory" ? last : last * 0.9
  const wobble = metric === "requests" ? Math.max(40, last * 0.16) : 9
  const ceiling = metric === "requests" ? Infinity : 100
  const backwards = [last]
  for (let index = 1; index < config.points; index++) {
    const previous = backwards[index - 1]!
    backwards.push(Math.min(ceiling, Math.max(0, Math.round(previous + (mean - previous) * 0.12 + (next() - 0.5) * wobble))))
  }
  return backwards.reverse().map((value, index) => {
    const minutes = (NOW_MINUTES - (config.points - 1 - index) * config.stepMinutes + 1440) % 1440
    return { label: `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`, value }
  })
}

/** El cambio de la segunda mitad de una serie contra la primera, en %; `null` sin base. */
export function halfChange(values: number[]): number | null {
  const half = Math.floor(values.length / 2)
  const average = (list: number[]) => list.reduce((sum, value) => sum + value, 0) / (list.length || 1)
  const before = average(values.slice(0, half))
  return before === 0 ? null : ((average(values.slice(half)) - before) / before) * 100
}

/** El uso de cada instancia: alrededor del promedio del servicio, con el tope en 100. */
export function instanceUsage(service: Service) {
  const next = seeded(`${service.id}:${service.projectId}:inst`)
  return Array.from({ length: service.instances }, (_, index) => ({
    name: `${service.name}-${index + 1}`,
    cpu: Math.min(100, Math.round(service.cpu + (next() - 0.5) * 16)),
    memory: Math.min(100, Math.round(service.memory + (next() - 0.5) * 10)),
  }))
}

export interface ServiceEvent {
  title: string
  description: string
  time: string
  dot: BadgeColor
}

export function eventsFor(service: Service, deployments: Deployment[]): ServiceEvent[] {
  const mine = deployments.filter((d) => d.service === service.name)
  const fromDeploys = mine.map<ServiceEvent>((d) => ({
    title: d.status === "failed" ? "Despliegue fallido" : d.status === "building" ? "Despliegue en curso" : "Despliegue publicado",
    description: `${d.commit} · ${d.message}`,
    time: d.startedAt,
    dot: d.status === "failed" ? "red" : d.status === "building" ? "amber" : "green",
  }))
  const scaling: ServiceEvent = { title: "Escalado a " + service.instances + " instancias", description: "Aplicado por Lucía", time: "Hace 3 días", dot: "blue" }
  return service.instances > 0 ? [...fromDeploys, scaling] : fromDeploys
}

export const PIPELINE = ["Clonar", "Compilar", "Publicar", "Healthcheck"] as const

/** Los pasos de un despliegue y en cuál está: lo que falló, en rojo; lo que sigue, pendiente. */
export function pipelineOf(deployment: Deployment): { steps: StepperStep[]; current: number } {
  const stoppedAt = deployment.status === "building" ? 1 : deployment.status === "failed" ? failedStep(deployment) : PIPELINE.length
  const steps = PIPELINE.map<StepperStep>((title, index) => ({
    title,
    status: deployment.status === "failed" && index === stoppedAt ? "error" : undefined,
  }))
  // Un despliegue terminado (`stoppedAt` = todos los pasos) los deja todos completos: ninguno queda «en curso».
  return { steps, current: stoppedAt }
}

// El paso donde cortó: el healthcheck si el log lo nombra, si no la compilación.
const failedStep = (deployment: Deployment) => (deployment.logs.some((line) => line.message.includes("Healthcheck")) ? 3 : 1)

export const BUILD_TAIL = ["Generando páginas estáticas (28/42)", "Generando páginas estáticas (42/42)", "Subiendo artefactos", "Imagen publicada (91 MB)"]

const pad = (n: number) => String(n).padStart(2, "0")

/** La línea `index` que sigue al log de un build en curso: 3 s después de la anterior, con la hora calculada (no la del reloj). */
export function buildTailLine(deployment: Deployment, index: number): LogLine {
  const [h, m, sec] = (deployment.logs.at(-1)?.time ?? "00:00:00").split(":").map(Number)
  const total = (h ?? 0) * 3600 + (m ?? 0) * 60 + (sec ?? 0) + 3 * (index + 1)
  const time = `${pad(Math.floor(total / 3600) % 24)}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`
  return { time, level: "info", message: BUILD_TAIL[index % BUILD_TAIL.length]! }
}

/** Cuánto lleva un build en curso, de 0 a 99: sale de las líneas que ya escribió, no de un número suelto. */
export const buildProgress = (deployment: Deployment) => Math.min(99, Math.round((deployment.logs.length / (deployment.logs.length + 3)) * 100))

/** Cuántas columnas para repartir `count` cosas parejas, sin dejar una huérfana abajo (3 → 3, 4 → 2, 5 y 6 → 3). */
export function columnsFor(count: number): 1 | 2 | 3 | 4 {
  if (count <= 3) return Math.max(1, count) as 1 | 2 | 3
  if (count === 4) return 2
  if (count <= 6) return 3
  return ([4, 3, 2] as const).find((columns) => count % columns !== 1) ?? 4
}

/** El «ahora» de la demo: fijo, así el HTML del servidor es el mismo que el del cliente. */
export const NOW_ISO = "2026-10-02T14:00:00"

export interface RuntimeLine extends LogLine {
  id: number
  service: string
}

const MESSAGES: [LogLevel, string][] = [
  ["info", "GET /v1/invoices 200 in 18ms"],
  ["info", "POST /v1/webhooks 202 in 41ms"],
  ["info", "GET /healthz 200 in 1ms"],
  ["info", "Conexión a la base establecida (pool 8/20)"],
  ["warn", "Respuesta lenta de stripe.com: 1.8 s"],
  ["info", "Trabajo email.send procesado en 220ms"],
  ["error", "ECONNRESET al llamar a hooks.acme.dev (reintento 2/5)"],
  ["info", "Caché regenerada: 312 entradas"],
]

// Un reloj simulado: la línea `index` sale `index` segundos después de las 14:00. Así las del arranque
// y las de la cola en vivo son una sola secuencia, y el HTML del servidor coincide con el del cliente.
const CLOCK_START = new Date(NOW_ISO).getTime()

/** La línea `index` del log de ejecución de un servicio: la misma cada vez que se la pide. */
export function runtimeLine(services: Service[], index: number): RuntimeLine {
  const next = seeded(`runtime:${index}`)
  const running = services.filter((s) => s.status === "running")
  const pool = running.length > 0 ? running : services
  const service = pool[Math.floor(next() * pool.length)]!
  const [level, message] = MESSAGES[Math.floor(next() * MESSAGES.length)]!
  const time = new Date(CLOCK_START + index * 1000).toTimeString().slice(0, 8)
  return { id: index, time, level, message, service: service?.name ?? "—" }
}

/** Las 120 líneas con las que arranca el visor. */
export function initialRuntimeLogs(services: Service[]) {
  if (services.length === 0) return []
  return Array.from({ length: 120 }, (_, index) => runtimeLine(services, index))
}
