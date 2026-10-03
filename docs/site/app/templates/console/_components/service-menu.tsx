"use client"

import { MoreHorizontalIcon, PauseIcon, PlayIcon, RotateCwIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { Button } from "sebs7n-ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "sebs7n-ui/dropdown-menu"

import type { Service } from "../_data/mock"
import { servicePath } from "../_lib/routes"

export interface ServiceActions {
  restart: (services: Service[]) => void
  pause: (services: Service[]) => void
  resume: (services: Service[]) => void
  askDelete: (services: Service[]) => void
}

// El menú «…» de un servicio, en la fila de la tabla y en la card: las mismas acciones en las dos vistas.
export function ServiceMenu({ service, actions }: { service: Service; actions: ServiceActions }) {
  const stopped = service.status === "stopped"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button aria-label={`Acciones para ${service.name}`} size="icon-sm" variant="plain" />}>
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={servicePath(service.id)} />}>Ver detalle</DropdownMenuItem>
        <DropdownMenuItem disabled={stopped} onClick={() => actions.restart([service])}>
          <RotateCwIcon />
          Reiniciar
        </DropdownMenuItem>
        {stopped ? (
          <DropdownMenuItem onClick={() => actions.resume([service])}>
            <PlayIcon />
            Reanudar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => actions.pause([service])}>
            <PauseIcon />
            Pausar
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => actions.askDelete([service])} variant="destructive">
          <Trash2Icon />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
