import { Badge } from "sebs7n-ui/badge"
import { Card, CardContent } from "sebs7n-ui/card"
import { Sparkline } from "sebs7n-ui/sparkline"
import { Stat } from "sebs7n-ui/stat"

import { DEMO } from "../_data/content"
import { SectionHeader } from "./section-header"

// La captura del producto, hecha con los mismos componentes del paquete (nada de imágenes): la cifra del
// período con su curva, y las facturas con su estado en texto (el color no es el único dato).
export function ProductDemo() {
  return (
    <section className="flex scroll-mt-20 flex-col gap-10" id="producto">
      <SectionHeader subtitle="Lo que te deben, lo que cobraste y lo que vence esta semana, sin armar nada." title="Así se ve el tablero" />
      <figure className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        <Card>
          <CardContent className="flex flex-col gap-6">
            <p className="text-headline text-label">{DEMO.title}</p>
            <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="flex flex-col gap-4">
                <Stat delta={DEMO.delta} hint={DEMO.hint} label="Cobrado" trend="up" value={DEMO.collected} />
                <Sparkline className="h-16" values={DEMO.series} />
                <p className="text-footnote text-label-secondary">Cobros por día, últimas dos semanas.</p>
              </div>
              <ul aria-label="Facturas recientes" className="flex flex-col divide-y divide-separator">
                {DEMO.invoices.map((invoice) => (
                  <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={invoice.client}>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-body text-label">{invoice.client}</span>
                      <span className="truncate text-callout text-label-secondary">{invoice.note}</span>
                    </div>
                    <Badge color={invoice.color}>{invoice.status}</Badge>
                    <span className="w-24 shrink-0 whitespace-nowrap text-end text-body text-label tabular-nums">{invoice.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <figcaption className="text-center text-footnote text-label-secondary">Datos de ejemplo.</figcaption>
      </figure>
    </section>
  )
}
