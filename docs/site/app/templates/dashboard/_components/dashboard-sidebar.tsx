"use client"

import { ArrowLeftIcon, FileTextIcon, HomeIcon, SettingsIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarItem, SidebarItemBadge, SidebarSearch } from "sebs7n-ui/sidebar"

import { CUSTOMERS_PATH, DASHBOARD_PATH, GALLERY_PATH, INVOICES_PATH, SETTINGS_PATH } from "../_lib/routes"
import { useInvoicesStore } from "../_state/invoices-context"
import { useDashboardCommand } from "./dashboard-command"

const SECTIONS = [
  { href: DASHBOARD_PATH, label: "Inicio", icon: <HomeIcon /> },
  { href: INVOICES_PATH, label: "Facturas", icon: <FileTextIcon />, showPending: true },
  { href: CUSTOMERS_PATH, label: "Clientes", icon: <UsersIcon /> },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { metrics, loading } = useInvoicesStore()
  const command = useDashboardCommand()
  return (
    <Sidebar>
      <SidebarContent aria-label="Secciones">
        <SidebarSearch onClick={command.open} shortcut="⌘K" />
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          {SECTIONS.map((section) => (
            <SidebarItem
              active={pathname === section.href}
              icon={section.icon}
              key={section.href}
              render={<Link href={section.href} />}
            >
              {section.label}
              {section.showPending && !loading && metrics.pendingCount > 0 && (
                <SidebarItemBadge>{metrics.pendingCount}</SidebarItemBadge>
              )}
            </SidebarItem>
          ))}
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarItem
            active={pathname === SETTINGS_PATH}
            icon={<SettingsIcon />}
            render={<Link href={SETTINGS_PATH} />}
          >
            Configuración
          </SidebarItem>
          {/* La barra del teléfono solo tiene lugar para el nombre y el avatar: la vuelta a la galería
              va acá, y solo se ve dentro del Sheet (en escritorio ya está en la barra). */}
          {GALLERY_PATH && (
            <SidebarItem className="lg:hidden" icon={<ArrowLeftIcon />} render={<Link href={GALLERY_PATH} />}>
              Templates
            </SidebarItem>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
