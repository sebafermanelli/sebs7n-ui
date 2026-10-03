"use client"

import { useState } from "react"
import { Card, CardContent } from "sebs7n-ui/card"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "sebs7n-ui/dropdown-menu"
import { MetricChart } from "sebs7n-ui/metric-chart"
import { StatGrid } from "sebs7n-ui/stat-grid"

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
const PAID = [1200, 1850, 1600, 2400, 2250, 3100, 2800, 3300, 2950, 3600, 3400, 4100]
const BILLED = [1500, 2100, 1900, 2700, 2600, 3500, 3200, 3600, 3300, 4000, 3900, 4500]

const points = (values: number[], count: number) => values.slice(-count).map((value, index) => ({ label: MONTHS[12 - count + index]!, value }))

/**
 * Una serie
 * Guías, eje Y a la derecha y, con el puntero o las flechas, línea punteada y tooltip. Probá Tab y ← →.
 */
export function Basic() {
  return (
    <Card className="w-full max-w-xl">
      <CardContent>
        <MetricChart aria-label="Cobros de los últimos 12 meses" data={points(PAID, 12)} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} height={180} name="Cobrado" />
      </CardContent>
    </Card>
  )
}

/**
 * Varias series
 * El color sale de un token (`brand`, `green`, `amber`, `red`); el tooltip lista cada serie con su punto.
 */
export function Series() {
  return (
    <Card className="w-full max-w-xl">
      <CardContent>
        <MetricChart
          aria-label="Facturado y cobrado en 2026"
          height={180}
          series={[
            { name: "Facturado", data: points(BILLED, 12), color: "amber" },
            { name: "Cobrado", data: points(PAID, 12), color: "green" },
          ]}
        />
      </CardContent>
    </Card>
  )
}

/**
 * En una card de indicadores
 * `StatGrid` con `chart` y `actions`: rótulo, cifra con variación, menú «…» y el gráfico llenando el resto de la card.
 */
export function InStatGrid() {
  const [months, setMonths] = useState(6)
  const [refreshes, setRefreshes] = useState(0)
  return (
    <StatGrid
      className="w-full"
      columns={2}
      items={[
        {
          id: "paid",
          label: "Cobrado",
          value: "US$ 4.100",
          delta: "↗ 20,6 %",
          trend: "up",
          hint: refreshes ? `Actualizado ${refreshes} ${refreshes === 1 ? "vez" : "veces"}` : `Últimos ${months} meses`,
          chart: <MetricChart aria-label={`Cobrado, últimos ${months} meses`} data={points(PAID, months)} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} height={140} />,
          actions: (
            <>
              <DropdownMenuItem>Ver detalle</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRefreshes((n) => n + 1)}>Actualizar</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Período</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setMonths(6)}>6 meses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMonths(12)}>12 meses</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Quitar</DropdownMenuItem>
            </>
          ),
        },
        {
          id: "overdue",
          label: "Vencido",
          value: "US$ 1.800",
          delta: "↘ 7,1 %",
          trend: "up",
          hint: "Menos es mejor",
          chart: <MetricChart aria-label="Vencido, últimos 6 meses" color="red" data={points([900, 1100, 1500, 2100, 1940, 1800], 6)} height={140} />,
          actions: <DropdownMenuItem>Ver detalle</DropdownMenuItem>,
        },
      ]}
    />
  )
}
