"use client"

import { Card } from "sebs7n-ui/card"
import { Meter } from "sebs7n-ui/meter"
import { PromoCard, PromoCardLink } from "sebs7n-ui/widget-card"
import { toast } from "sonner"

import type { Limit } from "../_data/costs"

/**
 * El bloque del plan de Ajustes de iCloud: la `PromoCard` con el plan del proyecto y, al lado, una card con lo que
 * se usó (`Meter`, uno por cupo: cómputo, ancho de banda y almacenamiento). «Cambiar de plan» es el link de la
 * promo: la acción es secundaria, la pantalla no tiene otra primaria.
 */
export function PlanCard({ limits, services }: { limits: Limit[]; services: number }) {
  return (
    <div className="grid gap-5 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <PromoCard chip={`${services} ${services === 1 ? "servicio" : "servicios"}`} title="Plan Pro">
        <PromoCardLink render={<button onClick={() => toast("Es una maqueta: acá iría la elección de plan.")} type="button" />}>Cambiar de plan</PromoCardLink>
      </PromoCard>
      <Card className="flex flex-col justify-between gap-5 p-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-title-2 text-label">Uso del plan</h3>
          <p className="text-callout text-label-secondary">Lo que incluye el plan del proyecto y cuánto llevás usado este mes.</p>
        </div>
        <div className="flex flex-col gap-4">
          {limits.map((limit) => (
            <Meter format={{ style: "unit", unit: limit.unit, maximumFractionDigits: 1 }} key={limit.label} label={limit.label} locale="es-AR" max={limit.max} showValue value={limit.used} />
          ))}
        </div>
      </Card>
    </div>
  )
}
