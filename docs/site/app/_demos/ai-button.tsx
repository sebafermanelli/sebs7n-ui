"use client"

import { Card, CardContent } from "sebs7n-ui/card"
import { AiButton, AiIcon, AiLauncher, AiShimmer } from "sebs7n-ui/ai-button"

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
 * Va donde iría un `Skeleton`, en un flujo de IA. El contenedor es quien anuncia la espera.
 */
export function Trabajando() {
  return (
    <Card aria-busy="true" className="w-full max-w-sm" size="sm">
      <CardContent className="flex flex-col gap-2">
        <AiShimmer className="w-2/3" />
        <AiShimmer />
        <AiShimmer className="w-1/2" />
      </CardContent>
    </Card>
  )
}
