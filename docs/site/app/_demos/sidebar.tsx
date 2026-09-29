"use client"

import { ArchiveIcon, FileTextIcon, FolderIcon, InboxIcon, LogOutIcon, SettingsIcon, UsersIcon } from "lucide-react"
import { useState } from "react"
import { Badge } from "sebs7n-ui/badge"
import { DropdownMenuItem } from "sebs7n-ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarItemBadge,
  SidebarSearch,
} from "sebs7n-ui/sidebar"
import { Switch } from "sebs7n-ui/switch"
import { UserMenu } from "sebs7n-ui/user-menu"

/**
 * Completo
 * La lista de fuentes de iCloud: a ras del borde, íconos en el acento, contadores en texto y una sección que se pliega con su «+». El estado de colapsado lo guarda la app: acá vive en un `useState`, en una app real en una cookie.
 */
export function Completo() {
  const [colapsado, setColapsado] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-callout text-label-secondary">
        <Switch checked={colapsado} onCheckedChange={setColapsado} size="sm" />
        Colapsado
      </label>
      <div className="h-[30rem] overflow-hidden rounded-surface border border-separator">
        <Sidebar className="h-full" collapsed={colapsado}>
          <SidebarHeader>
            <div className="flex h-8 items-center gap-2 px-1">
              <div className="size-6 shrink-0 rounded-control bg-label" />
              <span className="text-callout font-semibold group-data-collapsed/sidebar:hidden">Acme</span>
              <Badge className="group-data-collapsed/sidebar:hidden" size="sm">
                Admin
              </Badge>
            </div>
            <SidebarSearch shortcut="⌘K" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Operación</SidebarGroupLabel>
              <SidebarItem active icon={<FileTextIcon />}>
                Facturas
              </SidebarItem>
              <SidebarItem icon={<UsersIcon />}>
                Clientes
                <SidebarItemBadge label="3 pendientes">3</SidebarItemBadge>
              </SidebarItem>
            </SidebarGroup>
            <SidebarGroup collapsible>
              <SidebarGroupLabel>Carpetas</SidebarGroupLabel>
              <SidebarGroupAction aria-label="Nueva carpeta" />
              <SidebarItem icon={<InboxIcon />}>
                Entrada
                <SidebarItemBadge>12</SidebarItemBadge>
              </SidebarItem>
              <SidebarItem icon={<FolderIcon />}>Proyectos</SidebarItem>
              <SidebarItem icon={<ArchiveIcon />}>Archivo</SidebarItem>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Configuración</SidebarGroupLabel>
              <SidebarItem icon={<SettingsIcon />}>Ajustes</SidebarItem>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <UserMenu
              signOut={
                <DropdownMenuItem>
                  <LogOutIcon />
                  Cerrar sesión
                </DropdownMenuItem>
              }
              user={{ name: "Ana Pérez", email: "ana@acme.com" }}
            />
          </SidebarFooter>
        </Sidebar>
      </div>
    </div>
  )
}
