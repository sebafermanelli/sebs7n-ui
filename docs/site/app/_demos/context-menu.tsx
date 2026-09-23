"use client"

import { CopyIcon, DownloadIcon, LinkIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "sebs7n-ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "sebs7n-ui/dropdown-menu"

/**
 * Un archivo de la biblioteca
 * Las mismas acciones en dos lugares: el botón de la esquina, que se ve, y el click derecho, que es el atajo. Con foco en la tarjeta, la tecla de menú contextual o Shift+F10 también lo abren.
 */
export function Archivo() {
  return (
    <div className="relative w-64">
      <ContextMenu>
        <ContextMenuTrigger className="block w-full rounded-lg border border-gray-400 bg-background-100 p-3 text-left">
          <div className="h-24 rounded-md bg-gray-200" />
          <p className="mt-2 text-copy-14 text-gray-1000">portada-marzo.jpg</p>
          <p className="text-copy-13 text-gray-900">JPG · 2,4 MB</p>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuGroup>
            <ContextMenuLabel>portada-marzo.jpg</ContextMenuLabel>
            <ContextMenuItem>
              <PencilIcon />
              Renombrar
              <ContextMenuShortcut>F2</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              <LinkIcon />
              Copiar enlace
              <ContextMenuShortcut>⌘⇧C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <DownloadIcon />
                Descargar como
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Original</ContextMenuItem>
                <ContextMenuItem>WebP 1200px</ContextMenuItem>
                <ContextMenuItem>Miniatura 320px</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">
            <TrashIcon />
            Mover a la papelera
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button aria-label="Acciones de portada-marzo.jpg" size="icon-sm" variant="ghost" />}
          className="absolute top-4 right-4"
        >
          <MoreVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <PencilIcon />
              Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LinkIcon />
              Copiar enlace
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DownloadIcon />
              Descargar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/**
 * El lienzo de un editor
 * Checks y radios que no cierran el menú, para probar varias opciones sin volver a abrirlo. Acá el click derecho gana: sobre un lienzo no hay dónde poner un botón que no tape el trabajo.
 */
export function Lienzo() {
  const [zoom, setZoom] = useState("100")
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-40 w-full max-w-md items-center justify-center rounded-lg border border-dashed border-gray-400 bg-gray-100 text-copy-13 text-gray-900">
        Click derecho sobre el lienzo
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuLabel>Mostrar</ContextMenuLabel>
          <ContextMenuCheckboxItem defaultChecked>Grilla</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem defaultChecked>Guías</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Reglas</ContextMenuCheckboxItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>Zoom</ContextMenuLabel>
          <ContextMenuRadioGroup onValueChange={setZoom} value={zoom}>
            <ContextMenuRadioItem value="50">50 %</ContextMenuRadioItem>
            <ContextMenuRadioItem value="100">100 %</ContextMenuRadioItem>
            <ContextMenuRadioItem value="200">200 %</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <CopyIcon />
          Duplicar selección
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
