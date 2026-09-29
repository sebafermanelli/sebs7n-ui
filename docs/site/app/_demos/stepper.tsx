"use client"

import { UserIcon, ListIcon, PercentIcon, SendIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "sebs7n-ui"
import { Stepper, type StepperStep } from "sebs7n-ui/stepper"

const PASOS: StepperStep[] = [
  { title: "Cliente", description: "Acme S.A." },
  { title: "Ítems", description: "3 servicios" },
  { title: "Impuestos", description: "IVA 21 %" },
  { title: "Confirmar" },
]

/**
 * Una factura nueva
 * Los pasos de un asistente: completos en el acento con el tilde, el actual con el aro, los que faltan en gris. Con `onStepClick` se vuelve a un paso completo.
 */
export function Basico() {
  const [actual, setActual] = useState(1)
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <Stepper aria-label="Nueva factura" current={actual} onStepClick={setActual} steps={PASOS} />
      <div className="flex justify-between">
        <Button disabled={actual === 0} onClick={() => setActual(actual - 1)} variant="secondary">
          Anterior
        </Button>
        <Button disabled={actual === PASOS.length - 1} onClick={() => setActual(actual + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}

/**
 * Vertical, con íconos y un error
 * En columna para un costado. Un paso con `status="error"` va en rojo y lo dice («Impuestos, con error»).
 */
export function Vertical() {
  return (
    <Stepper
      aria-label="Emisión de la factura"
      className="max-w-xs"
      current={3}
      orientation="vertical"
      steps={[
        { title: "Cliente", description: "Acme S.A.", icon: <UserIcon /> },
        { title: "Ítems", description: "3 servicios", icon: <ListIcon /> },
        { title: "Impuestos", description: "Falta la condición frente al IVA", icon: <PercentIcon />, status: "error" },
        { title: "Enviar", description: "Por correo al cliente", icon: <SendIcon /> },
      ]}
    />
  )
}
