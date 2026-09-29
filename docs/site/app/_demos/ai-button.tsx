"use client"

import { Card, CardContent } from "sebs7n-ui/card"
import { useState } from "react"
import { AiButton, AiGlow, AiIcon, AiLauncher, AiShimmer } from "sebs7n-ui/ai-button"

/**
 * El botón
 * `outline` para una acción de IA entre otras; `solid` para la principal. Uno sólido por pantalla.
 */
export function Basico() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AiButton variant="solid">
        <AiIcon />
        Generar resumen
      </AiButton>
      <AiButton>
        <AiIcon />
        Completar con IA
      </AiButton>
      <AiButton size="sm">
        <AiIcon />
        Mejorar
      </AiButton>
      <AiButton aria-label="Preguntarle a la IA" size="icon-md">
        <AiIcon />
      </AiButton>
      <AiButton loading variant="solid">
        Generando…
      </AiButton>
      <AiButton disabled>
        <AiIcon />
        Sin conexión
      </AiButton>
    </div>
  )
}

/**
 * El lanzador
 * El botón redondo que abre el asistente. Con `active`, el canto gira: hay una respuesta en camino. Acá va adentro de una caja para que se vea en la página; en una app flota con `className="fixed right-6 bottom-6"`.
 */
export function Lanzador() {
  return (
    <div className="relative flex h-40 w-full max-w-md items-end justify-end gap-6 p-4">
      <AiLauncher labelVisible />
      {/* Con una respuesta en camino, el canto gira. */}
      <AiLauncher active label="Respondiendo" labelSide="right" />
    </div>
  )
}

/**
 * La IA está trabajando
 * El borde se enciende en cualquier contenedor mientras la IA trabaja, y el placeholder ocupa el lugar de lo que está escribiendo. Apretá el botón: dura tres segundos.
 */
export function Trabajando() {
  const [leyendo, setLeyendo] = useState(false)
  return (
    // `relative` es lo que ancla el borde a la tarjeta; `aria-busy` es lo que anuncia la espera.
    <Card aria-busy={leyendo} className="relative w-full max-w-sm" size="sm">
      <AiGlow active={leyendo} />
      <CardContent className="flex flex-col gap-4">
        {leyendo ? (
          <div className="flex flex-col gap-2">
            <AiShimmer className="w-2/3" />
            <AiShimmer />
            <AiShimmer className="w-1/2" />
          </div>
        ) : (
          <p className="text-copy-14 text-label-secondary">Subí el comprobante y la IA completa los datos de la factura.</p>
        )}
        <AiButton
          disabled={leyendo}
          onClick={() => {
            setLeyendo(true)
            setTimeout(() => setLeyendo(false), 3000)
          }}
          variant="solid"
        >
          <AiIcon />
          {leyendo ? "Leyendo el comprobante…" : "Leer el comprobante"}
        </AiButton>
      </CardContent>
    </Card>
  )
}
