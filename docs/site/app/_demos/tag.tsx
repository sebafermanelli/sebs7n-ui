"use client"

import { useState } from "react"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { Tag } from "sebs7n-ui/tag"

/**
 * Filtros aplicados
 * Un dato que puso el usuario: por eso se puede sacar.
 */
export function Filtros() {
  const [filtros, setFiltros] = useState(["Pendientes", "Acme S.A.", "Septiembre"])
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div aria-live="polite" className="flex min-h-6 flex-wrap items-center gap-2">
        {filtros.map((filtro) => (
          <Tag key={filtro} onRemove={() => setFiltros((previos) => previos.filter((otro) => otro !== filtro))}>
            {filtro}
          </Tag>
        ))}
        {filtros.length === 0 && <span className="text-copy-14 text-gray-900">Sin filtros</span>}
      </div>
      <Button disabled={filtros.length === 3} onClick={() => setFiltros(["Pendientes", "Acme S.A.", "Septiembre"])} size="sm" variant="outline">
        Restaurar
      </Button>
    </div>
  )
}

/**
 * Colores y tamaños
 * La misma paleta del Badge: el sistema tiene una sola forma de etiqueta.
 */
export function ColoresYTamanos() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Tag onRemove={() => {}}>Sin color</Tag>
        <Tag color="brand" onRemove={() => {}}>
          Marca
        </Tag>
        <Tag color="green" onRemove={() => {}}>
          Cobrado
        </Tag>
        <Tag color="purple" onRemove={() => {}}>
          Diseño
        </Tag>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Tag onRemove={() => {}} size="sm">
          Chico
        </Tag>
        <Tag size="sm">Sin quitar</Tag>
      </div>
    </div>
  )
}

/**
 * Badge o Tag
 * El estado lo calculó el sistema y no se saca: Badge. El filtro lo puso el usuario: Tag.
 */
export function BadgeOTag() {
  return (
    <div className="flex flex-col gap-3 text-copy-14 text-gray-900">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-28">Estado:</span>
        <Badge color="green">Pagada</Badge>
        <Badge color="amber">Pendiente</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-28">Filtros:</span>
        <Tag color="green" onRemove={() => {}}>
          Pagadas
        </Tag>
        <Tag onRemove={() => {}}>Últimos 30 días</Tag>
      </div>
    </div>
  )
}
