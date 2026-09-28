import type { Request } from "../_lib/requests"

const STATUS = { received: "Recibido", "in-progress": "En curso", released: "Publicado" } as const

function Row({ request }: { request: Request }) {
  return (
    <li className="flex items-center gap-4 border-b border-gray-alpha-400 py-3 last:border-b-0">
      <span className="w-10 shrink-0 text-center text-heading-20 tabular-nums text-gray-1000" aria-label={`${request.votes} votos`}>
        {request.votes}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-copy-14 text-gray-1000">{request.title}</span>
        <span className="text-label-12 text-gray-900">
          #{request.number} · {STATUS[request.status]}
        </span>
      </div>
      <a className="shrink-0 rounded-sm text-label-13 text-gray-1000 underline underline-offset-4 outline-none focus-visible:focus-ring" href={request.url} rel="noopener" target="_blank">
        {request.status === "released" ? "Ver en GitHub" : "👍 Votar en GitHub"}
      </a>
    </li>
  )
}

/** Las dos listas del tablero. Server Component: sin estado, sin JS de cliente. */
export function RequestsBoard({ open, released }: { open: Request[]; released: Request[] }) {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="abiertos" className="flex flex-col gap-3">
        <h2 className="text-heading-24 text-gray-1000" id="abiertos">
          Abiertos
        </h2>
        {open.length === 0 ? (
          <p className="text-copy-14 text-gray-900">Todavía no hay pedidos. El primero puede ser el tuyo.</p>
        ) : (
          <ul>{open.map((request) => <Row key={request.number} request={request} />)}</ul>
        )}
      </section>
      {released.length > 0 && (
        <section aria-labelledby="publicados" className="flex flex-col gap-3">
          <h2 className="text-heading-24 text-gray-1000" id="publicados">
            Publicados
          </h2>
          <ul>{released.map((request) => <Row key={request.number} request={request} />)}</ul>
        </section>
      )}
    </div>
  )
}
