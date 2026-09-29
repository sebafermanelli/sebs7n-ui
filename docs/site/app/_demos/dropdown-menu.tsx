"use client"

import { ArchiveIcon, CopyIcon, DownloadIcon, MoreHorizontalIcon, PencilIcon, TrashIcon, TriangleAlertIcon } from "lucide-react"
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
  AlertDialogIcon,
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
 * «Eliminar» es un ítem más, sin rojo, como en Mail: el peligro lo avisa la alerta que confirma. `DropdownMenuLabel` va dentro de `DropdownMenuGroup`: suelto, Base UI tira la página abajo.
 */
export function Acciones() {
  const [confirmar, setConfirmar] = useState(false)
  // Al cerrar la alerta, el ítem que la abrió ya no existe (el menú se cerró): el foco vuelve al
  // disparador del menú, que es de donde salió la acción.
  const disparador = useRef<HTMLButtonElement>(null)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger ref={disparador} render={<Button aria-label="Acciones de la factura 0012" size="icon-md" variant="ghost" />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
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
            <DropdownMenuItem onClick={() => setConfirmar(true)}>
              <TrashIcon />
              Eliminar…
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog onOpenChange={setConfirmar} open={confirmar}>
        <AlertDialogContent finalFocus={disparador}>
          <AlertDialogIcon>
            <TriangleAlertIcon className="size-12 text-amber-700" strokeWidth={1.5} />
          </AlertDialogIcon>
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
 * Ninguno de los dos cierra el menú: se recorren con las flechas. El tilde va a la izquierda, como en macOS, y los títulos llevan `inset` para alinear con el texto.
 */
export function ChecksYRadios() {
  const [orden, setOrden] = useState("fecha")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Vista</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel inset>Columnas</DropdownMenuLabel>
          <DropdownMenuCheckboxItem defaultChecked>Cliente</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem defaultChecked>Importe</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>CUIT</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel inset>Ordenar por</DropdownMenuLabel>
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
