"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "sebs7n-ui"
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from "sebs7n-ui/carousel"

const PLANS = [
  { name: "Básico", price: "$ 9.900", detail: "50 facturas por mes" },
  { name: "Estándar", price: "$ 19.900", detail: "300 facturas y débito automático" },
  { name: "Pro", price: "$ 39.900", detail: "Facturas sin límite y tres usuarios" },
  { name: "Empresa", price: "$ 79.900", detail: "Varias razones sociales" },
]

/**
 * Planes
 * Las flechas son botones de 28 sobre el material translúcido; los puntos saltan a cada uno. ←/→ con el foco adentro.
 */
export function Plans() {
  return (
    <Carousel aria-label="Planes" className="w-full max-w-sm">
      <CarouselContent>
        {PLANS.map((plan) => (
          <CarouselItem key={plan.name}>
            <Card>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.detail}</CardDescription>
              </CardHeader>
              <CardContent className="text-title-1 text-label tabular-nums">{plan.price}</CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  )
}

/**
 * Varios a la vista
 * `basis-1/2` en cada ítem y `opts={{ align: "start" }}`: dos por vez, de a uno.
 */
export function Several() {
  return (
    <Carousel aria-label="Planes, de a dos" className="w-full max-w-lg" opts={{ align: "start" }}>
      <CarouselContent>
        {PLANS.map((plan) => (
          <CarouselItem className="basis-1/2" key={plan.name}>
            <Card size="sm">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.price}</CardDescription>
              </CardHeader>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  )
}
