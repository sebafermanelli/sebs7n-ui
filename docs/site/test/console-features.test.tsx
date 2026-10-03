// Lo nuevo de la consola: mutaciones puras, avisos, costos y las pantallas nuevas. Entorno `node`: `renderToString`.
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { BILLING, limitsFor, monthlyCost, PLANS, spentSoFar } from "../app/templates/console/_data/costs"
import { DEPLOYMENTS, ENV_VARS, PROJECTS, SERVICES } from "../app/templates/console/_data/mock"
import { notificationsFor } from "../app/templates/console/_data/notifications"
import { applyImport, buildService, hasService, nextEnvId, parseDotenv, slugify } from "../app/templates/console/_state/mutations"
import { ProjectProvider } from "../app/templates/console/_state/project-context"
import { GO_SHORTCUTS } from "../app/templates/console/_components/shortcuts"
import ConsoleLayout from "../app/templates/console/layout"
import ServicesPage from "../app/templates/console/page"
import CostsPage from "../app/templates/console/costs/page"
import VariablesPage from "../app/templates/console/variables/page"

vi.mock("next/navigation", () => ({
  usePathname: () => "/templates/console",
  useRouter: () => ({ push: () => {} }),
  useParams: () => ({ id: "api" }),
  useSearchParams: () => new URLSearchParams(),
}))

const first = PROJECTS[0]!
const inProject = (page: ReturnType<typeof createElement>) => renderToString(createElement(ProjectProvider, null, page))

describe("mutaciones", () => {
  it("slugify arma el id y la dirección a partir del nombre", () => {
    expect(slugify("Mi API Ñandú!")).toBe("mi-api-nandu")
    expect(slugify("  --checkout--  ")).toBe("checkout")
  })

  it("un servicio nuevo arranca compilando, con una instancia y sin consumo", () => {
    const service = buildService(first.id, { name: "Checkout API", kind: "Web service", region: "us-east-1", plan: "starter", repo: "github.com/acme/checkout" })
    expect(service).toMatchObject({ id: "checkout-api", status: "building", instances: 1, cpu: 0, url: "checkout-api.acme.dev" })
    expect(buildService(first.id, { name: "job", kind: "Cron job", region: "x", plan: "pro", repo: "r" }).url).toBe("—")
  })

  it("hasService mira el proyecto: el mismo nombre en otro proyecto no choca", () => {
    expect(hasService(SERVICES, "acme-prod", "api")).toBe(true)
    expect(hasService(SERVICES, "acme-prod", "nuevo")).toBe(false)
    expect(hasService([], "acme-prod", "api")).toBe(false)
  })

  it("parseDotenv ignora comentarios, entiende export y comillas, y cuenta lo inválido", () => {
    const { entries, invalid } = parseDotenv(`# nota\n\nexport API_URL="https://a.dev"\nSTRIPE_SECRET_KEY='sk'\n1MALA=x\nsolo texto\nLOG_LEVEL=info\nLOG_LEVEL=debug`)
    expect(entries.map((e) => [e.key, e.value])).toEqual([["API_URL", "https://a.dev"], ["STRIPE_SECRET_KEY", "sk"], ["LOG_LEVEL", "debug"]])
    expect(entries.find((e) => e.key === "STRIPE_SECRET_KEY")!.secret).toBe(true)
    expect(entries.find((e) => e.key === "LOG_LEVEL")!.secret).toBe(false)
    expect(invalid).toBe(2)
  })

  it("applyImport pisa las existentes del entorno y suma las nuevas, sin tocar otros entornos", () => {
    const { entries } = parseDotenv("NODE_ENV=prod2\nNUEVA=1")
    const { vars, added, updated } = applyImport(ENV_VARS, "acme-prod", "production", entries)
    expect([added, updated]).toEqual([1, 1])
    expect(vars.find((v) => v.projectId === "acme-prod" && v.environment === "production" && v.key === "NODE_ENV")!.value).toBe("prod2")
    expect(vars.find((v) => v.projectId === "acme-prod" && v.environment === "staging" && v.key === "NODE_ENV")!.value).toBe("staging")
    expect(new Set(vars.map((v) => v.id)).size).toBe(vars.length)
    expect(nextEnvId(ENV_VARS)).toBe("13")
  })
})

