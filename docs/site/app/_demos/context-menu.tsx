"use client"

import {
  CloudDownloadIcon,
  CopyIcon,
  EyeIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
  FolderInputIcon,
  FolderOpenIcon,
  InfoIcon,
  MailIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react"
import { Fragment, useState, type ReactNode } from "react"
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
  ContextMenuTrigger,
} from "sebs7n-ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "sebs7n-ui/dropdown-menu"

type Accion = { label: string; icon: ReactNode; destructive?: boolean }

// El menú de un archivo de iCloud Drive, en el mismo orden y con los mismos cortes.
const ACCIONES: Accion[][] = [
  [
    { label: "Abrir", icon: <FolderOpenIcon /> },
    { label: "Vista previa", icon: <EyeIcon /> },
    { label: "Información", icon: <InfoIcon /> },
  ],
  [{ label: "Descargar una copia…", icon: <CloudDownloadIcon /> }],
  [
    { label: "Compartir…", icon: <ShareIcon /> },
    { label: "Enviar una copia…", icon: <MailIcon /> },
  ],
  [
    { label: "Duplicar", icon: <CopyIcon /> },
    { label: "Cambiar nombre", icon: <PencilIcon /> },
    { label: "Mover a carpeta…", icon: <FolderInputIcon /> },
  ],
  [{ label: "Eliminar", icon: <TrashIcon />, destructive: true }],
]

const ARCHIVOS = [
  { nombre: "Logos", tipo: "Carpeta", peso: "—", icon: <FolderIcon className="text-brand-900" /> },
  { nombre: "Factura-0012.pdf", tipo: "Documento PDF", peso: "84 KB", icon: <FileTextIcon className="text-red-900" /> },
  { nombre: "Presupuesto marzo.xlsx", tipo: "Planilla", peso: "36 KB", icon: <FileSpreadsheetIcon className="text-green-900" /> },
]

/**
 * Archivos de una biblioteca
 * Como la lista de iCloud Drive: el mismo menú desde el click derecho sobre la fila y desde el botón «…» de la derecha, que es el que se ve. Con foco en la fila, la tecla de menú contextual o Shift+F10 también lo abren. «Eliminar» va al final, en rojo.
 */
export function Archivos() {
  return (
    <ul aria-label="Archivos" className="flex w-full max-w-xl flex-col">
      {ARCHIVOS.map((archivo) => (
        <li key={archivo.nombre} className="relative">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-10 w-full items-center gap-3 rounded-item pr-12 pl-3 text-left hover:bg-fill-1">
              <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center [&_svg]:size-5">
                {archivo.icon}
              </span>
              <span className="min-w-0 flex-1 truncate text-body text-label">{archivo.nombre}</span>
              <span className="hidden w-32 text-callout text-label-secondary sm:block">{archivo.tipo}</span>
              <span className="w-14 text-right text-callout text-label-secondary">{archivo.peso}</span>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {ACCIONES.map((grupo, i) => (
                <Fragment key={grupo[0]!.label}>
                  {i > 0 && <ContextMenuSeparator />}
                  <ContextMenuGroup>
                    {grupo.map((accion) => (
                      <ContextMenuItem key={accion.label} variant={accion.destructive ? "destructive" : "default"}>
                        {accion.icon}
                        {accion.label}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuGroup>
                </Fragment>
              ))}
            </ContextMenuContent>
          </ContextMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button aria-label={`Acciones de ${archivo.nombre}`} size="icon-sm" variant="plain" />}
              className="absolute top-1.5 right-1.5"
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            {/* Como en Drive: el menú se abre al costado del botón, alineado con la fila. */}
            <DropdownMenuContent align="start" side="left">
              {ACCIONES.map((grupo, i) => (
                <Fragment key={grupo[0]!.label}>
                  {i > 0 && <DropdownMenuSeparator />}
                  {grupo.map((accion) => (
                    <DropdownMenuItem key={accion.label} variant={accion.destructive ? "destructive" : "default"}>
                      {accion.icon}
                      {accion.label}
                    </DropdownMenuItem>
                  ))}
                </Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      ))}
    </ul>
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
      <ContextMenuTrigger className="flex h-40 w-full max-w-md items-center justify-center rounded-control border border-dashed border-separator bg-fill-1 text-callout text-label-secondary">
        Click derecho sobre el lienzo
      </ContextMenuTrigger>
      <ContextMenuContent>
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
