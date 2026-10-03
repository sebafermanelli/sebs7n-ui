"use client"

import { PauseIcon, PlayIcon, RotateCwIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "sebs7n-ui/context-menu"

import type { Service } from "../_data/mock"
import { servicePath } from "../_lib/routes"
import type { ServiceActions } from "./service-menu"

// El mismo menú que el «…», con el clic derecho (o la tecla de menú) sobre la card. El «…» sigue
// ahí: es el que se ve y el que llega con el teclado y en el teléfono.
export function ServiceContextMenu({ service, actions, children, className }: { service: Service; actions: ServiceActions; children: ReactNode; className?: string }) {
  const stopped = service.status === "stopped"
  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem render={<Link href={servicePath(service.id)} />}>Ver detalle</ContextMenuItem>
        <ContextMenuItem disabled={stopped} onClick={() => actions.restart([service])}>
          <RotateCwIcon />
          Reiniciar
        </ContextMenuItem>
        {stopped ? (
          <ContextMenuItem onClick={() => actions.resume([service])}>
            <PlayIcon />
            Reanudar
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={() => actions.pause([service])}>
            <PauseIcon />
            Pausar
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => actions.askDelete([service])} variant="destructive">
          <Trash2Icon />
          Eliminar
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
