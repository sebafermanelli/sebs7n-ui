"use client"

import { TriangleAlertIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogIcon,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "sebs7n-ui/alert-dialog"
import { Button } from "sebs7n-ui/button"

/**
 * Confirmar algo destructivo
 * La alerta de macOS: el ícono arriba, la pregunta, y dos botones iguales. La acción destructiva va
 * tintada. `AlertDialogAction` no cierra sola: se envuelve en `AlertDialogClose` o se controla `open`.
 */
export function Basico() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Eliminar factura</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogIcon>
          <TriangleAlertIcon className="size-12 text-amber-700" strokeWidth={1.5} />
        </AlertDialogIcon>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar la factura 0012?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borra del listado y del resumen del mes. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogClose render={<AlertDialogAction variant="destructive" />}>Eliminar</AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Acción por defecto
 * Sin `variant`, la acción es del acento: el botón por defecto de macOS. Para lo que no destruye nada.
 */
export function AccionPorDefecto() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>Emitir factura</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Emitir la factura 0013?</AlertDialogTitle>
          <AlertDialogDescription>Se numera y se envía al cliente. Después solo se puede anular.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogClose render={<AlertDialogAction />}>Emitir</AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
