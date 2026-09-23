"use client"

import { Separator } from "sebs7n-ui/separator"

/** Horizontal y vertical */
export function Basico() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-copy-14 text-gray-1000">Facturación</div>
      <Separator className="my-3" />
      <div className="flex h-5 items-center gap-3 text-copy-13 text-gray-900">
        <span>Plan Pro</span>
        <Separator orientation="vertical" />
        <span>Mensual</span>
        <Separator orientation="vertical" />
        <span>ARS</span>
      </div>
    </div>
  )
}
