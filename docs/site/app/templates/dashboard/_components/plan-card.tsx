"use client"

import { Card } from "sebs7n-ui/card"
import { Meter } from "sebs7n-ui/meter"
import { PromoCard, PromoCardLink } from "sebs7n-ui/widget-card"
import { toast } from "sonner"

import { planOverview } from "../_lib/settings"

/**
 * El bloque del plan de Ajustes de iCloud: la `PromoCard` con el plan y, al lado, una card con lo que se usó
 * (`Meter`, uno por cupo). «Cambiar de plan» es el link de la promo (la acción es secundaria: el acento de la
 * pantalla es de «Guardar»). Las cifras salen de lo que hay, no de números sueltos.
 */
export function PlanCard({ overview }: { overview: ReturnType<typeof planOverview> }) {
  const { invoices, seats, space } = overview
  return (
    <div className="grid gap-5 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <PromoCard chip={`${seats.used} de ${seats.max} usuarios`} title="Plan Pro">
        <PromoCardLink render={<button onClick={() => toast("Es una maqueta: acá iría la elección de plan.")} type="button" />}>Cambiar de plan</PromoCardLink>
      </PromoCard>
      <Card className="flex flex-col justify-between gap-5 p-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-title-2 text-label">Uso del plan</h3>
          <p className="text-callout text-label-secondary">
            {`${invoices.used} de ${invoices.quota} facturas emitidas este mes. ${invoices.remaining > 0 ? `Te quedan ${invoices.remaining}.` : "Llegaste al límite: pasá de plan para seguir emitiendo."}`}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Meter label="Cupo de facturas" locale="es-AR" max={invoices.quota} showValue value={invoices.used} />
          <Meter label="Usuarios" locale="es-AR" max={seats.max} showValue value={seats.used} />
          <Meter format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }} label="Espacio" locale="es-AR" max={space.max} showValue value={space.used} />
        </div>
      </Card>
    </div>
  )
}
