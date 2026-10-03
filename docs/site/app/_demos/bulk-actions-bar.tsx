"use client"

import { useState } from "react"
import { BulkActionsBar } from "sebs7n-ui/bulk-actions-bar"
import { Button } from "sebs7n-ui/button"

/**
 * Con selección
 * Se dibuja con al menos uno elegido y «Limpiar selección» lo apaga. El contador se anuncia al cambiar.
 */
export function Basic() {
  const [count, setCount] = useState(0)
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div className="flex gap-2">
        <Button onClick={() => setCount((value) => value + 1)} size="sm" variant="secondary">
          Elegir una factura
        </Button>
      </div>
      <BulkActionsBar count={count} labels={{ selectedOne: "{count} seleccionada", selectedOther: "{count} seleccionadas" }} onClear={() => setCount(0)}>
        <Button size="sm" variant="secondary">
          Marcar cobradas
        </Button>
        <Button size="sm" variant="secondary">
          Enviar recordatorio
        </Button>
      </BulkActionsBar>
    </div>
  )
}
