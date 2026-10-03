"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { StatGrid, type StatGridItem } from "sebs7n-ui/stat-grid"

const ITEMS: StatGridItem[] = [
  { label: "Facturación total", value: "US$ 48.200", hint: "Sin las anuladas" },
  { label: "Pendientes de cobro", value: "12 facturas", aside: "US$ 9.400", hint: "Todavía en término" },
  { label: "Cobrado", value: "US$ 31.800", delta: "+12 %", trend: "up", hint: "vs. mes anterior" },
  { label: "Facturas vencidas", value: "3 facturas", badge: { text: "US$ 1.800", color: "red" }, hint: "Requiere gestión" },
]

/**
 * Cuatro indicadores
 * 1 columna en el teléfono, 2 en tablet y 4 en escritorio. Cada uno es un `Stat` en una `Card`.
 */
export function Four() {
  return <StatGrid className="w-full" items={ITEMS} />
}

/**
 * Cinco indicadores
 * Sin huérfana: 1 columna en el teléfono, 3 + 2 que llenan el ancho desde 48 rem y una sola fila desde 72 rem.
 */
export function Five() {
  return <StatGrid className="w-full" items={[...ITEMS, { label: "Clientes activos", value: "28", hint: "Con una factura este mes" }]} />
}

/**
 * Cargando
 * Los rótulos quedan y las cifras pasan a esqueleto del alto final: la card no cambia de alto al llegar el dato.
 */
export function Loading() {
  const [loading, setLoading] = useState(true)
  return (
    <div className="flex w-full flex-col gap-3">
      <div>
        <Button onClick={() => setLoading((value) => !value)} size="sm" variant="secondary">
          {loading ? "Mostrar datos" : "Volver a cargar"}
        </Button>
      </div>
      <StatGrid items={ITEMS.slice(0, 3)} loading={loading} />
    </div>
  )
}
