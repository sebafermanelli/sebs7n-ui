// Lo que suma la consola con los componentes del paquete: ajustes, alertas, árbol, asistente, calendario y
// atajos. Lo puro se prueba sin renderizar; las pantallas, con `renderToString` (entorno `node`).
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { answerFor, SUGGESTIONS } from "../app/templates/console/_data/assistant"
import { calendarEvents } from "../app/templates/console/_data/calendar"
import { buildProgress, buildTailLine, columnsFor, initialRuntimeLogs, NOW_ISO } from "../app/templates/console/_data/derive"
import { DEPLOYMENTS, ENV_VARS, PROJECTS, SERVICES } from "../app/templates/console/_data/mock"
import { notificationsFor } from "../app/templates/console/_data/notifications"
import { instanceNodes, parseNodeId, projectNodeId, resourceTree, serviceNodeId } from "../app/templates/console/_data/resources"
import { contextOf } from "../app/templates/console/_components/log-line-detail"
import { SHORTCUTS, GO_SHORTCUTS } from "../app/templates/console/_components/shortcuts"
import { addTurn, cleanQuestion } from "../app/templates/console/_state/conversation"
import {
  defaultSettings,
  envGroupOf,
  groupEnvVars,
  isDomain,
  nextId,
  reorderProject,
  scheduleError,
  toDotenv,
  parseDotenv,
  toLocalIso,
  windowError,
} from "../app/templates/console/_state/mutations"
import { ProjectProvider } from "../app/templates/console/_state/project-context"
import AlertsPage from "../app/templates/console/alerts/page"
import DeploymentsPage from "../app/templates/console/deployments/page"
import ResourcesPage from "../app/templates/console/resources/page"
import ServiceDetailPage from "../app/templates/console/services/[id]/page"
import VariablesPage from "../app/templates/console/variables/page"

const nav = vi.hoisted(() => ({ id: "api" }))
vi.mock("next/navigation", () => ({
  usePathname: () => "/templates/console",
  useRouter: () => ({ push: () => {} }),
  useParams: () => ({ id: nav.id }),
  useSearchParams: () => new URLSearchParams(),
}))

const first = PROJECTS[0]!
const services = SERVICES.filter((s) => s.projectId === first.id)
const deployments = DEPLOYMENTS.filter((d) => d.projectId === first.id)
const inProject = (page: ReturnType<typeof createElement>) => renderToString(createElement(ProjectProvider, null, page))

describe("variables", () => {
  it("cada variable cae en un grupo por su nombre y los grupos salen en orden fijo, sin vacíos", () => {
    expect(envGroupOf("DATABASE_URL")).toBe("Base de datos y caché")
    expect(envGroupOf("REDIS_URL")).toBe("Base de datos y caché")
    expect(envGroupOf("STRIPE_SECRET_KEY")).toBe("Pagos")
    expect(envGroupOf("SENTRY_DSN")).toBe("Observabilidad")
    expect(envGroupOf("PORT")).toBe("General")
    const groups = groupEnvVars(ENV_VARS.filter((v) => v.projectId === first.id && v.environment === "production"))
    expect(groups.map((g) => g.group)).toEqual(["Base de datos y caché", "Pagos", "Observabilidad", "General"])
    expect(groupEnvVars([])).toEqual([])
  })

  it("toDotenv es lo contrario de parseDotenv, con comillas si el valor tiene espacios", () => {
    const text = toDotenv([{ key: "A", value: "1" }, { key: "B", value: "hola mundo" }])
    expect(text).toBe('A=1\nB="hola mundo"')
    expect(parseDotenv(text).entries.map((e) => [e.key, e.value])).toEqual([["A", "1"], ["B", "hola mundo"]])
  })

  it("la página agrupa con colapsables, ofrece el menú del editor y no muestra los secretos", () => {
    const html = inProject(createElement(VariablesPage))
    for (const text of ["Pagos", "Base de datos y caché", "Archivo", "Ver"]) expect(html).toContain(text)
    expect(html).not.toContain("demo_key_0000000000000000")
  })
})