describe("avisos", () => {
  const services = SERVICES.filter((s) => s.projectId === first.id)
  const deployments = DEPLOYMENTS.filter((d) => d.projectId === first.id)

  it("salen de lo que está en pantalla: despliegues fallidos y uso alto", () => {
    const list = notificationsFor(services, deployments)
    expect(list.some((n) => n.id === "deploy-d-4819" && n.level === "error")).toBe(true)
    expect(list.some((n) => n.id === "usage-worker" && n.level === "warn")).toBe(true)
    expect(new Set(list.map((n) => n.id)).size).toBe(list.length)
  })

  it("un proyecto sin problemas no tiene avisos", () => {
    expect(notificationsFor([], [])).toEqual([])
  })
})

describe("costos", () => {
  const services = SERVICES.filter((s) => s.projectId === first.id)

  it("solo cuesta lo que corre o compila: detenido y caído no", () => {
    expect(monthlyCost(services.find((s) => s.name === "api")!)).toBe(3 * PLANS.standard.price)
    expect(monthlyCost(services.find((s) => s.status === "stopped")!)).toBe(0)
  })

  it("lo consumido es la parte transcurrida del mes y nunca pasa del estimado", () => {
    for (const s of services) expect(spentSoFar(s)).toBeLessThanOrEqual(monthlyCost(s))
    expect(spentSoFar(services.find((s) => s.name === "api")!)).toBe(Math.round((75 * BILLING.elapsedDays) / BILLING.days))
  })

  it("los límites usan lo que hay y no se pasan del máximo con los datos de la demo", () => {
    const limits = limitsFor(services, DEPLOYMENTS.filter((d) => d.projectId === first.id))
    expect(limits.map((limit) => limit.label)).toEqual(["Cómputo", "Ancho de banda", "Almacenamiento"])
    for (const limit of limits) expect(limit.used).toBeLessThanOrEqual(limit.max)
  })
})

describe("pantallas", () => {
  it("atajos: una letra distinta por sección", () => {
    expect(new Set(GO_SHORTCUTS.map((s) => s.key)).size).toBe(GO_SHORTCUTS.length)
    expect(GO_SHORTCUTS.map((s) => s.key)).toEqual(["s", "r", "d", "l", "v", "a", "c"])
  })

  it("el layout trae la campana con su contador y el menú de usuario", () => {
    const html = renderToString(createElement(ConsoleLayout, null, createElement("p", null, "contenido")))
    expect(html).toMatch(/aria-label="Notificaciones, \d+ sin leer"/)
    expect(html).toContain("Lucía Ferrari")
    expect(html).toContain('href="/templates/console/costs"')
  })

  it("Servicios arranca en lista con la búsqueda, el cambio de vista y el alta", () => {
    const html = inProject(createElement(ServicesPage))
    expect(html).toContain('aria-label="Buscar servicios"')
    expect(html).toContain('aria-label="Cuadrícula"')
    expect(html).toContain("Nuevo servicio")
    expect(html).toContain('aria-label="Servicios"')
  })

  it("Servicios arranca con el Resumen: una grilla de widgets estática, con «Editar» secundario y sin el módulo de arrastre", () => {
    const html = inProject(createElement(ServicesPage))
    for (const text of ["CPU del proyecto", "Requests por minuto", "Servicios con errores", "Costo del mes", "Despliegues recientes"]) expect(html).toContain(text)
    expect(html).toContain('aria-label="Resumen del proyecto"')
    expect(html).toMatch(/data-slot="widget-board-edit"[^>]*bg-fill-2/)
    expect(html).not.toContain("sortable")
    expect(html).not.toContain("Agregar widget")
  })

  it("Variables ofrece los dos entornos, el alta y la importación, y oculta los secretos", () => {
    const html = inProject(createElement(VariablesPage))
    for (const text of ["Producción", "Staging", "Nueva variable", "Importar .env"]) expect(html).toContain(text)
    expect(html).not.toContain("demo_key_0000000000000000")
    expect(html).not.toContain("STAGING-ONLY")
  })

  it("Costos muestra el consumo, el estimado, el desglose y el plan con sus medidores", () => {
    const html = inProject(createElement(CostsPage))
    for (const text of ["Consumo del mes", "Estimado a fin de mes", "Detalle por servicio", "Plan Pro", "Cambiar de plan", "Uso del plan", "Cómputo", "Ancho de banda", "Almacenamiento"]) expect(html).toContain(text)
    expect(html).toContain('role="meter"')
  })
})
