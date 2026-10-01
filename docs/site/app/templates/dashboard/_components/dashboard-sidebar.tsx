"use client"

import { FileTextIcon, HomeIcon, UsersIcon, BarChart3Icon, SettingsIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarItemBadge,
} from "sebs7n-ui/sidebar"

interface DashboardSidebarProps {
  pendingCount: number
}

export function DashboardSidebar({ pendingCount }: DashboardSidebarProps) {
  return (
    <Sidebar className="w-56 shrink-0 border-r border-separator-strong bg-surface-secondary">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarItem icon={<HomeIcon className="size-4" />}>
            Inicio
          </SidebarItem>

          <SidebarItem icon={<FileTextIcon className="size-4" />} active>
            Facturas
            {pendingCount > 0 && <SidebarItemBadge>{pendingCount}</SidebarItemBadge>}
          </SidebarItem>

          <SidebarItem icon={<UsersIcon className="size-4" />}>
            Clientes
          </SidebarItem>

          <SidebarItem icon={<BarChart3Icon className="size-4" />}>
            Reportes
          </SidebarItem>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarItem icon={<SettingsIcon className="size-4" />}>
            Configuración
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