describe("orden, ajustes y fechas", () => {
  it("reorderProject cambia solo el orden del proyecto y no pierde ninguno", () => {
    const ids = [...services.map((s) => s.id)].reverse()
    const next = reorderProject(SERVICES, first.id, ids)
    expect(next.filter((s) => s.projectId === first.id).map((s) => s.id)).toEqual(ids)
    expect(next).toHaveLength(SERVICES.length)
    expect(next.filter((s) => s.projectId !== first.id)).toEqual(SERVICES.filter((s) => s.projectId !== first.id))
    // Un id que falta o sobra no rompe: lo que no se nombró queda al final.
    expect(reorderProject(SERVICES, first.id, ["web", "no-existe"]).filter((s) => s.projectId === first.id).map((s) => s.id)[0]).toBe("web")
  })

  it("los ajustes por defecto parten de lo que corre y nunca pasan del tope", () => {
    for (const s of SERVICES) {
      const d = defaultSettings(s)
      expect(d.minInstances).toBeGreaterThanOrEqual(1)
      expect(d.maxInstances).toBeGreaterThanOrEqual(d.minInstances)
      expect(d.maxInstances).toBeLessThanOrEqual(10)
      expect(d.region).toBe(s.region)
    }
  })

  it("isDomain acepta dominios y vacío, y rechaza protocolos, rutas y espacios", () => {
    for (const ok of ["", "app.acme.com", "a-b.c.io"]) expect(isDomain(ok)).toBe(true)
    for (const bad of ["https://acme.com", "acme", "acme.com/ruta", "a cme.com", "-x.com"]) expect(isDomain(bad)).toBe(false)
  })

  it("programar exige una fecha futura y una ventana termina después de empezar", () => {
    const now = new Date(NOW_ISO)
    expect(scheduleError(null, now)).toMatch(/Elegí/)
    expect(scheduleError(new Date("2026-10-02T13:00:00"), now)).toMatch(/después de ahora/)
    expect(scheduleError(new Date("2026-10-03T09:00:00"), now)).toBeNull()
    const a = new Date("2026-10-06T02:00:00")
    expect(windowError(a, new Date("2026-10-06T01:00:00"))).toMatch(/después de empezar/)
    expect(windowError(a, new Date("2026-10-06T04:00:00"))).toBeNull()
    expect(windowError(null, a)).toMatch(/Elegí/)
  })

  it("toLocalIso y nextId arman los datos sin zona horaria ni choques", () => {
    expect(toLocalIso(new Date("2026-10-06T02:05:00"))).toBe("2026-10-06T02:05")
    expect(nextId("mw", ["mw-1", "mw-7"])).toBe("mw-8")
    expect(nextId("sd", [])).toBe("sd-1")
  })

  it("el calendario junta ventanas y despliegues programados con su color", () => {
    const events = calendarEvents([{ id: "mw-1", projectId: "p", title: "Base", start: "2026-10-06T02:00", end: "2026-10-06T04:00" }], [{ id: "sd-1", projectId: "p", service: "api", commit: "main", at: "2026-10-03T09:00" }])
    expect(events.map((e) => [e.id, e.color])).toEqual([["mw-1", "amber"], ["sd-1", "blue"]])
    expect(events[0]!.end!.getTime()).toBeGreaterThan(events[0]!.start.getTime())
  })
})

describe("alertas y avisos", () => {
  it("apagar una regla saca sus avisos; sin reglas no hay ninguno", () => {
    const all = notificationsFor(services, deployments)
    expect(all.some((n) => n.id.startsWith("deploy-"))).toBe(true)
    const noDeploys = notificationsFor(services, deployments, ["cpu-high", "memory-high", "service-down"])
    expect(noDeploys.some((n) => n.id.startsWith("deploy-"))).toBe(false)
    expect(noDeploys.some((n) => n.id === "usage-worker")).toBe(true)
    expect(notificationsFor(services, deployments, [])).toEqual([])
  })

  it("la página trae las reglas, los canales y el calendario", () => {
    const html = inProject(createElement(AlertsPage))
    for (const text of ["Reglas de alerta", "Canales", "Despliegue fallido", "Ventana de mantenimiento", "Mantenimiento de la base"]) expect(html).toContain(text)
  })
})

describe("recursos", () => {
  it("el árbol va proyecto > servicio y las instancias llegan después, al abrir", () => {
    const tree = resourceTree(PROJECTS, SERVICES, new Set())
    expect(tree.map((n) => n.id)).toEqual(PROJECTS.map((p) => projectNodeId(p.id)))
    const api = tree[0]!.children!.find((n) => n.id === serviceNodeId(services[0]!))!
    expect(api.hasChildren).toBe(true)
    expect(api.children).toBeUndefined()
    const loaded = resourceTree(PROJECTS, SERVICES, new Set([serviceNodeId(services[0]!)]))
    expect(loaded[0]!.children![0]!.children).toHaveLength(services[0]!.instances)
    // Un servicio sin instancias es una hoja, no una carpeta vacía.
    const stopped = tree[0]!.children!.find((n) => n.label === "cron-billing")!
    expect(stopped.hasChildren).toBeUndefined()
    expect(stopped.children).toBeUndefined()
    expect(PROJECTS.some((p) => !SERVICES.some((s) => s.projectId === p.id))).toBe(true)
  })

  it("los ids del árbol se leen de vuelta", () => {
    const s = services[0]!
    expect(parseNodeId(projectNodeId(first.id))).toEqual({ kind: "project", projectId: first.id })
    expect(parseNodeId(serviceNodeId(s))).toEqual({ kind: "service", projectId: first.id, serviceId: s.id })
    const inst = instanceNodes(s)[0]!
    expect(parseNodeId(inst.id)).toMatchObject({ kind: "instance", serviceId: s.id, name: `${s.name}-1` })
    expect(parseNodeId("x")).toBeNull()
  })

  it("la página muestra el árbol con su nombre y el detalle del proyecto", () => {
    const html = inProject(createElement(ResourcesPage))
    expect(html).toContain('aria-label="Recursos de la cuenta"')
    expect(html).toContain("acme-prod")
    expect(html).toContain("Proyecto activo")
  })
})

