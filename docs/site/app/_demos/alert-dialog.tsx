"use client"

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
  AlertDialogTitle,
  AlertDialogTrigger,
} from "sebs7n-ui/alert-dialog"
import { Button } from "sebs7n-ui/button"

/**
 * Confirmar algo destructivo
 * La confirmación de iCloud: la pregunta a la izquierda y los botones a la derecha. Cancelar es gris
 * y la acción destructiva, roja. `AlertDialogAction` no cierra sola: se envuelve en
 * `AlertDialogClose` o se controla `open`.
 */
export function Basico() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Eliminar factura</AlertDialogTrigger>
      <AlertDialogContent>
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
 * Sin `variant`, la acción es el botón del acento. Para lo que no destruye nada. `initialFocus` la
 * enfoca al abrir, así Return la dispara.
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
 * Los botones miden lo que su texto: «Descartar cambios» entra en el pie sin apilar. El foco
 * arranca en «Seguir editando», nunca en la acción que destruye.
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
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir editando</AlertDialogCancel>
          <AlertDialogClose render={<AlertDialogAction variant="destructive" />}>Descartar cambios</AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
