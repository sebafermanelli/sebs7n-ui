import type { EnvVar, Environment, PlanId, Service } from "../_data/mock"

export interface NewService {
  name: string
  kind: string
  region: string
  plan: PlanId
  repo: string
}

/** `Mi API` → `mi-api`: el id y la dirección salen del nombre. */
export const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/** Un servicio nuevo arranca compilando, con una instancia y sin consumo todavía. */
export function buildService(projectId: string, input: NewService): Service {
  const id = slugify(input.name)
  const web = input.kind === "Web service"
  return {
    id,
    projectId,
    name: id,
    kind: input.kind,
    status: "building",
    instances: 1,
    cpu: 0,
    memory: 0,
    url: web ? `${id}.acme.dev` : "—",
    region: input.region,
    plan: input.plan,
    repo: input.repo,
  }
}

export const hasService = (services: Service[], projectId: string, id: string) => services.some((s) => s.projectId === projectId && s.id === id)

export const sameService = (a: Service, b: Service) => a.projectId === b.projectId && a.id === b.id

/** El siguiente id numérico de variable: los de la semilla son números en texto. */
export const nextEnvId = (vars: EnvVar[]) => String(Math.max(0, ...vars.map((v) => Number(v.id) || 0)) + 1)

export const isEnvKey = (key: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)

const SECRET_KEY = /(SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|API_?KEY|DATABASE_URL)/i

export interface DotenvResult {
  entries: { key: string; value: string; secret: boolean }[]
  /** Renglones que no son un comentario, ni están vacíos, ni tienen la forma `CLAVE=valor`. */
  invalid: number
}

