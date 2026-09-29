import type { Metadata } from "next"
import Link from "next/link"

import site from "@/.generated/site.json"
import { Inline } from "../_components/inline"

// La cuenta sale del índice generado: escrita a mano quedaba vieja en cada release.
export const metadata: Metadata = {
  title: "Documentación",
  description: `Todas las páginas del sistema y los ${site.components.length} componentes.`,
}

export default function DocsIndex() {
  return (
    <div className="flex max-w-4xl flex-col gap-10 pb-24">
      <header className="flex flex-col gap-3">
        <h1 className="text-heading-40 text-label">Documentación</h1>
        <p className="text-copy-18 text-label-secondary">
          {site.components.length} componentes y {site.pages.length} páginas de sistema. Cada una se sirve también como
          markdown plano en la misma URL + <code className="text-copy-14-mono">.md</code>.
        </p>
      </header>

      {site.nav.map((grupo) => (
        <section aria-labelledby={`g-${grupo.id}`} className="flex flex-col gap-4" key={grupo.id}>
          <h2 className="text-heading-20 text-label" id={`g-${grupo.id}`}>
            {grupo.title}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {grupo.items.map((item) => {
              const componente = site.components.find((entry) => `/docs/components/${entry.slug}` === item.href)
              const pagina = site.pages.find((entry) => `/docs/${entry.slug}` === item.href)
              return (
                <li key={item.href}>
                  <Link
                    className="flex h-full flex-col gap-1 rounded-surface border border-separator bg-surface p-4 outline-none transition-control hover:border-gray-500 hover:bg-gray-100 focus-visible:focus-ring"
                    href={item.href}
                  >
                    <span className="text-label-14 text-label">{item.title}</span>
                    <span className="text-copy-13 text-label-secondary">
                      <Inline text={componente?.description ?? pagina?.description ?? ""} />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
