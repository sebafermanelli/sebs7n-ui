"use client"

import { ArchiveIcon, CopyIcon, DownloadIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react"
import { useRef, useState } from "react"
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
} from "sebs7n-ui/alert-dialog"
import { Button } from "sebs7n-ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "sebs7n-ui/dropdown-menu"

/**
 * Acciones de una fila
 * Como el menú de un archivo de iCloud Drive: íconos en el acento, grupos separados y «Eliminar» al final en rojo (`variant="destructive"`), que abre la alerta que confirma. `DropdownMenuLabel` va dentro de `DropdownMenuGroup`: suelto, Base UI tira la página abajo.
 */
export function Acciones() {
  const [confirmar, setConfirmar] = useState(false)
  // Al cerrar la alerta, el ítem que la abrió ya no existe (el menú se cerró): el foco vuelve al
  // disparador del menú, que es de donde salió la acción.
  const disparador = useRef<HTMLButtonElement>(null)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger ref={disparador} render={<Button aria-label="Acciones de la factura 0012" size="icon-md" variant="plain" />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Factura 0012</DropdownMenuLabel>
            <DropdownMenuItem>
              <PencilIcon />
              Editar
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CopyIcon />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <DownloadIcon />
                Descargar
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>PDF</DropdownMenuItem>
                <DropdownMenuItem>XML</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <ArchiveIcon />
              Archivar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmar(true)} variant="destructive">
              <TrashIcon />
              Eliminar…
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem external render={<a href="/docs" rel="noopener noreferrer" target="_blank" />}>
            Centro de ayuda
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog onOpenChange={setConfirmar} open={confirmar}>
        <AlertDialogContent finalFocus={disparador}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar la factura 0012?</AlertDialogTitle>
            <AlertDialogDescription>Se borra del listado y del resumen del mes. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel />
            <AlertDialogClose render={<AlertDialogAction variant="destructive" />}>Eliminar</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * Checks y radios
 * Ninguno de los dos cierra el menú: se recorren con las flechas. El tilde es el círculo de acento a la derecha, como el «View as» de iCloud Drive; los títulos son filas de 14/600.
 */
export function ChecksYRadios() {
  const [orden, setOrden] = useState("fecha")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>Vista</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Columnas</DropdownMenuLabel>
          <DropdownMenuCheckboxItem defaultChecked>Cliente</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem defaultChecked>Importe</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>CUIT</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup onValueChange={setOrden} value={orden}>
            <DropdownMenuRadioItem value="fecha">Fecha</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="importe">Importe</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="cliente">Cliente</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
