import type { Deployment, PlanId, Service } from "./mock"

export const PLANS: Record<PlanId, { label: string; spec: string; price: number }> = {
  starter: { label: "Starter", spec: "0,5 vCPU · 512 MB", price: 7 },
  standard: { label: "Standard", spec: "1 vCPU · 2 GB", price: 25 },
  pro: { label: "Pro", spec: "2 vCPU · 4 GB", price: 85 },
}

/** El ciclo de facturación de la demo: fijo, así el resultado no depende del día en que se abre. */
export const BILLING = { elapsedDays: 18, days: 31, budget: 400 }

/** Lo que cuesta por mes: instancias por el precio del plan, y solo mientras el servicio corre o compila. */
export const monthlyCost = (service: Service) => (service.status === "stopped" || service.status === "failed" ? 0 : service.instances * PLANS[service.plan].price)

/** Lo consumido hasta hoy: la parte del mes que ya pasó. */
export const spentSoFar = (service: Service) => Math.round((monthlyCost(service) * BILLING.elapsedDays) / BILLING.days)

export interface Limit {
  label: string
  used: number
  max: number
  unit: "gigabyte" | "hour"
}

/**
 * Lo que incluye el plan y cuánto se usó: cómputo (horas de instancia de lo que corre o compila, en lo que va del mes),
 * ancho de banda y almacenamiento. Salen de los servicios del proyecto, no de números sueltos.
 */
export function limitsFor(services: Service[], _deployments: Deployment[]): Limit[] {
  const instances = services.reduce((sum, s) => sum + s.instances, 0)
  const active = services.reduce((sum, s) => sum + (monthlyCost(s) > 0 ? s.instances : 0), 0)
  return [
    { label: "Cómputo", used: active * BILLING.elapsedDays * 24, max: 5000, unit: "hour" },
    { label: "Ancho de banda", used: instances * 11.5, max: 100, unit: "gigabyte" },
    { label: "Almacenamiento", used: 6 + services.length * 2.2, max: 50, unit: "gigabyte" },
  ]
}
