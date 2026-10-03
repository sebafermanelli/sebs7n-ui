import type { Metadata } from "next"
import Link from "next/link"
import { CardDescription, CardGrid, CardHeader, CardTitle } from "sebs7n-ui/card"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { cardVariants } from "sebs7n-ui/variants/card"

import site from "@/.generated/site.json"
import { Inline } from "../_components/inline"

// La cuenta sale del índice generado: escrita a mano quedaba vieja en cada release.
export const metadata: Metadata = {
  title: "Documentación",
  description: `Todas las páginas del sistema y los ${site.components.length} componentes.`,
}

// Playground e Iconos son rutas propias, sin página de markdown: su descripción va acá.
const RUTAS: Record<string, string> = {
  "/docs/playground": "Mové el material y el color de marca, mirá cómo cambian los componentes y llevate el CSS.",
  "/docs/iconos": "Los íconos de lucide: buscá, hacé clic y pegá el import.",
}

export default function DocsIndex() {
  return (
    <div className="flex max-w-4xl flex-col gap-10 pb-24">
      <PageHeader>
        <PageHeaderTitle>Documentación</PageHeaderTitle>
        <PageHeaderDescription>
          {site.components.length} componentes y {site.pages.length} páginas de sistema. Cada una se sirve también como
          markdown plano en la misma URL + <code className="text-mono-body">.md</code>.
        </PageHeaderDescription>
      </PageHeader>

      {site.nav.map((grupo) => (
        <section aria-labelledby={`g-${grupo.id}`} className="flex flex-col gap-4" key={grupo.id}>
          <h2 className="text-title-3 text-label" id={`g-${grupo.id}`}>
            {grupo.title}
          </h2>
          <CardGrid columns={2}>
            {grupo.items.map((item) => {
              const componente = site.components.find((entry) => `/docs/components/${entry.slug}` === item.href)
              const pagina = site.pages.find((entry) => `/docs/${entry.slug}` === item.href)
              return (
                // La card es el link: `data-slot="card"` la mete en las filas compartidas de CardGrid.
                <Link className={cardVariants({ interactive: true, size: "sm" })} data-size="sm" data-slot="card" href={item.href} key={item.href}>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>
                      <Inline text={componente?.description ?? pagina?.description ?? RUTAS[item.href] ?? ""} />
                    </CardDescription>
                  </CardHeader>
                </Link>
              )
            })}
          </CardGrid>
        </section>
      ))}
    </div>
  )
}
