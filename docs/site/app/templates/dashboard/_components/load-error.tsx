"use client"

import { XCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "sebs7n-ui/alert"
import { Button } from "sebs7n-ui/button"

// Cuando la carga falla, la lista no se vacía en silencio: dice qué pasó y deja reintentar. Es un
// aviso que sigue siendo verdad hasta que se resuelve, así que va en `Alert`, no en un toast.
export function LoadError({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <Alert variant="error">
      <XCircleIcon />
      <AlertTitle>{`No pudimos cargar ${what}`}</AlertTitle>
      <AlertDescription>
        <p>Revisá tu conexión y probá de nuevo. Lo que ya cargaste no se perdió.</p>
        <Button className="mt-3" onClick={onRetry} size="sm" variant="secondary">
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  )
}
