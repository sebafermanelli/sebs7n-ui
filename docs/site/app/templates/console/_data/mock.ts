export type ServiceStatus = "running" | "building" | "failed" | "stopped"
export type DeployStatus = "live" | "building" | "failed" | "superseded"
export type LogLevel = "info" | "warn" | "error"
export type PlanId = "starter" | "standard" | "pro"
export type Environment = "production" | "staging"

export interface Project {
  id: string
  name: string
  region: string
}

export interface Service {
  id: string
  projectId: string
  name: string
  kind: string
  status: ServiceStatus
  instances: number
  cpu: number
  memory: number
  url: string
  region: string
  plan: PlanId
  repo: string
}

export interface LogLine {
  time: string
  level: LogLevel
  message: string
}

export interface Deployment {
  id: string
  projectId: string
  service: string
  commit: string
  message: string
  author: string
  status: DeployStatus
  startedAt: string
  duration: string
  logs: LogLine[]
}

export interface EnvVar {
  id: string
  projectId: string
  environment: Environment
  key: string
  value: string
  secret: boolean
}

export const REGIONS = ["us-east-1", "sa-east-1", "eu-west-1"]

export const PROJECTS: Project[] = [
  { id: "acme-prod", name: "acme-prod", region: "us-east-1" },
  { id: "acme-staging", name: "acme-staging", region: "sa-east-1" },
  // Un proyecto recién creado: sin servicios, despliegues ni variables (el estado de «cuenta vacía»).
  { id: "acme-sandbox", name: "acme-sandbox", region: "eu-west-1" },
]

export const SERVICES: Service[] = [
  { id: "api", projectId: "acme-prod", name: "api", kind: "Web service", status: "running", instances: 3, cpu: 42, memory: 61, url: "api.acme.dev", region: "us-east-1", plan: "standard", repo: "github.com/acme/api" },
  { id: "web", projectId: "acme-prod", name: "web", kind: "Web service", status: "building", instances: 2, cpu: 18, memory: 34, url: "app.acme.dev", region: "us-east-1", plan: "standard", repo: "github.com/acme/web" },
  { id: "worker", projectId: "acme-prod", name: "worker", kind: "Background worker", status: "running", instances: 2, cpu: 67, memory: 72, url: "—", region: "us-east-1", plan: "pro", repo: "github.com/acme/worker" },
  { id: "cron-billing", projectId: "acme-prod", name: "cron-billing", kind: "Cron job", status: "stopped", instances: 0, cpu: 0, memory: 0, url: "—", region: "us-east-1", plan: "starter", repo: "github.com/acme/billing" },
  { id: "api", projectId: "acme-staging", name: "api", kind: "Web service", status: "running", instances: 1, cpu: 12, memory: 28, url: "api.staging.acme.dev", region: "sa-east-1", plan: "starter", repo: "github.com/acme/api" },
  { id: "web", projectId: "acme-staging", name: "web", kind: "Web service", status: "failed", instances: 1, cpu: 0, memory: 0, url: "app.staging.acme.dev", region: "sa-east-1", plan: "starter", repo: "github.com/acme/web" },
]

const ok = (steps: [string, string, LogLevel?][]): LogLine[] =>
  steps.map(([time, message, level = "info"]) => ({ time, message, level }))

