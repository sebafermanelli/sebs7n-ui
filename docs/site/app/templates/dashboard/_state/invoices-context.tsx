"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react"

import { CUSTOMERS_MOCK, slugify, type CustomerRecord } from "../_data/customers-mock"
import { calculateMetrics, INVOICES_MOCK, type Invoice } from "../_data/invoices-mock"
import { nameFromEmail, TEAM_MOCK, type Role, type TeamMember } from "../_data/team-mock"
import { today } from "../_lib/format"
import { DEFAULT_SETTINGS, type Settings } from "../_lib/settings"
import { invoicesReducer, isCollectable, nextInvoiceId, type NewInvoice } from "./invoices-reducer"
import { nextMemberId, uniqueCustomerId, workspaceReducer } from "./workspace-reducer"

interface InvoicesStore {
  invoices: Invoice[]
  loading: boolean
  /** La carga falló (probalo con `#error` en la URL): las listas ofrecen reintentar. */
  error: boolean
  retry: () => void
  metrics: ReturnType<typeof calculateMetrics>
  addInvoice: (input: NewInvoice) => Invoice
  /** Cobra las que se deben y devuelve cómo estaban, para el «Deshacer» del toast. */
  markPaid: (ids: string[]) => Invoice[]
  voidInvoice: (id: string) => void
  restore: (previous: Invoice[]) => void
  /** Las cobradas vuelven a «se debe» y devuelve cómo estaban, para el «Deshacer» del toast. */
  reopen: (ids: string[]) => Invoice[]
  setTags: (id: string, tags: string[]) => void
  /** Programa (o con `null`, cancela) el recordatorio de una factura que se debe. */
  scheduleReminder: (id: string, at: string | null) => void
  customers: CustomerRecord[]
  /** El alta de un cliente: el id sale del nombre. */
  addCustomer: (input: Omit<CustomerRecord, "id">) => CustomerRecord
  team: TeamMember[]
  /** Invitar por correo: queda en el equipo con el rol elegido, a nombre de su correo. */
  inviteMember: (email: string, role: Exclude<Role, "owner">) => TeamMember
  /** Quita a alguien y devuelve cómo estaba el equipo, para el «Deshacer» del toast. */
  removeMember: (id: string) => TeamMember[]
  restoreTeam: (previous: TeamMember[]) => void
  changeRole: (id: string, role: Role) => void
  /** Los avisos ya leídos: ids de `notificationsOf`. */
  readIds: string[]
  markRead: (ids: string[]) => void
  settings: Settings
  saveSettings: (settings: Settings) => void
}

const InvoicesContext = createContext<InvoicesStore | null>(null)

/** Lo que tarda el «fetch» de mentira: alcanza para ver los esqueletos sin hacer esperar. */
export const SIMULATED_LOAD_MS = 600

// Vive en el layout: navegar entre secciones no lo remonta, así que la carga se ve una sola vez y
// un alta en Facturas aparece en Inicio y en Clientes.
export function InvoicesProvider({ children, simulateLoading = true }: { children: ReactNode; simulateLoading?: boolean }) {
  const [state, dispatch] = useReducer(invoicesReducer, { invoices: INVOICES_MOCK, loading: simulateLoading, error: false })
  const [workspace, dispatchWorkspace] = useReducer(workspaceReducer, { customers: CUSTOMERS_MOCK, team: TEAM_MOCK, readIds: [], settings: DEFAULT_SETTINGS })

  // Con `#error` en la URL el primer intento falla: así se ve el estado de error. «Reintentar» carga bien.
  const failFirst = useRef(false)
  useEffect(() => {
    failFirst.current = window.location.hash === "#error"
  }, [])

  useEffect(() => {
    if (!state.loading) return
    const timer = setTimeout(() => {
      if (failFirst.current) {
        failFirst.current = false
        dispatch({ type: "failed" })
      } else dispatch({ type: "loaded" })
    }, SIMULATED_LOAD_MS)
    return () => clearTimeout(timer)
  }, [state.loading])

  const store = useMemo<InvoicesStore>(
    () => ({
      invoices: state.invoices,
      loading: state.loading,
      error: state.error,
      retry: () => dispatch({ type: "retry" }),
      metrics: calculateMetrics(state.invoices),
      addInvoice: (input) => {
        const invoice: Invoice = { ...input, id: nextInvoiceId(state.invoices), status: "pending" }
        dispatch({ type: "add", invoice })
        return invoice
      },
      markPaid: (ids) => {
        const previous = state.invoices.filter((inv) => ids.includes(inv.id) && isCollectable(inv))
        dispatch({ type: "markPaid", ids, date: today() })
        return previous
      },
      voidInvoice: (id) => dispatch({ type: "void", id, date: today() }),
      restore: (previous) => dispatch({ type: "restore", previous }),
      reopen: (ids) => {
        const previous = state.invoices.filter((inv) => ids.includes(inv.id) && inv.status === "paid")
        dispatch({ type: "reopen", ids, date: today() })
        return previous
      },
      setTags: (id, tags) => dispatch({ type: "setTags", id, tags }),
      scheduleReminder: (id, at) => dispatch({ type: "scheduleReminder", id, at }),
      customers: workspace.customers,
      addCustomer: (input) => {
        const customer: CustomerRecord = { ...input, id: uniqueCustomerId(workspace.customers, slugify(input.name)) }
        dispatchWorkspace({ type: "addCustomer", customer })
        return customer
      },
      team: workspace.team,
      inviteMember: (email, role) => {
        const member: TeamMember = { id: nextMemberId(workspace.team), name: nameFromEmail(email), email, role }
        dispatchWorkspace({ type: "addMember", member })
        return member
      },
      removeMember: (id) => {
        const previous = workspace.team
        dispatchWorkspace({ type: "removeMember", id })
        return previous
      },
      restoreTeam: (team) => dispatchWorkspace({ type: "restoreTeam", team }),
      changeRole: (id, role) => dispatchWorkspace({ type: "setRole", id, role }),
      readIds: workspace.readIds,
      markRead: (ids) => dispatchWorkspace({ type: "read", ids }),
      settings: workspace.settings,
      saveSettings: (settings) => dispatchWorkspace({ type: "saveSettings", settings }),
    }),
    [state, workspace]
  )

  return <InvoicesContext.Provider value={store}>{children}</InvoicesContext.Provider>
}

export function useInvoicesStore() {
  const store = useContext(InvoicesContext)
  if (!store) throw new Error("useInvoicesStore necesita <InvoicesProvider>")
  return store
}
