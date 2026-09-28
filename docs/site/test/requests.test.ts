import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchRequests, toRequests, type GitHubIssue } from "../app/_lib/requests"

const issue = (over: Partial<GitHubIssue>): GitHubIssue => ({
  number: 1,
  title: "[request] Tree",
  html_url: "https://github.com/sebafermanelli/sebs7n-ui/issues/1",
  state: "open",
  state_reason: null,
  labels: [{ name: "request" }],
  reactions: { "+1": 0 },
  created_at: "2026-09-01T00:00:00Z",
  closed_at: null,
  user: { login: "alguien" },
  body: "detalle privado",
  ...over,
})

describe("toRequests", () => {
  it("ordena los abiertos por votos y, con empate, el más viejo primero", () => {
    const { open } = toRequests([
      issue({ number: 1, reactions: { "+1": 2 }, created_at: "2026-09-10T00:00:00Z" }),
      issue({ number: 2, reactions: { "+1": 5 } }),
      issue({ number: 3, reactions: { "+1": 2 }, created_at: "2026-09-02T00:00:00Z" }),
    ])
    expect(open.map((r) => r.number)).toEqual([2, 3, 1])
  })

  it("marca en curso los que tienen in-progress", () => {
    const { open } = toRequests([issue({ labels: [{ name: "request" }, { name: "in-progress" }] })])
    expect(open[0]!.status).toBe("in-progress")
  })

  it("publicados: solo cerrados como completed, los 10 más recientes", () => {
    const cerrados = Array.from({ length: 12 }, (_, i) =>
      issue({ number: 100 + i, state: "closed", state_reason: "completed", closed_at: `2026-09-${String(i + 10).padStart(2, "0")}T00:00:00Z` })
    )
    const { released } = toRequests([...cerrados, issue({ number: 99, state: "closed", state_reason: "not_planned", closed_at: "2026-09-30T00:00:00Z" })])
    expect(released).toHaveLength(10)
    expect(released[0]!.number).toBe(111)
    expect(released.some((r) => r.number === 99)).toBe(false)
  })

  it("descarta los pull requests, que la API de issues mezcla", () => {
    const { open } = toRequests([issue({ number: 7, pull_request: { url: "x" } }), issue({ number: 8 })])
    expect(open.map((r) => r.number)).toEqual([8])
  })

  it("saca el prefijo del título y no expone autor ni cuerpo", () => {
    const { open } = toRequests([issue({})])
    expect(open[0]).toEqual({
      number: 1,
      title: "Tree",
      url: "https://github.com/sebafermanelli/sebs7n-ui/issues/1",
      votes: 0,
      status: "received",
      createdAt: "2026-09-01T00:00:00Z",
      closedAt: null,
    })
  })
})

describe("fetchRequests", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("sin GITHUB_TOKEN no manda Authorization", async () => {
    vi.stubEnv("GITHUB_TOKEN", "")
    const fetcher = vi.fn(async () => new Response(JSON.stringify([issue({})]), { status: 200 }))
    await fetchRequests(fetcher)
    const [, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit & { headers: Record<string, string> }]
    expect(init.headers).not.toHaveProperty("Authorization")
  })

  it("con GITHUB_TOKEN manda Authorization: Bearer <token>", async () => {
    vi.stubEnv("GITHUB_TOKEN", "t0k3n")
    const fetcher = vi.fn(async () => new Response(JSON.stringify([issue({})]), { status: 200 }))
    await fetchRequests(fetcher)
    const [, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit & { headers: Record<string, string> }]
    expect(init.headers.Authorization).toBe("Bearer t0k3n")
  })

  it("con GitHub caído o sin cupo devuelve error, no tira", async () => {
    const limitado = vi.fn(async () => new Response("rate limited", { status: 403 }))
    expect(await fetchRequests(limitado)).toEqual({ ok: false })
    const caido = vi.fn(async () => {
      throw new Error("ECONNRESET")
    })
    expect(await fetchRequests(caido)).toEqual({ ok: false })
    const basura = vi.fn(async () => new Response(JSON.stringify({ message: "x" }), { status: 200 }))
    expect(await fetchRequests(basura)).toEqual({ ok: false })
  })

  it("pide los issues con etiqueta request y revalida cada hora", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([issue({})]), { status: 200 }))
    const result = await fetchRequests(fetcher)
    expect(result.ok).toBe(true)
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit & { next?: { revalidate: number } }]
    expect(url).toBe("https://api.github.com/repos/sebafermanelli/sebs7n-ui/issues?labels=request&state=all&per_page=100")
    expect(init.next?.revalidate).toBe(3600)
  })
})
