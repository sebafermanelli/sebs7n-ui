"use client"

import * as React from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "./button.js"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.js"

type RowActionsProps = {
  /** El nombre accesible del botón, **con la fila**: «Acciones para FAC-1024». Un «…» por fila sin nombre propio es ambiguo. */
  label: string
  /** Lo que dice el tooltip. Por defecto, «Acciones». */
  tooltip?: string
  /** Los ítems del menú (`DropdownMenuItem`, `DropdownMenuSeparator`…). */
  children: React.ReactNode
  /** Hacia dónde se alinea el menú respecto del botón. Default `end`: la columna de acciones está a la derecha. */
  align?: "start" | "center" | "end"
  /** El ícono del botón. Por defecto, «…». */
  icon?: React.ReactNode
  /** Apaga el botón. */
  disabled?: boolean
  /** Clases del botón. */
  className?: string
}

/**
 * La acción de fila: **el «…» de una fila de tabla o de lista**, un `Button size="icon-sm" variant="plain"` (28 px, en el acento)
 * que abre un `DropdownMenu`, con tooltip. Es la norma del sistema para el menú de una fila: no se arma a mano, no son tres
 * botones sueltos y no cambia de tamaño ni de variante. Va en la última columna (`TableCell`, o `stacked="corner"` en una tabla
 * apilada) con la cabecera `<span className="sr-only">Acciones</span>`.
 *
 * ```tsx
 * <RowActions label={`Acciones para ${invoice.number}`}>
 *   <DropdownMenuItem onClick={() => open(invoice)}>Ver detalle</DropdownMenuItem>
 * </RowActions>
 * ```
 */
function RowActions({ label, tooltip = "Acciones", children, align = "end", icon, disabled, className }: RowActionsProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={<DropdownMenuTrigger render={<Button aria-label={label} className={className} data-slot="row-actions" disabled={disabled} size="icon-sm" variant="plain" />} />}
        >
          {icon ?? <MoreHorizontalIcon />}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align={align}>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

export { RowActions, type RowActionsProps }
