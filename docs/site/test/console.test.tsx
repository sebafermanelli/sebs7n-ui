// El sitio corre en entorno `node` sin jsdom: `renderToString`, igual que los tests del dashboard.
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import ConsoleLayout from "../app/templates/console/layout"
import LogsPage from "../app/templates/console/logs/page"
import ServiceDetailPage from "../app/templates/console/services/[id]/page"
import DeploymentsPage from "../app/templates/console/deployments/page"
import ServicesPage from "../app/templates/console/page"
import VariablesPage from "../app/templates/console/variables/page"
import { halfChange, initialRuntimeLogs, instanceUsage, pipelineOf, rangeSeriesFor, seriesFor } from "../app/templates/console/_data/derive"
import { DEPLOYMENTS, ENV_VARS, PROJECTS, SERVICES } from "../app/templates/console/_data/mock"
import { ProjectProvider } from "../app/templates/console/_state/project-context"

const nav = vi.hoisted(() => ({ pathname: "/templates/console/deployments" }))
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: () => {} }),
  useParams: () => ({ id: "api" }),
  useSearchParams: () => new URLSearchParams("service=api"),
}))

const inProject = (page: ReturnType<typeof createElement>) => renderToString(createElement(ProjectProvider, null, page))
const first = PROJECTS[0]!

describe("datos", () => {
  it("cada servicio, despliegue y variable pertenece a un proyecto que existe", () => {
    const ids = new Set(PROJECTS.map((p) => p.id))
    for (const item of [...SERVICES, ...DEPLOYMENTS, ...ENV_VARS]) expect(ids.has(item.projectId)).toBe(true)
  })

  it("un despliegue fallido deja un error en su log", () => {
    for (const d of DEPLOYMENTS.filter((x) => x.status === "failed")) expect(d.logs.some((l) => l.level === "error")).toBe(true)
  })
})

describe("layout", () => {
  const html = renderToString(createElement(ConsoleLayout, null, createElement("p", null, "contenido")))

  it("arma el shell con el selector de proyecto, el sidebar y el contenido", () => {
    expect(html).toContain('aria-label="Proyecto"')
    expect(html).toContain("contenido")
    for (const href of ["/templates/console", "/templates/console/deployments", "/templates/console/variables"]) expect(html).toContain(`href="${href}"`)
  })

  it("trae el buscador con su atajo y la vuelta a la galería", () => {
    expect(html).toContain('aria-keyshortcuts="Meta+K"')
    expect(html).toContain('href="/templates"')
  })
})

describe("páginas", () => {
  it("Servicios lista los del proyecto activo y nada de los otros", () => {
    const html = inProject(createElement(ServicesPage))
    for (const s of SERVICES.filter((x) => x.projectId === first.id)) expect(html).toContain(s.name)
    expect(html).not.toContain("api.staging.acme.dev")
  })

  it("Despliegues muestra la lista, el detalle y el log como región `log`", () => {
    const html = inProject(createElement(DeploymentsPage))
    expect(html).toContain(DEPLOYMENTS.find((d) => d.projectId === first.id)!.message)
    expect(html).toContain('role="log"')
  })

  it("Variables oculta los secretos hasta que se muestran", () => {
    const html = inProject(createElement(VariablesPage))
    const secret = ENV_VARS.find((v) => v.projectId === first.id && v.secret)!
    expect(html).toContain(secret.key)
    expect(html).not.toContain(secret.value)
  })
})

describe("derivados", () => {
  const api = SERVICES.find((s) => s.projectId === first.id && s.name === "api")!

  it("las series son siempre las mismas y terminan en el valor de la lista", () => {
    expect(seriesFor(api, "cpu")).toEqual(seriesFor(api, "cpu"))
    expect(seriesFor(api, "cpu").at(-1)).toBe(api.cpu)
    expect(seriesFor(api, "cpu")).toHaveLength(24)
  })

  it("las series por rango son largas, deterministas, con hora en cada punto y terminan en el valor de la lista", () => {
    const hour = rangeSeriesFor(api, "cpu", "1h")
    expect(hour).toHaveLength(60)
    expect(rangeSeriesFor(api, "cpu", "1h")).toEqual(hour)
    expect(hour.at(-1)).toEqual({ label: "14:30", value: api.cpu })
    expect(hour[0]!.label).toBe("13:31")
    expect(rangeSeriesFor(api, "memory", "24h")).toHaveLength(96)
    expect(rangeSeriesFor(api, "requests", "6h")).toHaveLength(72)
    for (const point of rangeSeriesFor(api, "cpu", "24h")) expect(point.value).toBeLessThanOrEqual(100)
    expect(hour.map((point) => point.value)).not.toEqual(rangeSeriesFor(api, "cpu", "6h").slice(-60).map((point) => point.value))
    expect(halfChange([10, 10, 20, 20])).toBe(100)
    expect(halfChange([0, 0, 1, 1])).toBeNull()
  })

  it("el detalle del servicio dibuja las métricas con gráfico, menú «…» y tooltip", () => {
    const html = inProject(createElement(ServiceDetailPage))
    expect(html).toContain('data-slot="metric-chart"')
    expect(html).toContain("Opciones de CPU")
    expect(html).toContain("Opciones de Requests por minuto")
  })

  it("hay un uso por cada instancia y ninguno pasa de 100", () => {
    const usage = instanceUsage(api)
    expect(usage).toHaveLength(api.instances)
    for (const u of usage) expect(Math.max(u.cpu, u.memory)).toBeLessThanOrEqual(100)
  })

  it("el pipeline marca el paso que falló y el que está en curso", () => {
    const failed = pipelineOf(DEPLOYMENTS.find((d) => d.status === "failed")!)
    expect(failed.steps.some((s) => s.status === "error")).toBe(true)
    expect(pipelineOf(DEPLOYMENTS.find((d) => d.status === "building")!).current).toBe(1)
    expect(pipelineOf(DEPLOYMENTS.find((d) => d.status === "live")!).steps.every((s) => s.status === undefined)).toBe(true)
  })

  it("el log de arranque es una secuencia de horas que no retrocede", () => {
    const times = initialRuntimeLogs(SERVICES.filter((s) => s.projectId === first.id)).map((l) => l.time)
    expect([...times].sort()).toEqual(times)
  })
})

describe("detalle y logs", () => {
  it("el detalle trae las pestañas, el pipeline de uso por instancia y la acción de reiniciar", () => {
    const html = inProject(createElement(ServiceDetailPage))
    for (const tab of ["Métricas", "Eventos", "Ajustes"]) expect(html).toContain(tab)
    expect(html).toContain("Reiniciar")
    expect(html).toContain('role="meter"')
  })

  it("los logs arrancan filtrados por el servicio de la URL y en vivo", () => {
    const html = inProject(createElement(LogsPage))
    expect(html).toContain('role="log"')
    expect(html).toContain("En vivo")
    expect(html).toContain("Pausar")
  })
})
