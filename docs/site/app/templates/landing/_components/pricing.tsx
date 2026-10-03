"use client"

import { CheckIcon } from "lucide-react"
import { useState } from "react"
import { Badge } from "sebs7n-ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardGrid, CardHeader, CardTitle } from "sebs7n-ui/card"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { buttonVariants } from "sebs7n-ui/variants/button"

import { annualMonthly, CTA_HREF, PLANS } from "../_data/content"
import { SalesButton } from "./sales-lazy"
import { SectionHeader } from "./section-header"

type Period = "monthly" | "annual"

// El único componente de cliente propio de la landing al abrir (más los diferidos: menú, carrusel, tema, ventas).
export function Pricing({ defaultPeriod = "monthly" }: { defaultPeriod?: Period }) {
  const [period, setPeriod] = useState<Period>(defaultPeriod)

  return (
    <section className="flex scroll-mt-20 flex-col items-center gap-10" id="precios">
      <SectionHeader subtitle="Empezá gratis. Cambiá de plan cuando quieras." title="Precios" />
      {/* Filtro de selección única con dos opciones: ToggleGroup, no dos botones. */}
      <div className="flex flex-col items-center gap-3">
        <ToggleGroup
          aria-label="Período de pago"
          onValueChange={(value) => value[0] && setPeriod(value[0] as Period)}
          required
          value={[period]}
        >
          <ToggleGroupItem value="monthly">Mensual</ToggleGroupItem>
          <ToggleGroupItem value="annual">Anual</ToggleGroupItem>
        </ToggleGroup>
        <Badge color="green" size="sm">
          Anual: 2 meses gratis
        </Badge>
      </div>
      {/* `CardGrid`: la cabecera más alta (el badge, dos líneas) fija la de todas, y los botones caen parejos. */}
      <CardGrid className="w-full">
        {PLANS.map((plan) => {
          const price = period === "annual" ? annualMonthly(plan.monthly) : plan.monthly
          return (
            <Card key={plan.name} selected={plan.featured}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.featured && <Badge size="sm">Recomendado</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-label">
                  <span className="text-title-1 tabular-nums">{`US$ ${price}`}</span>
                  <span className="text-callout text-label-secondary"> por mes</span>
                </p>
                <ul className="flex flex-col gap-2 text-callout text-label-secondary">
                  {plan.features.map((feature) => (
                    <li className="flex items-center gap-2" key={feature}>
                      <CheckIcon aria-hidden="true" className="size-4 shrink-0 text-brand-900" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {/* El acento solo en el recomendado: es el de esta pantalla. */}
                {plan.contact ? (
                  <SalesButton className="w-full" />
                ) : (
                  <a
                    className={buttonVariants({ variant: plan.featured ? "default" : "secondary", className: "w-full" })}
                    href={CTA_HREF}
                  >
                    {plan.monthly === 0 ? "Empezar gratis" : `Elegir ${plan.name}`}
                  </a>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </CardGrid>
    </section>
  )
}
