"use client"

import { useState } from "react"
import { Slider } from "sebs7n-ui/slider"

/**
 * Un valor, con el número a la vista
 * El `label` visible queda asociado al thumb por Base UI: no hace falta `aria-label`. Se mueve con las flechas, de a `largeStep` con Shift, y a los extremos con Inicio y Fin.
 */
export function Basico() {
  const [opacidad, setOpacidad] = useState(60)
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider label="Opacidad de la marca de agua" onValueChange={setOpacidad} showValue value={opacidad} />
      <div
        className="h-16 rounded-lg bg-gray-1000"
        style={{ opacity: opacidad / 100 }}
      />
    </div>
  )
}

/**
 * Rango, con marcas
 * `defaultValue={[min, max]}` pinta los dos thumbs solo. `minStepsBetweenValues` evita que terminen encimados, y las marcas son referencias visuales (`aria-hidden`), no topes.
 */
export function Rango() {
  const [precio, setPrecio] = useState<readonly number[]>([200_000, 700_000])
  const formato = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Slider
        label="Presupuesto"
        marks={[0, 250_000, 500_000, 750_000, 1_000_000]}
        max={1_000_000}
        min={0}
        minStepsBetweenValues={1}
        onValueChange={setPrecio}
        step={25_000}
        value={precio}
      />
      <p className="text-copy-13 text-gray-900">
        De {formato.format(precio[0])} a {formato.format(precio[1])}
      </p>
    </div>
  )
}

/**
 * Tamaños, formato y deshabilitado
 * `sm` (32px de área arrastrable) para un panel denso; `md` (40px) suelto. `format` es el de `Intl.NumberFormat`: cambia lo que muestra `showValue` y también el `aria-valuetext` que lee el lector de pantalla.
 */
export function TamanosYFormato() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider
        defaultValue={120_000}
        format={{ style: "currency", currency: "ARS", maximumFractionDigits: 0 }}
        label="Tope de gasto mensual"
        locale="es-AR"
        max={500_000}
        showValue
        size="sm"
        step={10_000}
      />
      <Slider defaultValue={8} label="Cuotas" marks={[1, 3, 6, 12]} max={12} min={1} showValue size="md" />
      <Slider defaultValue={50} disabled label="Solo lectura" showValue />
    </div>
  )
}
