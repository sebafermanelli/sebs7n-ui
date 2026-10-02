import { Card, CardContent, CardFooter, CardGrid } from "sebs7n-ui/card"

import { TESTIMONIALS } from "../_data/content"
import { SectionHeader } from "./section-header"

export function Testimonials() {
  return (
    <section className="flex flex-col gap-10">
      <SectionHeader title="Lo que dicen quienes lo usan" />
      {/* `CardGrid`: el pie (nombre y cargo) cae a la misma altura aunque la cita sea más corta. */}
      <CardGrid>
        {TESTIMONIALS.map((item) => (
          <Card key={item.name}>
            <CardContent className="pt-(--card-spacing)">
              <blockquote className="text-body text-label">«{item.quote}»</blockquote>
            </CardContent>
            <CardFooter className="flex-col items-start gap-0 pb-(--card-spacing) text-callout">
              <span className="text-label">{item.name}</span>
              <span className="text-label-secondary">{item.role}</span>
            </CardFooter>
          </Card>
        ))}
      </CardGrid>
    </section>
  )
}
