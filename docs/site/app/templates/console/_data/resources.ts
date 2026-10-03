import type { TreeNode } from "sebs7n-ui/tree"

import { instanceUsage } from "./derive"
import type { Project, Service } from "./mock"

/** Los ids del árbol dicen de qué son: `p:proyecto`, `s:proyecto:servicio`, `i:proyecto:servicio:instancia`. */
export const projectNodeId = (projectId: string) => `p:${projectId}`
export const serviceNodeId = (service: Service) => `s:${service.projectId}:${service.id}`
export const instanceNodeId = (service: Service, name: string) => `i:${service.projectId}:${service.id}:${name}`

export type ResourceRef = { kind: "project"; projectId: string } | { kind: "service"; projectId: string; serviceId: string } | { kind: "instance"; projectId: string; serviceId: string; name: string }

export function parseNodeId(id: string): ResourceRef | null {
  const [kind, projectId, serviceId, name] = id.split(":")
  if (!projectId) return null
  if (kind === "p") return { kind: "project", projectId }
  if (kind === "s" && serviceId) return { kind: "service", projectId, serviceId }
  if (kind === "i" && serviceId && name) return { kind: "instance", projectId, serviceId, name }
  return null
}

/** Las instancias de un servicio, que el árbol pide recién al abrirlo. */
export function instanceNodes(service: Service): TreeNode[] {
  return instanceUsage(service).map((instance) => ({ id: instanceNodeId(service, instance.name), label: instance.name, columns: ["Instancia", `${instance.cpu} %`] }))
}

/**
 * El árbol proyecto › servicio › instancia. Los servicios con instancias son carpetas con los hijos
 * pendientes (`hasChildren`) salvo los que ya se cargaron (`loaded`).
 */
export function resourceTree(projects: Project[], services: Service[], loaded: ReadonlySet<string>): TreeNode[] {
  return projects.map((project) => ({
    id: projectNodeId(project.id),
    label: project.name,
    columns: ["Proyecto", project.region],
    children: services
      .filter((s) => s.projectId === project.id)
      .map<TreeNode>((service) => {
        const id = serviceNodeId(service)
        const node: TreeNode = { id, label: service.name, columns: [service.kind, `${service.instances} inst.`] }
        if (service.instances === 0) return node
        return loaded.has(id) ? { ...node, children: instanceNodes(service) } : { ...node, hasChildren: true }
      }),
  }))
}
