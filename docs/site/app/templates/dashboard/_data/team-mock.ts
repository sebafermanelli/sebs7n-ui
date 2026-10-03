export type Role = "owner" | "admin" | "member" | "viewer"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
}

/** Lo que se muestra de cada rol y qué puede hacer: el `Select` y la nota de abajo salen de acá. */
export const ROLE_LABELS: Record<Role, string> = {
  owner: "Propietario",
  admin: "Administrador",
  member: "Miembro",
  viewer: "Solo lectura",
}

/** Los roles que se pueden asignar: el propietario es uno solo y no se elige. */
export const ASSIGNABLE_ROLES = { admin: ROLE_LABELS.admin, member: ROLE_LABELS.member, viewer: ROLE_LABELS.viewer }

export const TEAM_MOCK: TeamMember[] = [
  { id: "m-1", name: "Administración", email: "admin@acme.com", role: "owner" },
  { id: "m-2", name: "Lucía Fernández", email: "lucia@acme.com", role: "admin" },
  { id: "m-3", name: "Martín Gómez", email: "martin@acme.com", role: "member" },
  { id: "m-4", name: "Paula Rey", email: "paula@acme.com", role: "viewer" },
]

/** «lucia.perez@acme.com» → «Lucia Perez»: el nombre provisorio de quien todavía no entró. */
export function nameFromEmail(email: string) {
  return (email.split("@")[0] ?? email)
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
