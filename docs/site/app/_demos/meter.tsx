"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Meter } from "sebs7n-ui/meter"

/**
 * Cuánto del plan se usó
 * Una medida, no una tarea: el número puede subir o bajar solo —al borrar un archivo el disco se libera— y nunca "termina". Por eso es `role="meter"` y no `role="progressbar"`.
 */
export function EspacioDelPlan() {
  const [usado, setUsado] = useState(6.4)

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Meter
        format={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }}
        label="Espacio usado"
        locale="es-AR"
        max={10}
        showValue
        value={usado}
      />
      <div className="flex gap-2">
        <Button onClick={() => setUsado((v) => Math.min(10, v + 1.3))} size="sm" variant="outline">
          Subir un adjunto
        </Button>
        <Button disabled={usado === 0} onClick={() => setUsado(0)} size="sm" variant="ghost">
          Vaciar la papelera
        </Button>
      </div>
    </div>
  )
}

/**
 * Con su propio rango y su propio formato
 * `min` y `max` son el rango real del dato y `format` es el de `Intl.NumberFormat`: lo que se ve y lo que lee el lector salen del mismo texto, así que no se pueden desincronizar. Sin `format`, lo que se anuncia es la proporción ("64%").
 */
export function CupoFacturado() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Meter
        format={{ style: "currency", currency: "ARS", maximumFractionDigits: 0 }}
        label="Consumo del mes"
        locale="es-AR"
        max={500_000}
        showValue
        value={321_400}
      />
      <Meter label="Legajos cargados" max={40} showValue value={26} />
    </div>
  )
}

/**
 * Tamaños y uso en una lista
 * `sm` (4px) cuando la barra acompaña una fila y el texto de al lado ya dice el número; `md` (6px) suelta. Sin etiqueta visible va `aria-label`: una barra sin nombre no dice qué está midiendo.
 */
export function OcupacionPorSucursal() {
  const sucursales = [
    { nombre: "Centro", camas: 48, ocupadas: 41 },
    { nombre: "Costanera", camas: 30, ocupadas: 12 },
    { nombre: "Aeropuerto", camas: 22, ocupadas: 22 },
  ]

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {sucursales.map((sucursal) => (
        <div className="flex flex-col gap-1.5" key={sucursal.nombre}>
          <div className="flex items-baseline justify-between">
            <span className="text-label-14 text-gray-1000">{sucursal.nombre}</span>
            <span className="text-copy-13 text-gray-900">
              {sucursal.ocupadas} de {sucursal.camas} plazas
            </span>
          </div>
          <Meter
            aria-label={`Ocupación de ${sucursal.nombre}`}
            max={sucursal.camas}
            size="sm"
            value={sucursal.ocupadas}
          />
        </div>
      ))}
    </div>
  )
}
