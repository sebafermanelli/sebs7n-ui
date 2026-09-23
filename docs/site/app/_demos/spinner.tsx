"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Spinner } from "sebs7n-ui/spinner"

/**
 * Tamaños y color
 * 16 / 20 / 24px. Hereda el color del texto: no tiene prop de color.
 */
export function Tamanos() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-gray-900">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <Spinner className="text-brand-700" size="lg" />
    </div>
  )
}

/**
 * Con nombre accesible
 * Con `label` es una región `role="status"`: el lector anuncia «Buscando facturas» al aparecer.
 */
export function ConNombre() {
  return (
    <div className="flex items-center gap-2 text-copy-14 text-gray-900">
      <Spinner label="Buscando facturas" size="sm" />
      <span aria-hidden="true">Buscando facturas…</span>
    </div>
  )
}

/**
 * Dentro de un botón
 * `Button loading` ya usa este mismo Spinner: no lo pongas a mano.
 */
export function EnUnBoton() {
  const [loading, setLoading] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        loading={loading}
        onClick={() => {
          setLoading(true)
          setTimeout(() => setLoading(false), 2000)
        }}
      >
        Emitir factura
      </Button>
      <Button loading size="lg" variant="accent">
        Grande
      </Button>
    </div>
  )
}
