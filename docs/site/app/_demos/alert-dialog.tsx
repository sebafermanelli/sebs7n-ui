"use client"

import { TriangleAlertIcon } from "lucide-react"
import { useRef } from "react"
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
 * Sin `variant`, la acción es del acento: el botón por defecto de macOS. Para lo que no destruye
 * nada. `initialFocus` la enfoca al abrir, así Return la dispara, como en macOS.
 */
export function AccionPorDefecto() {
  const emitir = useRef<HTMLButtonElement>(null)
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>Emitir factura</AlertDialogTrigger>
      <AlertDialogContent initialFocus={emitir}>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Emitir la factura 0013?</AlertDialogTitle>
          <AlertDialogDescription>Se numera y se envía al cliente. Después solo se puede anular.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogClose ref={emitir} render={<AlertDialogAction />}>
            Emitir
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Etiqueta larga
 * «Descartar cambios» no entra lado a lado en 300 px: con `stacked` el pie se apila. Sin `stacked`
 * el texto bajaría de renglón adentro del botón, que es la red de seguridad, no el diseño.
 * La acción va primero en el DOM para quedar arriba, como en macOS; Tab sigue el mismo orden.
 */
export function EtiquetaLarga() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>Salir sin guardar</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Salir sin guardar la factura?</AlertDialogTitle>
          <AlertDialogDescription>Los cambios del borrador se pierden.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter stacked>
          <AlertDialogClose render={<AlertDialogAction variant="destructive" />}>Descartar cambios</AlertDialogClose>
          <AlertDialogCancel>Seguir editando</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
