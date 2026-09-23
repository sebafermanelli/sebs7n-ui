"use client"

import { FileTextIcon, LogOutIcon, SettingsIcon, UsersIcon } from "lucide-react"
import { useState } from "react"
import { Badge } from "sebs7n-ui/badge"
import { DropdownMenuItem } from "sebs7n-ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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
 * El estado de colapsado lo guarda la app: acá vive en un `useState`, en una app real en una cookie.
 */
export function Completo() {
  const [colapsado, setColapsado] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-copy-13 text-gray-900">
        <Switch checked={colapsado} onCheckedChange={setColapsado} size="sm" />
        Colapsado
      </label>
      <div className="h-[26rem] overflow-hidden rounded-xl border border-gray-400">
        <Sidebar className="h-full" collapsed={colapsado}>
          <SidebarHeader>
            <div className="flex h-8 items-center gap-2 px-1">
              <div className="size-6 shrink-0 rounded-md bg-gray-1000" />
              <span className="text-label-14 font-medium group-data-collapsed/sidebar:hidden">Acme</span>
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
