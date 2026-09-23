"use client"

import { toast } from "sonner"
import { Button } from "sebs7n-ui/button"

/**
 * Confirmar que algo salió bien
 * El `<Toaster />` va una sola vez, en el layout raíz.
 */
export function Basico() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast("Factura 0014 emitida")} variant="outline">
        Neutro
      </Button>
      <Button onClick={() => toast.success("Se envió el email al cliente")} variant="outline">
        Éxito
      </Button>
      <Button onClick={() => toast.error("AFIP rechazó el comprobante")} variant="outline">
        Error
      </Button>
    </div>
  )
}

/**
 * Con acción y con promesa
 * Si el toast lleva acción, tiene que durar lo suficiente para leerlo y apretarla.
 */
export function AccionYPromesa() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          toast("Factura archivada", {
            action: { label: "Deshacer", onClick: () => toast.success("Restaurada") },
            duration: 8000,
          })
        }
        variant="outline"
      >
        Con acción
      </Button>
      <Button
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1600)), {
            loading: "Enviando a AFIP…",
            success: "Aprobada. CAE 7501…",
            error: "No respondió el servicio",
          })
        }
        variant="outline"
      >
        Con promesa
      </Button>
    </div>
  )
}
