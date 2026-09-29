"use client"

import { CheckIcon, TriangleAlertIcon } from "lucide-react"
import { Badge } from "sebs7n-ui/badge"

import { focoSobre, hexOfOklch, textoSobre, type Oklch } from "../_lib/color"

/**
 * Lo que un color de marca no deja ver a ojo: si el texto que va encima llega a 4,5:1 y si el
 * anillo de foco llega a 3:1. Va en el `footer` del `ColorPicker` del Playground.
 *
 * No es parte del componente del paquete a propósito: es la pregunta de quien elige un color
 * DE MARCA, no de quien elige el color de una etiqueta.
 */
export function Veredicto({ color, superficie }: { color: Oklch; superficie: string }) {
  const texto = textoSobre(color)
  const foco = focoSobre(color, superficie)
  const numero = (ratio: number) => ratio.toFixed(2).replace(".", ",")
  return (
    <>
      <div
        className="flex h-10 items-center justify-center rounded-full text-callout font-medium"
        style={{ backgroundColor: hexOfOklch(color), color: texto.hex }}
      >
        Así queda el botón
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge color={texto.aa ? "green" : "red"} size="sm">
          {texto.aa ? <CheckIcon /> : <TriangleAlertIcon />}
          Texto {texto.hex === "#ffffff" ? "blanco" : "negro"} · {numero(texto.ratio)}:1
        </Badge>
        <Badge color={foco.ok ? "green" : "red"} size="sm">
          {foco.ok ? <CheckIcon /> : <TriangleAlertIcon />}
          Foco · {numero(foco.ratio)}:1
        </Badge>
      </div>
      {(!texto.aa || !foco.ok) && (
        <p className="text-callout text-label-secondary">
          {!texto.aa
            ? "Con este color ni el blanco ni el negro llegan a 4,5:1 encima. Bajale o subile la luminosidad."
            : "El anillo de foco no llega a 3:1 contra la superficie de este tema."}
        </p>
      )}
    </>
  )
}
