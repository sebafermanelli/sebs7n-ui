"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { DEPLOYMENTS, ENV_VARS, PROJECTS, SERVICES, type EnvVar, type Environment, type Project, type Service, type ServiceStatus } from "../_data/mock"
import {
  ALERT_RULES,
  applyImport,
  buildService,
  defaultSettings,
  hasService,
  nextEnvId,
  nextId,
  reorderProject,
  sameService,
  settingsKey,
  type AlertRuleId,
  type DotenvResult,
  type MaintenanceWindow,
  type NewService,
  type ScheduledDeploy,
  type ServiceSettings,
} from "./mutations"

// El proyecto activo y todo lo que se puede cambiar (servicios, variables, avisos leídos) viven en el
// layout: cambiarlos en una sección se ve en las demás y en ⌘K. Las mutaciones devuelven lo que había,
// para el «Deshacer» del toast.
const INITIAL_MAINTENANCE: MaintenanceWindow[] = [{ id: "mw-1", projectId: "acme-prod", title: "Mantenimiento de la base", start: "2026-10-06T02:00", end: "2026-10-06T04:00" }]

/** Lo que tarda en «traer» un proyecto al cambiarlo: es lo que dura el esqueleto. */
const LOAD_MS = 450

function useValue() {
  const [projectId, setProjectIdRaw] = useState(PROJECTS[0]!.id)
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  const currentId = useRef(PROJECTS[0]!.id)
  const setProjectId = useCallback((id: string) => {
    if (currentId.current === id) return
    currentId.current = id
    setProjectIdRaw(id)
    setLoading(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setLoading(false), LOAD_MS)
  }, [])
  const [settings, setSettings] = useState<Record<string, Partial<ServiceSettings>>>({})
  const [alertRules, setAlertRules] = useState<AlertRuleId[]>(ALERT_RULES.map((rule) => rule.id))
  const [maintenance, setMaintenance] = useState<MaintenanceWindow[]>(INITIAL_MAINTENANCE)
  const [scheduled, setScheduled] = useState<ScheduledDeploy[]>([])
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [allServices, setAllServices] = useState<Service[]>(SERVICES)
  const [allVars, setAllVars] = useState<EnvVar[]>(ENV_VARS)
  const [readIds, setReadIds] = useState<string[]>([])
  const [newServiceOpen, setNewServiceOpen] = useState(false)

  const addService = useCallback(
    (input: NewService) => {
      const service = buildService(projectId, input)
      setAllServices((previous) => (hasService(previous, projectId, service.id) ? previous : [...previous, service]))
      return service
    },
    [projectId]
  )

  const setServicesStatus = useCallback(
    (ids: string[], status: ServiceStatus) => {
      const previous = allServices.filter((s) => s.projectId === projectId && ids.includes(s.id))
      setAllServices((all) => all.map((s) => (s.projectId === projectId && ids.includes(s.id) ? { ...s, status } : s)))
      return previous
    },
    [allServices, projectId]
  )

  const removeServices = useCallback(
    (ids: string[]) => {
      const removed = allServices.filter((s) => s.projectId === projectId && ids.includes(s.id))
      setAllServices((all) => all.filter((s) => !(s.projectId === projectId && ids.includes(s.id))))
      return removed
    },
    [allServices, projectId]
  )

  const restoreServices = useCallback((previous: Service[]) => {
    setAllServices((all) => {
      const kept = all.map((s) => previous.find((p) => sameService(p, s)) ?? s)
      return [...kept, ...previous.filter((p) => !all.some((s) => sameService(p, s)))]
    })
  }, [])

  const addEnvVar = useCallback(
    (input: Pick<EnvVar, "environment" | "key" | "value" | "secret">) => {
      setAllVars((all) => [...all, { id: nextEnvId(all), projectId, ...input }])
    },
    [projectId]
  )

  const updateEnvVar = useCallback((id: string, patch: Partial<Pick<EnvVar, "key" | "value" | "secret">>) => {
    setAllVars((all) => all.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }, [])

  const removeEnvVar = useCallback(
    (id: string) => {
      const removed = allVars.find((v) => v.id === id)
      setAllVars((all) => all.filter((v) => v.id !== id))
      return removed
    },
    [allVars]
  )

  const restoreEnvVar = useCallback((variable: EnvVar) => {
    setAllVars((all) => (all.some((v) => v.id === variable.id) ? all : [...all, variable]))
  }, [])

  const importEnv = useCallback(
    (environment: Environment, entries: DotenvResult["entries"]) => {
      const result = applyImport(allVars, projectId, environment, entries)
      setAllVars(result.vars)
      return { added: result.added, updated: result.updated }
    },
    [allVars, projectId]
  )

  const reorderServices = useCallback((ids: string[]) => setAllServices((all) => reorderProject(all, projectId, ids)), [projectId])

  const settingsOf = useCallback(
    (service: Service): ServiceSettings => ({ ...defaultSettings(service), ...settings[settingsKey(service.projectId, service.id)] }),
    [settings]
  )
  const updateSettings = useCallback((service: Service, patch: Partial<ServiceSettings>) => {
    setSettings((all) => ({ ...all, [settingsKey(service.projectId, service.id)]: { ...all[settingsKey(service.projectId, service.id)], ...patch } }))
  }, [])

  const addMaintenance = useCallback(
    (input: Omit<MaintenanceWindow, "id" | "projectId">) => setMaintenance((all) => [...all, { id: nextId("mw", all.map((w) => w.id)), projectId, ...input }]),
    [projectId]
  )
  const removeMaintenance = useCallback((id: string) => setMaintenance((all) => all.filter((w) => w.id !== id)), [])

  const addScheduled = useCallback(
    (input: Omit<ScheduledDeploy, "id" | "projectId">) => setScheduled((all) => [...all, { id: nextId("sd", all.map((d) => d.id)), projectId, ...input }].sort((a, b) => a.at.localeCompare(b.at))),
    [projectId]
  )
  const cancelScheduled = useCallback((id: string) => setScheduled((all) => all.filter((d) => d.id !== id)), [])

  return useMemo(
    () => ({
      project: PROJECTS.find((p) => p.id === projectId) as Project,
      projects: PROJECTS,
      loading,
      setProjectId,
      allServices,
      services: allServices.filter((s) => s.projectId === projectId),
      deployments: DEPLOYMENTS.filter((d) => d.projectId === projectId),
      envVars: allVars.filter((v) => v.projectId === projectId),
      readIds,
      setReadIds,
      alertRules,
      setAlertRules,
      maintenance: maintenance.filter((w) => w.projectId === projectId),
      addMaintenance,
      removeMaintenance,
      scheduled: scheduled.filter((d) => d.projectId === projectId),
      addScheduled,
      cancelScheduled,
      reorderServices,
      settingsOf,
      updateSettings,
      assistantOpen,
      setAssistantOpen,
      newServiceOpen,
      setNewServiceOpen,
      addService,
      setServicesStatus,
      removeServices,
      restoreServices,
      addEnvVar,
      updateEnvVar,
      removeEnvVar,
      restoreEnvVar,
      importEnv,
    }),
    [
      projectId, loading, setProjectId, allServices, allVars, readIds, alertRules, maintenance, scheduled, assistantOpen, newServiceOpen,
      addService, setServicesStatus, removeServices, restoreServices, addEnvVar, updateEnvVar, removeEnvVar, restoreEnvVar, importEnv,
      addMaintenance, removeMaintenance, addScheduled, cancelScheduled, reorderServices, settingsOf, updateSettings,
    ]
  )
}

const ProjectContext = createContext<ReturnType<typeof useValue> | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  return <ProjectContext.Provider value={useValue()}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) throw new Error("useProject necesita <ProjectProvider>")
  return context
}
