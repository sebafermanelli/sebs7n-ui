"use client"

import { Card, CardContent, CardFooter } from "sebs7n-ui/card"
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from "sebs7n-ui/carousel"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "sebs7n-ui/hover-card"
import { Rating } from "sebs7n-ui/rating"

import { REVIEWS, TESTIMONIALS } from "../_data/content"

const formatAverage = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/**
 * Testimonios en `Carousel`: 1 a la vista en el teléfono, 2 en tablet y 3 en escritorio, con flechas, puntos
 * y ←/→. Cada uno lleva su valoración (`Rating readOnly`) y el nombre abre una ficha al pasar el mouse
 * (`HoverCard`): un adelanto, porque en el teléfono no hay hover y lo mismo está en la tarjeta.
 */
export default function TestimonialsCarouselContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-2">
        <Rating readOnly value={REVIEWS.average} />
        <span className="text-callout text-label-secondary">
          {formatAverage.format(REVIEWS.average)} · {REVIEWS.count} reseñas
        </span>
      </div>
      <Carousel aria-label="Testimonios" opts={{ align: "start" }}>
        <CarouselContent>
          {TESTIMONIALS.map((item) => (
            <CarouselItem className="md:basis-1/2 lg:basis-1/3" key={item.name}>
              <Card className="h-full justify-between">
                <CardContent className="flex flex-col gap-3 pt-(--card-spacing)">
                  <Rating readOnly size="sm" value={item.rating} />
                  <blockquote className="text-body text-label">«{item.quote}»</blockquote>
                </CardContent>
                <CardFooter className="flex-col items-start gap-0 pb-(--card-spacing) text-callout">
                  <HoverCard>
                    <HoverCardTrigger className="rounded-control text-label outline-none hover:underline focus-visible:focus-ring" href="#clientes">
                      {item.name}
                    </HoverCardTrigger>
                    <HoverCardContent align="start" className="flex w-64 flex-col gap-1 p-4">
                      <span className="text-headline text-label">{item.name}</span>
                      <span className="text-callout text-label-secondary">{item.role}</span>
                      <span className="text-callout text-label-secondary">Cliente desde {item.since}</span>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-label-secondary">{item.role}</span>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  )
}
