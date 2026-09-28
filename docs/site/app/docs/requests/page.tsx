import type { Metadata } from "next"
import { ViewTransition } from "react"

import { RequestsBoard } from "../../_components/requests-board"
import { issueUrl, REPO } from "../../_lib/github"
import { fetchRequests } from "../../_lib/requests"

export const metadata: Metadata = {
  title: "Pedidos",
  description: "Los componentes que se pidieron, ordenados por votos, y los que ya salieron.",
}

// Se regenera cada hora: es lo mismo que revalida el fetch, y sin esto la página quedaría
// congelada en lo que había al momento del build.
export const revalidate = 3600

export default async function RequestsPage() {
  const result = await fetchRequests()
  return (
    <ViewTransition default="none" enter="page-in" exit="page-out">
      <div className="flex max-w-4xl flex-col gap-8 pb-24">
        <header className="flex flex-col gap-3">
          <h1 className="text-heading-40 text-gray-1000">Pedidos</h1>
          <p className="text-copy-18 text-gray-900">
            Los componentes que se pidieron, ordenados por votos. Para sumar el tuyo a uno que ya está, votalo con 👍 en GitHub; para uno nuevo, pedilo.
          </p>
          <a
            className="w-fit rounded-full bg-gray-1000 px-4 py-2 text-label-14 text-background-100 outline-none focus-visible:focus-ring"
            href={issueUrl("component-request")}
            rel="noopener"
            target="_blank"
          >
            Pedir un componente
          </a>
        </header>
        {result.ok ? (
          <RequestsBoard open={result.open} released={result.released} />
        ) : (
          <p className="text-copy-14 text-gray-900">
            No pude traer los pedidos ahora.{" "}
            <a className="text-gray-1000 underline underline-offset-4" href={`${REPO}/issues?q=label%3Arequest`} rel="noopener" target="_blank">
              Miralos en GitHub
            </a>
            .
          </p>
        )}
      </div>
    </ViewTransition>
  )
}
