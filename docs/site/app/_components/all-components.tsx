import Link from "next/link"
import { Separator } from "sebs7n-ui/separator"
import { Card, CardContent } from "sebs7n-ui/card"
import { TextLink } from "sebs7n-ui/text-link"

import type { ComponentGroup } from "../_lib/all-components"
import { DemoSlot } from "./demo-slot"
import { Inline } from "./inline"

/**
 * Todos los componentes en una sola página, para revisar el sistema entero con el vidrio, la marca
 * y el tema que se eligieron arriba (el Playground los escribe en `<html>`, así que valen acá
 * también).
 *
 * Es un Server Component: los títulos, las descripciones y los links van en el HTML y no suman JS.
 * Cada demo pasa por `DemoSlot`, que la monta recién cuando su marco se acerca a la pantalla: con
 * las 67 montadas de entrada, el Playground pediría el código de todas al abrir.
 */
export function AllComponents({ groups }: { groups: ComponentGroup[] }) {
  return (
    <section aria-labelledby="todos-los-componentes" className="flex flex-col gap-10">
      <Separator />
      <header className="flex flex-col gap-2">
        <h2 className="scroll-mt-24 text-title-1 text-label" id="todos-los-componentes">
          Todos los componentes
        </h2>
        <p className="text-body text-label-secondary">La primera demo de cada uno, con la configuración de arriba. El título lleva a su página.</p>
      </header>
      {groups.map((group) => (
        <section aria-labelledby={`todos-${group.id}`} className="flex flex-col gap-6" key={group.id}>
          <h3 className="scroll-mt-24 text-title-2 text-label" id={`todos-${group.id}`}>
            {group.title}
          </h3>
          <div className="flex flex-col gap-10">
            {group.components.map((component) => (
              <article aria-labelledby={`todos-${component.slug}`} className="flex min-w-0 flex-col gap-3" key={component.slug}>
                <div className="flex flex-col gap-1">
                  <h4 className="text-title-3" id={`todos-${component.slug}`}>
                    <TextLink render={<Link href={component.href} />} variant="row">
                      {component.title}
                    </TextLink>
                  </h4>
                  <p className="text-callout text-label-secondary">
                    <Inline text={component.description} />
                  </p>
                </div>
                <Card className="min-w-0">
                  <CardContent className="flex min-h-32 min-w-0 items-center justify-center overflow-x-auto">
                    {component.demoId ? <DemoSlot id={component.demoId} /> : <p className="text-callout text-label-secondary">Sin demo.</p>}
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}
