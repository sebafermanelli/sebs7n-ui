"use client"

import { FileTextIcon, UsersIcon } from "lucide-react"
import { useState } from "react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarItem } from "sebs7n-ui/sidebar"
import { SidebarToggle } from "sebs7n-ui/sidebar-toggle"

/**
 * Arriba, junto a la marca
 * En el `SidebarHeader`, a la derecha de la marca, como Drive y Mail de iCloud. Plegado, queda primero y centrado. El estado lo guarda la app.
 */
export function Basic() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="h-72 overflow-hidden rounded-surface border border-separator">
      <Sidebar className="h-full" collapsed={collapsed} id="invoices-sidebar">
        <SidebarHeader>
          <div className="flex h-8 items-center gap-2 ps-1 group-data-collapsed/sidebar:h-auto group-data-collapsed/sidebar:flex-col group-data-collapsed/sidebar:ps-0">
            <div className="size-6 shrink-0 rounded-control bg-label" />
            <span className="text-callout font-semibold group-data-collapsed/sidebar:hidden">Acme</span>
            <SidebarToggle onCollapsedChange={setCollapsed} />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem active icon={<FileTextIcon />}>
              Facturas
            </SidebarItem>
            <SidebarItem icon={<UsersIcon />}>Clientes</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  )
}
