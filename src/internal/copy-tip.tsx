"use client"

import type * as React from "react"

import { Tooltip, TooltipContent } from "../components/tooltip.js"

/**
 * El tooltip de `CopyButton`, en su propio módulo para que `CopyButton` lo pida con `React.lazy` y
 * no arrastre Tooltip y Floating UI al abrir. Es interno: no se exporta del paquete.
 */
export default function CopyTip({ anchor, open, children }: { anchor: HTMLElement | null; open: boolean; children: React.ReactNode }) {
  return (
    <Tooltip open={open}>
      <TooltipContent anchor={anchor}>{children}</TooltipContent>
    </Tooltip>
  )
}