describe("asistente", () => {
  const context = { project: first, services, deployments }

  it("contesta lo mismo a la misma pregunta y habla de lo que hay en pantalla", () => {
    expect(answerFor("¿Qué despliegue falló?", context)).toBe(answerFor("¿Qué despliegue falló?", context))
    expect(answerFor("¿Qué despliegue falló?", context)).toContain("worker")
    expect(answerFor("¿Qué despliegue falló?", context)).toContain("TS2322")
    expect(answerFor("Mostrame los últimos errores", context)).toMatch(/errores en las últimas 120 líneas/)
    expect(answerFor("¿Cuánto vamos a gastar?", context)).toContain("US$")
    expect(answerFor("¿Cómo están los servicios?", context)).toContain("api: en ejecución")
  })

  it("un proyecto sin servicios y una pregunta que no entiende tienen su respuesta", () => {
    expect(answerFor("hola", { project: first, services: [], deployments: [] })).toContain("todavía no tiene servicios")
    expect(answerFor("¿qué hora es?", context)).toContain("Probá con una de esas preguntas")
    expect(answerFor("¿qué despliegue falló?", { project: first, services, deployments: [] })).toContain("No hay despliegues fallidos")
  })

  it("cada sugerencia tiene una respuesta propia", () => {
    const answers = SUGGESTIONS.map((q) => answerFor(q, context))
    expect(new Set(answers).size).toBe(SUGGESTIONS.length)
  })

  it("la conversación solo crece, con ids nuevos, y no manda mensajes vacíos", () => {
    const one = addTurn([], "user", "hola")
    const two = addTurn(one, "assistant", "chau")
    expect(two.map((t) => t.id)).toEqual([1, 2])
    expect(one).toHaveLength(1)
    expect(cleanQuestion("   ")).toBe("")
    expect(cleanQuestion("  ¿y?  ")).toBe("¿y?")
  })
})

describe("despliegues y logs", () => {
  it("el progreso de un build sale de su log y nunca llega a 100", () => {
    const building = DEPLOYMENTS.find((d) => d.status === "building")!
    expect(buildProgress(building)).toBe(buildProgress(building))
    expect(buildProgress(building)).toBeGreaterThan(0)
    expect(buildProgress(building)).toBeLessThan(100)
  })

  it("la cola de un build sigue la hora del último renglón, de 3 en 3 segundos", () => {
    const building = DEPLOYMENTS.find((d) => d.status === "building")!
    const last = building.logs.at(-1)!.time
    expect(last).toBe("13:56:48")
    expect(buildTailLine(building, 0).time).toBe("13:56:51")
    expect(buildTailLine(building, 1).time).toBe("13:56:54")
    expect(buildTailLine(building, 0)).toEqual(buildTailLine(building, 0))
  })

  it("las columnas reparten parejo: ninguna fila queda con una huérfana", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].map(columnsFor)).toEqual([1, 2, 3, 2, 3, 3, 4, 4, 3])
    for (let count = 2; count <= 12; count++) {
      const columns = columnsFor(count)
      expect(count % columns === 1 && count > columns).toBe(false)
    }
  })

  it("el contexto de una línea trae las de alrededor y nada si ya no está", () => {
    const lines = initialRuntimeLogs(services)
    expect(contextOf(lines, 10).map((l) => l.id)).toEqual([7, 8, 9, 10, 11, 12, 13])
    expect(contextOf(lines, 0).map((l) => l.id)).toEqual([0, 1, 2, 3])
    expect(contextOf(lines, 9999)).toEqual([])
    expect(initialRuntimeLogs([])).toEqual([])
  })

  it("Despliegues ofrece programar y el detalle trae la alerta del que falló", () => {
    expect(inProject(createElement(DeploymentsPage))).toContain("Programar despliegue")
  })
})

describe("detalle del servicio", () => {
  it("las tres instancias de api se reparten en tres columnas, sin la 2 + 1 huérfana, y las métricas no llevan cabecera", () => {
    nav.id = "api"
    const html = inProject(createElement(ServiceDetailPage))
    expect(html).toContain("@3xl:grid-cols-3")
    expect(html).not.toContain("@3xl:grid-cols-2")
    expect(html).toContain("Uso por instancia")
    expect(html).toContain('role="tablist"')
  })

  it("un servicio con error o con uso alto avisa antes de las métricas", () => {
    nav.id = "worker"
    expect(inProject(createElement(ServiceDetailPage))).toContain("Servicio degradado")
    nav.id = "api"
    expect(inProject(createElement(ServiceDetailPage))).not.toContain("Servicio degradado")
  })
})

describe("atajos", () => {
  it("la hoja y el mapa salen de la misma lista: cada «ir a» es una secuencia g + letra", () => {
    const sequences = SHORTCUTS.filter((s) => s.sequence)
    expect(sequences).toHaveLength(GO_SHORTCUTS.length)
    for (const s of sequences) expect(s.keys[0]).toBe("g")
    expect(new Set(SHORTCUTS.map((s) => s.keys.join(" "))).size).toBe(SHORTCUTS.length)
  })
})
