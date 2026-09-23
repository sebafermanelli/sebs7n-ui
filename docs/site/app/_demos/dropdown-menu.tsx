"use client"

import { ArchiveIcon, CopyIcon, DownloadIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react"
import { useState } from "react"
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
 * `DropdownMenuLabel` va dentro de `DropdownMenuGroup`: suelto, Base UI tira la página abajo.
 */
export function Acciones() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button aria-label="Acciones de la factura 0012" size="icon-md" variant="ghost" />}>
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
          <DropdownMenuItem variant="destructive">
            <TrashIcon />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Checks y radios
 * Ninguno de los dos cierra el menú: se recorren con las flechas.
 */
export function ChecksYRadios() {
  const [orden, setOrden] = useState("fecha")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Vista</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
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
