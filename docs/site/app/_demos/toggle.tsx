"use client"

import { BoldIcon } from "lucide-react"
import { Toggle } from "sebs7n-ui/toggle"

/** Un botón que queda apretado */
export function Basico() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle defaultPressed>Activos</Toggle>
      <Toggle>Archivados</Toggle>
      <Toggle disabled>Borradores</Toggle>
      <Toggle aria-label="Negrita">
        <BoldIcon />
      </Toggle>
    </div>
  )
}
