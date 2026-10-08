import { RuledList, RuledListItem } from "sebs7n-ui/ruled-list"
import { TextLink } from "sebs7n-ui/text-link"

import { FEATURES } from "../_data/content"
import { SectionHeader } from "./section-header"

// Los beneficios como lista con filetes y numeración (01, 02…) y no como seis cards iguales con un ícono: se lee de
// corrido, cada uno con su título y una línea.
export function Features() {
  return (
    <section className="flex scroll-mt-20 flex-col gap-10" id="beneficios">
      <SectionHeader subtitle="Lo que hace falta para facturar y cobrar, sin lo que sobra." title="Todo en un lugar" />
      <RuledList className="mx-auto w-full max-w-3xl">
        {FEATURES.map((feature) => (
          <RuledListItem key={feature.title} title={feature.title}>
            {feature.body}
          </RuledListItem>
        ))}
      </RuledList>
      <TextLink className="self-center" href="#producto" trailing="chevron">
        Ver el tablero por dentro
      </TextLink>
    </section>
  )
}