export const DEPLOYMENTS: Deployment[] = [
  {
    id: "d-4821", projectId: "acme-prod", service: "api", commit: "a3f9c21", message: "fix: reintentar webhooks con backoff", author: "Lucía",
    status: "live", startedAt: "Hoy, 14:02", duration: "1 min 48 s",
    logs: ok([["14:02:01", "Clonando repositorio @ a3f9c21"], ["14:02:09", "Instalando dependencias"], ["14:02:41", "Compilando"], ["14:03:12", "Advertencia: 2 paquetes con versión deprecada", "warn"], ["14:03:36", "Imagen publicada (82 MB)"], ["14:03:49", "Healthcheck /healthz → 200"], ["14:03:50", "Despliegue en vivo en 3 instancias"]]),
  },
  {
    id: "d-4820", projectId: "acme-prod", service: "web", commit: "9be1d07", message: "feat: tablero de uso por equipo", author: "Martín",
    status: "building", startedAt: "Hoy, 13:55", duration: "en curso",
    logs: ok([["13:55:02", "Clonando repositorio @ 9be1d07"], ["13:55:10", "Instalando dependencias"], ["13:56:03", "Compilando (next build)"], ["13:56:48", "Optimizando 42 páginas estáticas"]]),
  },
  {
    id: "d-4819", projectId: "acme-prod", service: "worker", commit: "77c0ab4", message: "perf: lotes de 500 en la cola de correos", author: "Lucía",
    status: "failed", startedAt: "Ayer, 18:20", duration: "56 s",
    logs: ok([["18:20:01", "Clonando repositorio @ 77c0ab4"], ["18:20:12", "Instalando dependencias"], ["18:20:50", "Compilando"], ["18:20:56", "error TS2322: el tipo 'string' no es asignable a 'number' (queue.ts:48)", "error"], ["18:20:57", "El build falló con código 1", "error"]]),
  },
  {
    id: "d-4818", projectId: "acme-prod", service: "api", commit: "1d44e8f", message: "chore: subir Node a 24", author: "Martín",
    status: "superseded", startedAt: "Ayer, 11:04", duration: "2 min 03 s",
    logs: ok([["11:04:01", "Clonando repositorio @ 1d44e8f"], ["11:05:30", "Imagen publicada (80 MB)"], ["11:06:04", "Despliegue en vivo en 3 instancias"]]),
  },
  {
    id: "d-77", projectId: "acme-staging", service: "api", commit: "a3f9c21", message: "fix: reintentar webhooks con backoff", author: "Lucía",
    status: "live", startedAt: "Hoy, 13:40", duration: "1 min 30 s",
    logs: ok([["13:40:01", "Clonando repositorio @ a3f9c21"], ["13:41:15", "Imagen publicada (82 MB)"], ["13:41:31", "Despliegue en vivo en 1 instancia"]]),
  },
  {
    id: "d-76", projectId: "acme-staging", service: "web", commit: "9be1d07", message: "feat: tablero de uso por equipo", author: "Martín",
    status: "failed", startedAt: "Hoy, 13:10", duration: "2 min 12 s",
    logs: ok([["13:10:01", "Clonando repositorio @ 9be1d07"], ["13:12:05", "Healthcheck / → 502", "error"], ["13:12:13", "Se revirtió al despliegue anterior", "warn"]]),
  },
]

export const ENV_VARS: EnvVar[] = [
  { id: "1", projectId: "acme-prod", environment: "production", key: "DATABASE_URL", value: "postgres://app:s3cr3t@db.acme.internal:5432/acme", secret: true },
  { id: "2", projectId: "acme-prod", environment: "production", key: "STRIPE_SECRET_KEY", value: "demo_key_0000000000000000", secret: true },
  { id: "3", projectId: "acme-prod", environment: "production", key: "NODE_ENV", value: "production", secret: false },
  { id: "4", projectId: "acme-prod", environment: "production", key: "LOG_LEVEL", value: "info", secret: false },
  { id: "7", projectId: "acme-prod", environment: "staging", key: "DATABASE_URL", value: "postgres://app:t3st@db.stg.acme.internal:5432/acme", secret: true },
  { id: "8", projectId: "acme-prod", environment: "staging", key: "NODE_ENV", value: "staging", secret: false },
  { id: "9", projectId: "acme-prod", environment: "production", key: "REDIS_URL", value: "redis://cache.acme.internal:6379/0", secret: true },
  { id: "10", projectId: "acme-prod", environment: "production", key: "STRIPE_WEBHOOK_SECRET", value: "whsec_9f2c000000000000", secret: true },
  { id: "11", projectId: "acme-prod", environment: "production", key: "SENTRY_DSN", value: "https://key@o0.ingest.sentry.io/0", secret: false },
  { id: "12", projectId: "acme-prod", environment: "production", key: "PORT", value: "8080", secret: false },
  { id: "5", projectId: "acme-staging", environment: "production", key: "DATABASE_URL", value: "postgres://app:t3st@db.staging.internal:5432/acme", secret: true },
  { id: "6", projectId: "acme-staging", environment: "production", key: "NODE_ENV", value: "staging", secret: false },
]
