"use client"

import { CheckCircle2Icon, InfoIcon, TriangleAlertIcon, XCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "sebs7n-ui/alert"

/** Las cuatro variantes */
export function Variantes() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Alert>
        <InfoIcon />
        <AlertTitle>Modo de prueba</AlertTitle>
        <AlertDescription>Las facturas que emitas acá no llegan a AFIP.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckCircle2Icon />
        <AlertTitle>Comprobante aprobado</AlertTitle>
        <AlertDescription>CAE 75012345678901, válido hasta el 10/10.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlertIcon />
        <AlertTitle>El certificado vence en 12 días</AlertTitle>
        <AlertDescription>Después de esa fecha no vas a poder emitir.</AlertDescription>
      </Alert>
      <Alert variant="error">
        <XCircleIcon />
        <AlertTitle>AFIP rechazó el comprobante</AlertTitle>
        <AlertDescription>El CUIT del receptor no está registrado.</AlertDescription>
      </Alert>
    </div>
  )
}
