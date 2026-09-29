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

// Sin fotos de verdad en el sitio: tres «imágenes» de degradé, con el mismo contraste arbitrario que una foto.
const PAGES = [
  { name: "Página 1 de la factura", background: "linear-gradient(135deg, #f5d0a9, #e07b39)" },
  { name: "Página 2 de la factura", background: "linear-gradient(135deg, #f8f8f8, #d9dde3)" },
  { name: "Página 3 de la factura", background: "linear-gradient(135deg, #1f2937, #4b5563)" },
]

/**
 * Sobre la foto
 * `bleed` y `controls="overlay"`: la imagen de borde a borde de la card y las flechas y los puntos encima, sobre el gris del tooltip. Con el puntero, las flechas aparecen al pasar; con el dedo, se desliza.
 */
export function Photos() {
  return (
    <Card className="w-full max-w-xs gap-0 overflow-hidden py-0">
      <Carousel aria-label="Factura 0012 escaneada" bleed controls="overlay" opts={{ loop: true }}>
        <CarouselContent>
          {PAGES.map((page) => (
            <CarouselItem key={page.name}>
              <div aria-label={page.name} className="aspect-4/3" role="img" style={{ background: page.background }} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
      <CardContent className="p-4">
        <p className="text-headline text-label">Factura 0012</p>
        <p className="text-callout text-label-secondary">Acme S.A. · 3 páginas</p>
      </CardContent>
    </Card>
  )
}
