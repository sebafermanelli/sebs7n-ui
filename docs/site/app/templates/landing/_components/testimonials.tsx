import { Card, CardContent, CardFooter } from "sebs7n-ui/card"
import { Marquee } from "sebs7n-ui/marquee"

import { TESTIMONIALS } from "../_data/content"
import { SectionHeader } from "./section-header"

// Las cards en `Marquee variant="cards"`: todas a la altura de la más alta, con el pie abajo.
const items = TESTIMONIALS.map((item) => ({
  id: item.name,
  node: (
    <Card className="w-80 justify-between">
      <CardContent className="pt-(--card-spacing)">
        <blockquote className="text-body text-label">«{item.quote}»</blockquote>
      </CardContent>
      <CardFooter className="flex-col items-start gap-0 pb-(--card-spacing) text-callout">
        <span className="text-label">{item.name}</span>
        <span className="text-label-secondary">{item.role}</span>
      </CardFooter>
    </Card>
  ),
}))

export function Testimonials() {
  return (
    <section className="flex flex-col gap-10">
      <SectionHeader title="Lo que dicen quienes lo usan" />
      <Marquee aria-label="Testimonios" className="w-full" items={items} pauseControl="press" variant="cards" />
    </section>
  )
}
