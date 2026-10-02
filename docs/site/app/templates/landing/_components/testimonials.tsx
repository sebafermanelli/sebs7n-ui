import { Card, CardContent } from "sebs7n-ui/card"

import { TESTIMONIALS } from "../_data/content"
import { SectionHeader } from "./section-header"

export function Testimonials() {
  return (
    <section className="flex flex-col gap-10">
      <SectionHeader title="Lo que dicen quienes lo usan" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <Card key={item.name}>
            <CardContent>
              <figure className="flex flex-col gap-4">
                <blockquote className="text-body text-label">«{item.quote}»</blockquote>
                <figcaption className="text-callout">
                  <span className="text-label">{item.name}</span>
                  <span className="block text-label-secondary">{item.role}</span>
                </figcaption>
              </figure>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
