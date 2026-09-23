"use client"

import { CopyIcon } from "lucide-react"
import { Button } from "sebs7n-ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"

/**
 * Una línea, en hover y en foco
 * El `aria-label` del botón sigue siendo obligatorio: el tooltip no es un nombre accesible.
 */
export function Basico() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip>
        <TooltipTrigger render={<Button aria-label="Copiar al portapapeles" size="icon-md" variant="outline" />}>
          <CopyIcon />
        </TooltipTrigger>
        <TooltipContent>Copiar al portapapeles</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" />}>Arriba</TooltipTrigger>
        <TooltipContent side="right">También abre con Tab</TooltipContent>
      </Tooltip>
    </div>
  )
}
