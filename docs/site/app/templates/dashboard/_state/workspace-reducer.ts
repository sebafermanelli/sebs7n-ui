import type { CustomerRecord } from "../_data/customers-mock"
import type { Role, TeamMember } from "../_data/team-mock"
import type { Settings } from "../_lib/settings"

/** Lo que no son facturas: los clientes dados de alta, el equipo y los avisos ya leídos. */
export interface WorkspaceState {
  customers: CustomerRecord[]
  team: TeamMember[]
  readIds: string[]
  /** La configuración guardada: lo que se edita en Configuración es un borrador hasta «Guardar». */
  settings: Settings
}

export type WorkspaceAction =
  | { type: "addCustomer"; customer: CustomerRecord }
  | { type: "addMember"; member: TeamMember }
  | { type: "removeMember"; id: string }
  | { type: "setRole"; id: string; role: Role }
  | { type: "restoreTeam"; team: TeamMember[] }
  | { type: "read"; ids: string[] }
  | { type: "saveSettings"; settings: Settings }

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "addCustomer":
      return { ...state, customers: [...state.customers, action.customer].sort((a, b) => a.name.localeCompare(b.name, "es")) }
    case "addMember":
      return { ...state, team: [...state.team, action.member] }
    // El propietario no se quita ni cambia de rol: sin él nadie administra la cuenta.
    case "removeMember":
      return { ...state, team: state.team.filter((member) => member.id !== action.id || member.role === "owner") }
    case "setRole":
      return { ...state, team: state.team.map((member) => (member.id === action.id && member.role !== "owner" ? { ...member, role: action.role } : member)) }
    case "restoreTeam":
      return { ...state, team: action.team }
    case "read":
      return { ...state, readIds: [...new Set([...state.readIds, ...action.ids])] }
    case "saveSettings":
      return { ...state, settings: action.settings }
  }
}

/** Un id que no choca con los existentes: `m-5`, `m-6`… */
export const nextMemberId = (team: TeamMember[]) => `m-${team.reduce((max, member) => Math.max(max, Number(member.id.replace(/\D/g, "")) || 0), 0) + 1}`

/** Un cliente nuevo con el id de su nombre; si ya existe ese id, se le suma un número. */
export function uniqueCustomerId(customers: CustomerRecord[], base: string) {
  const taken = new Set(customers.map((customer) => customer.id))
  let id = base || "cliente"
  for (let n = 2; taken.has(id); n += 1) id = `${base || "cliente"}-${n}`
  return id
}
