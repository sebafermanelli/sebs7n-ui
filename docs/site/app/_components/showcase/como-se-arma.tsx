"use client"

import Link from "next/link"
import { CopyButton } from "sebs7n-ui/copy-button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "sebs7n-ui/collapsible"
import { TooltipProvider } from "sebs7n-ui/tooltip"

import type { Receta } from "./catalog"

/** El link a la página de un componente: sale de `slug`, el mismo dato que verifica el test. */
export const hrefDe = (slug: string) => `/docs/components/${slug}`

/** Los componentes sin repetir, en el orden de la receta: dos piezas de un mismo módulo comparten página. */
function paginas(receta: Receta) {
  const vistas = new Set<string>()
  return receta.piezas.filter((pieza) => !vistas.has(pieza.slug) && vistas.add(pieza.slug))
}

/**
 * «Cómo se arma»: un panel colapsado bajo la pantalla con lo que usa (cada pieza enlaza a su página), el
 * código de la composición principal para copiar y las reglas por defecto que ilustra. Discreto a propósito:
 * cerrado es una línea. El bloque de código es el mismo del sitio pero con el `CopyButton` del paquete.
 */
export default function ComoSeArma({ receta, titulo = "Cómo se arma" }: { receta: Receta; titulo?: string }) {
  return (
    <TooltipProvider>
      <Collapsible className="rounded-surface border border-separator bg-surface">
        <CollapsibleTrigger chevron className="w-full px-4 py-3 text-callout font-medium text-label">
          {titulo}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-5 px-4 pb-4">
            <section aria-label="Componentes que usa" className="flex flex-col gap-2">
              <h3 className="text-footnote font-semibold text-label-secondary">Componentes</h3>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {receta.piezas.map((pieza) => (
                  <li key={pieza.name}>
                    <Link className="text-callout text-brand-900 underline-offset-2 hover:underline focus-visible:focus-ring" href={hrefDe(pieza.slug)}>
                      <code className="text-mono-body">{pieza.name}</code>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Código" className="flex flex-col gap-2">
              <h3 className="text-footnote font-semibold text-label-secondary">Código</h3>
              <div className="flex items-start gap-2 rounded-surface border border-separator bg-fill-1 pr-2">
                <pre className="max-h-80 min-w-0 flex-1 overflow-auto p-4" tabIndex={0}>
                  <code className="text-mono-body text-label">{receta.code}</code>
                </pre>
                <CopyButton className="mt-2 shrink-0" labels={{ copy: "Copiar el código" }} value={receta.code} />
              </div>
            </section>

            <section aria-label="Reglas por defecto" className="flex flex-col gap-2">
              <h3 className="text-footnote font-semibold text-label-secondary">Reglas que ilustra</h3>
              <ul className="flex list-disc flex-col gap-1 ps-5 text-callout text-label-secondary">
                {receta.reglas.map((regla) => (
                  <li key={regla}>{regla}</li>
                ))}
              </ul>
            </section>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </TooltipProvider>
  )
}
