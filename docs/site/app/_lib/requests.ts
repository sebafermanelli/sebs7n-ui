// El tablero de pedidos lee los issues con etiqueta `request` de GitHub. No hay base propia: los
// votos son las 👍 del issue y el estado sale de sus etiquetas, así que pedir y votar se hace en
// GitHub y acá solo se muestra.
//
// Se lee en el servidor y se revalida cada hora. Sin token alcanza: la API da 60 requests por
// hora por IP y esto hace una. `GITHUB_TOKEN`, si está, sube el cupo y no cambia nada más.

export type GitHubIssue = {
  number: number
  title: string
  html_url: string
  state: "open" | "closed"
  state_reason: "completed" | "not_planned" | "reopened" | null
  labels: { name: string }[]
  reactions: { "+1": number }
  created_at: string
  closed_at: string | null
  pull_request?: unknown
  user?: unknown
  body?: unknown
}

export type RequestStatus = "received" | "in-progress" | "released"

export type Request = {
  number: number
  title: string
  url: string
  votes: number
  status: RequestStatus
  createdAt: string
  closedAt: string | null
}

export type Requests = { open: Request[]; released: Request[] }

const API = "https://api.github.com/repos/sebafermanelli/sebs7n-ui/issues?labels=request&state=all&per_page=100"
const RELEASED_LIMIT = 10

// Solo lo que se muestra. El autor y el cuerpo quedan en GitHub: el tablero es público y un
// pedido puede traer detalles que quien lo escribió no pensó para una lista.
function toRequest(issue: GitHubIssue, status: RequestStatus): Request {
  return {
    number: issue.number,
    title: issue.title.replace(/^\[request\]\s*/i, ""),
    url: issue.html_url,
    votes: issue.reactions["+1"],
    status,
    createdAt: issue.created_at,
    closedAt: issue.closed_at,
  }
}

export function toRequests(issues: GitHubIssue[]): Requests {
  const own = issues.filter((issue) => issue.pull_request === undefined)
  const open = own
    .filter((issue) => issue.state === "open")
    .map((issue) => toRequest(issue, issue.labels.some((label) => label.name === "in-progress") ? "in-progress" : "received"))
    .sort((a, b) => b.votes - a.votes || a.createdAt.localeCompare(b.createdAt))
  const released = own
    .filter((issue) => issue.state === "closed" && issue.state_reason === "completed")
    .map((issue) => toRequest(issue, "released"))
    .sort((a, b) => (b.closedAt ?? "").localeCompare(a.closedAt ?? ""))
    .slice(0, RELEASED_LIMIT)
  return { open, released }
}

type Fetcher = (url: string, init: RequestInit & { next?: { revalidate: number } }) => Promise<Response>

/**
 * Nunca tira: si GitHub no contesta, contesta con error o devuelve algo que no es una lista, el
 * tablero muestra el aviso y el link a GitHub. Un build no puede caerse porque la API de otro
 * esté sin cupo.
 */
export async function fetchRequests(fetcher: Fetcher = fetch): Promise<({ ok: true } & Requests) | { ok: false }> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    const response = await fetcher(API, { headers, next: { revalidate: 3600 } })
    if (!response.ok) return { ok: false }
    const data: unknown = await response.json()
    if (!Array.isArray(data)) return { ok: false }
    return { ok: true, ...toRequests(data as GitHubIssue[]) }
  } catch {
    return { ok: false }
  }
}
