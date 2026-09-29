"use client"

import { FileXIcon } from "lucide-react"
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
 * La alerta de iCloud: el ícono de la marca arriba, la pregunta y el detalle centrados, y dos
 * botones iguales. Con una acción destructiva, «Cancelar» es el botón por defecto (el acento, con el
 * foco) y «Eliminar» va en gris con el texto rojo. `AlertDialogAction` no cierra sola: se envuelve
 * en `AlertDialogClose` o se controla `open`.
 */
export function Basico() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Eliminar factura</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogIcon>
          <FileXIcon strokeWidth={1.5} />
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
 * Sin `variant`, la acción es el botón por defecto: el acento, con el foco al abrir, así Return la
 * dispara. «Cancelar» va en gris. Para lo que no destruye nada.
 */
export function AccionPorDefecto() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="secondary" />}>Emitir factura</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Emitir la factura 0013?</AlertDialogTitle>
          <AlertDialogDescription>Se numera y se envía al cliente. Después solo se puede anular.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogClose render={<AlertDialogAction />}>
            Emitir
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Etiqueta larga
 * Los dos botones son iguales: si una etiqueta no entra, baja de renglón adentro del botón. El
 * foco arranca en «Seguir editando», el botón por defecto, nunca en la acción que destruye.
 */
export function EtiquetaLarga() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="secondary" />}>Salir sin guardar</AlertDialogTrigger>
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