/** Lee un `.env` pegado: `KEY=valor`, con `export`, comillas y comentarios. La última clave repetida gana. */
export function parseDotenv(text: string): DotenvResult {
  const byKey = new Map<string, { key: string; value: string; secret: boolean }>()
  let invalid = 0
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const match = /^(?:export\s+)?([^=\s]+)\s*=\s*(.*)$/.exec(line)
    if (!match || !isEnvKey(match[1]!)) {
      invalid += 1
      continue
    }
    const value = match[2]!.replace(/^(["'])(.*)\1$/, "$2")
    byKey.set(match[1]!, { key: match[1]!, value, secret: SECRET_KEY.test(match[1]!) })
  }
  return { entries: [...byKey.values()], invalid }
}

/** Aplica lo importado sobre las variables de un entorno: pisa las que ya existen y suma las nuevas. */
export function applyImport(all: EnvVar[], projectId: string, environment: Environment, entries: DotenvResult["entries"]) {
  let next = [...all]
  let added = 0
  let updated = 0
  for (const entry of entries) {
    const index = next.findIndex((v) => v.projectId === projectId && v.environment === environment && v.key === entry.key)
    if (index >= 0) {
      next = next.map((v, i) => (i === index ? { ...v, value: entry.value } : v))
      updated += 1
    } else {
      next = [...next, { id: nextEnvId(next), projectId, environment, ...entry }]
      added += 1
    }
  }
  return { vars: next, added, updated }
}

// ---- Variables: grupos y exportación ----

export const ENV_GROUPS = ["Base de datos y caché", "Pagos", "Observabilidad", "General"] as const
export type EnvGroup = (typeof ENV_GROUPS)[number]

/** A qué grupo pertenece una variable, por el nombre: así se ordenan sin que la app las etiquete a mano. */
export function envGroupOf(key: string): EnvGroup {
  if (/^(DATABASE|REDIS|POSTGRES|DB_)/i.test(key)) return "Base de datos y caché"
  if (/^STRIPE/i.test(key)) return "Pagos"
  if (/^(SENTRY|LOG_|OTEL)/i.test(key)) return "Observabilidad"
  return "General"
}

/** Las variables repartidas en sus grupos, en un orden fijo y sin los grupos vacíos. */
export function groupEnvVars<T extends { key: string }>(vars: T[]): { group: EnvGroup; vars: T[] }[] {
  return ENV_GROUPS.map((group) => ({ group, vars: vars.filter((v) => envGroupOf(v.key) === group) })).filter((entry) => entry.vars.length > 0)
}

/** El texto de un `.env` con las variables: `CLAVE=valor`, una por renglón. Lo contrario de `parseDotenv`. */
export const toDotenv = (vars: Pick<EnvVar, "key" | "value">[]) => vars.map((v) => `${v.key}=${/\s|#/.test(v.value) ? `"${v.value}"` : v.value}`).join("\n")

// ---- Orden de arranque ----

/** Reordena los servicios de un proyecto según `ids`; los de los otros proyectos quedan como estaban. */
export function reorderProject(all: Service[], projectId: string, ids: string[]): Service[] {
  const mine = ids.map((id) => all.find((s) => s.projectId === projectId && s.id === id)).filter((s): s is Service => Boolean(s))
  const missing = all.filter((s) => s.projectId === projectId && !ids.includes(s.id))
  return [...all.filter((s) => s.projectId !== projectId), ...mine, ...missing]
}

// ---- Ajustes de un servicio ----

export interface ServiceSettings {
  minInstances: number
  maxInstances: number
  region: string
  domain: string
  labels: string[]
}

export const MAX_INSTANCES = 10

/** Lo que vale mientras nadie lo cambió: de uno a dos tantos de lo que corre hoy, y la región del servicio. */
export const defaultSettings = (service: Service): ServiceSettings => ({
  minInstances: Math.max(1, service.instances),
  maxInstances: Math.min(MAX_INSTANCES, Math.max(2, service.instances * 2)),
  region: service.region,
  domain: "",
  labels: [],
})

export const settingsKey = (projectId: string, id: string) => `${projectId}:${id}`

/** Un dominio propio válido: `app.acme.com`, sin protocolo ni ruta. Vacío vale (no hay dominio propio). */
export const isDomain = (value: string) => value === "" || /^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,}$/i.test(value)

// ---- Alertas, mantenimiento y despliegues programados ----

export const ALERT_RULES = [
  { id: "deploy-failed", label: "Despliegue fallido", description: "Cuando un build o un healthcheck no pasa." },
  { id: "service-down", label: "Servicio caído", description: "Cuando un servicio no responde al healthcheck." },
  { id: "cpu-high", label: "CPU alta", description: "Más de 65 % sostenido durante 15 minutos." },
  { id: "memory-high", label: "Memoria alta", description: "Más de 70 % sostenido durante 15 minutos." },
] as const
export type AlertRuleId = (typeof ALERT_RULES)[number]["id"]

export const ALERT_CHANNELS = [
  { id: "email", label: "Correo" },
  { id: "slack", label: "Slack" },
  { id: "webhook", label: "Webhook" },
] as const

export interface MaintenanceWindow {
  id: string
  projectId: string
  title: string
  /** Fecha y hora local, `2026-10-06T02:00`. */
  start: string
  end: string
}

export interface ScheduledDeploy {
  id: string
  projectId: string
  service: string
  commit: string
  at: string
}

/** La fecha local en el formato de los datos, `2026-10-06T02:00`, sin pasar por la zona horaria. */
export const toLocalIso = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Por qué no se puede programar para esa fecha, o `null` si se puede: tiene que ser a futuro. */
export function scheduleError(date: Date | null, now: Date): string | null {
  if (!date) return "Elegí la fecha y la hora."
  return date.getTime() <= now.getTime() ? "Tiene que ser después de ahora." : null
}

/** Una ventana de mantenimiento válida termina después de empezar. */
export const windowError = (start: Date | null, end: Date | null): string | null => {
  if (!start || !end) return "Elegí cuándo empieza y cuándo termina."
  return end.getTime() <= start.getTime() ? "Tiene que terminar después de empezar." : null
}

export const nextId = (prefix: string, ids: string[]) => `${prefix}-${Math.max(0, ...ids.map((id) => Number(id.split("-").pop()) || 0)) + 1}`
