"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardFooter } from "sebs7n-ui/card"

import { TESTIMONIALS } from "../_data/content"

// Hasta que llega el carrusel: las mismas tarjetas, sin estrellas, a la misma altura, y el lugar de la
// valoración reservado. Una, dos o tres a la vista según el ancho, igual que el carrusel.
function Placeholder() {
  return (
    <div className="flex flex-col gap-6">
      <div aria-hidden="true" className="h-5" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-md:[&>*:nth-child(n+2)]:hidden max-lg:[&>*:nth-child(n+3)]:hidden">
        {TESTIMONIALS.slice(0, 3).map((item) => (
          <Card className="justify-between" key={item.name}>
            <CardContent className="pt-(--card-spacing)">
              <div aria-hidden="true" className="mb-3 h-5" />
              <blockquote className="text-body text-label">«{item.quote}»</blockquote>
            </CardContent>
            <CardFooter className="flex-col items-start gap-0 pb-(--card-spacing) text-callout">
              <span className="text-label">{item.name}</span>
              <span className="text-label-secondary">{item.role}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

const Carousel = dynamic(() => import("./testimonials-carousel"), { ssr: false, loading: () => <Placeholder /> })

export function TestimonialsCarousel() {
  return <Carousel />
}
